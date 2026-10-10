import { expect, test } from '@playwright/test';
import { BALANCE, ITEMS } from '../src/game/model/catalog';
import {
  acceptQuest, addItem, buyItem, changeClass, completeQuest, craftItem, createNewState,
  learnClass, learnRecipe, removeItem, sellItem, updateQuests,
} from '../src/game/model/state';
import type { CharacterAppearance, GameState, ZoneId } from '../src/game/model/types';
import { getGuidanceWaypoint, getQuestGuidance, type GuidanceContext } from '../src/game/runtime/questGuidance';
import { NavigationGrid, segmentBlocked } from '../src/game/runtime/navigation';
import { BALANCE as WORLD_BALANCE } from '../src/game/runtime/balance';
import { ZONES } from '../src/game/world/maps';

const appearance: CharacterAppearance = {
  name: 'Dẫn đường', race: 'human', gender: 'female', hair: 'braid', hairColor: '#352822', skinColor: '#d8a47f',
};
const fresh = (): GameState => createNewState(appearance);
function openingComplete(): GameState {
  const state = fresh();
  acceptQuest(state, 'work');
  state.progress.oreMined = BALANCE.workOreGoal;
  addItem(state, 'ore', BALANCE.workOreGoal);
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  return state;
}
function bossQuest(): GameState {
  const state = openingComplete();
  acceptQuest(state, 'seal');
  state.progress.sealBroken = true;
  state.progress.sealKills = BALANCE.sealKillGoal;
  state.progress.sealResolved = true;
  updateQuests(state);
  completeQuest(state, 'seal');
  acceptQuest(state, 'boss');
  return state;
}
function enter(state: GameState, zone: ZoneId): void {
  Object.assign(state.world, { zone, ...ZONES[zone].spawn });
}

test('guidance follows actual opening quest actions, hand-in, learning, and the forest gate', () => {
  const state = fresh();
  expect(getQuestGuidance(state)).toMatchObject({ id: 'elder', kind: 'npc', objective: 'Nhận nhiệm vụ đầu tiên' });
  expect(acceptQuest(state, 'work').ok).toBe(true);
  expect(getQuestGuidance(state)).toMatchObject({ kind: 'ore', action: 'Giữ E · Khai thác quặng' });
  state.progress.oreMined = BALANCE.workOreGoal;
  addItem(state, 'ore', BALANCE.workOreGoal);
  expect(getQuestGuidance(state)?.id).toBe('forge');
  learnRecipe(state, 'sword');
  expect(craftItem(state, 'sword').ok).toBe(true);
  expect(getQuestGuidance(state)?.id).toBe('elder');
  expect(completeQuest(state, 'work').ok).toBe(true);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'trainer', objective: 'Học Kiếm Sĩ hoặc Pháp Sư' });
  expect(learnClass(state, 'swordsman').ok).toBe(true);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'elder', objective: 'Nhận nhiệm vụ Vết nứt dưới trăng' });
  expect(acceptQuest(state, 'seal').ok).toBe(true);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'town-forest', zone: 'town', kind: 'exit' });
  enter(state, 'forest');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'forest-seal', action: 'E · Điều tra phong ấn' });
});

test('targets follow NPC schedules and actual moved NPC positions without mutating state', () => {
  const state = fresh();
  const elder = ZONES.town.objects.find(object => object.id === 'elder')!;
  expect(getQuestGuidance(state)).toMatchObject({ x: elder.x, y: elder.y });
  state.world.elapsedSeconds = WORLD_BALANCE.dayLength * .65;
  expect(getQuestGuidance(state)).toMatchObject({ x: elder.nightX, y: elder.nightY });
  const context: GuidanceContext = { objects: [{ id: 'elder', x: 410, y: 560, remaining: 0 }] };
  const before = JSON.stringify({ state, context });
  expect(getQuestGuidance(state, context)).toMatchObject({ x: 410, y: 560 });
  expect(JSON.stringify({ state, context })).toBe(before);
  state.world.elapsedSeconds = WORLD_BALANCE.dayLength;
  expect(getQuestGuidance(state)).toMatchObject({ x: elder.x, y: elder.y });
});

test('mining points to an available ore and waits at the earliest recovering vein if all are depleted', () => {
  const state = fresh();
  acceptQuest(state, 'work');
  state.world.x = 755; state.world.y = 486;
  const objects = ZONES.town.objects.filter(object => object.kind === 'ore').map(object => ({ ...object, remaining: 0 }));
  objects[0].remaining = 12;
  expect(getQuestGuidance(state, { objects })?.id).toBe('town-ore-2');
  objects[1].remaining = 8;
  objects[2].remaining = 3;
  expect(getQuestGuidance(state, { objects })).toMatchObject({ id: 'town-ore-3', action: 'Chờ quặng hồi lại' });
  objects[0].remaining = 0;
  expect(getQuestGuidance(state, { objects })).toMatchObject({ id: 'town-ore-1', action: 'Giữ E · Khai thác quặng' });
});

