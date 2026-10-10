import type Phaser from 'phaser';
import type { ZoneDefinition } from '../model/types';
import { BALANCE } from '../runtime/balance';

/** Town-only art. Coordinates are ground anchors; no body, interaction or save.
 * The existing map owns every road, obstacle and gameplay object. */
export const TOWN_LAMPS = [
  { x: 420, y: 201 }, { x: 541, y: 201 }, { x: 366, y: 370 },
  { x: 632, y: 468 }, { x: 242, y: 445 }, { x: 813, y: 203 },
] as const;

export interface TownVisuals {
  update(elapsedSeconds: number): void;
  destroy(): void;
}

export function createTownVisuals(scene: Phaser.Scene, zone: ZoneDefinition, initialTime = 0): TownVisuals {
  if (zone.id !== 'town') return { update: () => undefined, destroy: () => undefined };
  const owned: Phaser.GameObjects.GameObject[] = [];
  const lights: { graphic: Phaser.GameObjects.Graphics; x: number; y: number }[] = [];
  let lastEffectTick = -1;
  let destroyed = false;
  const graphic = (name: string, depth: number): Phaser.GameObjects.Graphics => {
    const item = scene.add.graphics().setDepth(depth).setData('town-visual', name);
    owned.push(item);
    return item;
  };
  // Bake the many static paving clusters once, then render a single nearest
  // texture. It is shared across zone restarts; no per-frame ground geometry.
  const pavingKey = 'town-paving-p0';
  if (!scene.textures.exists(pavingKey)) {
  const ground = scene.make.graphics({ x: 0, y: 0 });
  const onRoad = (x: number, y: number): boolean => zone.paths.some(path =>
    x >= path.x && x < path.x + path.width && y >= path.y && y < path.y + path.height);

  // A single paving surface over the union of the original roads. Quiet large
  // stones replace the busy repeating texture without changing walkable space.
  for (let y = 16; y < zone.height - 16; y += 8) for (let x = 16; x < zone.width - 16; x += 8) {
    if (!onRoad(x + 4, y + 4)) continue;
    const tone = ((x / 8) * 7 + (y / 8) * 3) % 5;
    ground.fillStyle(tone === 0 ? 0xb5aa8e : tone === 1 ? 0x8e8c79 : 0xa19a80, .68).fillRect(x, y, 8, 8);
    ground.fillStyle(0xd6c8a1, .18).fillRect(x + 1, y + 1, 6, 1);
    ground.fillStyle(0x674533, .15).fillRect(x, y + 7, 8, 1);
    // Curb only at outside edges: overlapping path rectangles have no seams.
    ground.fillStyle(0x586579, .6);
    if (!onRoad(x + 4, y - 4)) ground.fillRect(x, y, 8, 2);
    if (!onRoad(x + 4, y + 12)) ground.fillRect(x, y + 6, 8, 2);
    if (!onRoad(x - 4, y + 4)) ground.fillRect(x, y, 2, 8);
    if (!onRoad(x + 12, y + 4)) ground.fillRect(x + 6, y, 2, 8);
  }

  // Flat octagonal plaza. The mosaic is made of hard 2 px clusters, never a
  // fountain/blocker. Spawn (480,400) and all approaches remain open.
  const cx = 488, cy = 350;
  for (let dy = -64; dy <= 64; dy += 4) for (let dx = -80; dx <= 80; dx += 4) {
    const edge = Math.max(Math.abs(dx) / 80, Math.abs(dy) / 64, (Math.abs(dx) + Math.abs(dy)) / 112);
    if (edge > 1) continue;
    const border = edge > .91 || edge > .77 && edge < .82;
    ground.fillStyle(border ? 0x674533 : (dx / 4 + dy / 4) % 3 === 0 ? 0xb4b19b : 0xa4a58f, border ? .85 : .9).fillRect(cx + dx, cy + dy, 4, 4);
    if (edge > .94) ground.fillStyle(0xd6ac59, .65).fillRect(cx + dx, cy + dy, 3, 2);
  }
  for (let dy = -28; dy <= 28; dy += 2) for (let dx = -28; dx <= 28; dx += 2) {
    const outer = dx * dx + dy * dy <= 28 * 28;
    const inner = (dx - 12) ** 2 + (dy + 5) ** 2 < 24 * 24;
    if (outer && !inner) ground.fillStyle(dy < 0 ? 0xd6ac59 : 0x877c61, .9).fillRect(cx + dx, cy + dy, 2, 2);
  }
  ground.fillStyle(0x586579, .65).fillRect(cx - 3, cy - 25, 4, 16).fillRect(cx - 3, cy + 9, 4, 16);
  // Four diamond inlays make the centre readable from every approach.
  for (const [x, y] of [[cx, cy - 47], [cx, cy + 47], [cx - 60, cy], [cx + 60, cy]]) {
    for (let row = -3; row <= 3; row++) ground.fillStyle(0xd6ac59, .55).fillRect(x - (3 - Math.abs(row)) * 2, y + row * 2, (3 - Math.abs(row)) * 4 + 2, 2);
  }
  ground.generateTexture(pavingKey, zone.width, zone.height);
  ground.destroy();
  // Phaser FilterMode.NEAREST = 0; keep this module importable by node tests.
  scene.textures.get(pavingKey).setFilter(0);
  }
  owned.push(scene.add.image(0, 0, pavingKey).setOrigin(0).setDepth(-83).setData('town-visual', 'paving'));

  const lamp = (x: number, y: number): void => {
    const post = graphic('lantern', y + 46);
    post.fillStyle(0x171c2b).fillRect(x - 4, y - 3, 8, 4).fillRect(x - 2, y - 30, 4, 29);
    post.fillStyle(0xae7548).fillRect(x - 1, y - 28, 1, 25);
    post.fillStyle(0xd6ac59).fillRect(x - 6, y - 32, 12, 2).fillRect(x - 4, y - 21, 8, 2);
    post.fillStyle(0x171c2b).fillRect(x - 5, y - 30, 10, 9);
    post.fillStyle(0xf2bd70).fillRect(x - 3, y - 28, 6, 5);
    post.fillStyle(0xe3d7b5).fillRect(x - 2, y - 28, 2, 4);
    lights.push({ graphic: graphic('lantern-light', -81), x, y });
  };
  for (const { x, y } of TOWN_LAMPS) lamp(x, y);

  const sign = (x: number, y: number, text: string, color: number, width = 64): void => {
    const board = graphic('sign', y + 47);
    board.fillStyle(0x171c2b).fillRect(x - width / 2 - 1, y - 18, width + 2, 20);
    board.fillStyle(0x674533).fillRect(x - width / 2, y - 17, width, 18);
    board.fillStyle(0xae7548).fillRect(x - width / 2 + 2, y - 16, width - 4, 2);
    board.fillStyle(color).fillRect(x - width / 2 + 2, y - 1, width - 4, 1);
    const label = scene.add.text(x, y - 8, text, { fontFamily: 'Segoe UI, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#f4eed9', stroke: '#171c2b', strokeThickness: 2 })
      .setOrigin(.5).setResolution(2).setDepth(y + 48).setData('town-visual', 'sign-text');
    owned.push(label);
  };
  sign(620, 276, 'CHỢ', 0xd6ac59, 40);
  sign(171, 445, 'LÒ RÈN', 0xf2bd70);
  sign(772, 180, 'GIẢ KIM', 0x6fc4cf);
  sign(510, 544, 'QUÁN TRỌ', 0xd6ac59, 80);

  // Market annex fits the narrow grass pocket beyond the residents' loop.
  // Reuse the existing full-size merchant stall; these are supporting wares.
  const market = graphic('market-wares', 436);
  market.fillStyle(0x171c2b, .28).fillRect(667, 388, 31, 5);
  market.fillStyle(0x674533).fillRect(668, 364, 3, 26).fillRect(693, 364, 3, 26);
  market.fillStyle(0x171c2b).fillRect(667, 357, 30, 11);
  for (let strip = 0; strip < 5; strip++) {
    market.fillStyle(strip % 2 ? 0xe3d7b5 : 0x8778c6).fillRect(668 + strip * 6, 358, 5, 8);
    market.fillStyle(strip % 2 ? 0xb5aa8e : 0x586579).fillRect(668 + strip * 6, 366, 5, 3);
  }
  market.fillStyle(0xae7548).fillRect(669, 381, 26, 4);
  market.fillStyle(0x674533).fillRect(669, 385, 26, 5);
  market.fillStyle(0xd6ac59).fillRect(672, 384, 1, 6).fillRect(691, 384, 1, 6);
  for (let item = 0; item < 5; item++) {
    market.fillStyle(item % 2 ? 0xa1bd73 : 0xe47770).fillRect(672 + item * 4, 377 + item % 2, 3, 4);
    market.fillStyle(0xe3d7b5, .7).fillRect(672 + item * 4, 377 + item % 2, 1, 1);
  }
  const crate = (x: number, y: number): void => {
    const g = graphic('goods-crate', y + 46);
    g.fillStyle(0x171c2b).fillRect(x - 8, y - 10, 16, 11);
    g.fillStyle(0xae7548).fillRect(x - 7, y - 9, 14, 9);
    g.fillStyle(0x674533).fillRect(x - 5, y - 8, 2, 7).fillRect(x + 3, y - 8, 2, 7);
    g.fillStyle(0xd6ac59, .8).fillRect(x - 7, y - 9, 14, 1).fillRect(x - 7, y - 2, 14, 1);
    g.fillStyle(0x674533).fillRect(x - 1, y - 8, 2, 7);
  };
  crate(580, 281); crate(653, 281);
  const sacks = graphic('market-baskets', 328);
  for (const [x, color] of [[568, 0xd6ac59], [665, 0xa1bd73]]) {
    sacks.fillStyle(0x674533).fillRect(x - 4, 274, 9, 8);
    sacks.fillStyle(0xae7548).fillRect(x - 5, 274, 11, 2);
    sacks.fillStyle(color).fillRect(x - 3, 271, 3, 3).fillRect(x + 1, 272, 3, 2);
  }
  const pennants = graphic('market-pennants', 325);
  pennants.lineStyle(1, 0x674533).lineBetween(563, 256, 663, 257);
  for (let i = 0; i < 8; i++) {
    const x = 566 + i * 12, y = 257;
    pennants.fillStyle([0xd6ac59, 0x8778c6, 0xe3d7b5][i % 3]).fillRect(x, y, 6, 4).fillRect(x + 1, y + 4, 4, 2).fillRect(x + 2, y + 6, 2, 2);
  }

  // Forge annex: equipment on the grass beside the workshop, not on its
  // approach from the road. All weapons are painted scenery, never loot.
  const rack = graphic('forge-rack', 482);
  rack.fillStyle(0x171c2b).fillRect(241, 406, 19, 31);
  rack.fillStyle(0x674533).fillRect(242, 407, 2, 29).fillRect(256, 407, 2, 29);
  rack.fillStyle(0xae7548).fillRect(242, 411, 16, 3).fillRect(242, 431, 16, 3);
  for (const x of [247, 253]) {
    rack.fillStyle(0x586579).fillRect(x - 1, 414, 3, 14);
    rack.fillStyle(0xe3d7b5).fillRect(x, 414, 1, 12);
    rack.fillStyle(0xd6ac59).fillRect(x - 2, 427, 5, 2);
    rack.fillStyle(0x674533).fillRect(x, 429, 1, 4);
  }
  const barrel = graphic('forge-barrel', 548);
  barrel.fillStyle(0x171c2b).fillRect(118, 484, 16, 18);
  barrel.fillStyle(0xae7548).fillRect(120, 484, 12, 17);
  barrel.fillStyle(0x674533).fillRect(123, 485, 1, 16).fillRect(128, 485, 1, 16);
  barrel.fillStyle(0x586579).fillRect(119, 487, 14, 2).fillRect(119, 496, 14, 2);
  barrel.fillStyle(0xe3d7b5, .5).fillRect(120, 487, 4, 1);
  const forgeLight = graphic('forge-light', -80);
  const forgeSparks = graphic('forge-sparks', 510);

  const potions = graphic('alchemy-tray', 257);
  potions.fillStyle(0x171c2b).fillRect(796, 206, 20, 6);
  potions.fillStyle(0xae7548).fillRect(797, 206, 18, 3);
  potions.fillStyle(0x674533).fillRect(798, 209, 2, 3).fillRect(812, 209, 2, 3);
  for (let bottle = 0; bottle < 3; bottle++) {
    const x = 798 + bottle * 6;
    potions.fillStyle(0x171c2b).fillRect(x, 199, 5, 7);
    potions.fillStyle([0xe47770, 0x6fc4cf, 0x8fd5a3][bottle]).fillRect(x + 1, 201, 3, 4);
    potions.fillStyle(0xe3d7b5).fillRect(x + 1, 201, 1, 2);
    potions.fillStyle(0xd6ac59).fillRect(x + 1, 197, 3, 2);
  }
  const alchemyLight = graphic('alchemy-rune', -80);
  const alchemyMist = graphic('alchemy-mist', 254);

  const bench = graphic('inn-bench', 580);
  bench.fillStyle(0x171c2b).fillRect(568, 519, 25, 17);
  bench.fillStyle(0xae7548).fillRect(569, 520, 23, 4).fillRect(569, 528, 23, 3);
  bench.fillStyle(0x674533).fillRect(570, 524, 2, 11).fillRect(589, 524, 2, 11);
  bench.fillStyle(0xd6ac59, .6).fillRect(569, 520, 23, 1).fillRect(569, 528, 23, 1);
  crate(545, 550);
  const welcome = graphic('inn-welcome', -82);
  welcome.fillStyle(0x674533, .8).fillRect(495, 560, 30, 12);
  welcome.fillStyle(0xd6ac59, .65).fillRect(497, 561, 26, 1).fillRect(497, 570, 26, 1);
  welcome.fillStyle(0x8778c6, .45).fillRect(500, 564, 20, 4);

  // East gate stays beside the original portal (916,320). Two side piers,
  // never a crossbar across the street or a new collision rectangle.
  for (const y of [278, 376]) {
    const gate = graphic('east-gate-pier', y + 46);
    gate.fillStyle(0x171c2b).fillRect(922, y - 48, 19, 49);
    gate.fillStyle(0x586579).fillRect(924, y - 45, 15, 42);
    gate.fillStyle(0xa0abb4).fillRect(924, y - 45, 3, 39);
    gate.fillStyle(0x2a3448).fillRect(936, y - 44, 3, 40);
    for (let row = 0; row < 5; row++) gate.fillStyle(0x2a3448, .7)
      .fillRect(927, y - 39 + row * 8, 9, 1).fillRect(930 + row % 2 * 3, y - 44 + row * 8, 1, 5);
    gate.fillStyle(0x674533).fillRect(921, y - 48, 21, 4).fillRect(921, y - 5, 21, 5);
    gate.fillStyle(0xd6ac59).fillRect(922, y - 48, 19, 1).fillRect(922, y - 5, 19, 1);
    gate.fillStyle(0x8778c6).fillRect(927, y - 40, 8, 17);
    gate.fillStyle(0xd6ac59).fillRect(929, y - 37, 2, 10).fillRect(931, y - 38, 2, 2).fillRect(931, y - 28, 2, 2);
    lamp(932, y);
  }
  sign(887, 281, 'RỪNG →', 0x8fd5a3, 74);
  const threshold = graphic('east-threshold', -82);
  for (let row = 0; row < 8; row++) {
    threshold.fillStyle(row % 2 ? 0x586579 : 0xa0abb4, .5).fillRect(907, 288 + row * 8, 8, 7);
    threshold.fillStyle(0xd6ac59, .55).fillRect(915, 288 + row * 8, 2, 7);
  }
  // Ground inlays keep the outgoing lane legible without creating a second
  // interactive marker that could be confused with the real exit.
  threshold.fillStyle(0xd6ac59, .4).fillRect(886, 317, 9, 3).fillRect(893, 315, 3, 7);

  const planter = (x: number, y: number, color: number): void => {
    const g = graphic('roadside-planter', y + 46);
    g.fillStyle(0x171c2b).fillRect(x - 9, y - 8, 18, 9);
    g.fillStyle(0x674533).fillRect(x - 8, y - 7, 16, 7);
    g.fillStyle(0xae7548).fillRect(x - 9, y - 8, 18, 2);
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x5b8b54).fillRect(x - 7 + i * 4, y - 13, 3, 6);
      g.fillStyle(color).fillRect(x - 8 + i * 4, y - 15 + i % 2, 4, 3);
      g.fillStyle(0xe3d7b5, .65).fillRect(x - 7 + i * 4, y - 15 + i % 2, 1, 1);
    }
  };
  planter(370, 449, 0xe47770);
  planter(699, 385, 0xd6ac59);
  planter(904, 400, 0x8778c6);

  const art: TownVisuals = {
    update(elapsedSeconds) {
      if (destroyed) return;
      const tick = Math.floor(elapsedSeconds * 10);
      if (tick === lastEffectTick) return;
      lastEffectTick = tick;
      const night = elapsedSeconds % BALANCE.dayLength >= BALANCE.dayLength * .65;
      for (const { graphic: light, x, y } of lights) {
        const flicker = 1 + Math.sin(elapsedSeconds * 2 + x) * .06;
        light.clear().fillStyle(0xf2bd70, (night ? .11 : .025) * flicker)
          .fillRect(x - 18, y - 10, 36, 15).fillRect(x - 12, y - 15, 24, 25);
        light.fillStyle(0xf2bd70, night ? .12 : .025).fillRect(x - 7, y - 3, 14, 7);
      }
      const pulse = 1 + Math.sin(elapsedSeconds * 3) * .12;
      forgeLight.clear().fillStyle(0xf2bd70, (night ? .18 : .07) * pulse).fillRect(165, 456, 42, 28);
      forgeLight.fillStyle(0xf2bd70, night ? .16 : .06).fillRect(173, 463, 26, 15);
      forgeSparks.clear();
      for (let i = 0; i < 4; i++) {
        const rise = (elapsedSeconds * 14 + i * 7) % 25;
        forgeSparks.fillStyle(i % 2 ? 0xd6ac59 : 0xf2bd70, .8 * (1 - rise / 27))
          .fillRect(185 + Math.round(Math.sin(i * 3 + elapsedSeconds) * 7), 464 - Math.round(rise), 2, 2);
      }
      alchemyLight.clear().lineStyle(1, 0x8778c6, night ? .5 : .25).strokeRect(739, 257, 34, 13);
      alchemyLight.fillStyle(0x6fc4cf, (night ? .12 : .035) * pulse).fillRect(742, 255, 28, 17);
      for (const x of [742, 755, 768]) alchemyLight.fillStyle(0x6fc4cf, .45).fillRect(x, 260, 2, 4);
      alchemyMist.clear();
      for (let i = 0; i < 2; i++) {
        const rise = (elapsedSeconds * 4 + i * 8) % 16;
        alchemyMist.fillStyle(0x8fd5a3, .28 * (1 - rise / 18)).fillRect(760 + i * 3, 205 - Math.round(rise), 3, 2);
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const item of owned) if (item.active) item.destroy();
    },
  };
  art.update(initialTime);
  return art;
}
