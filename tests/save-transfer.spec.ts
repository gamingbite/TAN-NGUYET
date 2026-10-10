import { expect, test } from '@playwright/test';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, SETTINGS_KEY } from '../src/game/model/settings';
import {
  getSaveBackupKeys, importGame, loadGame, parseSave, SAVE_BACKUP_PREFIX, SAVE_KEY, saveGame,
} from '../src/game/model/storage';
import { createNewState } from '../src/game/model/state';
import type { GameState } from '../src/game/model/types';
import type { GameSettings } from '../src/game/model/settings';

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();
  readonly writes: { key: string; value: string }[] = [];
  reads = 0;
  failWrite: ((key: string) => boolean) | null = null;
  failRead = false;
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null {
    this.reads += 1;
    if (this.failRead) throw new Error('SecurityError');
    return this.data.get(key) ?? null;
  }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void {
    if (this.failWrite?.(key)) throw new Error('QuotaExceededError');
    this.writes.push({ key, value });
    this.data.set(key, value);
  }
}

function character(name = 'Nguyệt An'): GameState {
  const state = createNewState({
    name, race: 'elf', gender: 'female', hair: 'long', hairColor: '#3e2935', skinColor: '#d8a47f',
  });
  state.hp = 78;
  state.mp = 45;
  state.xp = 30;
  state.world.discovered.town = ['12,8', '13,8'];
  return state;
}

test('portable save parsing uses the same strict validation and errors as local loading', () => {
  const state = character();
  const raw = JSON.stringify(state, null, 2);
  expect(parseSave(raw)).toEqual({ state, error: null });
  const invalid = [
    '{broken', 'null', '[]', JSON.stringify({ ...state, version: 2 }),
    JSON.stringify({ ...state, hp: -1 }),
    JSON.stringify({ ...state, world: { ...state.world, x: 2000 } }),
    ' '.repeat(200_001),
  ];
  for (const value of invalid) {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, value);
    const parsed = parseSave(value);
    expect(parsed.state).toBeNull();
    expect(parsed.error).toBeTruthy();
    expect(loadGame(storage)).toEqual(parsed);
    expect(storage.getItem(SAVE_KEY)).toBe(value);
  }
});

test('importing into an empty slot preserves the validated file bytes and loads its progress', () => {
  const storage = new MemoryStorage();
  const state = character();
  const raw = `\n${JSON.stringify(state, null, 2)}\n`;
  expect(importGame(raw, storage).ok).toBe(true);
  expect(storage.getItem(SAVE_KEY)).toBe(raw);
  expect(loadGame(storage)).toEqual({ state, error: null });
  expect(getSaveBackupKeys(storage)).toEqual([]);
  expect(storage.writes.map((write) => write.key)).toEqual([SAVE_KEY]);
});

test('each explicit replacement retains the exact previous save and every older backup', () => {
  const storage = new MemoryStorage();
  const olderKey = `${SAVE_BACKUP_PREFIX}2025-existing`;
  const oldRaw = `\n${JSON.stringify(character('Nhân vật cũ'), null, 2)}\n`;
  const nextRaw = JSON.stringify(character('Nhân vật mới'));
  const thirdRaw = JSON.stringify(character('Nhân vật thứ ba'));
  storage.setItem(olderKey, 'older backup bytes');
  storage.setItem(SAVE_KEY, oldRaw);
  storage.writes.length = 0;
  expect(importGame(nextRaw, storage).ok).toBe(true);
  expect(storage.writes).toHaveLength(2);
  expect(storage.writes[0].key).toMatch(new RegExp(`^${SAVE_BACKUP_PREFIX}`));
  expect(storage.writes[0].value).toBe(oldRaw);
  expect(storage.writes[1]).toEqual({ key: SAVE_KEY, value: nextRaw });
  const firstKey = storage.writes[0].key;
  expect(importGame(thirdRaw, storage).ok).toBe(true);
  const keys = getSaveBackupKeys(storage);
  expect(keys).toHaveLength(3);
  expect(new Set(keys).size).toBe(3);
  expect(storage.getItem(firstKey)).toBe(oldRaw);
  expect(storage.getItem(olderKey)).toBe('older backup bytes');
  expect(keys.some((key) => storage.getItem(key) === nextRaw)).toBe(true);
  expect(storage.getItem(SAVE_KEY)).toBe(thirdRaw);
});

