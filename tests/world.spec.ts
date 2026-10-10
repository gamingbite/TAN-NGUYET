import { clickGameMenu } from './helpers/gameMenu';
import { expect, test, type Page } from '@playwright/test';
import {
  acceptQuest, addItem, changeClass, completeQuest, countItem, craftItem,
  createNewState, learnClass, learnRecipe,
} from '../src/game/model/state';
import { loadGame, SAVE_KEY } from '../src/game/model/storage';
import type { GameState } from '../src/game/model/types';

function fresh(x: number, y: number): GameState {
  const state = createNewState({
    name: 'World traveler', race: 'elf', gender: 'female', hair: 'long',
    hairColor: '#ced8d0', skinColor: '#e7bd92',
  });
  state.world.x = x;
  state.world.y = y;
  return state;
}

function forest(x: number, y: number, bothClasses = false): GameState {
  const state = fresh(x, y);
  acceptQuest(state, 'work');
  state.progress.oreMined = 3;
  addItem(state, 'ore', 3);
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect(acceptQuest(state, 'seal').ok).toBe(true);
  if (bothClasses) {
    addItem(state, 'staff', 1);
    learnClass(state, 'mage');
    changeClass(state, 'swordsman', false);
  }
  state.world.zone = 'forest';
  state.world.visited = ['town', 'forest'];
  return state;
}

async function fixture(page: Page, state: GameState): Promise<string> {
  const raw = JSON.stringify(state);
  expect(loadGame({ getItem: () => raw } as unknown as Storage).error).toBeNull();
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: SAVE_KEY, value: raw });
  await page.goto('/');
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.locator('#game').focus();
  return raw;
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key, { delay: 100 });
}

async function save(page: Page): Promise<GameState> {
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('Đã lưu tiến độ');
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!) as GameState, SAVE_KEY);
}

async function close(page: Page): Promise<void> {
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await page.locator('#game').focus();
}

async function moveTo(page: Page, axis: 'px' | 'py', target: number): Promise<void> {
  const current = Number(await page.locator('#game').getAttribute(`data-${axis}`));
  const increasing = current < target;
  const key = axis === 'px' ? increasing ? 'd' : 'a' : increasing ? 's' : 'w';
  await page.locator('#game').focus();
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(({ coordinate, destination, positive }) => {
      const current = Number(document.getElementById('game')?.getAttribute(`data-${coordinate}`));
      return positive ? current >= destination - 5 : current <= destination + 5;
    }, { coordinate: axis, destination: target, positive: increasing }, { timeout: 5000 });
  } finally { await page.keyboard.up(key); }
}

test('a hidden discovery grants its item, copper and XP once, including after Continue', async ({ page }) => {
  // South of the secret, outside the northern wolf's patrol/detection range.
  const state = forest(760, 565);
  await fixture(page, state);
  await expect(page.locator('#interaction-text')).toContainText('Phiến đá cũ');
  await press(page, 'e');
  await expect(page.locator('#hud-copper')).toHaveText(String(state.coins.copper + 25));
  const found = await save(page);
  expect(found.progress.secretFound).toBe(true);
  expect(countItem(found, 'moon-shard')).toBe(1);
  expect(found.xp).toBe(state.xp + 15);
  await page.locator('#game').focus();
  await press(page, 'e');
  await expect(page.locator('#demo-toast')).toContainText('đã trống');
  const repeated = await save(page);
  expect([repeated.coins, repeated.xp, repeated.inventory]).toEqual([found.coins, found.xp, found.inventory]);
  await page.reload();
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#interaction-text')).toContainText('Phiến đá cũ');
  await page.locator('#game').focus();
  await press(page, 'e');
  await expect(page.locator('#demo-toast')).toContainText('đã trống');
  const continued = await save(page);
  expect([continued.coins, continued.xp, continued.inventory]).toEqual([found.coins, found.xp, found.inventory]);
});

test('a depleted ore node respawns in the running world and can be mined again', async ({ page }) => {
  test.setTimeout(40_000);
  await fixture(page, fresh(755, 516));
  await page.keyboard.down('e');
  await expect(page.locator('#game')).toHaveAttribute('data-ore', '1', { timeout: 5000 });
  await page.keyboard.up('e');
  await expect(page.locator('#interaction-text')).toContainText('tái sinh');
  // Wait for the observable node becoming available, rather than skipping time.
  await expect(page.locator('#interaction-text')).toContainText('Khai thác quặng', { timeout: 25_000 });
  await page.keyboard.down('e');
  await expect(page.locator('#game')).toHaveAttribute('data-ore', '2', { timeout: 5000 });
  await page.keyboard.up('e');
  const mined = await save(page);
  expect(countItem(mined, 'ore')).toBe(2);
  expect(mined.progress.oreMined).toBe(2);
});

