import type Phaser from 'phaser';
import type { ZoneDefinition } from '../model/types';
import { BALANCE } from '../runtime/balance';
import { segmentBlocked, type Point } from '../runtime/navigation';
import { updateActorVisual } from './ActorVisuals';
import { createTownVisuals } from './TownVisuals';

interface ResidentDefinition {
  id: string;
  texture: string;
  route: readonly Point[];
  speed: number;
  offset: number;
  tint: number;
  night?: boolean;
}

/** Decorative residents only: no physics, dialogue, quest or save ownership.
 * Route coordinates are feet, matching the navigation grid. The five named
 * NPCs remain the scene's interaction actors with their existing schedules. */
export const VILLAGE_RESIDENTS: readonly ResidentDefinition[] = [
  { id: 'market-walker', texture: 'npc-merchant', route: [{ x: 370, y: 270 }, { x: 420, y: 270 }, { x: 420, y: 294 }, { x: 370, y: 294 }], speed: 19, offset: 0, tint: 0xe4d4bb },
  { id: 'square-walker', texture: 'npc-alchemy', route: [{ x: 570, y: 366 }, { x: 652, y: 366 }, { x: 652, y: 384 }, { x: 570, y: 384 }], speed: 22, offset: 4, tint: 0xd3dfbc, night: true },
  { id: 'north-neighbour', texture: 'npc-elder', route: [{ x: 290, y: 242 }, { x: 350, y: 242 }, { x: 350, y: 268 }, { x: 290, y: 268 }], speed: 16, offset: 7, tint: 0xd7cde3 },
  { id: 'west-neighbour', texture: 'npc-forge', route: [{ x: 112, y: 316 }, { x: 180, y: 316 }, { x: 180, y: 346 }, { x: 112, y: 346 }], speed: 18, offset: 10, tint: 0xe4c5a5 },
  { id: 'south-neighbour', texture: 'npc-merchant', route: [{ x: 256, y: 490 }, { x: 356, y: 490 }, { x: 356, y: 516 }, { x: 256, y: 516 }], speed: 20, offset: 3, tint: 0xb9cbd0 },
  { id: 'east-neighbour', texture: 'npc-alchemy', route: [{ x: 712, y: 282 }, { x: 812, y: 282 }, { x: 812, y: 304 }, { x: 712, y: 304 }], speed: 23, offset: 8, tint: 0xe4cebd },
  { id: 'gate-walker', texture: 'npc-trainer', route: [{ x: 808, y: 346 }, { x: 884, y: 346 }, { x: 884, y: 372 }, { x: 808, y: 372 }], speed: 21, offset: 14, tint: 0xc6d3ae, night: true },
  { id: 'evening-walker', texture: 'npc-elder', route: [{ x: 394, y: 528 }, { x: 422, y: 528 }, { x: 422, y: 584 }, { x: 394, y: 584 }], speed: 17, offset: 5, tint: 0xe4d5b2, night: true },
];

const CORNER_REST = 1.6;
const HOUSE_TINTS = [0xffffff, 0xf4dfbf, 0xd9e5c7, 0xe0d9ed, 0xf5d6bb, 0xd0e0db, 0xe7d4bb, 0xd6d7e8];

/** Position derives from the simulation clock, so reloads are deterministic
 * and the caller can freeze all motion by stopping update while paused. */
export function getVillageResidentPose(resident: ResidentDefinition, elapsedSeconds: number): Point & { moving: boolean; flipX: boolean; visible: boolean } {
  const durations = resident.route.map((from, index) => {
    const to = resident.route[(index + 1) % resident.route.length];
    return Math.hypot(to.x - from.x, to.y - from.y) / resident.speed + CORNER_REST;
  });
  const cycle = durations.reduce((sum, value) => sum + value, 0);
  let time = ((Math.max(0, elapsedSeconds) + resident.offset) % cycle + cycle) % cycle;
  const night = elapsedSeconds % BALANCE.dayLength >= BALANCE.dayLength * .65;
  for (let index = 0; index < durations.length; index++) {
    if (time > durations[index]) { time -= durations[index]; continue; }
    const from = resident.route[index], to = resident.route[(index + 1) % resident.route.length];
    const travelTime = durations[index] - CORNER_REST;
    const ratio = Math.min(1, time / travelTime);
    return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio,
      moving: ratio < 1, flipX: to.x < from.x, visible: !night || resident.night === true };
  }
  return { ...resident.route[0], moving: false, flipX: false, visible: !night || resident.night === true };
}

