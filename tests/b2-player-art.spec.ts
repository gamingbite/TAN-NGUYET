import { expect, test, type Page } from '@playwright/test';
import type Phaser from 'phaser';
import type { GameState } from '../src/game/model/types';
import { createNewState } from '../src/game/model/state';
import { SAVE_KEY } from '../src/game/model/storage';
import { BALANCE } from '../src/game/runtime/balance';

interface RuntimeScene {
  player: Phaser.Physics.Arcade.Sprite;
  session: { state: GameState; paused: boolean };
  textures: Phaser.Textures.TextureManager;
  facing: Phaser.Math.Vector2;
  animationTime: number;
  attackPose: number;
  attackPoseDuration: number;
  hurtPose: number;
  dodgeTimer: number;
  deathElapsed: number | null;
  getArtStatus(): { playerFrames: number };
  playerTexture(): string;
  hurtPlayer(damage: number): void;
  events: Phaser.Events.EventEmitter;
}
declare global { interface Window { __b2ArtGame: Phaser.Game } }

async function captureGame(page: Page): Promise<void> {
  // Phaser exports itself before createDemoGame constructs the game. Capture
  // that construction in the test context without adding a production hook.
  await page.addInitScript(() => {
    let exported: { Game: typeof Phaser.Game };
    Object.defineProperty(window, 'Phaser', {
      configurable: true,
      get: () => exported,
      set: (value: { Game: typeof Phaser.Game }) => {
        exported = value;
        const Original = value.Game;
        value.Game = new Proxy(Original, { construct(target, args) {
          const game = Reflect.construct(target, args) as Phaser.Game;
          window.__b2ArtGame = game; return game;
        } });
      },
    });
  });
}
async function start(page: Page): Promise<void> {
  await captureGame(page);
  await page.goto('/');
  await page.locator('#create-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
}

test('B2 keeps all race, Class, direction and action textures inside native frames without changing feet physics or an older save', async ({ page }) => {
  const oldRaw = JSON.stringify(createNewState({ name: 'Bản lưu giữ nguyên', race: 'elf', gender: 'female', hair: 'braid', hairColor: '#493b36', skinColor: '#e7bd92' }));
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: oldRaw });
  const errors: string[] = [], sheets = new Map<string, number>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (/\/player_(human|elf|dwarf|beast)_b2(?:_back)?\.png$/.test(path)) sheets.set(path, response.status());
  });
  await start(page);
  await expect(page.locator('#hud-avatar img.b2-portrait')).toBeVisible();
  expect(await page.locator('#hud-avatar img.b2-portrait').evaluate(node => {
    const image = node as HTMLImageElement; return [image.naturalWidth, image.naturalHeight];
  })).toEqual([32, 42]);
  const result = await page.evaluate(({ dodgeDuration }) => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const state = scene.session.state;
    const old = { character: state.character, classId: state.classId, equipped: { ...state.equipped },
      animationTime: scene.animationTime, facing: { x: scene.facing.x, y: scene.facing.y } };
    const failures: string[] = [], identities: number[] = [];
    let frames = 0;
    const sample = (key: string): number => {
      const source = scene.textures.get(key).getSourceImage() as HTMLCanvasElement;
      if (source.width !== 32 || source.height !== 42) failures.push(`${key}: size ${source.width}×${source.height}`);
      const pixels = source.getContext('2d')!.getImageData(0, 0, source.width, source.height).data;
      let hash = 2166136261, occupied = 0, border = false;
      for (let index = 0; index < pixels.length; index++) hash = Math.imul(hash ^ pixels[index], 16777619) >>> 0;
      for (let y = 0; y < 42; y++) for (let x = 0; x < 32; x++) {
        if (!pixels[(y * 32 + x) * 4 + 3]) continue;
        occupied++;
        if (x === 0 || x === 31 || y === 0 || y === 41) border = true;
      }
      if (occupied < 30) failures.push(`${key}: empty body`);
      if (border) failures.push(`${key}: occupied outside padding`);
      frames++; return hash;
    };
    for (const race of ['human', 'elf', 'dwarf', 'beast'] as const) for (const classId of ['civilian', 'swordsman', 'mage'] as const) {
      state.character = { ...old.character, race, hair: 'short' }; state.classId = classId;
      state.equipped = { swordsman: 'sword', mage: 'staff', armor: classId === 'civilian' ? null : 'armor' };
      for (const [direction, x, y] of [['down', 0, 1], ['left', -1, 0], ['right', 1, 0], ['up', 0, -1]] as const) {
        scene.facing.set(x, y);
        for (const action of ['idle', 'walk', 'attack', 'hurt', 'death', 'dodge']) for (let frame = 0; frame < 4; frame++) {
          scene.player.setVelocity(action === 'walk' ? 10 : 0, 0);
          scene.animationTime = action === 'walk' ? (frame + .1) / 10 : (frame + .1) / 3;
          scene.attackPose = action === 'attack' ? (1 - frame / 4) * scene.attackPoseDuration : 0;
          scene.hurtPose = action === 'hurt' ? (1 - frame / 4) * .24 : 0;
          scene.deathElapsed = action === 'death' ? frame * .075 + .001 : null;
          scene.dodgeTimer = action === 'dodge' ? (1 - frame / 4) * dodgeDuration : 0;
          const hash = sample(scene.playerTexture());
          if (direction === 'down' && action === 'idle' && frame === 0) identities.push(hash);
        }
      }
    }
    const body = scene.player.body as Phaser.Physics.Arcade.Body;
    const collider = { width: body.width, height: body.height, offsetX: body.offset.x, offsetY: body.offset.y };
    state.character = old.character; state.classId = old.classId; state.equipped = old.equipped;
    scene.animationTime = old.animationTime; scene.facing.set(old.facing.x, old.facing.y);
    scene.attackPose = 0; scene.hurtPose = 0; scene.deathElapsed = null; scene.dodgeTimer = 0; scene.player.setVelocity(0, 0);
    return { failures, identities, frames, collider, installed: scene.getArtStatus().playerFrames };
  }, { dodgeDuration: BALANCE.dodgeDuration });
  expect(result.installed).toBe(384);
  expect(result.frames).toBe(1152);
  expect(result.failures).toEqual([]);
  expect(new Set(result.identities).size).toBe(12);
  expect(result.collider).toEqual({ width: 12, height: 12, offsetX: 10, offsetY: 29 });
  expect([...sheets.values()]).toEqual([200, 200, 200, 200, 200, 200, 200, 200]);
  expect(await page.evaluate(key => localStorage.getItem(key), SAVE_KEY)).toBe(oldRaw);
  expect(errors).toEqual([]);
});

