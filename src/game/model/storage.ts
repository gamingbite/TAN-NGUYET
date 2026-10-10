import { BALANCE, BAG_CAPACITY, CLASSES, ITEMS, QUESTS, RACES, RECIPES } from './catalog';
import { maxHp, maxMp, xpToNext } from './state';
import type { ActionResult, GameState, ItemId } from './types';

export const SAVE_KEY = 'tan-nguyet-save-v1';
export const SAVE_BACKUP_PREFIX = 'tan-nguyet-save-backup-v1-';
const MAX_SAVE_LENGTH = 200_000;
const MAX_COUNTER = 1_000_000_000;
const ZONES = ['town', 'forest', 'dungeon'] as const;
const STATUSES = ['locked', 'active', 'ready', 'done'] as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}
function number(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}
function member(value: unknown, options: readonly string[]): value is string {
  return typeof value === 'string' && options.includes(value);
}
function uniqueList(value: unknown, options: readonly string[]): value is string[] {
  return Array.isArray(value) && value.length <= options.length && value.every((entry) => member(entry, options)) && new Set(value).size === value.length;
}
function position(value: unknown): value is Record<string, unknown> {
  return record(value) && member(value.zone, ZONES) && number(value.x, 0, 960) && number(value.y, 0, 640);
}

// JSON is untrusted input. Validate every field before a scene or UI consumes it.
function validateState(value: unknown): string | null {
  if (!record(value)) return 'Bản lưu không phải dữ liệu nhân vật hợp lệ.';
  if (value.version !== 1) return 'Phiên bản bản lưu chưa được hỗ trợ. Bản lưu cũ được giữ nguyên.';
  const character = value.character;
  if (!record(character) || typeof character.name !== 'string' || character.name.trim().length < 1 || character.name.length > 24 || /[\u0000-\u001f\u007f]/.test(character.name)
    || !member(character.race, Object.keys(RACES)) || !member(character.gender, ['female', 'male']) || !member(character.hair, ['short', 'long', 'braid'])
    || typeof character.hairColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(character.hairColor)
    || typeof character.skinColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(character.skinColor)) return 'Ngoại hình hoặc tên trong bản lưu không hợp lệ.';
  if (!member(value.classId, Object.keys(CLASSES)) || !uniqueList(value.unlockedClasses, Object.keys(CLASSES)) || !value.unlockedClasses.includes('civilian') || !value.unlockedClasses.includes(value.classId)) return 'Class trong bản lưu không hợp lệ.';
  if (!integer(value.level, 1, BALANCE.maxLevel) || !integer(value.xp, 0, xpToNext(value.level) - 1) || (value.level === BALANCE.maxLevel && value.xp !== 0)) return 'Cấp hoặc XP trong bản lưu không hợp lệ.';
  // The class and level above are validated before calling derived-stat helpers.
  const stats = value as unknown as GameState;
  if (!number(value.hp, 0, maxHp(stats)) || !number(value.mp, 0, maxMp(stats)) || !number(value.potionCooldown, 0, BALANCE.potionCooldown)) return 'HP, MP hoặc hồi chiêu trong bản lưu không hợp lệ.';
  if (!Array.isArray(value.inventory) || value.inventory.length > BAG_CAPACITY || !value.inventory.every((slot: unknown) => record(slot)
    && member(slot.itemId, Object.keys(ITEMS)) && integer(slot.quantity, 1, ITEMS[slot.itemId as ItemId].stack))) return 'Túi đồ trong bản lưu không hợp lệ.';
  const equipped = value.equipped;
  if (!record(equipped) || ![null, 'sword'].includes(equipped.swordsman as string | null) || ![null, 'staff'].includes(equipped.mage as string | null)
    || ![null, 'armor'].includes(equipped.armor as string | null)) return 'Trang bị trong bản lưu không hợp lệ.';
  for (const id of Object.values(equipped)) {
    if (id !== null && !value.inventory.some((slot) => record(slot) && slot.itemId === id)) return 'Bản lưu thiếu vật phẩm đang trang bị.';
  }
  if ((equipped.swordsman !== null && !value.unlockedClasses.includes('swordsman')) || (equipped.mage !== null && !value.unlockedClasses.includes('mage'))) return 'Bộ trang bị yêu cầu Class chưa học.';
  if (!uniqueList(value.learnedRecipes, Object.keys(RECIPES))) return 'Công thức trong bản lưu không hợp lệ.';
  const coins = value.coins;
  if (!record(coins) || !integer(coins.copper, 0, MAX_COUNTER) || !integer(coins.silver, 0, MAX_COUNTER) || !integer(coins.gold, 0, MAX_COUNTER)) return 'Tiền trong bản lưu không hợp lệ.';
  const quests = value.quests;
  if (!record(quests) || !Object.keys(QUESTS).every((id) => member(quests[id], STATUSES))) return 'Nhiệm vụ trong bản lưu không hợp lệ.';
  const progress = value.progress;
  if (!record(progress) || !['oreMined', 'sealKills', 'kills'].every((key) => integer(progress[key], 0, MAX_COUNTER))
    || !['craftedEquipment', 'brewedPotion', 'learnedClass', 'sealBroken', 'sealResolved', 'bossDefeated', 'demoCompleted', 'secretFound'].every((key) => typeof progress[key] === 'boolean')) return 'Tiến độ trong bản lưu không hợp lệ.';
  if (progress.learnedClass !== (value.unlockedClasses.length > 1)) return 'Trạng thái học Class không nhất quán.';
  if (progress.sealResolved && (!progress.sealBroken || (progress.sealKills as number) < BALANCE.sealKillGoal)) return 'Trạng thái phong ấn không nhất quán.';
  if ((quests.work === 'ready' || quests.work === 'done') && ((progress.oreMined as number) < BALANCE.workOreGoal || !progress.craftedEquipment)) return 'Mục tiêu nghề nghiệp trong bản lưu chưa hoàn thành.';
  if (quests.seal !== 'locked' && quests.work !== 'done') return 'Chuỗi nhiệm vụ trong bản lưu không nhất quán.';
  if ((quests.seal === 'ready' || quests.seal === 'done') && (!progress.sealBroken || !progress.sealResolved || (progress.sealKills as number) < BALANCE.sealKillGoal)) return 'Mục tiêu phong ấn trong bản lưu chưa hoàn thành.';
  if (quests.boss !== 'locked' && quests.seal !== 'done') return 'Nhiệm vụ Boss chưa được mở hợp lệ.';
  if ((quests.boss === 'ready' || quests.boss === 'done') && !progress.bossDefeated) return 'Mục tiêu Boss trong bản lưu chưa hoàn thành.';
  if (progress.demoCompleted !== (quests.boss === 'done')) return 'Trạng thái kết thúc demo không nhất quán.';
  const world = value.world;
  if (!position(world) || !number(world.elapsedSeconds, 0, MAX_COUNTER) || !uniqueList(world.visited, ZONES) || !world.visited.includes('town') || !world.visited.includes(world.zone as string)
    || typeof world.travelUnlocked !== 'boolean' || (world.travelUnlocked && !world.visited.includes('forest'))) return 'Vị trí hoặc khám phá trong bản lưu không hợp lệ.';
  if (!record(world.discovered) || !ZONES.every((zone) => {
    const cells = (world.discovered as Record<string, unknown>)[zone];
    return Array.isArray(cells) && cells.length <= 600 && new Set(cells).size === cells.length && cells.every((cell) => {
      if (typeof cell !== 'string' || !/^\d{1,2},\d{1,2}$/.test(cell)) return false;
      const [col, row] = cell.split(',').map(Number);
      return col >= 0 && col < 30 && row >= 0 && row < 20;
    });
  })) return 'Sương mù khám phá trong bản lưu không hợp lệ.';
  if (!position(value.checkpoint) || !world.visited.includes(value.checkpoint.zone as string)) return 'Checkpoint trong bản lưu không hợp lệ.';
  return null;
}

