import { clickGameMenu } from './helpers/gameMenu';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../src/game/model/settings';
import { SAVE_BACKUP_PREFIX, SAVE_KEY, parseSave } from '../src/game/model/storage';
import { acceptQuest, addItem, completeQuest, craftItem, createNewState, learnClass, learnRecipe } from '../src/game/model/state';
import type { GameState } from '../src/game/model/types';

function fresh(name = 'Khách dưới trăng'): GameState {
  return createNewState({ name, race: 'elf', gender: 'female', hair: 'braid', hairColor: '#493b36', skinColor: '#e7bd92' });
}

function trained(): GameState {
  const state = fresh();
  acceptQuest(state, 'work');
  state.progress.oreMined = 3;
  addItem(state, 'ore', 3);
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect(acceptQuest(state, 'seal').ok).toBe(true);
  return state;
}

async function seedTitle(page: Page, raw: string): Promise<void> {
  await page.addInitScript(({ key, value }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
  }, { key: SAVE_KEY, value: raw });
  await page.goto('/');
}

async function startFixture(page: Page, state: GameState): Promise<void> {
  const raw = JSON.stringify(state);
  expect(parseSave(raw).error).toBeNull();
  await seedTitle(page, raw);
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
}

test('title settings persist without changing a saved character or starting the game', async ({ page }) => {
  const raw = JSON.stringify(fresh());
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await seedTitle(page, raw);
  await page.locator('#title-settings-button').click();
  await expect(page.locator('#panel-title')).toHaveText('Cài đặt trải nghiệm');
  await expect(page.locator('#settings-volume')).toHaveValue(String(DEFAULT_SETTINGS.volume * 100));
  await page.locator('#settings-volume').fill('35');
  await page.locator('#settings-muted').check();
  await page.locator('#settings-shake').uncheck();
  await page.locator('#settings-damage').uncheck();
  await expect(page.locator('#settings-volume-value')).toHaveText('35%');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SETTINGS_KEY)).toEqual({
    volume: .35, muted: true, screenShake: false, showDamageNumbers: false,
  });
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(raw);
  await expect(page.locator('#game canvas')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#panel-overlay')).toBeHidden();
  await expect(page.locator('#title-settings-button')).toBeFocused();
  await page.reload();
  await page.locator('#title-settings-button').click();
  await expect(page.locator('#settings-volume')).toHaveValue('35');
  await expect(page.locator('#settings-muted')).toBeChecked();
  await expect(page.locator('#settings-shake')).not.toBeChecked();
  await expect(page.locator('#settings-damage')).not.toBeChecked();
  expect(errors).toEqual([]);
});

test('settings pause the world and leave the canvas and quest progress intact', async ({ page }) => {
  const state = trained();
  await startFixture(page, state);
  await page.locator('#game canvas').evaluate(canvas => { (canvas as HTMLElement).dataset.preserved = 'true'; });
  await clickGameMenu(page, '#pause-button');
  await page.locator('#pause-settings-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
  const before = await page.locator('#game').getAttribute('data-px');
  await page.keyboard.down('d');
  await page.waitForTimeout(300);
  await page.keyboard.up('d');
  expect(await page.locator('#game').getAttribute('data-px')).toBe(before);
  await page.locator('#settings-muted').check();
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
  await expect(page.locator('#game canvas')).toHaveAttribute('data-preserved', 'true');
  await clickGameMenu(page, '#save-button');
  const saved: GameState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(saved.quests).toEqual(state.quests);
  expect(saved.inventory).toEqual(state.inventory);
  await clickGameMenu(page, '[data-panel="save-data"]');
  await expect(page.locator('#panel-title')).toHaveText('Bản lưu & sao lưu');
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
});

test('a settings storage failure keeps the previous displayed and effective preferences', async ({ page }) => {
  await page.addInitScript(({ key }) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name: string, value: string): void {
      if (name === key) throw new DOMException('Settings storage unavailable', 'QuotaExceededError');
      original.call(this, name, value);
    };
  }, { key: SETTINGS_KEY });
  await page.goto('/');
  await page.locator('#title-settings-button').click();
  await page.locator('#settings-volume').fill('20');
  await expect(page.locator('#settings-volume')).toHaveValue(String(DEFAULT_SETTINGS.volume * 100));
  await expect(page.locator('#settings-volume-value')).toHaveText(`${DEFAULT_SETTINGS.volume * 100}%`);
  await page.locator('#settings-muted').click();
  await expect(page.locator('#settings-muted')).not.toBeChecked();
  await expect(page.locator('#demo-toast')).toHaveAttribute('data-tone', 'danger');
  expect(await page.evaluate(key => localStorage.getItem(key), SETTINGS_KEY)).toBeNull();
});