test('missing crafting materials guide through mining and real NPC trades back to the forge', () => {
  const state = fresh();
  acceptQuest(state, 'work');
  state.progress.oreMined = BALANCE.workOreGoal;
  addItem(state, 'ore', BALANCE.workOreGoal);
  removeItem(state, 'wood', 4);
  state.coins.copper = 0;
  expect(getQuestGuidance(state)).toMatchObject({ kind: 'ore', objective: 'Đào thêm quặng để bán lấy Đồng mua gỗ' });
  const extraOre = Math.ceil(2 * ITEMS.wood.buy / ITEMS.ore.sell);
  addItem(state, 'ore', extraOre);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'merchant', action: 'E · Bán quặng dư, rồi mua Gỗ khô' });
  expect(sellItem(state, 'ore', extraOre).ok).toBe(true);
  expect(buyItem(state, 'wood', 2).ok).toBe(true);
  expect(getQuestGuidance(state)?.id).toBe('forge');
  sellItem(state, 'ore', 1);
  expect(getQuestGuidance(state)).toMatchObject({ kind: 'ore', objective: 'Bổ sung quặng để rèn vũ khí 2/3' });
});

test('a learned civilian is told to switch Class before forest combat without blocking town hand-ins', () => {
  const state = openingComplete();
  expect(changeClass(state, 'civilian', false).ok).toBe(true);
  expect(getQuestGuidance(state)?.id).toBe('elder');
  acceptQuest(state, 'seal');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'trainer', action: 'Mở Hành trang (I) để đổi Class', travelRequired: false });
  enter(state, 'forest');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'trainer', zone: 'forest', travelRequired: false });
  const final = bossQuest();
  final.progress.bossDefeated = true;
  updateQuests(final);
  changeClass(final, 'civilian', false);
  expect(getQuestGuidance(final)).toMatchObject({ id: 'elder', objective: 'Nộp nhiệm vụ Boss để hoàn tất nội dung demo' });
  enter(final, 'dungeon');
  expect(getQuestGuidance(final)).toMatchObject({
    id: 'dungeon-forest', objective: 'Nộp nhiệm vụ Boss để hoàn tất nội dung demo',
    action: 'Mở Hành trang (I) để đổi sang Class đã học', travelRequired: false,
  });
  expect(changeClass(final, 'swordsman', false).ok).toBe(true);
  expect(getQuestGuidance(final)).toMatchObject({ id: 'dungeon-forest', action: `E · Đi tới ${ZONES.forest.name}` });
  expect(getQuestGuidance(final)?.travelRequired).not.toBe(false);
});

test('seal guidance follows only living event enemies, then closing and handing in the seal', () => {
  const state = openingComplete();
  acceptQuest(state, 'seal');
  enter(state, 'forest');
  state.progress.sealBroken = true;
  state.progress.sealKills = 1;
  state.world.x = 410; state.world.y = 240;
  const enemies = [
    { id: 'forest-wolf-1', x: 411, y: 240, alive: true },
    { id: 'seal-wraith-1', x: 412, y: 240, alive: false },
    { id: 'seal-wraith-2', x: 700, y: 300, alive: true },
    { id: 'seal-slime-3', x: 430, y: 250, alive: true },
  ];
  expect(getQuestGuidance(state, { enemies })).toMatchObject({ id: 'seal-slime-3', kind: 'enemy', x: 430, y: 250 });
  enemies[3].alive = false;
  enemies[2].x = 650;
  expect(getQuestGuidance(state, { enemies })).toMatchObject({ id: 'seal-wraith-2', x: 650, y: 300 });
  expect(getQuestGuidance(state, { enemies: [] })).toMatchObject({ id: 'forest-seal', action: 'Tìm linh thể còn lại quanh phong ấn' });
  state.progress.sealKills = BALANCE.sealKillGoal;
  expect(getQuestGuidance(state, { enemies: [] })).toMatchObject({ id: 'forest-seal', action: 'E · Khép vết nứt' });
  state.progress.sealResolved = true;
  updateQuests(state);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'forest-town', objective: 'Nộp nhiệm vụ Vết nứt dưới trăng' });
  enter(state, 'town');
  expect(getQuestGuidance(state)?.id).toBe('elder');
  completeQuest(state, 'seal');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'elder', objective: 'Nhận nhiệm vụ Người canh Tàn Nguyệt' });
});

