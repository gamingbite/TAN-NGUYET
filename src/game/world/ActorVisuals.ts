import type Phaser from 'phaser';

export interface ActorAnimationState {
  moving?: boolean;
  attacking?: boolean;
  phase?: 1 | 2;
}

/**
 * Selects raster or procedural frames without moving/scaling an actor or changing tint.
 * Every frame keeps the original native size; foot hitboxes and hit flashes
 * remain owned by the scene. elapsedSeconds should be the paused game clock.
 */
export function updateActorVisual(
  sprite: Phaser.GameObjects.Sprite,
  baseKey: string,
  elapsedSeconds: number,
  state: ActorAnimationState = {},
): void {
  if (!sprite.active || !sprite.visible) return;
  const boss = baseKey === 'boss';
  const npc = baseKey.startsWith('npc-');
  if (!boss && !npc && !['slime', 'wolf', 'wraith'].includes(baseKey)) return;

  const base = boss && state.phase === 2 ? 'boss-phase2' : baseKey;
  let pose = '';
  if (state.attacking) {
    if (!npc) pose = 'attack';
  } else if (state.moving) {
    const frame = Math.floor(Math.max(0, elapsedSeconds) * 8) % 4;
    const fullWalk = sprite.scene.textures.exists(`${base}-walk3`) && sprite.scene.textures.exists(`${base}-walk4`);
    pose = fullWalk ? `walk${frame + 1}` : frame === 1 ? 'walk1' : frame === 3 ? 'walk2' : '';
  } else if (npc && Math.floor(Math.max(0, elapsedSeconds) * 8) % 29 === 28) {
    pose = 'blink';
  }

  const requested = pose ? `${base}-${pose}` : base;
  const key = sprite.scene.textures.exists(requested) ? requested : baseKey;
  if (sprite.texture.key !== key) sprite.setTexture(key);
}
