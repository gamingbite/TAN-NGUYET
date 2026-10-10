/** Art-only frame choices. Damage, dodge speed, invulnerability and respawn
 * remain controlled by the existing gameplay timers. */
export const PLAYER_ANIMATION_STATES = ['idle', 'walk', 'attack', 'hurt', 'death', 'dodge'] as const;
export const PLAYER_ANIMATION_POSES = [
  'idle', 'idle2', 'idle3', 'idle4', 'walk1', 'walk2', 'walk3', 'walk4',
  'attack', 'attack2', 'attack3', 'attack4', 'hurt', 'hurt2', 'hurt3', 'hurt4',
  'death', 'death2', 'death3', 'death4', 'dodge', 'dodge2', 'dodge3', 'dodge4',
] as const;
export type PlayerAnimationPose = typeof PLAYER_ANIMATION_POSES[number];
export interface PlayerAnimationStatus {
  time: number; moving: boolean; attackRemaining: number; attackDuration: number;
  hurtRemaining: number; dodgeRemaining: number; dodgeDuration: number;
  deathElapsed: number | null;
}
const at = (state: number, frame: number): PlayerAnimationPose =>
  PLAYER_ANIMATION_POSES[state * 4 + Math.max(0, Math.min(3, frame))];
export function playerAnimationPose(status: PlayerAnimationStatus): PlayerAnimationPose {
  if (status.deathElapsed !== null) return at(4, Math.floor(status.deathElapsed / .075));
  if (status.dodgeRemaining > 0) return at(5, Math.floor((1 - status.dodgeRemaining / status.dodgeDuration) * 4));
  if (status.hurtRemaining > 0) return at(3, Math.floor((1 - status.hurtRemaining / .24) * 4));
  if (status.attackRemaining > 0) return at(2, Math.floor((1 - status.attackRemaining / status.attackDuration) * 4));
  if (status.moving) return at(1, Math.floor(status.time * 10) % 4);
  return at(0, Math.floor(status.time * 3) % 4);
}