test('Boss guidance uses each connecting exit, follows the live Boss, and returns to the elder before ending', () => {
  const state = bossQuest();
  expect(getQuestGuidance(state, { enemies: [] })).toMatchObject({ id: 'town-forest', zone: 'town' });
  enter(state, 'forest');
  expect(getQuestGuidance(state, { enemies: [] })).toMatchObject({ id: 'forest-dungeon', zone: 'forest' });
  enter(state, 'dungeon');
  expect(getQuestGuidance(state, { enemies: [{ id: 'moon-warden', x: 712, y: 244, alive: true }] }))
    .toMatchObject({ id: 'moon-warden', zone: 'dungeon', kind: 'enemy', x: 712, y: 244 });
  expect(getQuestGuidance(state, { enemies: [] })).toBeNull();
  expect(getQuestGuidance(state, { enemies: [{ id: 'moon-warden', x: 780, y: 180, alive: false }] })).toBeNull();
  state.progress.bossDefeated = true;
  updateQuests(state);
  expect(getQuestGuidance(state)).toMatchObject({ id: 'dungeon-forest', zone: 'dungeon' });
  enter(state, 'forest');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'forest-town', zone: 'forest' });
  enter(state, 'town');
  expect(getQuestGuidance(state)).toMatchObject({ id: 'elder', zone: 'town' });
  expect(state.progress.demoCompleted).toBe(false);
  expect(completeQuest(state, 'boss').ok).toBe(true);
  expect(getQuestGuidance(state)).toBeNull();
});

test('guidance does not reveal the optional secret or change exploration and saved data', () => {
  const state = bossQuest();
  enter(state, 'forest');
  const before = JSON.stringify(state);
  expect(getQuestGuidance(state)?.id).toBe('forest-dungeon');
  expect(JSON.stringify(state)).toBe(before);
  state.progress.secretFound = true;
  expect(getQuestGuidance(state)?.id).toBe('forest-dungeon');
});

test('the guidance arrow can leave a touched dungeon wall and follow doorways to the Boss and back', () => {
  const zone = ZONES.dungeon;
  const navigation = new NavigationGrid(zone, 7);
  const wallContact = { x: 46, y: 514 };
  const bossFeet = { x: 780, y: 194 };
  expect(segmentBlocked(wallContact, bossFeet, zone.obstacles, 5.95)).toBe(true);
  const first = getGuidanceWaypoint(wallContact, navigation.route(wallContact, bossFeet), zone.obstacles);
  expect(first).toBeDefined();
  expect(segmentBlocked(wallContact, first!, zone.obstacles, 5.95)).toBe(false);
  for (const [start, finish] of [[wallContact, bossFeet], [bossFeet, { x: 80, y: 566 }]]) {
    let current = start;
    for (let turns = 0; turns < 20 && Math.hypot(current.x - finish.x, current.y - finish.y) > 10; turns += 1) {
      const waypoint = getGuidanceWaypoint(current, navigation.route(current, finish), zone.obstacles);
      expect(waypoint).toBeDefined();
      expect(segmentBlocked(current, waypoint!, zone.obstacles, 5.95)).toBe(false);
      current = waypoint!;
    }
    expect(Math.hypot(current.x - finish.x, current.y - finish.y)).toBeLessThanOrEqual(10);
  }
  expect(getGuidanceWaypoint(wallContact, [], zone.obstacles)).toBeUndefined();
  expect(getGuidanceWaypoint(wallContact, [bossFeet], zone.obstacles)).toBeUndefined();
});

test('a cached return route keeps guiding through the doorway when only a short corner step is clear', () => {
  const zone = ZONES.dungeon;
  const from = { x: 373.21240396447683, y: 402 };
  const goal = { x: 80, y: 566 };
  const cachedPath = new NavigationGrid(zone, 7).route(from, goal);
  const first = getGuidanceWaypoint(from, cachedPath, zone.obstacles);
  expect(first).toBeDefined();
  expect(Math.hypot(first!.x - from.x, first!.y - from.y)).toBeLessThan(4);
  expect(segmentBlocked(from, first!, zone.obstacles, 5.95)).toBe(false);

  let current = from;
  let crossedDoorway = false;
  for (let steps = 0; steps < 1600 && Math.hypot(current.x - goal.x, current.y - goal.y) > 6; steps += 1) {
    // The path stays cached while the player advances in small physical steps.
    const waypoint = getGuidanceWaypoint(current, cachedPath, zone.obstacles);
    expect(waypoint).toBeDefined();
    const distance = Math.hypot(waypoint!.x - current.x, waypoint!.y - current.y);
    const step = Math.min(.75, distance);
    const next = {
      x: current.x + (waypoint!.x - current.x) / distance * step,
      y: current.y + (waypoint!.y - current.y) / distance * step,
    };
    expect(segmentBlocked(current, waypoint!, zone.obstacles, 5.95)).toBe(false);
    expect(segmentBlocked(current, next, zone.obstacles, 5.95)).toBe(false);
    if (next.x >= 312 && next.x <= 352 && next.y >= 424 && next.y <= 488) crossedDoorway = true;
    current = next;
  }
  expect(crossedDoorway).toBe(true);
  expect(Math.hypot(current.x - goal.x, current.y - goal.y)).toBeLessThanOrEqual(6);
});
