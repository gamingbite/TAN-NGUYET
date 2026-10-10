import { createServer, type Server } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import { WORLD_ART_SHEETS } from '../src/game/world/ArtManifest';
import { SAVE_KEY } from '../src/game/model/storage';
import type { GameState } from '../src/game/model/types';
import { clickGameMenu } from './helpers/gameMenu';

const prefix = '/TAN-NGUYET/';
const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
let server: Server | undefined;
let siteURL: string;

function staysWithin(root: string, candidate: string): boolean {
  const path = relative(root, candidate);
  return path !== '..' && !path.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(path);
}

test.beforeAll(async () => {
  const root = await realpath(resolve('dist'));
  // Serve only the production files beneath the actual repository prefix.
  // There is no root /assets alias, SPA fallback, or directory listing that
  // could conceal an absolute runtime asset URL in the production bundle.
  server = createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
      if (!pathname.startsWith(prefix)) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const candidate = resolve(root, pathname.slice(prefix.length) || 'index.html');
      if (!staysWithin(root, candidate)) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const file = await realpath(candidate);
      if (!staysWithin(root, file) || !(await stat(file)).isFile()) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const body = await readFile(file);
      response.writeHead(200, {
        'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
        'Content-Length': body.length, 'Cache-Control': 'no-store',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) {
      response.writeHead(error instanceof URIError ? 400 : 404);
      response.end('Not found');
    }
  });
  const listeningServer = server;
  await new Promise<void>((done, reject) => {
    listeningServer.once('error', reject);
    listeningServer.listen(0, '127.0.0.1', () => {
      listeningServer.off('error', reject); done();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Prefix test server did not acquire a loopback port.');
  siteURL = `http://127.0.0.1:${address.port}${prefix}`;
});

test.afterAll(async () => {
  const closingServer = server;
  if (!closingServer) return;
  await new Promise<void>((done, reject) => {
    closingServer.close(error => error ? reject(error) : done());
    closingServer.closeAllConnections();
  });
  server = undefined;
});

test('the published repository prefix loads real art and preserves a played character through save and Continue', async ({ page, request }) => {
  // This case renders four race portraits and boots the full game twice.
  // Shared Linux runners can exceed the default whole-test 30s budget.
  test.setTimeout(90_000);
  const errors: string[] = [], failed: string[] = [], httpErrors: string[] = [];
  const pngResponses = new Map<string, number>();
  const assetRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', resource => failed.push(`${resource.url()}: ${resource.failure()?.errorText}`));
  page.on('request', resource => {
    const pathname = new URL(resource.url()).pathname;
    if (pathname.includes('/assets/')) assetRequests.push(pathname);
  });
  page.on('response', response => {
    const pathname = new URL(response.url()).pathname;
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${pathname}`);
    if (pathname.endsWith('.png')) pngResponses.set(pathname, response.status());
  });

  // Demonstrate that the test host cannot satisfy the old root-absolute URLs.
  expect((await request.get(new URL('/assets/atlases/world_props_v1.png', siteURL).href)).status()).toBe(404);
  expect((await request.get(`${siteURL}assets/atlases/`)).status()).toBe(404);
  expect((await request.get(`${siteURL}%2e%2e%5cpackage.json`)).status()).toBe(404);

  const titleImage = page.waitForResponse(response => new URL(response.url()).pathname === `${prefix}assets/ui/title_landscape_v1.png`);
  await page.goto(siteURL);
  expect((await titleImage).status()).toBe(200);
  expect(await page.locator('#app').evaluate(node => getComputedStyle(node).backgroundImage)).toContain(`${prefix}assets/ui/title_landscape_v1.png`);
  for (const race of ['human', 'elf', 'dwarf', 'beast']) {
    await page.locator('#race').selectOption(race);
    await expect(page.locator('#character-portrait img.b2-portrait')).toHaveAttribute('data-race', race);
    await expect.poll(() => page.locator('#character-portrait img.b2-portrait').evaluate(node => {
      const image = node as HTMLImageElement;
      return image.complete && image.naturalWidth === 32 && image.naturalHeight === 42;
    })).toBe(true);
  }
  if (process.env.CI) console.log('Deployment check: title and all race portraits loaded');
  await page.locator('#character-name').fill('Khách chơi trên web');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-art-world-frames', String(WORLD_ART_SHEETS.reduce((count, sheet) => count + sheet.frames.length, 0)));
  await expect(page.locator('#game')).toHaveAttribute('data-art-player-frames', '384');
  await expect(page.locator('#game')).toHaveAttribute('data-art-missing', '0');
  await expect(page.locator('#game')).toHaveAttribute('data-art-warnings', '0');
  await expect(page.locator('#hud-avatar img.b2-portrait')).toBeVisible();
  const expectedSheets = [
    ...WORLD_ART_SHEETS.map(sheet => sheet.path.split('/').at(-1)!),
    'player_bases_v1.png',
    ...['human', 'elf', 'dwarf', 'beast'].flatMap(race => [`player_${race}_b2.png`, `player_${race}_b2_back.png`]),
  ];
  for (const sheet of expectedSheets) expect(pngResponses.get(`${prefix}assets/atlases/${sheet}`), sheet).toBe(200);
  if (process.env.CI) console.log('Deployment check: game and all world/player sheets ready');

  const startX = Number(await page.locator('#game').getAttribute('data-px'));
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  try {
    await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')), { intervals: [25] }).toBeGreaterThan(startX + 20);
  } finally { await page.keyboard.up('d'); }
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('Đã lưu tiến độ');
  const savedRaw = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  expect(savedRaw).not.toBeNull();
  const saved = JSON.parse(savedRaw!) as GameState;
  expect(saved.character.name).toBe('Khách chơi trên web');
  expect(saved.world.zone).toBe('town');
  expect(saved.world.x).toBeGreaterThan(startX + 20);
  if (process.env.CI) console.log('Deployment check: movement and manual save passed');

  await page.reload();
  await expect(page.locator('#continue-button')).toBeVisible();
  const reloadedRaw = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  expect(reloadedRaw).not.toBeNull();
  const reloaded = JSON.parse(reloadedRaw!) as GameState;
  // After a successful manual save, beforeunload may save a later simulation
  // tick. Check preserved progress while allowing that authorized clock update.
  expect(reloaded.character).toEqual(saved.character);
  expect(reloaded.inventory).toEqual(saved.inventory);
  expect(reloaded.equipped).toEqual(saved.equipped);
  expect(reloaded.quests).toEqual(saved.quests);
  expect(reloaded.progress).toEqual(saved.progress);
  expect(reloaded.world).toEqual({ ...saved.world, elapsedSeconds: reloaded.world.elapsedSeconds });
  expect(reloaded.world.elapsedSeconds).toBeGreaterThanOrEqual(saved.world.elapsedSeconds);
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText(saved.character.name);
  await expect(page.locator('#game')).toHaveAttribute('data-px', String(Math.round(saved.world.x)));
  await expect(page.locator('#game')).toHaveAttribute('data-py', String(Math.round(saved.world.y)));
  await expect(page.locator('#game')).toHaveAttribute('data-art-missing', '0');
  await expect(page.locator('#game')).toHaveAttribute('data-art-warnings', '0');
  expect(assetRequests.length).toBeGreaterThan(14);
  expect(assetRequests.every(pathname => pathname.startsWith(`${prefix}assets/`)), JSON.stringify(assetRequests)).toBe(true);
  expect(errors).toEqual([]); expect(failed).toEqual([]); expect(httpErrors).toEqual([]);
  if (process.env.CI) console.log('Deployment check: reload, Continue and network passed');
});

test('the preserved foundation entry starts and moves beneath the published repository prefix', async ({ page }) => {
  const errors: string[] = [], httpErrors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${siteURL}foundation.html`);
  await page.getByRole('button', { name: 'Mở cảnh thử' }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect(page.locator('#scene-status')).toContainText('Vị trí 320, 270');
  await page.keyboard.down('d');
  try {
    await expect.poll(async () => Number((await page.locator('#scene-status').innerText()).match(/Vị trí (\d+),/)?.[1]), { intervals: [25] }).toBeGreaterThan(340);
  } finally { await page.keyboard.up('d'); }
  expect(errors).toEqual([]); expect(httpErrors).toEqual([]);
});
