import { clickGameMenu } from './helpers/gameMenu';
import { expect, test, type Page } from '@playwright/test';
import { BALANCE, CLASSES, ITEMS, RACES } from '../src/game/model/catalog';
import {
  acceptQuest, addItem, completeQuest, countItem, craftItem, createNewState,
  gainXp, learnClass, learnRecipe, maxHp, maxMp,
} from '../src/game/model/state';
import { loadGame, SAVE_KEY } from '../src/game/model/storage';
import type { CharacterAppearance, GameState, RaceId } from '../src/game/model/types';

// Saved fixtures set up a specific existing player situation. All changes under
// test then use real UI buttons or keyboard controls; the app exposes no cheats.
const appearance: CharacterAppearance = {
  name: 'An Nguyệt', race: 'human', gender: 'female', hair: 'braid',
  hairColor: '#493b36', skinColor: '#e7bd92',
};

function freshAt(x: number, y: number): GameState {
  const state = createNewState(appearance);
  state.world.x = x;
  state.world.y = y;
  return state;
}

function craftedAt(x: number, y: number): GameState {
  const state = freshAt(x, y);
  acceptQuest(state, 'work');
  state.progress.oreMined = BALANCE.workOreGoal;
  addItem(state, 'ore', BALANCE.workOreGoal);
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(true);
  return state;
}

async function openFixture(page: Page, state: GameState): Promise<void> {
  const raw = JSON.stringify(state);
  // Exercise the same validator that guards Continue before using a fixture.
  expect(loadGame({ getItem: () => raw } as unknown as Storage).error).toBeNull();
  await page.addInitScript(({ key, value }) => {
    // Reload must retain the save made by UI actions, rather than re-seed it.
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: SAVE_KEY, value: raw });
  await page.goto('/');
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await expect(page.locator('#game canvas')).toBeVisible();
}

async function savedState(page: Page): Promise<GameState> {
  const raw = await page.evaluate(key => localStorage.getItem(key), SAVE_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as GameState;
}

async function saveAndRead(page: Page): Promise<GameState> {
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('Đã lưu tiến độ');
  return savedState(page);
}

async function openNPC(page: Page, title: string): Promise<void> {
  await page.locator('#game').focus();
  await expect(page.locator('#interaction-text')).toContainText('E · Trò chuyện');
  // Phaser consumes key transitions during its update frame. Keep the press
  // down across a frame instead of sending an instantaneous synthetic tap.
  await page.keyboard.press('e', { delay: 100 });
  await expect(page.locator('#panel-title')).toHaveText(title);
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
}

async function closePanel(page: Page): Promise<void> {
  await page.locator('#panel-close').click();
  await expect(page.locator('#panel-overlay')).toBeHidden();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await page.locator('#game').focus();
}

function persistentProgress(state: GameState): unknown {
  return {
    character: state.character, level: state.level, xp: state.xp,
    classId: state.classId, unlockedClasses: state.unlockedClasses,
    inventory: state.inventory, equipped: state.equipped,
    recipes: state.learnedRecipes, coins: state.coins,
    quests: state.quests, progress: state.progress,
    travel: state.world.travelUnlocked,
  };
}

for (const race of Object.keys(RACES) as RaceId[]) {
  test(`new ${race} character starts balanced, moves and pauses on the production build`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('#continue-button')).toHaveCount(0);
    await page.locator('#character-name').fill(`Lữ khách ${race}`);
    await page.locator('#race').selectOption(race);
    await page.locator('#gender').selectOption('male');
    await page.locator('#hair').selectOption('short');
    await page.locator('#hair-color').selectOption('#ced8d0');
    await page.locator('#skin-color').selectOption('#8d5d45');
    const preview = page.locator('#character-portrait').locator('.b2-portrait, .pixel-portrait');
    await expect(preview).toHaveAttribute('data-race', race);
    await expect(preview).toHaveAttribute('data-gender', 'male');
    await expect(preview).toHaveAttribute('data-hair', 'short');
    const rasterPreview = page.locator('#character-portrait img.b2-portrait');
    if (await rasterPreview.count()) {
      await expect(rasterPreview).toHaveAttribute('src', /^data:image\/png;base64,/);
      await expect.poll(() => rasterPreview.evaluate((image: HTMLImageElement) => ({
        decoded: image.complete, width: image.naturalWidth, height: image.naturalHeight,
      }))).toEqual({ decoded: true, width: 32, height: 42 });
    }
    await page.locator('#create-button').click();
    await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('#hud-name')).toHaveText(`Lữ khách ${race}`);
    await expect(page.locator('#hud-class')).toHaveText(CLASSES.civilian);
    await expect(page.locator('#hud-level')).toHaveText('1');
    await expect(page.locator('#hud-hp')).toHaveText('100 / 100');
    await expect(page.locator('#hud-mp')).toHaveText('60 / 60');
    await page.locator('#game').focus();
    await page.keyboard.down('d');
    await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')),
      { intervals: [25] }).toBeGreaterThan(510);
    await page.keyboard.up('d');
    await clickGameMenu(page, '#pause-button');
    const pausedX = await page.locator('#game').getAttribute('data-px');
    await page.keyboard.down('d');
    await page.waitForTimeout(200);
    await page.keyboard.up('d');
    expect(await page.locator('#game').getAttribute('data-px')).toBe(pausedX);
    await closePanel(page);
    if (race === 'human') {
      // With movement keys released, Shift must still move the character in
      // its last facing direction. This checks an actual dodge in the world.
      const beforeDodge = Number(await page.locator('#game').getAttribute('data-px'));
      await page.keyboard.press('Shift', { delay: 100 });
      await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')),
        { intervals: [25] }).toBeGreaterThan(beforeDodge + 35);
    }
    const state = await saveAndRead(page);
    expect(state.character).toEqual({
      name: `Lữ khách ${race}`, race, gender: 'male', hair: 'short',
      hairColor: '#ced8d0', skinColor: '#8d5d45',
    });
    expect([state.classId, state.level, state.hp, state.mp]).toEqual(['civilian', 1, 100, 60]);
    expect(state.coins).toEqual({ copper: 20, silver: 0, gold: 0 });
    expect(state.world.discovered.town.length).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
}

