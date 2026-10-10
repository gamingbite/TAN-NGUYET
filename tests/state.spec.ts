import { expect, test } from '@playwright/test';
import { BAG_CAPACITY, ITEMS } from '../src/game/model/catalog';
import {
  acceptQuest, addItem, buyItem, changeClass, completeQuest, countItem, craftItem,
  createNewState, equipItem, gainXp, learnClass, learnRecipe, maxHp, maxMp,
  removeItem, respawn, sellItem, updateQuests, usePotion,
} from '../src/game/model/state';
import { hasSave, loadGame, SAVE_KEY, saveGame } from '../src/game/model/storage';
import type { CharacterAppearance, GameState, InventorySlot } from '../src/game/model/types';

const appearance: CharacterAppearance = {
  name: 'An Nguyệt', race: 'human', gender: 'female', hair: 'braid', hairColor: '#352822', skinColor: '#d8a47f',
};
const fresh = (): GameState => createNewState(appearance);
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const swords = (count: number): InventorySlot[] => Array.from({ length: count }, () => ({ itemId: 'sword', quantity: 1 }));

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

function trainedState(): GameState {
  const state = fresh();
  state.progress.oreMined = 3;
  addItem(state, 'ore', 3);
  learnRecipe(state, 'sword');
  craftItem(state, 'sword');
  return state;
}

function finalQuestState(): GameState {
  const state = trainedState();
  acceptQuest(state, 'work');
  completeQuest(state, 'work');
  learnClass(state, 'swordsman');
  acceptQuest(state, 'seal');
  state.progress.sealBroken = true;
  state.progress.sealKills = 3;
  state.progress.sealResolved = true;
  updateQuests(state);
  completeQuest(state, 'seal');
  acceptQuest(state, 'boss');
  state.progress.bossDefeated = true;
  updateQuests(state);
  return state;
}

test('four races start equally as civilian level 1 with separate currencies', () => {
  for (const race of ['human', 'elf', 'dwarf', 'beast'] as const) {
    const state = createNewState({ ...appearance, race });
    expect([state.classId, state.level, state.hp, state.mp]).toEqual(['civilian', 1, 100, 60]);
    expect(state.coins).toEqual({ copper: 20, silver: 0, gold: 0 });
    expect(state.equipped).toEqual({ swordsman: null, mage: null, armor: null });
    expect(state.learnedRecipes).toEqual([]);
    expect(state.quests.work).toBe('locked');
  }
});

test('loot stacks correctly and a bag overflow changes nothing', () => {
  const state = fresh();
  state.inventory = [{ itemId: 'ore', quantity: 19 }];
  expect(addItem(state, 'ore', 22).ok).toBe(true);
  expect(state.inventory.map((slot) => slot.quantity)).toEqual([20, 20, 1]);
  state.inventory = [...swords(BAG_CAPACITY - 1), { itemId: 'ore', quantity: 19 }];
  const before = copy(state);
  expect(addItem(state, 'ore', 2).ok).toBe(false);
  expect(state).toEqual(before);
  expect(addItem(state, 'ore', 1).ok).toBe(true);
  expect(countItem(state, 'ore')).toBe(20);
});

test('crafting requires knowledge and materials, and full-bag failure is atomic', () => {
  const state = fresh();
  const beforeKnowledge = copy(state);
  expect(craftItem(state, 'sword').ok).toBe(false);
  expect(state).toEqual(beforeKnowledge);
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(false);
  state.inventory = [{ itemId: 'ore', quantity: 6 }, { itemId: 'wood', quantity: 4 }, ...swords(10)];
  const before = copy(state);
  expect(craftItem(state, 'sword').ok).toBe(false);
  expect(state).toEqual(before);
  state.inventory[0].quantity = 3;
  state.inventory[1].quantity = 2;
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(countItem(state, 'ore')).toBe(0);
  expect(countItem(state, 'wood')).toBe(0);
  expect(countItem(state, 'sword')).toBe(11);
});

test('armor crafting does not bypass the opening weapon task', () => {
  const state = fresh();
  addItem(state, 'ore', 2);
  learnRecipe(state, 'armor');
  expect(craftItem(state, 'armor').ok).toBe(true);
  expect(state.progress.craftedEquipment).toBe(false);
  expect(learnClass(state, 'swordsman').ok).toBe(false);
  expect(equipItem(state, 'armor').ok).toBe(true);
  expect(state.equipped.armor).toBe('armor');
  expect(equipItem(state, 'armor').ok).toBe(true);
  expect(state.equipped.armor).toBeNull();
});

