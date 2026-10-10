import type { CharacterAppearance, ClassId, RaceId } from '../model/types';
import { paintB2Layers } from './B2PlayerLayers';
import { B2_RACES, b2PlayerPath, b2Canvas, b2Context, normalizeB2Body } from './B2PlayerSources';

const bodies = new Map<RaceId, HTMLCanvasElement>();
const portraits = new Map<string, string>();
let pending: Promise<void> | undefined;

/** Missing art preserves the existing portrait fallback. Does not construct
 * a Phaser game, fetch back sheets or write any player/save data. */
export function preloadB2Portraits(): Promise<void> {
  return pending ??= Promise.all(B2_RACES.map(async race => {
    try {
      const image = new Image(); image.src = b2PlayerPath(race); await image.decode();
      const body = normalizeB2Body(image, race, 'down', 'idle'); if (body) bodies.set(race, body);
    } catch { /* Local missing/invalid image: caller retains its fallback. */ }
  })).then(() => undefined);
}
export function getB2Portrait(appearance: CharacterAppearance, classId: ClassId = 'civilian',
  armored = false, armed = false): string | undefined {
  const body = bodies.get(appearance.race); if (!body) return undefined;
  const key = JSON.stringify([appearance, classId, armored, armed]);
  const cached = portraits.get(key); if (cached) return cached;
  const canvas = b2Canvas(), context = b2Context(canvas); context.drawImage(body, 0, 0);
  paintB2Layers(context, appearance, classId, armored, armed, 'down', 'idle');
  const result = canvas.toDataURL('image/png'); portraits.set(key, result); return result;
}
