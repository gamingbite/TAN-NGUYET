import { expect, test } from '@playwright/test';
import { BALANCE } from '../src/game/runtime/balance';
import { NavigationGrid, segmentBlocked } from '../src/game/runtime/navigation';
import { VILLAGE_ADDED_FOOTPRINTS, VILLAGE_ADDED_HOUSES, ZONES } from '../src/game/world/maps';
import { getVillageResidentPose, VILLAGE_RESIDENTS } from '../src/game/world/VillageLife';

test('the denser village keeps old houses and streets clear of added footprints', () => {
  const town = ZONES.town;
  expect(town.decorations.filter(decoration => decoration.kind === 'house')).toHaveLength(15);
  for (const footprint of [
    { x: 134, y: 152, width: 92, height: 34 }, { x: 434, y: 122, width: 92, height: 34 },
    { x: 714, y: 162, width: 92, height: 34 }, { x: 134, y: 424, width: 92, height: 34 },
    { x: 464, y: 522, width: 92, height: 34 },
  ]) expect(town.obstacles).toContainEqual(footprint);
  for (const house of VILLAGE_ADDED_FOOTPRINTS) for (const street of town.paths) {
    const overlapWidth = Math.min(house.x + house.width, street.x + street.width) - Math.max(house.x, street.x);
    const overlapHeight = Math.min(house.y + house.height, street.y + street.height) - Math.max(house.y, street.y);
    expect(overlapWidth <= 0 || overlapHeight <= 0, `Added house overlaps street: ${JSON.stringify({ house, street })}`).toBe(true);
  }
  expect(town.objects.filter(object => object.kind === 'npc')).toHaveLength(5);
  expect(town.enemies).toHaveLength(0);
});

test('all day/night interaction points and new home approaches remain reachable on foot', () => {
  const town = ZONES.town;
  const start = { x: town.spawn.x, y: town.spawn.y + 14 };
  const grid = new NavigationGrid(town, 8);
  const targets = town.objects.flatMap(object => [
    { x: object.x, y: object.y + 14 },
    ...(object.nightX === undefined ? [] : [{ x: object.nightX, y: object.nightY! + 14 }]),
  ]).concat(VILLAGE_ADDED_HOUSES.map(house => ({ x: house.x, y: house.y + 48 })));
  for (const target of targets) {
    expect(segmentBlocked(target, target, town.obstacles, 5.9), `Blocked interaction/porch: ${JSON.stringify(target)}`).toBe(false);
    const route = grid.route(start, target);
    expect(route.length, `No route to ${JSON.stringify(target)}`).toBeGreaterThan(0);
    let previous = start;
    for (const point of route) {
      expect(segmentBlocked(previous, point, town.obstacles, 5.9), `Foot collider clips on route to ${JSON.stringify(target)}`).toBe(false);
      previous = point;
    }
    expect(Math.hypot(previous.x - target.x, previous.y - target.y)).toBeLessThan(12);
  }
});

test('eight ambient residents stay on safe loops and fewer remain outside at night', () => {
  expect(VILLAGE_RESIDENTS).toHaveLength(8);
  for (const resident of VILLAGE_RESIDENTS) {
    for (let index = 0; index < resident.route.length; index++) {
      expect(segmentBlocked(resident.route[index], resident.route[(index + 1) % resident.route.length], ZONES.town.obstacles, 8)).toBe(false);
    }
    const positions = new Set<string>();
    let walkingSamples = 0, restingSamples = 0;
    for (let elapsed = 0; elapsed < 120; elapsed += .25) {
      const pose = getVillageResidentPose(resident, elapsed);
      expect(segmentBlocked(pose, pose, ZONES.town.obstacles, 8)).toBe(false);
      expect(pose.visible).toBe(true);
      positions.add(`${Math.round(pose.x)},${Math.round(pose.y)}`);
      if (pose.moving) walkingSamples++; else restingSamples++;
    }
    expect(positions.size).toBeGreaterThan(20);
    expect(walkingSamples).toBeGreaterThan(0);
    expect(restingSamples).toBeGreaterThan(0);
    expect(getVillageResidentPose(resident, 15)).toEqual(getVillageResidentPose(resident, 15));
  }
  expect(VILLAGE_RESIDENTS.filter(resident => getVillageResidentPose(resident, BALANCE.dayLength * .7).visible)).toHaveLength(3);
});