test('a normal slime respawns after being killed and grants fresh combat rewards when defeated again', async ({ page }) => {
  test.setTimeout(50_000);
  // This point reaches one slime with the area skill while remaining outside
  // the second slime's whole patrol/detection range.
  const state = forest(275, 335);
  await fixture(page, state);
  await press(page, '1');
  await expect(page.locator('#hud-copper')).toHaveText(String(state.coins.copper + 3));
  await expect(page.locator('#game')).toHaveAttribute('data-combat', 'false', { timeout: 8000 });
  const firstKill = await save(page);
  expect(firstKill.progress.kills).toBe(1);
  expect(firstKill.xp).toBe(state.xp + 8);
  // Combat returns when the respawned slime detects the stationary player.
  // No reload, scene change or injected time is used to recreate the enemy.
  await expect(page.locator('#game')).toHaveAttribute('data-combat', 'true', { timeout: 30_000 });
  await page.locator('#game').focus();
  await press(page, '1');
  await expect(page.locator('#hud-copper')).toHaveText(String(state.coins.copper + 6));
  await expect(page.locator('#game')).toHaveAttribute('data-combat', 'false', { timeout: 8000 });
  const secondKill = await save(page);
  expect(secondKill.progress.kills).toBe(2);
  expect(secondKill.xp).toBe(state.xp + 16);
});

test('travel stays locked until the stone is approached, then returns to town through the map', async ({ page }) => {
  const state = forest(100, 320);
  await fixture(page, state);
  await clickGameMenu(page, '[data-panel="map"]');
  await expect(page.locator('.travel-card')).toContainText('chưa mở');
  await expect(page.locator('[data-action="travel"]')).toHaveCount(0);
  await close(page);
  await moveTo(page, 'px', 120);
  const visited = await save(page);
  expect(visited.world.travelUnlocked).toBe(true);
  await clickGameMenu(page, '[data-panel="map"]');
  await expect(page.locator('[data-action="travel"]')).toBeEnabled();
  await page.locator('[data-action="travel"]').click();
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town');
  await expect(page.locator('#game')).toHaveAttribute('data-px', '480');
  await expect(page.locator('#game')).toHaveAttribute('data-py', '400');
});

test('active combat blocks saving and disables changing an unlocked Class', async ({ page }) => {
  const state = forest(275, 335, true);
  const previous = await fixture(page, state);
  await expect(page.locator('#game')).toHaveAttribute('data-combat', 'true');
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('thoát giao tranh');
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(previous);
  await clickGameMenu(page, '[data-panel="inventory"]');
  await expect(page.locator('[data-action="class"][data-id="mage"]')).toBeDisabled();
  await expect(page.locator('#hud-class')).toHaveText('Kiếm Sĩ');
  await close(page);
});

test('a partially resolved seal wave survives save/load and only the two remaining enemies need defeating', async ({ page }) => {
  const state = forest(100, 320);
  state.progress.sealBroken = true;
  state.progress.sealKills = 1;
  state.progress.kills = 1;
  await fixture(page, state);
  const before = await save(page);
  expect(before.progress.sealKills).toBe(1);
  await page.reload();
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-seal-kills', '1');
  await expect(page.locator('#game')).toHaveAttribute('data-seal-resolved', 'false');
  await moveTo(page, 'px', 450);
  await moveTo(page, 'py', 280);
  await expect(page.locator('#interaction-text')).toContainText('Phong ấn');
  await press(page, 'e');
  await expect(page.locator('#demo-toast')).toContainText('1/3');
  await press(page, '1');
  await press(page, '2');
  await expect(page.locator('#game')).toHaveAttribute('data-seal-kills', '3');
  await expect(page.locator('#game')).toHaveAttribute('data-seal-resolved', 'false');
  await press(page, 'e');
  await expect(page.locator('#game')).toHaveAttribute('data-seal-resolved', 'true');
  await clickGameMenu(page, '[data-panel="quests"]');
  await expect(page.locator('[data-quest="seal"]')).toHaveAttribute('data-status', 'ready');
  await close(page);
});