test('holding E mines once, releasing resets progress, and a depleted node grants no extra ore', async ({ page }) => {
  await openFixture(page, freshAt(755, 516));
  await expect(page.locator('#interaction-text')).toContainText('Khai thác quặng');
  await page.keyboard.down('e');
  await expect(page.locator('#interaction-fill')).not.toHaveAttribute('style', 'width: 0%;');
  await page.keyboard.up('e');
  await expect(page.locator('#interaction-fill')).toHaveAttribute('style', 'width: 0%;');
  await expect(page.locator('#game')).toHaveAttribute('data-ore', '0');
  await page.keyboard.down('e');
  await expect(page.locator('#game')).toHaveAttribute('data-ore', '1', { timeout: 5000 });
  await page.waitForTimeout(250);
  await page.keyboard.up('e');
  await expect(page.locator('#game')).toHaveAttribute('data-ore', '1');
  await expect(page.locator('#interaction-text')).toContainText('tái sinh');
  const state = await saveAndRead(page);
  expect(countItem(state, 'ore')).toBe(1);
  expect(state.progress.oreMined).toBe(1);
});

test('forge teaches and crafts a real weapon; repeating without materials leaves inventory intact', async ({ page }) => {
  const state = freshAt(186, 534);
  acceptQuest(state, 'work');
  state.progress.oreMined = 3;
  addItem(state, 'ore', 3);
  await openFixture(page, state);
  await openNPC(page, 'Thợ Rèn');
  await page.locator('[data-action="recipe"][data-id="sword"]').click();
  await page.locator('[data-action="craft"][data-id="sword"]').click();
  await expect(page.locator('#demo-toast')).toHaveAttribute('data-tone', 'success');
  await page.locator('[data-action="craft"][data-id="sword"]').click();
  await expect(page.locator('#demo-toast')).toHaveAttribute('data-tone', 'danger');
  await closePanel(page);
  const crafted = await saveAndRead(page);
  expect(crafted.learnedRecipes).toContain('sword');
  expect(countItem(crafted, 'ore')).toBe(0);
  expect(countItem(crafted, 'wood')).toBe(2);
  expect(countItem(crafted, 'sword')).toBe(1);
  expect(crafted.progress.craftedEquipment).toBe(true);
  expect(crafted.quests.work).toBe('ready');
  await page.locator('#game').focus();
  // Rejoin the original road before walking east; the added southern home
  // occupies the grass shortcut beside the forge.
  await page.keyboard.down('w');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-py')),
    { intervals: [25] }).toBeLessThan(500);
  await page.keyboard.up('w');
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')),
    { intervals: [25] }).toBeGreaterThan(265);
  await page.keyboard.up('d');
  await clickGameMenu(page, '[data-panel="craft"]');
  await page.locator('[data-action="craft"][data-id="sword"]').click();
  await expect(page.locator('#demo-toast')).toContainText('đúng NPC');
  await closePanel(page);
  expect((await saveAndRead(page)).inventory).toEqual(crafted.inventory);
});

