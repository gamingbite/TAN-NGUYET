import { clickGameMenu } from './helpers/gameMenu';
import { moveKeyboardAxis } from './helpers/keyboardMovement';
import { expect, test, type Page } from '@playwright/test';
import { BALANCE } from '../src/game/model/catalog';
import {
  acceptQuest, addItem, completeQuest, craftItem, createNewState, learnClass, learnRecipe, updateQuests,
} from '../src/game/model/state';
import { loadGame, SAVE_KEY } from '../src/game/model/storage';
import type { GameState } from '../src/game/model/types';

function freshAt(x = 480, y = 400): GameState {
  const state = createNewState({
    name: 'Theo dấu trăng', race: 'human', gender: 'female', hair: 'braid',
    hairColor: '#493b36', skinColor: '#e7bd92',
  });
  state.world.x = x; state.world.y = y;
  return state;
}

function bossQuestAt(x: number, y: number): GameState {
  const state = freshAt(x, y);
  expect(acceptQuest(state, 'work').ok).toBe(true);
  state.progress.oreMined = BALANCE.workOreGoal;
  expect(addItem(state, 'ore', BALANCE.workOreGoal).ok).toBe(true);
  expect(learnRecipe(state, 'sword').ok).toBe(true);
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect(acceptQuest(state, 'seal').ok).toBe(true);
  state.progress.sealBroken = true;
  state.progress.sealKills = BALANCE.sealKillGoal;
  state.progress.sealResolved = true;
  expect(completeQuest(state, 'seal').ok).toBe(true);
  expect(acceptQuest(state, 'boss').ok).toBe(true);
  return state;
}

// Each test uses Playwright's isolated profile. Fixtures pass the same save
// validator as Continue; progress changes under test use player controls.
async function startFixture(page: Page, state: GameState): Promise<void> {
  const raw = JSON.stringify(state);
  expect(loadGame({ getItem: () => raw } as unknown as Storage).error).toBeNull();
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: SAVE_KEY, value: raw });
  await page.goto('/');
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.locator('#game').focus();
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key, { delay: 100 });
}

async function closePanel(page: Page): Promise<void> {
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await page.locator('#game').focus();
}

// These town waypoints are connected by clear straight segments. Movement is
// measured from the running HUD, without assigning player coordinates.
async function moveAxis(page: Page, axis: 'px' | 'py', destination: number): Promise<void> {
  await moveKeyboardAxis(page, axis, destination);
  expect(Math.abs(destination - Number(await page.locator('#game').getAttribute(`data-${axis}`)))).toBeLessThan(15);
}

test('quest guide follows actual acceptance and three ore nodes, then points to the forge', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'elder');
  await expect(page.locator('#quest-guide-label')).toContainText('Trưởng làng');
  await moveAxis(page, 'py', 240);
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-near', 'true');
  await press(page, 'e');
  await expect(page.locator('#panel-title')).toHaveText('Trưởng làng');
  await page.locator('[data-action="quest"][data-id="work"]').click();
  await closePanel(page);
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'town-ore-1');
  await expect(page.locator('#quest-guide-objective')).toContainText('0/3');

  for (const [index, [x, y]] of [[755, 516], [820, 520], [874, 480]].entries()) {
    await moveAxis(page, 'px', x);
    await moveAxis(page, 'py', y);
    await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', `town-ore-${index + 1}`);
    await expect(page.locator('#quest-guide-action')).toContainText('Giữ E');
    await page.keyboard.down('e');
    try { await expect(page.locator('#game')).toHaveAttribute('data-ore', String(index + 1), { timeout: 5000 }); }
    finally { await page.keyboard.up('e'); }
    await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', index === 2 ? 'forge' : `town-ore-${index + 2}`);
  }
  await expect(page.locator('#quest-guide-label')).toContainText('Thợ rèn');
  await clickGameMenu(page, '#save-button');
  const saved: GameState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(saved.progress.oreMined).toBe(3);
  expect(saved.progress.craftedEquipment).toBe(false);
  expect(saved.quests.work).toBe('active');
  expect(saved.progress.secretFound).toBe(false);
  expect(errors).toEqual([]);
});

test('guide follows the elder when the day changes to night and the destination remains interactable', async ({ page }) => {
  const state = freshAt(480, 550);
  state.world.elapsedSeconds = BALANCE.daySeconds * .65 - 4;
  await startFixture(page, state);
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'elder');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-near', 'false');
  await expect(page.locator('#hud-clock')).toContainText('Đêm', { timeout: 8000 });
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-near', 'true');
  await expect(page.locator('#quest-guide-action')).toContainText('E');
  await press(page, 'e');
  await expect(page.locator('#panel-title')).toHaveText('Trưởng làng');
  await expect(page.locator('.npc-dialogue')).toContainText('Đêm');
  await page.locator('[data-action="quest"][data-id="work"]').click();
  await closePanel(page);
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'town-ore-1');
});