test('selecting a valid import only previews it; explicit restore preserves the previous raw save', async ({ page }) => {
  const oldRaw = JSON.stringify(fresh('Người ở lại'));
  const incoming = trained();
  incoming.character.name = 'Người trở về';
  const raw = JSON.stringify(incoming);
  await seedTitle(page, oldRaw);
  await page.locator('#title-save-data-button').click();
  await page.locator('#import-save-file').setInputFiles({ name: 'restored.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
  await expect(page.locator('#import-preview')).toContainText(incoming.character.name);
  await expect(page.locator('#import-preview')).toContainText('Kiếm Sĩ');
  await expect(page.locator('#import-preview')).toContainText('Thị trấn Tro Tàn');
  await expect(page.locator('#restore-save-button')).toBeEnabled();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
  await expect(page.locator('#game canvas')).toHaveCount(0);
  await page.locator('#restore-save-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText(incoming.character.name);
  const backups = await page.evaluate(prefix => Object.keys(localStorage).filter(key => key.startsWith(prefix)).map(key => localStorage.getItem(key)), SAVE_BACKUP_PREFIX);
  expect(backups).toEqual([oldRaw]);
  const imported: GameState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect(imported.character).toEqual(incoming.character);
  expect(imported.quests).toEqual(incoming.quests);
  expect(imported.inventory).toEqual(incoming.inventory);
});

test('invalid and oversized imports cannot overwrite even a damaged existing save', async ({ page }) => {
  const oldRaw = '{my-damaged-but-important-save';
  await seedTitle(page, oldRaw);
  await page.locator('#title-save-data-button').click();
  await page.locator('#import-save-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{invalid') });
  await expect(page.locator('#import-status')).toHaveAttribute('data-tone', 'danger');
  await expect(page.locator('#restore-save-button')).toBeHidden();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
  await page.locator('#import-save-file').setInputFiles({ name: 'huge.json', mimeType: 'application/json', buffer: Buffer.alloc(200_001, 32) });
  await expect(page.locator('#import-status')).toContainText('File quá lớn');
  await expect(page.locator('#restore-save-button')).toBeHidden();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
});

test('export downloads the actual local save and works before a game has started', async ({ page }) => {
  const raw = JSON.stringify(trained());
  await seedTitle(page, raw);
  await page.locator('#title-save-data-button').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export-save-button').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^tan-nguyet-save-.*\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(await readFile(path!, 'utf8')).toBe(raw);
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(raw);
  await expect(page.locator('#game canvas')).toHaveCount(0);
});

test('a browser backup can be previewed without writes and restored explicitly while preserving every earlier save', async ({ page }) => {
  const current = trained();
  current.character.name = 'Hành trình hiện tại';
  const currentRaw = JSON.stringify(current);
  const earlier = fresh('Người của ngày trước');
  const earlierRaw = JSON.stringify(earlier);
  const backupKey = `${SAVE_BACKUP_PREFIX}2026-10-08T09-00-00-000Z-seeded`;
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: backupKey, raw: earlierRaw });
  await seedTitle(page, currentRaw);
  await page.locator('#title-save-data-button').click();
  await expect(page.locator('#save-backups')).toContainText(earlier.character.name);
  await page.locator('[data-backup-preview="0"]').click();
  await expect(page.locator('#import-preview')).toContainText(earlier.character.name);
  await expect(page.locator('#import-preview')).toContainText('Dân thường');
  await expect(page.locator('#restore-save-button')).toBeEnabled();
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(currentRaw);
  expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBe(earlierRaw);
  await expect(page.locator('#game canvas')).toHaveCount(0);
  await page.locator('#restore-save-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#hud-name')).toHaveText(earlier.character.name);
  await expect(page.locator('#hud-class')).toHaveText('Dân thường');
  const backups = await page.evaluate(prefix => Object.keys(localStorage).filter(key => key.startsWith(prefix)).map(key => localStorage.getItem(key)), SAVE_BACKUP_PREFIX);
  expect(backups).toHaveLength(2);
  expect(backups).toEqual(expect.arrayContaining([earlierRaw, currentRaw]));
  expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBe(earlierRaw);
});

test('a damaged browser backup is downloadable byte for byte without changing or removing saved data', async ({ page }) => {
  const raw = '{important-damaged-history <script>window.unsafe=true</script>';
  const backupKey = `${SAVE_BACKUP_PREFIX}2026-10-08T10-00-00-000Z-damaged`;
  const currentRaw = JSON.stringify(trained());
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: backupKey, raw });
  await seedTitle(page, currentRaw);
  await page.locator('#title-save-data-button').click();
  await expect(page.locator('.save-backup-card h4')).toHaveText('Dữ liệu cần kiểm tra');
  await expect(page.locator('[data-backup-preview]')).toHaveCount(0);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('[data-backup-export="0"]').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  expect(await readFile(path!, 'utf8')).toBe(raw);
  expect(await page.evaluate(key => localStorage.getItem(key), backupKey)).toBe(raw);
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(currentRaw);
  expect(await page.evaluate(() => 'unsafe' in window)).toBe(false);
});

test('skill and dodge cooldowns reflect real actions and recover when time advances', async ({ page }) => {
  await startFixture(page, trained());
  await expect(page.locator('#cooldown-skill-one')).toHaveText('Sẵn sàng');
  await page.locator('#game').focus();
  await page.keyboard.press('1', { delay: 100 });
  await expect(page.locator('#cooldown-skill-one')).toHaveText(/\d\.\d+s/);
  await page.keyboard.press('Shift', { delay: 100 });
  await expect(page.locator('#cooldown-dodge')).toHaveText(/\d\.\d+s/);
  await expect(page.locator('#cooldown-dodge')).toHaveText('Sẵn sàng', { timeout: 2500 });
  await expect(page.locator('#cooldown-skill-one')).toHaveText('Sẵn sàng', { timeout: 4000 });
});

test('elder instructions follow the active seal quest instead of repeating the first mining step', async ({ page }) => {
  const state = trained();
  state.world.x = 480; state.world.y = 242;
  await startFixture(page, state);
  await page.locator('#game').focus();
  await page.keyboard.press('e', { delay: 100 });
  await expect(page.locator('#panel-title')).toHaveText('Trưởng làng');
  await expect(page.locator('.npc-dialogue')).toContainText('Rừng Vọng Nguyệt');
  await expect(page.locator('.npc-dialogue')).toContainText('phong ấn');
  await expect(page.locator('.npc-dialogue')).not.toContainText('giữ E để đào');
});
