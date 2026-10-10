import Phaser from 'phaser';
import { gameConfig, gameEvents } from '../config';

type MovementKeys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

export class FoundationScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private movementKeys!: MovementKeys;
  private lastReportedPosition = '';
  private lastReportedAt = 0;

  constructor() {
    super('foundation');
  }

  create(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');
    this.cursors = keyboard.createCursorKeys();
    this.movementKeys = keyboard.addKeys('W,A,S,D') as MovementKeys;
    this.createTextures();
    this.drawGround();

    const obstacles = this.physics.add.staticGroup();
    for (const [x, y] of [[170, 95], [470, 95]]) {
      obstacles.create(x, y, 'test-house');
    }
    for (const [x, y] of [[65, 60], [100, 180], [70, 285], [550, 55], [575, 180], [555, 300]]) {
      obstacles.create(x, y, 'test-tree');
    }
    this.player = this.physics.add.sprite(gameConfig.spawn.x, gameConfig.spawn.y, 'test-player');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.physics.world.setBounds(22, 22, gameConfig.width - 44, gameConfig.height - 44);
    this.physics.add.collider(this.player, obstacles);

    this.add.text(320, 37, 'SÂN THỬ · HÌNH ẢNH TẠM', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '9px', color: '#a9bbab',
      backgroundColor: '#172b25', padding: { x: 8, y: 5 },
    }).setOrigin(.5).setDepth(20);
    const resetKeys = (): void => { keyboard.resetKeys(); this.player.setVelocity(0); };
    this.game.events.on(Phaser.Core.Events.BLUR, resetKeys);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.BLUR, resetKeys);
    });
    this.publishPosition();
    this.game.events.emit(gameEvents.ready);
  }

  update(time: number): void {
    const x = Number(this.cursors.right.isDown || this.movementKeys.D.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.A.isDown);
    const y = Number(this.cursors.down.isDown || this.movementKeys.S.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.W.isDown);
    const movement = new Phaser.Math.Vector2(x, y).normalize().scale(gameConfig.playerSpeed);
    this.player.setVelocity(movement.x, movement.y);
    if (time - this.lastReportedAt > 100) {
      this.publishPosition();
      this.lastReportedAt = time;
    }
  }

  resetPlayer(): void {
    this.input.keyboard?.resetKeys();
    this.player.body?.reset(gameConfig.spawn.x, gameConfig.spawn.y);
    this.player.setVelocity(0);
    this.publishPosition();
  }

  clearInput(): void {
    this.input.keyboard?.resetKeys();
    this.player.setVelocity(0);
  }

  private publishPosition(): void {
    const position = `${Math.round(this.player.x)}, ${Math.round(this.player.y)}`;
    if (position !== this.lastReportedPosition) {
      this.game.events.emit(gameEvents.position, position);
      this.lastReportedPosition = position;
    }
  }

  private drawGround(): void {
    const ground = this.add.graphics();
    ground.fillStyle(0x213d32).fillRect(0, 0, gameConfig.width, gameConfig.height);
    for (let y = 0; y < gameConfig.height; y += 16) {
      for (let x = 0; x < gameConfig.width; x += 16) {
        if ((x * 7 + y * 11) % 5 < 2) ground.fillStyle(0x294738).fillRect(x + 3, y + 6, 3, 2);
      }
    }
    ground.fillStyle(0x7e7860).fillRect(284, 64, 72, 260);
    ground.fillStyle(0x7e7860).fillRect(118, 172, 403, 54);
    for (let y = 80; y < 320; y += 18) {
      ground.fillStyle(0x8e866b).fillRect(296, y, 12, 8).fillRect(327, y + 8, 14, 6);
    }
    ground.lineStyle(2, 0x71856a, .4).strokeRect(21, 21, 598, 318);
  }

  private createTextures(): void {
    if (this.textures.exists('test-player')) return;
    const graphic = this.make.graphics({ x: 0, y: 0 });
    graphic.fillStyle(0x14241e).fillRect(2, 22, 14, 3);
    graphic.fillStyle(0x3c3840).fillRect(5, 19, 3, 6).fillRect(11, 19, 3, 6);
    graphic.fillStyle(0xa98156).fillRect(3, 10, 13, 10);
    graphic.fillStyle(0xdcc39b).fillRect(5, 3, 9, 8);
    graphic.fillStyle(0x342b29).fillRect(4, 1, 11, 4).fillRect(4, 3, 3, 6);
    graphic.fillStyle(0xede0af).fillRect(10, 10, 3, 8);
    graphic.generateTexture('test-player', 19, 26);
    graphic.clear();
    graphic.fillStyle(0x162d24).fillRect(2, 16, 88, 62);
    graphic.fillStyle(0xafa082).fillRect(9, 20, 74, 50);
    graphic.fillStyle(0x695648).fillRect(8, 4, 76, 22);
    graphic.fillStyle(0x8d7255).fillRect(4, 19, 84, 7);
    graphic.fillStyle(0x493e32).fillRect(38, 48, 17, 23);
    graphic.fillStyle(0xdec689).fillRect(18, 38, 12, 12).fillRect(63, 38, 12, 12);
    graphic.generateTexture('test-house', 92, 78);
    graphic.clear();
    graphic.fillStyle(0x183025).fillRect(3, 30, 34, 13);
    graphic.fillStyle(0x76553e).fillRect(17, 25, 7, 19);
    graphic.fillStyle(0x3f6547).fillRect(10, 2, 20, 11).fillRect(4, 12, 32, 12);
    graphic.fillStyle(0x36583c).fillRect(1, 22, 38, 12);
    graphic.fillStyle(0x567553).fillRect(12, 7, 13, 4).fillRect(8, 18, 9, 3);
    graphic.generateTexture('test-tree', 40, 44);
    graphic.destroy();
  }
}