test('trade cannot spend silver, overflow the bag, remove equipped items, or sell absent items', () => {
  const state = trainedState();
  state.coins = { copper: 0, silver: 100, gold: 100 };
  const before = copy(state);
  expect(buyItem(state, 'hp-potion').ok).toBe(false);
  expect(state).toEqual(before);
  learnClass(state, 'swordsman');
  expect(sellItem(state, 'sword').ok).toBe(false);
  expect(removeItem(state, 'sword', 1)).toBe(false);
  addItem(state, 'sword', 1);
  expect(sellItem(state, 'sword').ok).toBe(true);
  expect(countItem(state, 'sword')).toBe(1);
  expect(state.coins.copper).toBe(ITEMS.sword.sell);
  equipItem(state, 'sword');
  expect(sellItem(state, 'sword').ok).toBe(true);
  expect(sellItem(state, 'sword').ok).toBe(false);
  state.inventory = swords(BAG_CAPACITY);
  state.coins.copper = 100;
  const full = copy(state);
  expect(buyItem(state, 'ore').ok).toBe(false);
  expect(state).toEqual(full);
});

test('invalid quantities never mutate inventory or money', () => {
  const state = fresh();
  for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER]) {
    const before = copy(state);
    expect(addItem(state, 'ore', quantity).ok).toBe(false);
    expect(buyItem(state, 'ore', quantity).ok).toBe(false);
    expect(sellItem(state, 'wood', quantity).ok).toBe(false);
    expect(removeItem(state, 'wood', quantity)).toBe(false);
    expect(state).toEqual(before);
  }
});

test('classes share quest and combat XP and retain independent weapon loadouts', () => {
  const state = trainedState();
  expect(equipItem(state, 'sword').ok).toBe(false);
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  addItem(state, 'staff', 1);
  expect(learnClass(state, 'mage').ok).toBe(true);
  expect(state.equipped).toEqual({ swordsman: 'sword', mage: 'staff', armor: null });
  gainXp(state, 35);
  expect(changeClass(state, 'swordsman', true).ok).toBe(false);
  expect(state.classId).toBe('mage');
  expect(changeClass(state, 'swordsman', false).ok).toBe(true);
  expect(state.xp).toBe(35);
  acceptQuest(state, 'work');
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect([state.level, state.xp]).toEqual([2, 35]);
  expect(changeClass(state, 'mage', false).ok).toBe(true);
  expect([state.level, state.xp]).toEqual([2, 35]);
  expect(state.equipped.mage).toBe('staff');
});

test('quest dependencies and rewards cannot be skipped or duplicated', () => {
  const state = fresh();
  expect(acceptQuest(state, 'seal').ok).toBe(false);
  expect(acceptQuest(state, 'boss').ok).toBe(false);
  expect(completeQuest(state, 'work').ok).toBe(false);
  const final = finalQuestState();
  expect(final.quests.boss).toBe('ready');
  expect(final.progress.demoCompleted).toBe(false);
  final.world.zone = 'forest';
  expect(completeQuest(final, 'boss').ok).toBe(false);
  expect(final.progress.demoCompleted).toBe(false);
  final.world.zone = 'town';
  expect(completeQuest(final, 'boss').ok).toBe(true);
  expect(final.progress.demoCompleted).toBe(true);
  const before = copy(final);
  expect(completeQuest(final, 'boss').ok).toBe(false);
  expect(completeQuest(final, 'work').ok).toBe(false);
  expect(acceptQuest(final, 'boss').ok).toBe(false);
  expect(final).toEqual(before);
});

test('potions restore within capacity, share cooldown, and do not waste a bottle at full HP', () => {
  const state = fresh();
  learnRecipe(state, 'hp-potion');
  expect(craftItem(state, 'hp-potion').ok).toBe(true);
  expect(countItem(state, 'herb')).toBe(2);
  expect(state.progress.brewedPotion).toBe(true);
  const full = copy(state);
  expect(usePotion(state, 'hp-potion').ok).toBe(false);
  expect(state).toEqual(full);
  state.hp = maxHp(state) - 10;
  expect(usePotion(state, 'hp-potion').ok).toBe(true);
  expect(state.hp).toBe(maxHp(state));
  addItem(state, 'mp-potion', 1);
  state.mp = 0;
  const cooldown = copy(state);
  expect(usePotion(state, 'mp-potion').ok).toBe(false);
  expect(state).toEqual(cooldown);
  state.potionCooldown = 0;
  expect(usePotion(state, 'mp-potion').ok).toBe(true);
  expect(state.mp).toBe(maxMp(state));
});

