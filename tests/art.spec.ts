import { clickGameMenu } from './helpers/gameMenu';
import { expect, test, type Page } from '@playwright/test';
import { WORLD_ART_SHEETS } from '../src/game/world/ArtManifest';
import { createNewState } from '../src/game/model/state';
import { SAVE_KEY } from '../src/game/model/storage';

const appearance = {
  name: 'Người giữ bản cũ', race: 'human' as const, gender: 'female' as const,
  hair: 'braid' as const, hairColor: '#493b36', skinColor: '#e7bd92',
};

async function newGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
}

async function moveRight(page: Page): Promise<void> {
  const before = Number(await page.locator('#game').getAttribute('data-px'));
  await page.locator('#game').focus();
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')),
    { intervals: [25] }).toBeGreaterThan(before + 15);
  await page.keyboard.up('d');
}

test('raster sheets load without missing files and inventory uses readable native PNG icons', async ({ page }) => {
  const responses = new Map<string, number>();
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith('/assets/') && path.endsWith('.png')) responses.set(path, response.status());
  });
  await newGame(page);
  const expectedFrames = WORLD_ART_SHEETS.reduce((count, sheet) => count + sheet.frames.length, 0);
  await expect(page.locator('#game')).toHaveAttribute('data-art-world-frames', String(expectedFrames));
  await expect(page.locator('#game')).toHaveAttribute('data-art-missing', '0');
  await expect(page.locator('#game')).toHaveAttribute('data-art-warnings', '0');
  expect(Number(await page.locator('#game').getAttribute('data-art-player-frames'))).toBeGreaterThan(0);
  for (const sheet of WORLD_ART_SHEETS) expect(responses.get(new URL(sheet.path, page.url()).pathname)).toBe(200);
  expect([...responses.values()].every(status => status === 200)).toBe(true);
  await clickGameMenu(page, '[data-panel="inventory"]');
  const icons = page.locator('.inventory-slot .item-icon img');
  expect(await icons.count()).toBeGreaterThan(0);
  expect(await icons.evaluateAll(nodes => nodes.every(node => {
    const image = node as HTMLImageElement;
    return image.complete && image.naturalWidth === 32 && image.naturalHeight === 32
      && image.src.startsWith('data:image/png');
  }))).toBe(true);
  expect(errors).toEqual([]);
});

test('the enlarged game keeps its canvas, controls and readable help through panel changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  const titleImage = page.waitForResponse(response => new URL(response.url()).pathname === '/assets/ui/title_landscape_v1.png');
  await page.goto('/');
  expect((await titleImage).status()).toBe(200);
  expect(await page.locator('#app').evaluate(node => getComputedStyle(node).backgroundImage)).toContain('title_landscape_v1.png');
  await expect(page.locator('#create-button')).toBeVisible();
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  const canvas = page.locator('#game canvas');
  await canvas.evaluate(node => { (node as HTMLElement).dataset.artPreserved = 'true'; });
  const box = (await canvas.boundingBox())!;
  expect(box.width).toBeGreaterThan(1100);
  expect(box.width).toBeCloseTo(1280, 0);
  expect(box.height).toBeCloseTo(900, 0);
  expect(box.x).toBeCloseTo(0, 0);
  expect(box.y).toBeCloseTo(0, 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  await page.locator('#game').focus();
  await page.keyboard.press('h', { delay: 100 });
  await expect(page.locator('.controls-list')).toContainText('WASD');
  await expect(page.locator('.help-save')).toBeVisible();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
  await page.keyboard.press('Escape', { delay: 100 });
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await expect(canvas).toHaveAttribute('data-art-preserved', 'true');
  await moveRight(page);
  await expect(page.locator('.game-controls, .sidebar-note')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('missing PNGs keep the procedural game and icon fallback usable without replacing an earlier save', async ({ page }) => {
  const oldRaw = JSON.stringify(createNewState(appearance));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ key, raw }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
  }, { key: SAVE_KEY, raw: oldRaw });
  await page.route(/\/assets\/.*\.png(?:\?.*)?$/, route => route.abort());
  await newGame(page);
  await expect(page.locator('#game')).toHaveAttribute('data-art-world-frames', '0');
  await expect(page.locator('#game')).toHaveAttribute('data-art-player-frames', '0');
  expect(Number(await page.locator('#game').getAttribute('data-art-missing'))).toBeGreaterThan(0);
  expect(Number(await page.locator('#game').getAttribute('data-art-warnings'))).toBeGreaterThan(0);
  await moveRight(page);
  await clickGameMenu(page, '[data-panel="inventory"]');
  await expect(page.locator('.inventory-slot .item-icon img')).toHaveCount(0);
  const fallback = page.locator('.inventory-slot .item-icon');
  expect(await fallback.count()).toBeGreaterThan(0);
  expect((await fallback.allTextContents()).every(text => text.trim().length > 0)).toBe(true);
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
  await page.reload();
  await expect(page.locator('#continue-button')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
  expect(errors).toEqual([]);
});