test('B2 changes real loadout and appearance while unequipping removes weapon and armor pixels', async ({ page }) => {
  await start(page);
  await expect(page.locator('#hud-avatar img.b2-portrait')).toBeVisible();
  const originalPortrait = await page.locator('#hud-avatar img.b2-portrait').getAttribute('src');
  const result = await page.evaluate(() => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const state = scene.session.state; scene.player.setVelocity(0, 0); scene.animationTime = 0;
    scene.facing.set(0, 1);
    const take = (): string => (scene.textures.get(scene.playerTexture()).getSourceImage() as HTMLCanvasElement).toDataURL();
    const rows = [];
    for (const race of ['human', 'elf', 'dwarf', 'beast'] as const) {
      state.character = { ...state.character, race, hair: 'short', hairColor: '#493b36', skinColor: '#e7bd92' };
      state.classId = 'swordsman'; state.equipped.swordsman = null; state.equipped.armor = null;
      const cloth = take();
      state.equipped.swordsman = 'sword'; const sword = take();
      state.equipped.armor = 'armor'; const armor = take();
      state.equipped.swordsman = null; state.equipped.armor = null; const removed = take();
      state.character.hairColor = '#ced8d0'; const hair = take();
      state.character.skinColor = '#8d5d45'; const skin = take();
      state.character.hair = 'long'; const long = take();
      state.character.hair = 'braid'; const braid = take();
      state.classId = 'mage'; state.equipped.mage = null; const mageUnarmed = take();
      state.equipped.mage = 'staff'; const staff = take();
      rows.push({ race, weaponChanged: cloth !== sword, armorChanged: sword !== armor, removalRestored: cloth === removed,
        hairChanged: cloth !== hair, skinChanged: hair !== skin, longChanged: skin !== long, braidChanged: long !== braid, staffChanged: mageUnarmed !== staff });
    }
    return { rows, expectedPortrait: take() };
  });
  for (const row of result.rows) {
    expect(row.weaponChanged, row.race).toBe(true); expect(row.armorChanged, row.race).toBe(true);
    expect(row.removalRestored, row.race).toBe(true); expect(row.hairChanged, row.race).toBe(true);
    expect(row.skinChanged, row.race).toBe(true); expect(row.longChanged, row.race).toBe(true);
    expect(row.braidChanged, row.race).toBe(true); expect(row.staffChanged, row.race).toBe(true);
  }
  expect(result.expectedPortrait).not.toBe(originalPortrait);
  await expect(page.locator('#hud-avatar img.b2-portrait')).toHaveAttribute('src', result.expectedPortrait);
});

