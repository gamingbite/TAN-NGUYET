import { clickGameMenu } from './helpers/gameMenu';
import { moveKeyboardAxis } from './helpers/keyboardMovement';
import { expect, test, type Page } from '@playwright/test';
import { ZONES } from '../src/game/world/maps';
import type { ZoneId } from '../src/game/model/types';

// Keep DOM/source tracing and failure images without capturing the full canvas
// at every key action; those images previously grew a trace beyond 1GB.
test.use({ trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true } });

// Complete journeys use the same keyboard and UI as a player. No progress,
// damage, position or inventory is injected into the game.
async function position(page: Page): Promise<{ x: number; y: number; zone: ZoneId }> {
  return page.locator('#game').evaluate(element => {
    const data = (element as HTMLElement).dataset;
    return { x: Number(data.px), y: Number(data.py), zone: data.zone as ZoneId };
  });
}

async function walk(page: Page, x: number, y: number): Promise<void> {
  const start = await position(page);
  const zone = ZONES[start.zone];
  const step = 8;
  const columns = zone.width / step;
  const rows = zone.height / step;
  const cell = (px: number, py: number): number => Math.round(py / step) * columns + Math.round(px / step);
  const open = (id: number): boolean => {
    const px = id % columns * step;
    const py = Math.floor(id / columns) * step + 14; // Feet collider below sprite centre.
    return px >= 32 && px <= 928 && py >= 32 && py <= 608 && !zone.obstacles.some(rect =>
      px > rect.x - 15 && px < rect.x + rect.width + 15 && py > rect.y - 15 && py < rect.y + rect.height + 15);
  };
  const from = cell(start.x, start.y);
  const to = cell(x, y);
  const queue = [from];
  const parents = new Map<number, number>([[from, -1]]);
  for (let head = 0; head < queue.length && !parents.has(to); head++) {
    const current = queue[head];
    for (const next of [current + 1, current - 1, current + columns, current - columns]) {
      if (next < 0 || next >= columns * rows || parents.has(next) || !open(next)) continue;
      if (Math.abs(next % columns - current % columns) > 1) continue;
      parents.set(next, current); queue.push(next);
    }
  }
  if (!parents.has(to)) throw new Error(`No route: ${start.zone} ${start.x},${start.y} -> ${x},${y}`);
  const route: number[] = [];
  for (let current = to; current !== from; current = parents.get(current)!) route.unshift(current);
  const turns = route.filter((id, index) => index === route.length - 1 || route[index + 1] - id !== id - (route[index - 1] ?? from));
  for (const id of turns) {
    const target = { x: id % columns * step, y: Math.floor(id / columns) * step };
    for (const axis of ['x', 'y'] as const) {
      await moveKeyboardAxis(page, axis === 'x' ? 'px' : 'py', target[axis]);
    }
  }
  const final = await position(page);
  expect(Math.hypot(final.x - x, final.y - y), `Walking reached ${x},${y} in ${start.zone}`).toBeLessThan(24);
}

async function press(page: Page, key: string): Promise<void> {
  await page.keyboard.down(key); await page.waitForTimeout(80); await page.keyboard.up(key);
  await page.waitForTimeout(120);
}
async function npc(page: Page, x: number, y: number): Promise<void> {
  const object = ZONES.town.objects.find(object => object.kind === 'npc' && Math.hypot(object.x - x, object.y - y) < 40);
  if (object && (await page.locator('#hud-clock').innerText()).includes('Đêm')) {
    x = object.nightX!; y = object.nightY! - 24;
  }
  await walk(page, x, y); await press(page, 'e');
  await expect(page.locator('#panel-overlay')).toBeVisible();
}
async function close(page: Page): Promise<void> {
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
}
const button = (page: Page, action: string, id: string) => page.locator(`[data-action="${action}"][data-id="${id}"]`).first();

