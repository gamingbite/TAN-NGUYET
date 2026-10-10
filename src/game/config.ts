// Technical test values only; these are not finalized gameplay balance.
export const gameConfig = {
  width: 640,
  height: 360,
  playerSpeed: 110,
  spawn: { x: 320, y: 270 },
} as const;

export const gameEvents = {
  ready: 'foundation:ready',
  position: 'foundation:position',
} as const;
