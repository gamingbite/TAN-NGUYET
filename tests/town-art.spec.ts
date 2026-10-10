import { expect, test, type Page } from '@playwright/test';
import type Phaser from 'phaser';
import { createNewState } from '../src/game/model/state';
import { loadGame, SAVE_KEY } from '../src/game/model/storage';
import type { GameState, WorldObject, ZoneId } from '../src/game/model/types';

interface TownRuntime {
  session: { state: GameState; paused: boolean };
  player: Phaser.Physics.Arcade.Sprite;
  children: Phaser.GameObjects.DisplayList;
  cameras: { main: Phaser.Cameras.Scene2D.Camera };
  textures: Phaser.Textures.TextureManager;
  physics: { world: Phaser.Physics.Arcade.World };
  tweens: Phaser.Tweens.TweenManager;
  events: Phaser.Events.EventEmitter;
  sys: Phaser.Scenes.Systems;
  actors: { definition: WorldObject; sprite: Phaser.GameObjects.Sprite }[];
  enterZone(zone: ZoneId, x: number, y: number): void;
}
interface TownProbe {
  oldPlayer: Phaser.Physics.Arcade.Sprite;
  oldVisuals: Phaser.GameObjects.GameObject[];
  groundTexture: Phaser.Textures.Texture;
}
interface GroundPixel {
  world: { x: number; y: number };
  screen: { x: number; y: number };
  rgb: number[];
  sum: number;
}
declare global { interface Window {
  __townArtGame: Phaser.Game;
  __townArtProbe: TownProbe;
} }

async function openTown(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1366, height: 768 });
  const state = createNewState({ name: 'Town art QA', race: 'human', gender: 'female',
    hair: 'braid', hairColor: '#493b36', skinColor: '#e7bd92' });
  state.world.elapsedSeconds = 30;
  // Discovered fixture gives the same clear ground in both lighting probes.
  // This isolated rendering check does not claim a fresh exploration journey.
  state.world.discovered.town = Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 30 }, (_, x) => `${x},${y}`)).flat();
  const raw = JSON.stringify(state);
  expect(loadGame({ getItem: () => raw } as unknown as Storage).error).toBeNull();
  await page.addInitScript(({ raw, key }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
    // Capture Phaser construction in the disposable test browser, without a
    // debug API, production hook, or any changes to the owner's save/profile.
    let exported: { Game: typeof Phaser.Game };
    Object.defineProperty(window, 'Phaser', { configurable: true, get: () => exported,
      set(value: { Game: typeof Phaser.Game }) {
        exported = value;
        value.Game = new Proxy(value.Game, { construct(target, args) {
          const game = Reflect.construct(target, args) as Phaser.Game;
          window.__townArtGame = game; return game;
        } });
      } });
  }, { raw, key: SAVE_KEY });
  await page.goto('/');
  await page.locator('#continue-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await page.waitForFunction(() => !window.__townArtGame.scene.getScene('world').cameras.main.fadeEffect.isRunning);
}

async function pause(page: Page): Promise<void> {
  await page.locator('#game-menu-button').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'true');
}
async function resume(page: Page): Promise<void> {
  await page.locator('#panel-close').click();
  await expect(page.locator('#game')).toHaveAttribute('data-paused', 'false');
}

async function groundPixel(page: Page): Promise<GroundPixel> {
  return page.evaluate(() => new Promise<GroundPixel>((resolve, reject) => {
    const game = window.__townArtGame;
    const camera = game.scene.getScene('world').cameras.main as Phaser.Cameras.Scene2D.Camera & {
      matrix: Phaser.GameObjects.Components.TransformMatrix;
    };
    // Clear ground below the stationary player, away from lamps and props.
    // The framebuffer probe also excludes the HTML menu used to pause.
    const world = { x: 480, y: 440 };
    const screen = camera.matrix.transformPoint(world.x - camera.scrollX, world.y - camera.scrollY);
    const x = Math.floor(screen.x), y = Math.floor(screen.y);
    const roundtrip = camera.getWorldPoint(x + .5, y + .5);
    if (x < 0 || y < 0 || x >= game.canvas.width || y >= game.canvas.height
      || Math.hypot(roundtrip.x - world.x, roundtrip.y - world.y) > 1) {
      reject(new Error('Town pixel probe is outside the visible ground')); return;
    }
    const timeout = setTimeout(() => reject(new Error('Town snapshotPixel timed out')), 3000);
    game.renderer.snapshotPixel(x, y, color => {
      clearTimeout(timeout);
      if (!('r' in color && 'g' in color && 'b' in color)
        || typeof color.r !== 'number' || typeof color.g !== 'number' || typeof color.b !== 'number') {
        reject(new Error('Expected a renderer RGB pixel')); return;
      }
      resolve({ world, screen: { x, y }, rgb: [color.r, color.g, color.b], sum: color.r + color.g + color.b });
    });
  }));
}

