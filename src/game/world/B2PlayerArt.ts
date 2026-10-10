import Phaser from 'phaser';
import type { CharacterAppearance, ClassId, RaceId } from '../model/types';
import type { ActorDirection, PlayerPose } from './textures';
import { PLAYER_ANIMATION_POSES } from './PlayerAnimation';
import { paintB2Layers } from './B2PlayerLayers';
import { B2_RACES, B2_DIRECTIONS, B2_NATIVE, b2PlayerPath, b2PlayerBackPath,
  b2Canvas, b2Context, normalizeB2Body } from './B2PlayerSources';

/** 96 runtime outputs per race, curated from irregular body sheets plus
 * back-facing hurt/death/dodge sheets. Some body poses are reused or mirrored;
 * B2_FRAME_SOURCES records that explicitly. These are not 96 authored cells. */
export const B2_PLAYER_ART = { races: B2_RACES, directions: B2_DIRECTIONS, ...B2_NATIVE } as const;
export { b2PlayerPath } from './B2PlayerSources';
const bases = new WeakMap<Phaser.Textures.TextureManager, Map<string, HTMLCanvasElement>>();
const resultCache = new WeakMap<Phaser.Textures.TextureManager, { installed: number; warnings: string[] }>();
const keyOf = (race: RaceId, direction: ActorDirection, pose: PlayerPose): string => `${race}-${direction}-${pose}`;
const sourceKey = (race: RaceId, back = false): string => `art-source-player-${race}-b2${back ? '-back' : ''}`;

export function loadB2PlayerArt(scene: Phaser.Scene): void {
  for (const race of B2_RACES) {
    if (!scene.textures.exists(sourceKey(race))) scene.load.image(sourceKey(race), b2PlayerPath(race));
    if (!scene.textures.exists(sourceKey(race, true))) scene.load.image(sourceKey(race, true), b2PlayerBackPath(race));
  }
}
export function installB2PlayerArt(scene: Phaser.Scene): { installed: number; warnings: string[] } {
  const previous = resultCache.get(scene.textures); if (previous) return previous;
  const installed = new Map<string, HTMLCanvasElement>(), warnings: string[] = [];
  for (const race of B2_RACES) {
    if (!scene.textures.exists(sourceKey(race))) { warnings.push(`Thiếu ${b2PlayerPath(race)}; giữ bộ nhân vật dự phòng.`); continue; }
    try {
      const image = scene.textures.get(sourceKey(race)).getSourceImage() as HTMLImageElement;
      const back = scene.textures.exists(sourceKey(race, true))
        ? scene.textures.get(sourceKey(race, true)).getSourceImage() as HTMLImageElement : undefined;
      if (!back) warnings.push(`Thiếu ${b2PlayerBackPath(race)}; ba trạng thái nhìn sau dùng bộ dự phòng.`);
      for (const direction of B2_DIRECTIONS) for (const pose of PLAYER_ANIMATION_POSES) {
        const canvas = normalizeB2Body(image, race, direction, pose, back);
        if (canvas) installed.set(keyOf(race, direction, pose), canvas);
        else if (back || direction !== 'up') warnings.push(`Ô B2 trống: ${race}/${direction}/${pose}; giữ bộ dự phòng.`);
      }
    } catch (error) { warnings.push(`${race} B2: ${error instanceof Error ? error.message : String(error)}; giữ bộ dự phòng.`); }
  }
  bases.set(scene.textures, installed);
  const result = { installed: installed.size, warnings }; resultCache.set(scene.textures, result); return result;
}
export function createB2PlayerTexture(scene: Phaser.Scene, key: string, appearance: CharacterAppearance, classId: ClassId,
  armored: boolean, armed: boolean, direction: ActorDirection, pose: PlayerPose): boolean {
  const base = bases.get(scene.textures)?.get(keyOf(appearance.race, direction, pose)); if (!base) return false;
  if (scene.textures.exists(key)) return true;
  const canvas = b2Canvas(), context = b2Context(canvas); context.drawImage(base, 0, 0);
  paintB2Layers(context, appearance, classId, armored, armed, direction, pose);
  const texture = scene.textures.addCanvas(key, canvas); if (!texture) return false;
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST); return true;
}
