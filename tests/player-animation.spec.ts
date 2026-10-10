import { expect, test } from '@playwright/test';
import { playerAnimationPose, type PlayerAnimationStatus } from '../src/game/world/PlayerAnimation';
import { BALANCE } from '../src/game/runtime/balance';

const idle: PlayerAnimationStatus = { time: 0, moving: false, attackRemaining: 0, attackDuration: .18,
  hurtRemaining: 0, dodgeRemaining: 0, dodgeDuration: BALANCE.dodgeDuration, deathElapsed: null };

test('movement cycles all four steps and stopping immediately returns to breathing', () => {
  expect([.01, .11, .21, .31, .41].map(time => playerAnimationPose({ ...idle, moving: true, time })))
    .toEqual(['walk1', 'walk2', 'walk3', 'walk4', 'walk1']);
  expect(playerAnimationPose({ ...idle, moving: false, time: .41 })).toBe('idle2');
});

test('normal attacks and longer skills both show anticipation, impact and recovery', () => {
  for (const duration of [.18, .22]) {
    const poses = [1, .7, .45, .2].map(remaining => playerAnimationPose({ ...idle, moving: true,
      attackDuration: duration, attackRemaining: duration * remaining }));
    expect(poses).toEqual(['attack', 'attack2', 'attack3', 'attack4']);
    expect(playerAnimationPose({ ...idle, attackRemaining: 0, attackDuration: duration })).toBe('idle');
  }
});

test('damage, evasion and lethal damage take priority over held attacks', () => {
  const attacking = { ...idle, moving: true, attackRemaining: .1 };
  expect(playerAnimationPose({ ...attacking, hurtRemaining: .24 })).toBe('hurt');
  expect(playerAnimationPose({ ...attacking, hurtRemaining: .08 })).toBe('hurt3');
  expect(playerAnimationPose({ ...attacking, hurtRemaining: .08, dodgeRemaining: BALANCE.dodgeDuration })).toBe('dodge');
  expect(playerAnimationPose({ ...attacking, hurtRemaining: .08, dodgeRemaining: .01, deathElapsed: 0 })).toBe('death');
  expect(playerAnimationPose({ ...attacking, dodgeRemaining: .01 })).toBe('dodge4');
});

test('lethal damage falls once, reaches the ground before the existing respawn delay and holds', () => {
  expect([0, .08, .16, .24, .34, 2].map(deathElapsed => playerAnimationPose({ ...idle, deathElapsed })))
    .toEqual(['death', 'death2', 'death3', 'death4', 'death4', 'death4']);
});