test('guide selects each local exit toward the dungeon and reconstructs its target after Continue', async ({ page }) => {
  const state = bossQuestAt(896, 320);
  await startFixture(page, state);
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'town-forest');
  await expect(page.locator('#quest-guide-label')).toContainText('Rừng');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-near', 'true');
  await press(page, 'e');
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'forest-dungeon');
  await expect(page.locator('#quest-guide-label')).toContainText('Hầm');
  await expect(page.locator('#quest-guide-objective')).toContainText('Người Canh');
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('Đã lưu tiến độ');
  await page.reload();
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'forest-dungeon');
});

test('Boss hand-in hides the guide while free play and saved completion stay available', async ({ page }) => {
  const state = bossQuestAt(480, 240);
  state.progress.bossDefeated = true;
  updateQuests(state);
  await startFixture(page, state);
  await expect(page.locator('#quest-guide')).toBeVisible();
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'elder');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-near', 'true');
  await press(page, 'e');
  await expect(page.locator('#panel-title')).toHaveText('Trưởng làng');
  await page.locator('[data-action="quest"][data-id="boss"]').click();
  await expect(page.locator('.ending-text')).toContainText('tự do khám phá');
  await page.locator('[data-action="resume"]').click();
  await expect(page.locator('#game')).toHaveAttribute('data-completed', 'true');
  await expect(page.locator('#quest-guide')).toBeHidden();
  await clickGameMenu(page, '#save-button');
  await page.reload();
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#quest-guide')).toBeHidden();
  const before = Number(await page.locator('#game').getAttribute('data-py'));
  await page.locator('#game').focus();
  await page.keyboard.down('s'); await page.waitForTimeout(300); await page.keyboard.up('s');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-py'))).toBeGreaterThan(before + 10);
});

test('quest guide stays inside the full viewport canvas and survives pause without replacing the game', async ({ page }) => {
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.locator('#game canvas').evaluate(canvas => { (canvas as HTMLElement).dataset.preserved = 'true'; });
  for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080], [500, 800]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('#quest-guide')).toBeVisible();
    const layout = await page.evaluate(() => {
      const guide = document.querySelector('#quest-guide')!.getBoundingClientRect();
      const canvas = document.querySelector('#game canvas')!.getBoundingClientRect();
      const children = ['#quest-guide-objective', '#quest-guide-label', '#quest-guide-action']
        .map(selector => document.querySelector(selector)!.getBoundingClientRect());
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        guide: { left: guide.left, right: guide.right, top: guide.top, bottom: guide.bottom },
        canvas: { left: canvas.left, right: canvas.right, top: canvas.top, bottom: canvas.bottom, width: canvas.width, height: canvas.height },
        childrenContained: children.every(rect => rect.left >= guide.left - 1 && rect.right <= guide.right + 1
          && rect.top >= guide.top - 1 && rect.bottom <= guide.bottom + 1),
      };
    });
    expect(layout.overflow, `${width}×${height}: horizontal overflow`).toBe(false);
    expect(layout.guide.left).toBeGreaterThanOrEqual(0);
    expect(layout.guide.right).toBeLessThanOrEqual(width);
    expect(layout.canvas.width).toBeCloseTo(width, 0);
    expect(layout.canvas.height).toBeCloseTo(height, 0);
    expect(layout.guide.left).toBeGreaterThanOrEqual(layout.canvas.left);
    expect(layout.guide.right).toBeLessThanOrEqual(layout.canvas.right);
    expect(layout.guide.top).toBeGreaterThanOrEqual(layout.canvas.top);
    expect(layout.guide.bottom).toBeLessThanOrEqual(layout.canvas.bottom);
    expect(layout.childrenContained, `${width}×${height}: guide text stays contained`).toBe(true);
    if (width >= 1280) expect(layout.guide.bottom).toBeLessThanOrEqual(height);
  }
  await clickGameMenu(page, '#pause-button');
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
  const pausedX = await page.locator('#game').getAttribute('data-px');
  await page.keyboard.down('d'); await page.waitForTimeout(250); await page.keyboard.up('d');
  expect(await page.locator('#game').getAttribute('data-px')).toBe(pausedX);
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await expect(page.locator('#quest-guide')).toHaveAttribute('data-target', 'elder');
  await expect(page.locator('#game canvas')).toHaveAttribute('data-preserved', 'true');
});
