import { BALANCE as QUEST_BALANCE, ITEMS, RECIPES } from '../model/catalog';
import { countItem } from '../model/state';
import type { GameState, RectDefinition, WorldObject, ZoneId } from '../model/types';
import { ZONES } from '../world/maps';
import { BALANCE } from './balance';
import { segmentBlocked, type Point } from './navigation';

/** Live positions belong to the current zone; omitted lists use map defaults. */
export interface GuidanceContext {
  objects?: readonly { id: string; x: number; y: number; remaining: number }[];
  enemies?: readonly { id: string; x: number; y: number; alive: boolean }[];
}

export interface QuestGuidance {
  id: string;
  zone: ZoneId;
  x: number;
  y: number;
  label: string;
  objective: string;
  action: string;
  kind: 'npc' | 'ore' | 'seal' | 'enemy' | 'exit';
  travelRequired?: boolean;
}

/** Choose an aim line that clears the player's feet, including wall contact. */
export function getGuidanceWaypoint(from: Point, path: readonly Point[], obstacles: readonly RectDefinition[]): Point | undefined {
  let waypoint: Point | undefined;
  for (const point of path) {
    // The 12 px feet collider has half-width 6. The grid keeps a 7 px margin;
    // this small tolerance lets a player touching a wall aim away from it.
    if (segmentBlocked(from, point, obstacles, 5.95)) continue;
    const distance = Math.hypot(point.x - from.x, point.y - from.y);
    if (distance > .5) waypoint = point;
  }
  // A cached path may begin behind a corner. Keep scanning for visible points;
  // a short clear step can be the only way around the corner without a collision.
  return waypoint;
}