async function aimAround(page: Page, angle: number): Promise<void> {
  const point = await position(page);
  const box = (await page.locator('#game canvas').boundingBox())!;
  const zoom = 1.2 * Math.max(1, Math.min(box.width / 800, box.height / 450));
  const halfWidth = box.width / zoom / 2;
  const halfHeight = box.height / zoom / 2;
  const cameraX = halfWidth * 2 >= 960 ? 480 : Math.max(halfWidth, Math.min(960 - halfWidth, point.x));
  const cameraY = halfHeight * 2 >= 640 ? 320 : Math.max(halfHeight, Math.min(640 - halfHeight, point.y));
  await page.mouse.click(
    box.x + (point.x - cameraX + halfWidth + Math.cos(angle) * 80) * zoom,
    box.y + (point.y - cameraY + halfHeight + Math.sin(angle) * 80) * zoom,
  );
  await page.waitForTimeout(380);
}

async function clearPursuers(page: Page): Promise<void> {
  for (let round = 0; round < 4 && await page.locator('#game').getAttribute('data-combat') === 'true'; round++) {
    await press(page, '1'); await press(page, '2'); await press(page, 'q');
    for (let angle = 0; angle < 8; angle++) await aimAround(page, angle * Math.PI / 4);
    await page.waitForTimeout(3800);
  }
  await expect(page.locator('#game')).toHaveAttribute('data-combat', 'false', { timeout: 8000 });
}