async function sceneSnapshot(page: Page) {
  return page.evaluate(() => {
    const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
    const town = scene.children.list.filter(child => child.getData('town-visual'));
    return {
      zone: scene.session.state.world.zone, elapsed: scene.session.state.world.elapsedSeconds,
      paused: scene.session.paused && scene.sys.isPaused(),
      counts: { children: scene.children.list.length, town: town.length,
        tweens: scene.tweens.getTweens().length, bodies: scene.physics.world.bodies.size,
        staticBodies: scene.physics.world.staticBodies.size, shutdownListeners: scene.events.listenerCount('shutdown') },
      interactiveOrPhysical: town.filter(child => child.body || child.input?.enabled).map(child => child.getData('town-visual') as string),
      graphics: town.filter(child => child.type === 'Graphics').map(child => ({
        tag: child.getData('town-visual') as string,
        commands: [...(child as Phaser.GameObjects.Graphics).commandBuffer] as number[],
      })),
    };
  });
}

test('town night darkens actual ground pixels rather than only changing an invisible overlay alpha', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openTown(page);
  await pause(page);
  const day = await groundPixel(page);
  await resume(page);
  // QA-only clock change lets the actual update apply its normal night
  // schedule/tint. It does not test progression or skip a gameplay journey.
  await page.evaluate(() => {
    const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
    scene.session.state.world.elapsedSeconds = 225;
  });
  await page.waitForFunction(() => {
    const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
    return scene.actors.find(actor => actor.definition.id === 'elder')?.sprite.y === 582;
  });
  await pause(page);
  const night = await groundPixel(page);
  await test.info().attach('town-rendered-day-night.json', {
    body: Buffer.from(JSON.stringify({ day, night }, null, 2)), contentType: 'application/json',
  });
  // A relative difference avoids locking the test to a particular art color.
  // This fails the original fillAlpha=0 bug even when object alpha reads .24.
  expect(night.sum).toBeLessThan(day.sum * .9);
  expect(errors).toEqual([]);
});

test('town dressing freezes on pause and releases its objects across three zone round trips while reusing baked ground', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await openTown(page);
  await page.evaluate(() => {
    const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
    const paving = scene.children.list.find(child => child.getData('town-visual') === 'paving') as Phaser.GameObjects.Image | undefined;
    if (!paving) throw new Error('Town paving did not load');
    window.__townArtProbe = { oldPlayer: scene.player, oldVisuals: [], groundTexture: paving.texture };
  });
  const initial = await sceneSnapshot(page);
  expect(initial.counts.town).toBeGreaterThan(0);
  expect(initial.interactiveOrPhysical).toEqual([]);
  await pause(page);
  const paused = await sceneSnapshot(page);
  expect(paused.paused).toBe(true);
  await page.waitForTimeout(600);
  const frozen = await sceneSnapshot(page);
  expect(frozen.elapsed).toBe(paused.elapsed);
  expect(frozen.graphics).toEqual(paused.graphics);
  expect(frozen.counts).toEqual(paused.counts);
  await resume(page);
  await expect.poll(async () => (await sceneSnapshot(page)).elapsed).toBeGreaterThan(frozen.elapsed);

  const cycles: { zone: ZoneId; counts: typeof initial.counts; destroyed: number }[] = [];
  let forestCounts: typeof initial.counts | undefined;
  for (let cycle = 0; cycle < 3; cycle++) for (const zone of ['forest', 'town'] as const) {
    // Direct restart is confined to this renderer lifecycle test. Real E-gate
    // transition permissions and end-to-end progression are tested elsewhere.
    await page.evaluate(zone => {
      const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
      window.__townArtProbe.oldPlayer = scene.player;
      window.__townArtProbe.oldVisuals = scene.children.list.filter(child => child.getData('town-visual'));
      scene.enterZone(zone, zone === 'town' ? 480 : 80, zone === 'town' ? 400 : 320);
    }, zone);
    await page.waitForFunction(zone => {
      const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
      return scene.session.state.world.zone === zone && scene.player !== window.__townArtProbe.oldPlayer
        && scene.sys.isActive() && !scene.cameras.main.fadeEffect.isRunning;
    }, zone);
    const cleanup = await page.evaluate(() => {
      const scene = window.__townArtGame.scene.getScene('world') as unknown as TownRuntime;
      const probe = window.__townArtProbe;
      const paving = scene.children.list.find(child => child.getData('town-visual') === 'paving') as Phaser.GameObjects.Image | undefined;
      return { destroyed: probe.oldVisuals.length,
        allDestroyed: probe.oldVisuals.every(child => !child.active && !child.scene),
        cachedGround: scene.textures.get(probe.groundTexture.key) === probe.groundTexture,
        pavingReused: !paving || paving.texture === probe.groundTexture };
    });
    expect(cleanup.allDestroyed).toBe(true);
    expect(cleanup.cachedGround && cleanup.pavingReused).toBe(true);
    const current = await sceneSnapshot(page);
    expect(current.zone).toBe(zone);
    expect(current.interactiveOrPhysical).toEqual([]);
    if (zone === 'forest') {
      expect(current.counts.town).toBe(0);
      expect(cleanup.destroyed).toBe(initial.counts.town);
      if (!forestCounts) forestCounts = current.counts;
      else expect(current.counts).toEqual(forestCounts);
    } else expect(current.counts).toEqual(initial.counts);
    cycles.push({ zone, counts: current.counts, destroyed: cleanup.destroyed });
  }
  await test.info().attach('town-lifecycle-counts.json', {
    body: Buffer.from(JSON.stringify({ initial: initial.counts, cycles }, null, 2)), contentType: 'application/json',
  });
  expect(errors).toEqual([]);
});