export interface VillageLife {
  update(dt: number, elapsedSeconds: number): void;
  destroy(): void;
}

/** Call after the scene draws terrain/decorations. This adds visual village
 * dressing around the approved house art; collision stays in maps.ts. */
export function createVillageLife(scene: Phaser.Scene, zone: ZoneDefinition, initialElapsedSeconds = 0): VillageLife {
  const visuals: Phaser.GameObjects.GameObject[] = [];
  const residents: { definition: ResidentDefinition; sprite: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse }[] = [];
  const smoke: { graphic: Phaser.GameObjects.Graphics; x: number; y: number; offset: number }[] = [];
  const banners: { graphic: Phaser.GameObjects.Graphics; x: number; y: number; color: number }[] = [];
  const windows: Phaser.GameObjects.Ellipse[] = [];
  let destroyed = false;
  if (zone.id !== 'town') return { update: () => undefined, destroy: () => undefined };
  const townArt = createTownVisuals(scene, zone, initialElapsedSeconds);

  const ground = scene.add.graphics().setDepth(-84);
  visuals.push(ground);
  const houses = zone.decorations.filter(decoration => decoration.kind === 'house');
  for (const [index, house] of houses.entries()) {
    const { x, y } = house;
    const variant = house.variant ?? 0;
    const image = scene.children.list.find(child => child.type === 'Image'
      && (child as Phaser.GameObjects.Image).texture.key === 'house'
      && (child as Phaser.GameObjects.Image).x === x && (child as Phaser.GameObjects.Image).y === y) as Phaser.GameObjects.Image | undefined;
    image?.setTint(HOUSE_TINTS[variant % HOUSE_TINTS.length]);

    // Low-contrast courtyard and stepping stones are flat ground details.
    ground.fillStyle(0x171c2b, .22).fillEllipse(x, y + 37, 108, 17);
    ground.fillStyle(0x9a906d, .7).fillRoundedRect(x - 32, y + 30, 64, 26, 6);
    ground.lineStyle(1, 0xd6c695, .3).strokeRoundedRect(x - 32, y + 30, 64, 26, 6);
    for (let step = 0; step < 3; step++) {
      ground.fillStyle(step % 2 ? 0xb8aa83 : 0x897e65, .65).fillRect(x - 8 + step % 2 * 3, y + 43 + step * 7, 16, 4);
    }
    const trim = scene.add.graphics().setDepth(y + .5);
    visuals.push(trim);
    // Baskets sit inside the already-solid lower footprint. A tiny crop bed
    // and porch flowers add domestic detail without adding new interaction.
    const side = variant % 2 ? -1 : 1;
    const basketX = x + side * 37;
    trim.fillStyle(0x674533).fillRect(basketX - 6, y + 16, 12, 12);
    trim.fillStyle(0xae7548).fillRect(basketX - 5, y + 16, 10, 3);
    trim.lineStyle(1, 0xd6ac59, .7).strokeRect(basketX - 6, y + 19, 12, 6);
    for (let fruit = 0; fruit < 3; fruit++) trim.fillStyle(index % 2 ? 0xa1bd73 : 0xe47770).fillRect(basketX - 4 + fruit * 3, y + 14 + fruit % 2, 3, 3);
    ground.fillStyle(0x674533, .75).fillRect(x - side * 38 - 10, y + 35, 20, 9);
    for (let flower = 0; flower < 4; flower++) {
      const fx = x - side * 38 - 7 + flower * 4;
      ground.fillStyle(0x5b8b54).fillRect(fx, y + 33, 2, 7);
      ground.fillStyle(index % 3 === 0 ? 0xd6ac59 : index % 3 === 1 ? 0xe47770 : 0xe3d7b5).fillRect(fx - 1, y + 31 + flower % 2 * 2, 4, 3);
    }
    // The approved house already contains detailed lit windows. Keep the
    // night warmth beneath the art instead of painting guessed window boxes.
    const light = scene.add.ellipse(x, y + 30, 95, 35, 0xf2bd70, .3).setDepth(y - .5);
    visuals.push(light); windows.push(light);
    if (index % 4 === 0) {
      const graphic = scene.add.graphics().setDepth(y + .6);
      visuals.push(graphic); smoke.push({ graphic, x: x + (variant % 2 ? -29 : 29), y: y - 35, offset: index });
    }
  }

  // Small kitchen gardens between houses; beds are ground, never blockers.
  for (const [x, y, width] of [[102, 188, 34], [270, 178, 48], [570, 193, 48], [248, 594, 60], [624, 593, 52]]) {
    ground.fillStyle(0x674533, .65).fillRect(x, y, width, 18);
    ground.lineStyle(1, 0xae7548, .65).strokeRect(x, y, width, 18);
    for (let row = 0; row < 2; row++) for (let column = 4; column < width - 3; column += 8) {
      ground.fillStyle(row ? 0xa1bd73 : 0x5b8b54).fillRect(x + column, y + 4 + row * 8, 4, 3);
      ground.fillStyle(0x294c3d).fillRect(x + column + 1, y + 7 + row * 8, 2, 2);
    }
  }
  for (const [x, y, color] of [[246, 348, 0xd6ac59], [661, 340, 0x8fd5a3], [839, 283, 0xd6ac59]]) {
    const graphic = scene.add.graphics().setDepth(y);
    visuals.push(graphic); banners.push({ graphic, x, y, color });
  }
  // Laundry by the western homes, drawn above their own courtyard only.
  const laundry = scene.add.graphics().setDepth(390);
  laundry.lineStyle(1, 0x674533).lineBetween(242, 379, 273, 378);
  laundry.fillStyle(0xe3d7b5).fillRect(246, 379, 7, 9);
  laundry.fillStyle(0x8778c6).fillRect(257, 379, 7, 8);
  visuals.push(laundry);

  for (const definition of VILLAGE_RESIDENTS) {
    // Reject an invalid decorative route rather than walking through a house
    // after a future layout edit. No physics body can obstruct the player.
    if (!scene.textures.exists(definition.texture)
      || definition.route.some((point, index) => segmentBlocked(point, definition.route[(index + 1) % definition.route.length], zone.obstacles, 8))) continue;
    const shadow = scene.add.ellipse(0, 0, 17, 6, 0x171c2b, .25);
    const sprite = scene.add.sprite(0, 0, definition.texture).setTint(definition.tint);
    sprite.setData('village-resident', definition.id);
    visuals.push(shadow, sprite); residents.push({ definition, sprite, shadow });
  }

  const life: VillageLife = {
    update(dt, elapsedSeconds) {
      if (destroyed || dt < 0) return;
      townArt.update(elapsedSeconds);
      for (const { definition, sprite, shadow } of residents) {
        const pose = getVillageResidentPose(definition, elapsedSeconds);
        sprite.setPosition(pose.x, pose.y - 14).setDepth(pose.y + 46).setFlipX(pose.flipX).setVisible(pose.visible);
        shadow.setPosition(pose.x, pose.y + 1).setDepth(pose.y + 45).setVisible(pose.visible);
        updateActorVisual(sprite, definition.texture, elapsedSeconds, { moving: pose.moving });
      }
      for (const puff of smoke) {
        const rise = (elapsedSeconds * 5 + puff.offset * 3) % 17;
        puff.graphic.clear().fillStyle(0xe3d7b5, .18 * (1 - rise / 20));
        puff.graphic.fillRect(puff.x - 2 + Math.round(Math.sin(elapsedSeconds + puff.offset) * 2), puff.y - rise, 5, 4);
        puff.graphic.fillRect(puff.x + 1, puff.y - rise - 5, 4, 3);
      }
      for (const flag of banners) {
        const sway = Math.round(Math.sin(elapsedSeconds * 2 + flag.x) * 2);
        flag.graphic.clear().fillStyle(0x674533).fillRect(flag.x, flag.y - 29, 2, 30);
        flag.graphic.fillStyle(flag.color).fillRect(flag.x + 2, flag.y - 27, 12, 10)
          .fillTriangle(flag.x + 14, flag.y - 27, flag.x + 14, flag.y - 17, flag.x + 19 + sway, flag.y - 20);
        flag.graphic.fillStyle(0xe3d7b5, .75).fillRect(flag.x + 5, flag.y - 25, 2, 6);
      }
      const night = elapsedSeconds % BALANCE.dayLength >= BALANCE.dayLength * .65;
      for (const light of windows) light.setAlpha(night ? .2 : 0);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      townArt.destroy();
      for (const visual of visuals) if (visual.active) visual.destroy();
      scene.events.off('shutdown', life.destroy);
    },
  };
  life.update(0, initialElapsedSeconds);
  scene.events.once('shutdown', life.destroy);
  return life;
}
