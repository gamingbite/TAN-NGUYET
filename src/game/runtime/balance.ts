// All numbers are tuning values for the demo, not finalized GDD rules.
export const BALANCE = {
  playerSpeed: 145,
  dodgeSpeed: 390,
  dodgeDuration: .19,
  dodgeCooldown: 1.2,
  invulnerabilityAfterHit: .8,
  combatGrace: 3.5,
  attackCooldown: .35,
  mineDuration: 1.6,
  oreRespawn: 15,
  herbRespawn: 12,
  enemyRespawn: 18,
  interactDistance: 46,
  dayLength: 300,
  skills: { primary: { mp: 8, cooldown: 3 }, secondary: { mp: 15, cooldown: 6 } },
  enemies: {
    slime: { hp: 28, damage: 5, speed: 48, detection: 135, reach: 26, xp: 8 },
    wolf: { hp: 40, damage: 8, speed: 83, detection: 155, reach: 29, xp: 12 },
    wraith: { hp: 48, damage: 9, speed: 60, detection: 165, reach: 90, xp: 15 },
    boss: { hp: 300, damage: 17, speed: 53, detection: 225, reach: 65, xp: 65 },
  },
} as const;