export function parseSave(raw: string): { state: GameState | null; error: string | null } {
  if (raw.length > MAX_SAVE_LENGTH) return { state: null, error: 'Bản lưu quá lớn hoặc đã bị sửa. Dữ liệu được giữ nguyên.' };
  try {
    const value: unknown = JSON.parse(raw);
    const error = validateState(value);
    return error ? { state: null, error } : { state: value as GameState, error: null };
  } catch {
    return { state: null, error: 'Bản lưu bị lỗi JSON. Dữ liệu được giữ nguyên, chưa ghi đè.' };
  }
}

function getStorage(storage?: Storage): Storage {
  return storage ?? globalThis.localStorage;
}

export function loadGame(storage?: Storage): { state: GameState | null; error: string | null } {
  try {
    const raw = getStorage(storage).getItem(SAVE_KEY);
    return raw === null ? { state: null, error: null } : parseSave(raw);
  } catch {
    return { state: null, error: 'Trình duyệt không cho đọc bản lưu local. Hãy kiểm tra quyền lưu trữ.' };
  }
}

export function hasSave(storage?: Storage): boolean {
  try { return getStorage(storage).getItem(SAVE_KEY) !== null; }
  catch { return false; }
}

export function getSaveBackupKeys(storage?: Storage): string[] {
  try {
    const target = getStorage(storage);
    const keys: string[] = [];
    for (let index = 0; index < target.length; index += 1) {
      const key = target.key(index);
      if (key?.startsWith(SAVE_BACKUP_PREFIX)) keys.push(key);
    }
    return keys.sort().reverse();
  } catch {
    return [];
  }
}

