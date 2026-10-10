import type { ActionResult } from './types';

export interface GameSettings {
  volume: number;
  muted: boolean;
  screenShake: boolean;
  showDamageNumbers: boolean;
}

export const SETTINGS_KEY = 'tan-nguyet-settings-v1';
export const DEFAULT_SETTINGS: Readonly<GameSettings> = Object.freeze({
  volume: 0.7,
  muted: false,
  screenShake: true,
  showDamageNumbers: true,
});

function validSettings(value: unknown): value is GameSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  return typeof settings.volume === 'number' && Number.isFinite(settings.volume)
    && settings.volume >= 0 && settings.volume <= 1
    && typeof settings.muted === 'boolean'
    && typeof settings.screenShake === 'boolean'
    && typeof settings.showDamageNumbers === 'boolean';
}

function settingsCopy(settings: GameSettings): GameSettings {
  return {
    volume: settings.volume,
    muted: settings.muted,
    screenShake: settings.screenShake,
    showDamageNumbers: settings.showDamageNumbers,
  };
}

export function loadSettings(storage?: Storage): GameSettings {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(SETTINGS_KEY);
    if (raw === null || raw.length > 2_000) return settingsCopy(DEFAULT_SETTINGS);
    const value: unknown = JSON.parse(raw);
    return validSettings(value) ? settingsCopy(value) : settingsCopy(DEFAULT_SETTINGS);
  } catch {
    // Unavailable or malformed preferences never prevent opening a game. Leave
    // their stored bytes and all character saves untouched.
    return settingsCopy(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: GameSettings, storage?: Storage): ActionResult {
  if (!validSettings(settings)) return { ok: false, message: 'Thiết lập không hợp lệ. Âm lượng phải nằm từ 0 đến 100%.' };
  try {
    (storage ?? globalThis.localStorage).setItem(SETTINGS_KEY, JSON.stringify(settingsCopy(settings)));
    return { ok: true, message: 'Đã lưu thiết lập trên trình duyệt này.' };
  } catch {
    return { ok: false, message: 'Không lưu được thiết lập: trình duyệt chặn lưu trữ hoặc đã hết dung lượng.' };
  }
}
