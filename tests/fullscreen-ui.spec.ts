import { expect, test } from '@playwright/test';
import { clickGameMenu } from './helpers/gameMenu';
import { SETTINGS_KEY } from '../src/game/model/settings';

test('the viewport is the play field and readable HUD stays inside it across browser sizes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.locator('#game canvas').evaluate(canvas => { (canvas as HTMLElement).dataset.sameCanvas = 'true'; });
  for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }, { width: 500, height: 800 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => (await page.locator('#game canvas').boundingBox())?.width).toBe(viewport.width);
    const layout = await page.evaluate(() => {
      const canvas = document.querySelector('#game canvas')!;
      const box = canvas.getBoundingClientRect();
      const selectors = ['.player-hud', '.action-bar', '#quest-guide', '#game-menu-button', '.zone-heading'];
      const controls = selectors.map(selector => ({ selector, box: document.querySelector(selector)!.getBoundingClientRect() }));
      const fonts = ['#hud-name', '#hud-class', '#hud-hp', '#hud-mp', '#quest-guide-objective', '#quest-guide-action', '.skill-cooldown'].map(selector => ({ selector, size: parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize) }));
      const identity = document.querySelector('.hud-identity')!.getBoundingClientRect();
      const guide = document.querySelector('#quest-guide')!.getBoundingClientRect();
      return {
        canvas: { x: box.x, y: box.y, width: box.width, height: box.height },
        hudInside: controls.every(({ box: rect }) => rect.left >= box.left && rect.right <= box.right && rect.top >= box.top && rect.bottom <= box.bottom),
        fonts,
        centreIsCanvas: document.elementFromPoint(innerWidth / 2, innerHeight / 2) === canvas,
        identityPassesPointer: document.elementFromPoint(identity.x + identity.width / 2, identity.y + identity.height / 2) === canvas,
        guidePassesPointer: document.elementFromPoint(guide.x + guide.width / 2, guide.y + guide.height / 2) === canvas,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        verticalOverflow: document.documentElement.scrollHeight > innerHeight,
      };
    });
    expect(layout.canvas).toEqual({ x: 0, y: 0, ...viewport });
    expect(layout.hudInside, JSON.stringify({ viewport, layout })).toBe(true);
    expect(layout.fonts.every(({ size }) => size >= 12), JSON.stringify(layout.fonts)).toBe(true);
    expect(layout.fonts.find(({ selector }) => selector === '#hud-name')?.size).toBeGreaterThanOrEqual(16);
    expect(layout.centreIsCanvas).toBe(true);
    expect(layout.identityPassesPointer).toBe(true);
    expect(layout.guidePassesPointer).toBe(true);
    expect(layout.horizontalOverflow).toBe(false);
    expect(layout.verticalOverflow).toBe(false);
    await expect(page.locator('#game canvas')).toHaveAttribute('data-same-canvas', 'true');
  }
  await expect(page.locator('.game-toolbar, .game-topbar, .game-footer, .game-controls, .sidebar-note')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the corner menu pauses safely and exposes working help, settings and browser fullscreen', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  const menu = page.getByRole('button', { name: 'Menu trò chơi', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', { name: 'Menu trò chơi', exact: true })).toBeVisible();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
  for (const panel of ['inventory', 'quests', 'craft', 'map', 'help', 'settings', 'save-data']) await expect(page.locator(`[data-panel="${panel}"]`)).toBeVisible();
  await expect(page.locator('#save-button, #pause-button, #menu-fullscreen-button')).toHaveCount(3);
  const x = await page.locator('#game').getAttribute('data-px');
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  expect(await page.locator('#game').getAttribute('data-px')).toBe(x);
  await page.locator('[data-panel="help"]').click();
  await expect(page.locator('.controls-list')).toContainText('WASD');
  await page.keyboard.press('Escape');
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await expect(menu).toBeFocused();
  await clickGameMenu(page, '[data-panel="settings"]');
  await page.locator('#settings-volume').fill('45');
  await page.locator('#settings-muted').check();
  await page.locator('#settings-shake').uncheck();
  await page.locator('#settings-damage').uncheck();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SETTINGS_KEY)).toEqual({ volume: .45, muted: true, screenShake: false, showDamageNumbers: false });
  await page.locator('#panel-close').click();
  await clickGameMenu(page, '#menu-fullscreen-button');
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id)).toBe('app');
  await expect(page.locator('#menu-fullscreen-button')).toHaveText('Thoát toàn màn hình');
  await page.locator('#menu-fullscreen-button').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await page.locator('[data-action="resume"]').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await page.locator('#game').focus();
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px'))).toBeGreaterThan(Number(x) + 10);
  expect(errors).toEqual([]);
});

test('narrow-window panels keep their close button above the corner menu icon', async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 800 });
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  for (const panel of ['inventory', 'quests', 'craft', 'map', 'help', 'settings', 'save-data']) {
    await clickGameMenu(page, `[data-panel="${panel}"]`);
    await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
    const close = page.locator('#panel-close');
    await expect(close).toBeVisible();
    expect(await close.evaluate(button => {
      const box = button.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('#panel-close') === button;
    }), `${panel}: the close button receives the pointer`).toBe(true);
    // An ordinary pointer click must work; forcing it would hide interception.
    await close.click();
    await expect(page.locator('#panel-overlay')).toBeHidden();
    await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
    await expect(page.locator('#game-menu-button')).toBeFocused();
  }
});
