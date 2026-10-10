import Phaser from 'phaser';
import type { GameSession } from './model/types';
import type { SoundFeedback } from './audio/SoundFeedback';
import { DemoScene, type DemoSceneCallbacks } from './scenes/DemoScene';

export function createDemoGame(parent: HTMLElement, session: GameSession, callbacks: DemoSceneCallbacks, sound: SoundFeedback): Phaser.Game {
  let game: Phaser.Game;
  // Resize the view, never stretch the world. Keep a useful pixel scale on
  // narrow windows and the original 800×450 framing on larger desktop views.
  const resizeCamera = (): void => {
    if (!world.cameras?.main) return;
    const zoom = 1.2 * Math.max(1, Math.min(game.scale.width / 800, game.scale.height / 450));
    world.cameras.main.setZoom(zoom);
  };
  const world = new DemoScene(session, { ...callbacks, ready: () => { resizeCamera(); callbacks.ready(); } }, sound);
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth,
    height: parent.clientHeight,
    backgroundColor: '#152a21',
    pixelArt: true,
    antialias: false,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scene: [world],
    audio: { noAudio: true },
  });
  // Phaser installs ScaleManager during boot, after the constructor returns.
  game.events.once(Phaser.Core.Events.READY, () => { game.scale.on(Phaser.Scale.Events.RESIZE, resizeCamera); });
  game.events.once(Phaser.Core.Events.DESTROY, () => {
    game.scale.off(Phaser.Scale.Events.RESIZE, resizeCamera);
  });
  return game;
}
