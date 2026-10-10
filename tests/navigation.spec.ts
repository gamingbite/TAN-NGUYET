import { expect, test } from '@playwright/test';
import { NavigationGrid, segmentBlocked } from '../src/game/runtime/navigation';
import { ZONES } from '../src/game/world/maps';

test('an enemy can route between the dungeon rooms through doorways with its feet collider clear', () => {
  const zone = ZONES.dungeon;
  const start = { x: 180, y: 456 };
  const finish = { x: 780, y: 194 };
  const route = new NavigationGrid(zone, 14).route(start, finish);
  expect(segmentBlocked(start, finish, zone.obstacles)).toBe(true);
  expect(route.length).toBeGreaterThan(2);
  let previous = start;
  for (const point of route) {
    expect(segmentBlocked(previous, point, zone.obstacles, 12)).toBe(false);
    previous = point;
  }
  expect(Math.hypot(previous.x - finish.x, previous.y - finish.y)).toBeLessThan(10);
  expect(route.some(point => point.x >= 312 && point.x <= 352 && point.y >= 424 && point.y <= 488)).toBe(true);
});

test('solid walls block attacks and projectiles while an open doorway preserves line of sight', () => {
  const wall = [{ x: 100, y: 80, width: 16, height: 80 }];
  expect(segmentBlocked({ x: 60, y: 120 }, { x: 160, y: 120 }, wall)).toBe(true);
  expect(segmentBlocked({ x: 60, y: 40 }, { x: 160, y: 40 }, wall)).toBe(false);
  expect(segmentBlocked({ x: 108, y: 120 }, { x: 108, y: 180 }, wall)).toBe(true);
  expect(segmentBlocked({ x: 280, y: 456 }, { x: 380, y: 456 }, ZONES.dungeon.obstacles)).toBe(false);
});

test('the forest route goes around tree trunks instead of chasing into a collider', () => {
  const zone = ZONES.forest;
  const start = { x: 670, y: 330 };
  const finish = { x: 715, y: 330 };
  expect(segmentBlocked(start, finish, zone.obstacles, 7)).toBe(true);
  const route = new NavigationGrid(zone, 9).route(start, finish);
  expect(route.length).toBeGreaterThan(1);
  let previous = start;
  for (const point of route) {
    expect(segmentBlocked(previous, point, zone.obstacles, 7)).toBe(false);
    previous = point;
  }
});