test('explicit restore backs up malformed or unsupported current data while ordinary save still refuses it', () => {
  const nextRaw = JSON.stringify(character());
  for (const damagedRaw of ['{not-json', JSON.stringify({ version: 76, valuable: 'keep these bytes' })]) {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, damagedRaw);
    expect(saveGame(character(), storage).ok).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBe(damagedRaw);
    expect(importGame(nextRaw, storage).ok).toBe(true);
    expect(storage.getItem(SAVE_KEY)).toBe(nextRaw);
    const keys = getSaveBackupKeys(storage);
    expect(keys).toHaveLength(1);
    expect(storage.getItem(keys[0])).toBe(damagedRaw);
  }
});

test('invalid incoming files cause no reads, backups or writes to the current slot', () => {
  const storage = new MemoryStorage();
  const previous = JSON.stringify(character());
  storage.setItem(SAVE_KEY, previous);
  storage.writes.length = 0;
  storage.reads = 0;
  for (const raw of ['{broken', 'null', JSON.stringify({ ...character(), version: 2 }), ' '.repeat(200_001)]) {
    expect(importGame(raw, storage).ok).toBe(false);
  }
  expect(storage.reads).toBe(0);
  expect(storage.writes).toEqual([]);
  expect(storage.getItem(SAVE_KEY)).toBe(previous);
  expect(getSaveBackupKeys(storage)).toEqual([]);
});

test('backup write failure aborts replacement and leaves all existing data intact', () => {
  const storage = new MemoryStorage();
  const previous = '{valuable damaged save';
  const backupKey = `${SAVE_BACKUP_PREFIX}existing`;
  storage.setItem(SAVE_KEY, previous);
  storage.setItem(backupKey, 'keep older backup');
  storage.writes.length = 0;
  storage.failWrite = (key) => key.startsWith(SAVE_BACKUP_PREFIX);
  const result = importGame(JSON.stringify(character()), storage);
  expect(result.ok).toBe(false);
  expect(result.message).toContain('chưa nhập');
  expect(storage.writes).toEqual([]);
  expect(storage.getItem(SAVE_KEY)).toBe(previous);
  expect(storage.getItem(backupKey)).toBe('keep older backup');
  expect(getSaveBackupKeys(storage)).toEqual([backupKey]);
});

test('primary write failure retains both the original slot and its newly created safety backup', () => {
  const storage = new MemoryStorage();
  const previous = JSON.stringify(character('Tiến độ được giữ'));
  storage.setItem(SAVE_KEY, previous);
  storage.writes.length = 0;
  storage.failWrite = (key) => key === SAVE_KEY;
  expect(importGame(JSON.stringify(character('Không nhập được')), storage).ok).toBe(false);
  expect(storage.getItem(SAVE_KEY)).toBe(previous);
  expect(storage.writes).toHaveLength(1);
  expect(storage.writes[0].value).toBe(previous);
  const keys = getSaveBackupKeys(storage);
  expect(keys).toHaveLength(1);
  expect(storage.getItem(keys[0])).toBe(previous);
});

test('storage access failures never report an import success or remove existing backups', () => {
  const storage = new MemoryStorage();
  const previous = JSON.stringify(character());
  storage.setItem(SAVE_KEY, previous);
  storage.writes.length = 0;
  storage.failRead = true;
  expect(importGame(JSON.stringify(character('Một nhân vật khác')), storage).ok).toBe(false);
  expect(storage.writes).toEqual([]);
  storage.failRead = false;
  expect(storage.getItem(SAVE_KEY)).toBe(previous);
  const empty = new MemoryStorage();
  empty.failWrite = () => true;
  expect(importGame(previous, empty).ok).toBe(false);
  expect(empty.length).toBe(0);
});

