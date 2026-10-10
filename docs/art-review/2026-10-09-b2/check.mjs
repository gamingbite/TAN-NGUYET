import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const folder = dirname(fileURLToPath(import.meta.url));
const files = ['identity.png', 'swordsman-states.png', 'mage-states.png', 'swordsman-motion.png', 'mage-motion.png'];
const result = { checkedAt: new Date().toISOString(), status: 'running', source: 'local-file-gallery', images: [], viewports: [], pageErrors: [], externalRequests: [], checks: [], failures: [] };
let browser;
try {
  for (const name of files) {
    const file = join(folder, name);
    const bytes = await readFile(file);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${name}: PNG signature`);
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    assert(width > 0 && height > 0, `${name}: nonzero dimensions`);
    result.images.push({ file: name, width, height, bytes: (await stat(file)).size, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('pageerror', error => result.pageErrors.push(String(error)));
  page.on('request', request => { if (/^https?:/i.test(request.url())) result.externalRequests.push(request.url()); });
  const href = pathToFileURL(join(folder, 'index.html')).href;
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(href, { waitUntil: 'load' });
    await page.locator('.art-link img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const layout = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth, firstImageTop: document.querySelector('.art-link img').getBoundingClientRect().top, images: [...document.querySelectorAll('.art-link img')].map(image => ({ loaded: image.complete && image.naturalWidth > 0, width: image.naturalWidth, height: image.naturalHeight })), errorStatuses: document.querySelectorAll('.load-status.error').length }));
    assert.equal(layout.images.length, 5, 'Five concept boards shown');
    assert(layout.images.every(image => image.loaded), 'All concept boards loaded');
    assert.equal(layout.errorStatuses, 0, 'No image loading error');
    assert(layout.scrollWidth <= layout.innerWidth, `No horizontal page overflow at ${viewport.width}`);
    assert(layout.firstImageTop < viewport.height - 60, `First art board visibly starts in initial viewport at ${viewport.width}`);
    await page.getByRole('button', { name: 'Nền tối', exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.getByRole('button', { name: 'Nền sáng', exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    const artLink = page.locator('.art-link').first();
    await artLink.focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('#zoom-dialog').evaluate(dialog => dialog.open), 'Keyboard opens zoom');
    assert.equal(await page.locator('#zoom-image').evaluate(image => getComputedStyle(image).imageRendering), 'pixelated', 'Zoom preserves pixel edges');
    await page.keyboard.press('+');
    assert.equal(await page.locator('#zoom-value').textContent(), '150%');
    await page.keyboard.press('-');
    assert.equal(await page.locator('#zoom-value').textContent(), '100%');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#zoom-dialog').evaluate(dialog => dialog.open), false, 'Escape closes zoom');
    assert(await artLink.evaluate(link => document.activeElement === link), 'Keyboard focus returns to image link');
    // Let Edge paint each full-resolution board before capturing beyond the viewport.
    for (const image of await page.locator('.art-link img').all()) {
      await image.scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const screenshot = viewport.width === 1280 ? 'overview.png' : 'overview-mobile.png';
    await page.screenshot({ path: join(folder, screenshot), fullPage: true });
    await page.screenshot({ path: join(folder, viewport.width === 1280 ? 'header-desktop.png' : 'header-mobile.png') });
    result.viewports.push({ ...viewport, ...layout, screenshot, zoomKeyboard: 'passed', themeToggle: 'passed' });
  }
  const oldGallery = fileURLToPath(new URL('../../../.cache/art-review/2026-10-09/index.html', pathToFileURL(join(folder, 'index.html'))));
  assert((await stat(oldGallery)).isFile(), 'Original A–D gallery link resolves');
  assert.equal(result.pageErrors.length, 0, 'No browser page errors');
  assert.equal(result.externalRequests.length, 0, 'No external network requests');
  result.checks = ['Five PNG signatures and dimensions', 'All five browser images decode', 'Desktop/mobile page width', 'Keyboard zoom and Escape/focus return', 'Light/dark page toggle', 'Original A–D gallery link', 'Zero page errors/external requests'];
  result.status = 'passed';
} catch (error) {
  result.status = 'failed';
  result.failures.push(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
} finally {
  await browser?.close();
  await writeFile(join(folder, 'result.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ status: result.status, images: result.images.map(({ file, width, height }) => ({ file, width, height })), viewports: result.viewports.length, pageErrors: result.pageErrors.length, failures: result.failures }));
}