for (const classId of ['swordsman', 'mage'] as const) {
  test(`full playable journey: ${classId}, civilian to Boss hand-in and continued exploration`, async ({ page }) => {
    test.setTimeout(300_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.locator('#character-name').fill(`Journey ${classId}`);
    await page.locator('#create-button').click();
    await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
    await npc(page, 480, 240);
    await button(page, 'quest', 'work').click();
    await close(page);
    console.log(`${classId}: mine`);
    for (const [index, target] of [[752, 488], [816, 496], [872, 456]].entries()) {
      await walk(page, target[0], target[1]);
      await page.keyboard.down('e');
      await expect(page.locator('#game')).toHaveAttribute('data-ore', String(index + 1), { timeout: 4000 });
      await page.keyboard.up('e'); await page.waitForTimeout(200);
    }
    console.log(`${classId}: forge`);
    await npc(page, 192, 496);
    const weapon = classId === 'mage' ? 'staff' : 'sword';
    await button(page, 'recipe', weapon).click();
    await button(page, 'craft', weapon).click();
    await close(page);
    await npc(page, 752, 256);
    await button(page, 'recipe', 'hp-potion').click();
    await button(page, 'craft', 'hp-potion').click();
    await button(page, 'recipe', 'mp-potion').click();
    await button(page, 'craft', 'mp-potion').click();
    await close(page);
    await npc(page, 280, 320);
    await button(page, 'learnClass', classId).click();
    await expect(page.locator('#hud-class')).toContainText(classId === 'mage' ? 'Pháp Sư' : 'Kiếm Sĩ');
    await close(page);
    await npc(page, 480, 240);
    await button(page, 'quest', 'work').click();
    await button(page, 'quest', 'seal').click();
    await close(page);
    await npc(page, 616, 328);
    for (let i = 0; i < 3; i++) await button(page, 'buy', 'hp-potion').click();
    await close(page);
    console.log(`${classId}: forest`);
    await walk(page, 896, 320); await press(page, 'e');
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
    await walk(page, 184, 320);
    await walk(page, 448, 280); await press(page, 'e');
    // Both skills and repeated normal attacks; the wave chases the player.
    await press(page, '1'); await press(page, '2');
    for (let i = 0; i < 30 && await page.locator('#game').getAttribute('data-seal-kills') !== '3'; i++) {
      await press(page, 'Space');
      if (i % 5 === 0) await press(page, '1');
      if (i % 10 === 0) await press(page, '2');
      if (i % 12 === 0) await press(page, 'q');
    }
    await expect(page.locator('#game')).toHaveAttribute('data-seal-kills', '3');
    await press(page, 'e');
    await expect(page.locator('#game')).toHaveAttribute('data-seal-resolved', 'true');
    await walk(page, 184, 320);
    await press(page, '1'); await press(page, '2');
    await press(page, 'q');
    await clearPursuers(page);
    await press(page, 'm'); await page.locator('[data-action="travel"]').click();
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town');
    await npc(page, 480, 240);
    await button(page, 'quest', 'seal').click(); await button(page, 'quest', 'boss').click();
    await close(page);
    await clickGameMenu(page, '#save-button');
    await press(page, 'm'); await page.locator('[data-action="travel"]').click();
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
    console.log(`${classId}: dungeon`);
    await walk(page, 872, 120);
    await clearPursuers(page);
    await press(page, 'e');
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'dungeon');
    // Fight enemies naturally encountered at the corridor and approach Boss.
    await walk(page, 552, 216);
    await press(page, '1'); await press(page, '2'); await press(page, 'q');
    await walk(page, 752, 184);
    await page.screenshot({ path: `.cache/previews/${classId}-boss.png`, fullPage: true });
    let sawPhaseTwo = false;
    let sawWarning = false;
    for (let i = 0; i < 100 && await page.locator('#game').getAttribute('data-boss-defeated') !== 'true'; i++) {
      const data = await page.locator('#game').evaluate(element => ({ ...(element as HTMLElement).dataset }));
      sawPhaseTwo ||= data.bossPhase === '2'; sawWarning ||= data.bossWarning === 'true';
      // The Boss approaches from the west after we enter its room. Click to
      // aim both melee and magic at it rather than at our last walking direction.
      await aimAround(page, Math.PI);
      if (i % 7 === 0) await press(page, '1');
      if (i % 12 === 0) await press(page, '2');
      if (i % 10 === 0) await press(page, 'q');
      if (i % 30 === 0) await press(page, 'r');
    }
    await expect(page.locator('#game')).toHaveAttribute('data-boss-defeated', 'true');
    expect(sawPhaseTwo).toBe(true); expect(sawWarning).toBe(true);
    await expect(page.locator('#game')).toHaveAttribute('data-completed', 'false');
    console.log(`${classId}: return and hand-in`);
    await walk(page, 80, 552);
    await clearPursuers(page);
    await press(page, 'e'); await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
    await walk(page, 888, 112);
    await clearPursuers(page);
    await press(page, 'm'); await page.locator('[data-action="travel"]').click();
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'town');
    await npc(page, 480, 240);
    await button(page, 'quest', 'boss').click();
    await expect(page.locator('.ending-text')).toHaveText('Kết thúc nội dung cốt truyện của Demo v0.1 – thế giới vẫn có thể tự do khám phá.');
    await page.screenshot({ path: `.cache/previews/${classId}-ending.png`, fullPage: true });
    await page.locator('[data-action="resume"]').click();
    await expect(page.locator('#game')).toHaveAttribute('data-completed', 'true');
    await clickGameMenu(page, '#save-button');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tan-nguyet-save-v1')!));
    expect(saved.quests).toEqual({ work: 'done', seal: 'done', boss: 'done' });
    expect(saved.progress.brewedPotion).toBe(true);
    await page.reload(); await page.locator('#continue-button').click();
    await expect(page.locator('#game')).toHaveAttribute('data-completed', 'true');
    await press(page, 'm'); await page.locator('[data-action="travel"]').click();
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'forest');
    await walk(page, 872, 120); await clearPursuers(page); await press(page, 'e');
    await expect(page.locator('#game')).toHaveAttribute('data-zone', 'dungeon');
    await expect(page.locator('#game')).toHaveAttribute('data-boss-hp', '300');
    await expect(page.locator('#game')).toHaveAttribute('data-boss-phase', '1');
    await expect(page.locator('#game')).toHaveAttribute('data-completed', 'true');
    expect(errors).toEqual([]);
  });
}