test('trainer teaches both classes, retains weapon sets and shared XP, and enforces switch cooldown', async ({ page }) => {
  const state = craftedAt(276, 354);
  addItem(state, 'staff', 1);
  gainXp(state, 57);
  await openFixture(page, state);
  await openNPC(page, 'Người dạy Class');
  await page.locator('[data-action="learnClass"][data-id="swordsman"]').click();
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.swordsman);
  await page.locator('[data-action="learnClass"][data-id="mage"]').click();
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.mage);
  await page.locator('[data-action="class"][data-id="swordsman"]').click();
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.swordsman);
  await page.locator('[data-action="class"][data-id="mage"]').click();
  await expect(page.locator('#demo-toast')).toContainText('hồi chiêu 3 giây');
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.swordsman);
  // Opening panels pauses game time, so cooldown must elapse in the world.
  await closePanel(page);
  const resumedAt = (await saveAndRead(page)).world.elapsedSeconds;
  await expect.poll(async () => (await saveAndRead(page)).world.elapsedSeconds,
    { timeout: 8000, intervals: [250] }).toBeGreaterThan(resumedAt + 3);
  await clickGameMenu(page, '[data-panel="inventory"]');
  await page.locator('[data-action="class"][data-id="mage"]').click();
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.mage);
  await closePanel(page);
  const learned = await saveAndRead(page);
  expect([learned.level, learned.xp]).toEqual([state.level, state.xp]);
  expect(learned.equipped).toEqual({ swordsman: 'sword', mage: 'staff', armor: null });
  expect(learned.unlockedClasses).toEqual(['civilian', 'swordsman', 'mage']);
});

test('NPC day/night schedule still permits learning a class at its night location', async ({ page }) => {
  const state = craftedAt(430, 580);
  state.world.elapsedSeconds = BALANCE.daySeconds * .65 + 2;
  await openFixture(page, state);
  await expect(page.locator('#hud-clock')).toContainText('Đêm');
  await openNPC(page, 'Người dạy Class');
  await expect(page.locator('.npc-dialogue')).toContainText('Đêm xuống');
  await page.locator('[data-action="learnClass"][data-id="swordsman"]').click();
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.swordsman);
  await closePanel(page);
  expect((await saveAndRead(page)).progress.learnedClass).toBe(true);
});

test('alchemy brews HP/MP potions and shared cooldown prevents consuming the second bottle early', async ({ page }) => {
  const state = freshAt(756, 279);
  state.hp = 20;
  state.mp = 0;
  await openFixture(page, state);
  await openNPC(page, 'Nhà Giả Kim');
  for (const id of ['hp-potion', 'mp-potion']) {
    await page.locator(`[data-action="recipe"][data-id="${id}"]`).click();
    await page.locator(`[data-action="craft"][data-id="${id}"]`).click();
  }
  await closePanel(page);
  await page.locator('#hp-potion-button').click();
  await expect(page.locator('#hud-hp')).toHaveText('85 / 100');
  await expect(page.locator('#hp-potion-count')).toHaveText('×0');
  await page.locator('#mp-potion-button').click();
  await expect(page.locator('#mp-potion-count')).toHaveText('×1');
  await expect(page.locator('#demo-toast')).toContainText('hồi chiêu');
  await expect(page.locator('#potion-cooldown')).toHaveText('', { timeout: 8000 });
  await page.locator('#mp-potion-button').click();
  await expect(page.locator('#hud-mp')).toHaveText('60 / 60');
  const brewed = await saveAndRead(page);
  expect(brewed.progress.brewedPotion).toBe(true);
  expect(countItem(brewed, 'herb')).toBe(0);
  expect(countItem(brewed, 'hp-potion')).toBe(0);
  expect(countItem(brewed, 'mp-potion')).toBe(0);
});

test('merchant trades at actual prices, keeps currencies separate and protects the last equipped weapon', async ({ page }) => {
  const state = craftedAt(620, 355);
  learnClass(state, 'swordsman');
  state.coins = { copper: 60, silver: 7, gold: 2 };
  await openFixture(page, state);
  await openNPC(page, 'Thương nhân');
  await page.locator('[data-action="buy"][data-id="wood"]').click();
  await page.locator('[data-action="sell"][data-id="wood"]').click();
  await page.locator('[data-action="sell"][data-id="sword"]').click();
  await expect(page.locator('#demo-toast')).toHaveAttribute('data-tone', 'danger');
  await closePanel(page);
  const traded = await saveAndRead(page);
  expect(traded.coins).toEqual({ copper: 60 - ITEMS.wood.buy + ITEMS.wood.sell, silver: 7, gold: 2 });
  expect(countItem(traded, 'wood')).toBe(countItem(state, 'wood'));
  expect(countItem(traded, 'sword')).toBe(1);
  expect(traded.equipped.swordsman).toBe('sword');
});