/** Resolve the next manual action without changing quests, discovery, or saves. */
export function getQuestGuidance(state: GameState, context: GuidanceContext = {}): QuestGuidance | null {
  if (state.progress.demoCompleted || state.quests.boss === 'done') return null;

  const objectTarget = (zone: ZoneId, object: WorldObject | undefined, objective: string, action: string): QuestGuidance | null => {
    if (!object || !['npc', 'ore', 'seal', 'exit'].includes(object.kind)) return null;
    const live = zone === state.world.zone ? context.objects?.find(actor => actor.id === object.id) : undefined;
    const night = state.world.elapsedSeconds % BALANCE.dayLength >= BALANCE.dayLength * .65;
    return {
      id: object.id, zone, label: object.name, objective, action,
      kind: object.kind as QuestGuidance['kind'],
      x: live?.x ?? (night && object.kind === 'npc' ? object.nightX ?? object.x : object.x),
      y: live?.y ?? (night && object.kind === 'npc' ? object.nightY ?? object.y : object.y),
    };
  };
  const npc = (role: WorldObject['role'], objective: string, action = 'E · Trò chuyện') => objectTarget(
    'town', ZONES.town.objects.find(object => object.role === role), objective, action,
  );
  const seal = (objective: string, action: string) => objectTarget(
    'forest', ZONES.forest.objects.find(object => object.kind === 'seal'), objective, action,
  );
  const ore = (objective: string): QuestGuidance | null => {
    const origin = state.world.zone === 'town' ? state.world : ZONES.town.spawn;
    const candidates = ZONES.town.objects.filter(object => object.kind === 'ore').map(object => {
      const live = state.world.zone === 'town' ? context.objects?.find(actor => actor.id === object.id) : undefined;
      return { object, x: live?.x ?? object.x, y: live?.y ?? object.y, remaining: live?.remaining ?? 0 };
    });
    const available = candidates.filter(candidate => candidate.remaining <= 0);
    const sorted = (available.length ? available : candidates).sort((a, b) => {
      if (!available.length && a.remaining !== b.remaining) return a.remaining - b.remaining;
      return Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y);
    });
    const chosen = sorted[0];
    return chosen ? objectTarget('town', chosen.object, objective,
      chosen.remaining > 0 ? 'Chờ quặng hồi lại' : 'Giữ E · Khai thác quặng') : null;
  };
  const enemy = (zone: ZoneId, boss: boolean, objective: string): QuestGuidance | null => {
    const definitions = ZONES[zone].enemies.filter(definition => boss ? definition.kind === 'boss' : definition.eventEnemy);
    const currentZone = state.world.zone === zone;
    const origin = currentZone ? state.world : ZONES[zone].spawn;
    const candidates = definitions.flatMap((definition, index) => {
      if (currentZone && context.enemies !== undefined) {
        const live = context.enemies.find(actor => actor.id === definition.id && actor.alive);
        return live ? [{ id: definition.id, x: live.x, y: live.y }] : [];
      }
      // The scene restores the event wave by skipping this many map entries.
      if (!boss && index < state.progress.sealKills) return [];
      return [{ id: definition.id, x: definition.x, y: definition.y }];
    }).sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y));
    const chosen = candidates[0];
    return chosen ? {
      ...chosen, zone, kind: 'enemy', objective,
      label: boss ? 'Người Canh Tàn Nguyệt' : 'Linh thể thoát ấn',
      action: 'Space / chuột trái · Tấn công · Shift · Né',
    } : null;
  };

  let target: QuestGuidance | null;
  if (state.quests.work === 'locked') {
    target = npc('elder', 'Nhận nhiệm vụ đầu tiên');
  } else if (state.quests.work === 'active') {
    if (state.progress.oreMined < QUEST_BALANCE.workOreGoal) {
      target = ore(`Tự đào quặng ${state.progress.oreMined}/${QUEST_BALANCE.workOreGoal}`);
    } else if (!state.progress.craftedEquipment) {
      const oreNeeded = RECIPES.sword.ingredients.ore ?? 0;
      const woodNeeded = RECIPES.sword.ingredients.wood ?? 0;
      const oreCount = countItem(state, 'ore');
      const missingWood = Math.max(0, woodNeeded - countItem(state, 'wood'));
      const woodCost = missingWood * ITEMS.wood.buy;
      if (oreCount < oreNeeded) {
        target = ore(`Bổ sung quặng để rèn vũ khí ${oreCount}/${oreNeeded}`);
      } else if (missingWood > 0) {
        const spareOreValue = Math.max(0, oreCount - oreNeeded) * ITEMS.ore.sell;
        target = state.coins.copper + spareOreValue < woodCost
          ? ore('Đào thêm quặng để bán lấy Đồng mua gỗ')
          : npc('merchant', `Mua thêm ${missingWood} Gỗ khô để rèn vũ khí`,
            state.coins.copper >= woodCost ? 'E · Mua Gỗ khô' : 'E · Bán quặng dư, rồi mua Gỗ khô');
      } else {
        target = npc('forge', 'Học công thức và rèn Kiếm sắt hoặc Trượng nguyệt');
      }
    } else {
      target = npc('elder', 'Nộp nhiệm vụ Từ đôi bàn tay');
    }
  } else if (state.quests.work === 'ready') {
    target = npc('elder', 'Nộp nhiệm vụ Từ đôi bàn tay');
  } else if (state.quests.seal === 'ready' || (state.quests.seal !== 'done' && state.progress.sealResolved)) {
    target = npc('elder', 'Nộp nhiệm vụ Vết nứt dưới trăng');
  } else if (state.quests.boss === 'ready' || (state.quests.boss !== 'locked' && state.progress.bossDefeated)) {
    target = npc('elder', 'Nộp nhiệm vụ Boss để hoàn tất nội dung demo');
  } else if (!state.unlockedClasses.some(classId => classId !== 'civilian')) {
    target = npc('trainer', 'Học Kiếm Sĩ hoặc Pháp Sư');
  } else if (state.quests.seal === 'locked') {
    target = npc('elder', 'Nhận nhiệm vụ Vết nứt dưới trăng');
  } else if (state.quests.seal === 'active') {
    if (!state.progress.sealBroken) {
      target = seal('Điều tra phong ấn trong rừng', 'E · Điều tra phong ấn');
    } else if (state.progress.sealKills < QUEST_BALANCE.sealKillGoal) {
      const objective = `Hạ linh thể thoát ấn ${state.progress.sealKills}/${QUEST_BALANCE.sealKillGoal}`;
      target = enemy('forest', false, objective) ?? seal(objective, 'Tìm linh thể còn lại quanh phong ấn');
    } else {
      target = seal('Khép vết nứt sau khi hạ đủ linh thể', 'E · Khép vết nứt');
    }
  } else if (state.quests.boss === 'locked') {
    target = npc('elder', 'Nhận nhiệm vụ Người canh Tàn Nguyệt');
  } else {
    target = enemy('dungeon', true, 'Vào hầm mộ và hạ Người Canh Tàn Nguyệt');
  }

  if (state.classId === 'civilian' && target && target.zone !== 'town') {
    target = npc('trainer', 'Đổi sang Class đã học để tiếp tục', 'Mở Hành trang (I) để đổi Class');
    if (target) target.travelRequired = false;
  }
  if (!target || target.zone === state.world.zone) return target;
  const exit = firstExitToward(state.world.zone, target.zone);
  if (exit?.target === 'forest' && state.classId === 'civilian') {
    const guidance = objectTarget(state.world.zone, exit, target.objective, 'Mở Hành trang (I) để đổi sang Class đã học');
    return guidance ? { ...guidance, travelRequired: false } : null;
  }
  if (target.travelRequired === false) return { ...target, zone: state.world.zone, x: state.world.x, y: state.world.y };
  return objectTarget(state.world.zone, exit, target.objective,
    exit?.target ? `E · Đi tới ${ZONES[exit.target].name}` : 'E · Đi qua lối ra');
}

function firstExitToward(from: ZoneId, destination: ZoneId): WorldObject | undefined {
  const visited = new Set<ZoneId>([from]);
  const queue: { zone: ZoneId; first?: WorldObject }[] = [{ zone: from }];
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    for (const exit of ZONES[current.zone].objects) {
      if (exit.kind !== 'exit' || !exit.target || visited.has(exit.target)) continue;
      const first = current.first ?? exit;
      if (exit.target === destination) return first;
      visited.add(exit.target);
      queue.push({ zone: exit.target, first });
    }
  }
  return undefined;
}