test('respawning preserves items, equipment, money, quests and world exploration', () => {
  const state = finalQuestState();
  state.world.zone = 'dungeon';
  state.world.visited = ['town', 'forest', 'dungeon'];
  state.world.discovered.forest = ['12,8'];
  state.world.travelUnlocked = true;
  state.checkpoint = { zone: 'forest', x: 420, y: 360 };
  const protectedState = copy({ inventory: state.inventory, equipped: state.equipped, coins: state.coins, quests: state.quests, progress: state.progress, xp: state.xp, level: state.level, discovered: state.world.discovered });
  state.hp = 0;
  state.mp = 0;
  respawn(state);
  expect(state.hp).toBe(maxHp(state));
  expect(state.mp).toBe(maxMp(state));
  expect([state.world.zone, state.world.x, state.world.y]).toEqual(['forest', 420, 360]);
  expect({ inventory: state.inventory, equipped: state.equipped, coins: state.coins, quests: state.quests, progress: state.progress, xp: state.xp, level: state.level, discovered: state.world.discovered }).toEqual(protectedState);
});

test('saving and loading keeps exact progress, including free play after final hand-in', () => {
  const storage = new MemoryStorage();
  expect(hasSave(storage)).toBe(false);
  expect(loadGame(storage)).toEqual({ state: null, error: null });
  const state = finalQuestState();
  state.world.visited = ['town', 'forest', 'dungeon'];
  state.world.discovered.forest = ['12,8', '13,8'];
  state.world.travelUnlocked = true;
  completeQuest(state, 'boss');
  expect(saveGame(state, storage).ok).toBe(true);
  expect(hasSave(storage)).toBe(true);
  expect(loadGame(storage)).toEqual({ state, error: null });
  const loaded = loadGame(storage).state!;
  const before = copy(loaded);
  expect(completeQuest(loaded, 'boss').ok).toBe(false);
  expect(loaded).toEqual(before);
  expect(addItem(loaded, 'ore', 1).ok).toBe(true);
  expect(saveGame(loaded, storage).ok).toBe(true);
});

test('malformed JSON and unsupported versions are kept intact and never silently replaced', () => {
  for (const raw of ['{invalid', JSON.stringify({ ...fresh(), version: 2 }), 'null', '[]']) {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, raw);
    expect(hasSave(storage)).toBe(true);
    expect(loadGame(storage).state).toBeNull();
    expect(loadGame(storage).error).toBeTruthy();
    expect(saveGame(fresh(), storage).ok).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBe(raw);
  }
});

test('save validation rejects invalid IDs, stacks, positions, numbers, and quest contradictions', () => {
  const badStates: unknown[] = [];
  const badItem = fresh();
  badItem.inventory = [{ itemId: 'sword', quantity: 2 }];
  badStates.push(badItem, { ...fresh(), hp: -1 }, { ...fresh(), level: 0 }, { ...fresh(), xp: 40 }, { ...fresh(), classId: 'mage' }, { ...fresh(), potionCooldown: 99 });
  const unknownItem = copy(fresh()) as unknown as { inventory: { itemId: string; quantity: number }[] };
  unknownItem.inventory[0].itemId = 'unrecognized';
  badStates.push(unknownItem);
  const badCoins = fresh(); badCoins.coins.copper = -2; badStates.push(badCoins);
  const badWorld = fresh(); badWorld.world.x = 2000; badStates.push(badWorld);
  const badCells = fresh(); badCells.world.discovered.town = ['30,0']; badStates.push(badCells);
  const badEquipment = fresh(); badEquipment.equipped.swordsman = 'sword'; badStates.push(badEquipment);
  const badQuest = fresh(); badQuest.quests.boss = 'done'; badQuest.progress.demoCompleted = true; badStates.push(badQuest);
  const badComplete = fresh(); badComplete.progress.demoCompleted = true; badStates.push(badComplete);
  const badSeal = fresh(); badSeal.progress.sealResolved = true; badStates.push(badSeal);
  for (const bad of badStates) {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify(bad));
    expect(loadGame(storage).state).toBeNull();
    expect(loadGame(storage).error).toBeTruthy();
  }
  const goodStorage = new MemoryStorage();
  saveGame(fresh(), goodStorage);
  const previous = goodStorage.getItem(SAVE_KEY);
  const nanState = fresh(); nanState.mp = Number.NaN;
  expect(saveGame(nanState, goodStorage).ok).toBe(false);
  expect(goodStorage.getItem(SAVE_KEY)).toBe(previous);
});

test('storage failures report real errors and leave previous saved data intact', () => {
  const storage = new MemoryStorage();
  expect(saveGame(fresh(), storage).ok).toBe(true);
  const previous = storage.getItem(SAVE_KEY);
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  expect(saveGame(trainedState(), storage).ok).toBe(false);
  expect(storage.getItem(SAVE_KEY)).toBe(previous);
  storage.getItem = () => { throw new Error('SecurityError'); };
  expect(loadGame(storage).error).toBeTruthy();
  expect(hasSave(storage)).toBe(false);
});