test('saving and Continue preserve class, bag, quests, exploration and an unlocked travel point', async ({ page }) => {
  // Keep a generous safe margin from the slime even when HUD position samples
  // arrive after several movement frames on a busy browser.
  const state = craftedAt(70, 280);
  learnClass(state, 'swordsman');
  completeQuest(state, 'work');
  acceptQuest(state, 'seal');
  state.world.zone = 'forest';
  state.world.visited = ['town', 'forest'];
  state.world.travelUnlocked = true;
  state.world.discovered.forest = ['2,3', '3,3'];
  await openFixture(page, state);
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px')),
    { intervals: [25] }).toBeGreaterThan(100);
  await page.keyboard.up('d');
  const beforeReload = await saveAndRead(page);
  await page.reload();
  await expect(page.locator('#continue-button')).toBeVisible();
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
  await expect(page.locator('#hud-class')).toHaveText(CLASSES.swordsman);
  const continued = await saveAndRead(page);
  expect(persistentProgress(continued)).toEqual(persistentProgress(beforeReload));
  expect(continued.world.discovered.forest).toEqual(expect.arrayContaining(beforeReload.world.discovered.forest));
  expect(continued.world.x).toBeCloseTo(beforeReload.world.x, 0);
  await clickGameMenu(page, '[data-panel="map"]');
  await expect(page.locator('[data-action="travel"]')).toBeEnabled();
  await page.locator('[data-action="travel"]').click();
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town');
  await expect(page.locator('#game')).toHaveAttribute('data-px', '480');
  await expect(page.locator('#game')).toHaveAttribute('data-py', '400');
});

test('malformed saved data is reported and remains intact when Continue or a new-game save is attempted', async ({ page }) => {
  const raw = '{invalid-player-save';
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: SAVE_KEY, value: raw });
  await page.goto('/');
  await expect(page.locator('[role="alert"]')).toContainText('lỗi JSON');
  await page.locator('#continue-button').click();
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'title');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await clickGameMenu(page, '#save-button');
  await expect(page.locator('#demo-toast')).toContainText('giữ nguyên');
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(raw);
});

test('trying a new character preserves the old save until an explicit save replaces it', async ({ page }) => {
  const previous = createNewState({ ...appearance, name: 'Old Moon' });
  const raw = JSON.stringify(previous);
  expect(loadGame({ getItem: () => raw } as unknown as Storage).error).toBeNull();
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: SAVE_KEY, value: raw });
  await page.goto('/');
  await page.locator('#character-name').fill('New Moon');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText('New Moon');
  await page.reload();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(raw);
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText('Old Moon');

  await clickGameMenu(page, '#pause-button');
  await page.locator('[data-action="title"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'title');
  await page.locator('#character-name').fill('New Moon');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  expect((await saveAndRead(page)).character.name).toBe('New Moon');
  await page.reload();
  expect((await savedState(page)).character.name).toBe('New Moon');
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText('New Moon');
});

test('a real enemy hit causes checkpoint revival without losing inventory or quest progress', async ({ page }) => {
  const state = craftedAt(275, 408);
  learnClass(state, 'swordsman');
  state.world.zone = 'forest';
  state.world.visited = ['town', 'forest'];
  state.world.discovered.forest = ['8,12'];
  state.hp = 1;
  const protectedState = persistentProgress(state);
  await openFixture(page, state);
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town', { timeout: 15000 });
  await expect(page.locator('#game')).toHaveAttribute('data-px', '480');
  await expect(page.locator('#game')).toHaveAttribute('data-py', '400');
  await expect(page.locator('#hud-hp')).toHaveText(`${maxHp(state)} / ${maxHp(state)}`);
  await expect(page.locator('#hud-mp')).toHaveText(`${maxMp(state)} / ${maxMp(state)}`);
  const revived = await saveAndRead(page);
  expect(persistentProgress(revived)).toEqual(protectedState);
  expect(revived.world.discovered.forest).toEqual(expect.arrayContaining(['8,12']));
  expect(revived.checkpoint).toEqual(state.checkpoint);
});

test('a zero-HP persisted character resumes at checkpoint with its belongings intact', async ({ page }) => {
  const state = craftedAt(180, 320);
  learnClass(state, 'swordsman');
  state.world.zone = 'forest';
  state.world.visited = ['town', 'forest'];
  state.hp = 0;
  await openFixture(page, state);
  await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town');
  await expect(page.locator('#hud-hp')).toHaveText(`${maxHp(state)} / ${maxHp(state)}`);
  expect(persistentProgress(await saveAndRead(page))).toEqual(persistentProgress(state));
});