function newBackupKey(target: Storage): string {
  const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
  // Check the key before every write. Even a repeated clock/random value must
  // not replace an earlier backup.
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const random = Math.random().toString(36).slice(2, 12);
    const key = `${SAVE_BACKUP_PREFIX}${timestamp}-${random}-${attempt}`;
    if (target.getItem(key) === null) return key;
  }
  throw new Error('Cannot create a unique local save backup key.');
}

// This explicit restore operation is allowed to replace an unreadable current
// save, unlike ordinary saveGame. Preserve its exact bytes before replacing it.
export function importGame(raw: string, storage?: Storage): ActionResult {
  const parsed = parseSave(raw);
  if (parsed.error || !parsed.state) return { ok: false, message: `Không thể nhập: ${parsed.error ?? 'Bản lưu không hợp lệ.'}` };
  try {
    const target = getStorage(storage);
    const existing = target.getItem(SAVE_KEY);
    if (existing !== null) {
      const backupKey = newBackupKey(target);
      try {
        target.setItem(backupKey, existing);
      } catch {
        return { ok: false, message: 'Không tạo được bản sao lưu an toàn. Bản lưu hiện có được giữ nguyên; chưa nhập dữ liệu.' };
      }
    }
    target.setItem(SAVE_KEY, raw);
    return {
      ok: true,
      message: existing === null
        ? 'Đã khôi phục bản lưu.'
        : 'Đã khôi phục bản lưu và giữ bản cũ trong sao lưu local.',
    };
  } catch {
    return { ok: false, message: 'Không nhập được: trình duyệt chặn lưu trữ hoặc đã hết dung lượng. Bản lưu trước và các bản sao lưu được giữ nguyên.' };
  }
}

export function saveGame(state: GameState, storage?: Storage): ActionResult {
  const error = validateState(state);
  if (error) return { ok: false, message: `Không thể lưu: ${error}` };
  try {
    const target = getStorage(storage);
    const existing = target.getItem(SAVE_KEY);
    if (existing !== null && parseSave(existing).error !== null) return { ok: false, message: 'Bản lưu hiện có bị lỗi hoặc khác phiên bản. Đã giữ nguyên để bạn có thể sao lưu; chưa ghi đè.' };
    const raw = JSON.stringify(state);
    if (raw.length > MAX_SAVE_LENGTH) return { ok: false, message: 'Bản lưu vượt giới hạn dung lượng; chưa ghi đè.' };
    target.setItem(SAVE_KEY, raw);
    return { ok: true, message: 'Đã lưu tiến độ trên trình duyệt này.' };
  } catch {
    return { ok: false, message: 'Không lưu được: trình duyệt chặn lưu trữ hoặc đã hết dung lượng. Bản lưu trước được giữ nguyên.' };
  }
}