test('real movement, dodge, hit and death select B2 frames and pause freezes the hit pose before safe respawn', async ({ page }) => {
  await start(page);
  await page.locator('#game').focus();
  const before = Number(await page.locator('#game').getAttribute('data-px'));
  await page.keyboard.down('d');
  await expect.poll(() => page.evaluate(() => (window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene).player.texture.key)).toMatch(/-right-walk/);
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px'))).toBeGreaterThan(before);
  await page.keyboard.up('d');
  expect(Number(await page.locator('#game').getAttribute('data-px'))).toBeGreaterThan(before);
  const dodge = page.evaluate(() => new Promise<string[]>(resolve => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const keys = new Set<string>(); const listener = (): void => { keys.add(scene.player.texture.key); };
    scene.events.on('postupdate', listener);
    setTimeout(() => { scene.events.off('postupdate', listener); resolve([...keys]); }, 400);
  }));
  await page.keyboard.press('Shift', { delay: 90 });
  expect((await dodge).some(key => /-dodge/.test(key))).toBe(true);
  await page.waitForTimeout(1100);
  const hit = await page.evaluate(() => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const hp = scene.session.state.hp; scene.hurtPlayer(3);
    return { hpBefore: hp, hpAfter: scene.session.state.hp, key: scene.player.texture.key };
  });
  expect(hit.hpAfter).toBe(hit.hpBefore - 3); expect(hit.key).toMatch(/-hurt/);
  await page.getByRole('button', { name: 'Menu trò chơi', exact: true }).click();
  const paused = await page.evaluate(() => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    return { key: scene.player.texture.key, time: scene.animationTime, hp: scene.session.state.hp, paused: scene.session.paused };
  });
  expect(paused.paused).toBe(true);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    return { key: scene.player.texture.key, time: scene.animationTime, hp: scene.session.state.hp, paused: scene.session.paused };
  })).toEqual(paused);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
  const death = await page.evaluate(() => new Promise<{ keys: string[]; before: string; after: string; hp: number }>(resolve => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const before = JSON.stringify({ inventory: scene.session.state.inventory, level: scene.session.state.level, quests: scene.session.state.quests });
    const keys = new Set<string>(); const listener = (): void => { keys.add(scene.player.texture.key); };
    scene.events.on('postupdate', listener); scene.hurtPlayer(9999); keys.add(scene.player.texture.key);
    setTimeout(() => {
      scene.events.off('postupdate', listener);
      resolve({ keys: [...keys], before, after: JSON.stringify({ inventory: scene.session.state.inventory, level: scene.session.state.level, quests: scene.session.state.quests }), hp: scene.session.state.hp });
    }, 650);
  }));
  expect(death.keys.some(key => /-death/.test(key))).toBe(true);
  expect(death.keys.some(key => /-death4/.test(key))).toBe(true);
  expect(death.after).toBe(death.before); expect(death.hp).toBeGreaterThan(0);
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
});

test('one missing B2 race keeps its legacy and procedural frames playable while the other races load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/assets/atlases/player_human_b2.png', route => route.abort());
  await start(page);
  const result = await page.evaluate(() => {
    const scene = window.__b2ArtGame.scene.getScene('world') as unknown as RuntimeScene;
    const body = scene.player.body as Phaser.Physics.Arcade.Body;
    const pixels = (scene.player.texture.getSourceImage() as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 32, 42).data;
    return { frames: scene.getArtStatus().playerFrames, legacySource: scene.textures.exists('art-source-player-bases-v1'),
      occupied: [...pixels].filter((value, index) => index % 4 === 3 && value > 0).length,
      collider: [body.width, body.height, body.offset.x, body.offset.y] };
  });
  expect(result.frames).toBe(288); expect(result.legacySource).toBe(true);
  expect(result.occupied).toBeGreaterThan(30); expect(result.collider).toEqual([12, 12, 10, 29]);
  const before = Number(await page.locator('#game').getAttribute('data-px'));
  await page.locator('#game').focus(); await page.keyboard.down('d');
  await expect.poll(async () => Number(await page.locator('#game').getAttribute('data-px'))).toBeGreaterThan(before + 10);
  await page.keyboard.up('d'); await page.keyboard.press('Shift', { delay: 90 });
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  expect(errors).toEqual([]);
});