test('backup listing includes only local save backups and never mutates storage', () => {
  const storage = new MemoryStorage();
  const keys = [`${SAVE_BACKUP_PREFIX}2026-a`, `${SAVE_BACKUP_PREFIX}2025-b`];
  for (const key of keys) storage.setItem(key, 'backup');
  storage.setItem(SAVE_KEY, 'current');
  storage.setItem(SETTINGS_KEY, 'preferences');
  storage.writes.length = 0;
  expect(getSaveBackupKeys(storage)).toEqual(keys);
  expect(storage.writes).toEqual([]);
  storage.key = () => { throw new Error('Storage unavailable'); };
  expect(getSaveBackupKeys(storage)).toEqual([]);
});

test('settings round trip independently from the character and backup slots at all volume bounds', () => {
  const storage = new MemoryStorage();
  const raw = JSON.stringify(character());
  const backupKey = `${SAVE_BACKUP_PREFIX}existing`;
  storage.setItem(SAVE_KEY, raw);
  storage.setItem(backupKey, 'old raw bytes');
  expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  for (const volume of [0, 0.45, 1]) {
    const settings: GameSettings = { volume, muted: volume === 0, screenShake: false, showDamageNumbers: false };
    expect(saveSettings(settings, storage).ok).toBe(true);
    expect(loadSettings(storage)).toEqual(settings);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
    expect(storage.getItem(backupKey)).toBe('old raw bytes');
  }
  expect(loadGame(storage).state).toEqual(character());
});

test('invalid or inaccessible settings load fresh defaults while preserving the stored bytes', () => {
  const storage = new MemoryStorage();
  for (const raw of [
    '{broken', 'null', '[]', '{}',
    JSON.stringify({ ...DEFAULT_SETTINGS, volume: -1 }),
    JSON.stringify({ ...DEFAULT_SETTINGS, volume: 2 }),
    JSON.stringify({ ...DEFAULT_SETTINGS, muted: 'yes' }),
    ' '.repeat(2_001),
  ]) {
    storage.setItem(SETTINGS_KEY, raw);
    storage.writes.length = 0;
    const settings = loadSettings(storage);
    expect(settings).toEqual(DEFAULT_SETTINGS);
    settings.volume = 0;
    expect(loadSettings(storage).volume).toBe(0.7);
    expect(storage.writes).toEqual([]);
    expect(storage.getItem(SETTINGS_KEY)).toBe(raw);
  }
  storage.failRead = true;
  expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
});

test('invalid values and failed writes cannot replace an earlier valid preference file', () => {
  const storage = new MemoryStorage();
  expect(saveSettings({ ...DEFAULT_SETTINGS }, storage).ok).toBe(true);
  const previous = storage.getItem(SETTINGS_KEY);
  storage.writes.length = 0;
  const invalid = [
    { ...DEFAULT_SETTINGS, volume: Number.NaN },
    { ...DEFAULT_SETTINGS, volume: Number.POSITIVE_INFINITY },
    { ...DEFAULT_SETTINGS, volume: -0.01 },
    { ...DEFAULT_SETTINGS, volume: 1.01 },
    { ...DEFAULT_SETTINGS, screenShake: 1 },
    { ...DEFAULT_SETTINGS, showDamageNumbers: null },
  ];
  for (const value of invalid) expect(saveSettings(value as unknown as GameSettings, storage).ok).toBe(false);
  expect(storage.writes).toEqual([]);
  storage.failWrite = () => true;
  expect(saveSettings({ ...DEFAULT_SETTINGS, muted: true }, storage).ok).toBe(false);
  expect(storage.getItem(SETTINGS_KEY)).toBe(previous);
});
