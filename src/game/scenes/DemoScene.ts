import Phaser from 'phaser';
import type { GameSession, WorldObject, ZoneId, EnemyDefinition, ItemId } from '../model/types';
import { ITEMS } from '../model/catalog';
import { addItem, gainXp, maxHp, maxMp, respawn, updateQuests } from '../model/state';
import { ZONES } from '../world/maps';
import { generateWorldTextures, generatePlayerTexture } from '../world/textures';
import { updateActorVisual } from '../world/ActorVisuals';
import { loadWorldArt, installWorldArt, paintTerrainArt } from '../world/RasterArt';
import { loadPlayerArt, installPlayerArt } from '../world/PlayerArt';
import { playerAnimationPose } from '../world/PlayerAnimation';
import { createVillageLife, type VillageLife } from '../world/VillageLife';
import { NavigationGrid, segmentBlocked, type Point } from '../runtime/navigation';
import { getGuidanceWaypoint, getQuestGuidance, type QuestGuidance } from '../runtime/questGuidance';
import { DEFAULT_SETTINGS, type GameSettings } from '../model/settings';
import { BALANCE } from '../runtime/balance';
import type { SoundFeedback } from '../audio/SoundFeedback';

export interface DemoSceneCallbacks {
  interaction: (object: WorldObject) => void;
  nearby: (text: string, progress?: number) => void;
  ready: () => void;
  potion: (id: ItemId) => void;
  panel: (panel: 'inventory' | 'quests' | 'craft' | 'map' | 'help' | 'pause') => void;
}

interface ObjectActor {
  definition: WorldObject;
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  remaining: number;
}
interface EnemyActor {
  definition: EnemyDefinition;
  sprite: Phaser.Physics.Arcade.Sprite;
  bar: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text | null;
  hp: number;
  maxHp: number;
  phase: number;
  mode: 'idle' | 'chase' | 'telegraph' | 'dead';
  cooldown: number;
  windup: number;
  strikeVisual: number;
  targetX: number;
  targetY: number;
  respawn: number;
  warning: Phaser.GameObjects.Graphics | null;
  path: Point[];
  routeTimer: number;
}
interface ProjectileActor {
  sprite: Phaser.Physics.Arcade.Image;
  damage: number;
  friendly: boolean;
  life: number;
}
interface LootActor { sprite: Phaser.GameObjects.Sprite; itemId: ItemId; quantity: number; warned: boolean }
export type QuestGuidanceStatus = QuestGuidance & { near: boolean; reachable: boolean };
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'E' | 'SPACE' | 'SHIFT' | 'ONE' | 'TWO' | 'Q' | 'R' | 'I' | 'J' | 'C' | 'M' | 'H' | 'ESC', Phaser.Input.Keyboard.Key>;

export class DemoScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Keys;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private actors: ObjectActor[] = [];
  private enemies: EnemyActor[] = [];
  private shots: ProjectileActor[] = [];
  private loot: LootActor[] = [];
  private fog!: Phaser.GameObjects.Graphics;
  private dusk!: Phaser.GameObjects.Rectangle;
  private pickaxe!: Phaser.GameObjects.Graphics;
  private facing = new Phaser.Math.Vector2(0, 1);
  private attackTimer = 0;
  private skillTimers = [0, 0];
  private dodgeTimer = 0;
  private dodgeCooldown = 0;
  private invulnerable = 0;
  private combatTimer = 0;
  private mining = 0;
  private miningId = '';
  private miningBlocked = false;
  private hudTimer = 0;
  private fogTimer = 0;
  private lastTexture = '';
  private deathPending = false;
  private transitionPending = false;
  private lastDayPeriod = '';
  private animationTime = 0;
  private attackPose = 0;
  private attackPoseDuration = .18;
  private hurtPose = 0;
  private deathElapsed: number | null = null;
  private villageLife: VillageLife | null = null;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };
  private navigation!: NavigationGrid;
  private bossNavigation!: NavigationGrid;
  private guideNavigation!: NavigationGrid;
  private guideArrow!: Phaser.GameObjects.Graphics;
  private guideMarker!: Phaser.GameObjects.Graphics;
  private guidePath: Point[] = [];
  private guideTarget = '';
  private guideGoal: Point | null = null;
  private guideTimer = 0;
  private guideReachable = true;
  private artStatus = { worldFrames: 0, playerFrames: 0, missing: 0, warnings: 0 };

  constructor(private session: GameSession, private callbacks: DemoSceneCallbacks, private feedback: SoundFeedback) {
    super('world');
  }

  preload(): void {
    loadWorldArt(this);
    loadPlayerArt(this);
  }

  getArtStatus(): Readonly<typeof this.artStatus> { return this.artStatus; }

  create(): void {
    const state = this.session.state;
    const zone = ZONES[state.world.zone];
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Không thể khởi tạo bàn phím.');
    this.actors = []; this.enemies = []; this.shots = []; this.loot = [];
    this.mining = 0; this.miningId = ''; this.miningBlocked = false;
    this.attackTimer = 0; this.skillTimers = [0, 0];
    this.attackPose = 0; this.attackPoseDuration = .18; this.animationTime = 0;
    this.hurtPose = 0; this.deathElapsed = null;
    this.dodgeTimer = 0; this.dodgeCooldown = 0;
    this.hudTimer = 0; this.fogTimer = 0;
    this.guidePath = []; this.guideTarget = ''; this.guideGoal = null; this.guideTimer = 0; this.guideReachable = true;
    this.deathPending = false; this.transitionPending = false; this.combatTimer = 0; this.invulnerable = 1;
    this.session.inCombat = false; this.lastDayPeriod = '';
    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D,E,SPACE,SHIFT,ONE,TWO,Q,R,I,J,C,M,H,ESC') as Keys;
    const worldArt = installWorldArt(this);
    const playerArt = installPlayerArt(this);
    this.artStatus = { worldFrames: worldArt.installed.length, playerFrames: playerArt.installed,
      missing: worldArt.missing.length, warnings: worldArt.warnings.length + playerArt.warnings.length };
    generateWorldTextures(this);
    this.navigation = new NavigationGrid(zone, 9);
    this.bossNavigation = new NavigationGrid(zone, 14);
    this.guideNavigation = new NavigationGrid(zone, 7);
    this.drawTerrain();
    this.villageLife = createVillageLife(this, zone, state.world.elapsedSeconds);
    this.obstacles = this.physics.add.staticGroup();
    for (const obstacle of zone.obstacles) {
      const rectangle = this.add.rectangle(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width, obstacle.height).setVisible(false);
      this.physics.add.existing(rectangle, true);
      this.obstacles.add(rectangle);
    }
    this.physics.world.setBounds(18, 18, zone.width - 36, zone.height - 36);
    this.lastTexture = this.playerTexture();
    this.player = this.physics.add.sprite(state.world.x, state.world.y, this.lastTexture);
    this.player.setCollideWorldBounds(true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(12, 12).setOffset((this.player.width - 12) / 2, this.player.height - 13);
    this.physics.add.collider(this.player, this.obstacles);
    this.projectiles = this.physics.add.group();
    this.physics.add.collider(this.projectiles, this.obstacles, (object) => object.destroy());
    for (const object of zone.objects) this.createObject(object);
    let eventIndex = 0;
    for (const definition of zone.enemies) {
      if (definition.eventEnemy) {
        if (!state.progress.sealBroken || state.progress.sealResolved || eventIndex++ < state.progress.sealKills) continue;
      }
      this.createEnemy(definition);
    }
    this.cameras.main.setBounds(0, 0, zone.width, zone.height);
    this.cameras.main.setZoom(1.2).startFollow(this.player, true, .12, .12);
    this.cameras.main.roundPixels = true;
    this.cameras.main.fadeIn(230, 10, 20, 17);
    this.dusk = this.add.rectangle(zone.width / 2, zone.height / 2, zone.width, zone.height, 0x071124, 0).setDepth(1900);
    // Town lamps need the existing night tint to actually render. A transparent
    // fill multiplied by setAlpha(.24) stayed invisible in the old town view.
    if (zone.id === 'town') this.dusk.setFillStyle(0x071124, 1).setAlpha(0);
    this.fog = this.add.graphics().setDepth(2000);
    this.pickaxe = this.add.graphics().setDepth(1700);
    this.guideMarker = this.add.graphics().setDepth(1650);
    this.guideArrow = this.add.graphics().setDepth(2010);
    this.revealMap();
    const attack = (pointer: Phaser.Input.Pointer): void => {
      if (pointer.leftButtonDown() && !this.session.paused) {
        const point = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.facing.set(point.x - this.player.x, point.y - this.player.y).normalize();
        this.attack();
      }
    };
    this.input.on('pointerdown', attack);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerdown', attack);
      this.villageLife?.destroy(); this.villageLife = null;
    });
    this.updateNpcSchedule();
    this.updateQuestGuidance(0);
    this.callbacks.nearby('');
    this.callbacks.ready();
    this.session.changed();
  }

  update(_time: number, delta: number): void {
    if (this.session.paused || this.transitionPending) return;
    const dt = Math.min(delta / 1000, .05);
    // The existing respawn delay stays unchanged. Only the falling sprite
    // advances while combat/world updates are stopped after lethal damage.
    if (this.deathPending) {
      this.deathElapsed = (this.deathElapsed ?? 0) + dt;
      this.updateAppearance();
      return;
    }
    this.animationTime += dt;
    this.attackPose = Math.max(0, this.attackPose - dt);
    this.hurtPose = Math.max(0, this.hurtPose - dt);
    const state = this.session.state;
    state.world.elapsedSeconds += dt;
    this.villageLife?.update(dt, state.world.elapsedSeconds);
    state.potionCooldown = Math.max(0, state.potionCooldown - dt);
    state.mp = Math.min(maxMp(state), state.mp + dt * 2.4);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.skillTimers = this.skillTimers.map(value => Math.max(0, value - dt));
    this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.combatTimer = Math.max(0, this.combatTimer - dt);
    this.player.setAlpha(this.invulnerable > 0 ? .65 + Math.sin(state.world.elapsedSeconds * 30) * .25 : 1);
    const direction = new Phaser.Math.Vector2(
      Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown),
      Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown),
    ).normalize();
    if (direction.lengthSq() && this.dodgeTimer <= 0) this.facing.copy(direction);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) && this.dodgeCooldown <= 0) {
      this.dodgeTimer = BALANCE.dodgeDuration;
      this.dodgeCooldown = BALANCE.dodgeCooldown;
      this.invulnerable = Math.max(this.invulnerable, BALANCE.dodgeDuration);
      this.feedback.play('dodge');
      this.particle(this.player.x, this.player.y, 0xa6c7c2, 24);
    }
    const movement = this.dodgeTimer > 0 ? this.facing.clone().scale(BALANCE.dodgeSpeed) : direction.scale(BALANCE.playerSpeed);
    this.player.setVelocity(movement.x, movement.y).setDepth(this.player.y + 60);
    this.updateAppearance();
    const pointer = this.input.activePointer;
    if (state.classId !== 'civilian' && (this.keys.SPACE.isDown || (pointer.isDown && pointer.leftButtonDown()))) {
      if (pointer.isDown && pointer.leftButtonDown()) {
        const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.facing.set(target.x - this.player.x, target.y - this.player.y).normalize();
      }
      this.attack();
    } else if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.attack();
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) this.skill(0);
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) this.skill(1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) this.callbacks.potion('hp-potion');
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.callbacks.potion('mp-potion');
    const panels = [['I', 'inventory'], ['J', 'quests'], ['C', 'craft'], ['M', 'map'], ['H', 'help'], ['ESC', 'pause']] as const;
    for (const [key, panel] of panels) {
      if (Phaser.Input.Keyboard.JustDown(this.keys[key])) { this.clearInput(); this.callbacks.panel(panel); return; }
    }
    this.updateObjects(dt);
    if (this.transitionPending || this.session.paused) return;
    this.updateEnemies(dt);
    if (this.deathPending) return;
    this.updateProjectiles(dt);
    if (this.deathPending) return;
    this.collectLoot();
    this.session.inCombat = this.combatTimer > 0;
    state.world.x = this.player.x;
    state.world.y = this.player.y;
    this.hudTimer += dt; this.fogTimer += dt;
    if (this.fogTimer >= .25) { this.revealMap(); this.updateNpcSchedule(); this.fogTimer = 0; }
    this.updateQuestGuidance(dt);
    if (this.hudTimer >= .15) { this.session.changed(); this.hudTimer = 0; }
  }

  clearInput(): void {
    this.input.keyboard?.resetKeys();
    if (this.player?.body) this.player.setVelocity(0);
    this.mining = 0;
    this.pickaxe?.clear();
  }

  nearbyNpc(role: WorldObject['role']): boolean {
    return this.actors.some(actor => actor.definition.role === role && Phaser.Math.Distance.Between(this.player.x, this.player.y, actor.sprite.x, actor.sprite.y) <= BALANCE.interactDistance + 12);
  }

  getQuestGuidanceStatus(): QuestGuidanceStatus | null {
    const target = getQuestGuidance(this.session.state, {
      objects: this.actors.map(actor => ({ id: actor.definition.id, x: actor.sprite.x, y: actor.sprite.y, remaining: actor.remaining })),
      enemies: this.enemies.map(enemy => ({ id: enemy.definition.id, x: enemy.sprite.x, y: enemy.sprite.y, alive: enemy.hp > 0 })),
    });
    if (!target) return null;
    const distance = Math.hypot(this.player.x - target.x, this.player.y - target.y);
    // Crowded night-time NPCs still require approaching the intended speaker.
    const nearest = target.kind === 'enemy' ? undefined : this.actors.reduce<ObjectActor | undefined>((closest, actor) =>
      !closest || Math.hypot(this.player.x - actor.sprite.x, this.player.y - actor.sprite.y)
        < Math.hypot(this.player.x - closest.sprite.x, this.player.y - closest.sprite.y) ? actor : closest, undefined);
    return { ...target, near: target.travelRequired === false || distance < BALANCE.interactDistance - 4 && (!nearest || nearest.definition.id === target.id),
      action: this.session.inCombat && (target.kind === 'npc' || target.kind === 'exit')
        ? target.travelRequired === false ? 'Thoát giao tranh rồi mở Hành trang (I) để đổi Class' : 'Thoát giao tranh trước khi tương tác (E)' : target.action,
      reachable: this.guideTarget !== target.id || this.guideReachable };
  }

  private updateQuestGuidance(dt: number): void {
    this.guideArrow.clear(); this.guideMarker.clear();
    const target = this.getQuestGuidanceStatus();
    if (!target) { this.guideTarget = ''; this.guidePath = []; return; }
    if (target.travelRequired === false) { this.guideTarget = ''; this.guidePath = []; return; }
    const state = this.session.state;
    const from = { x: this.player.x, y: this.player.y + 14 };
    const goal = { x: target.x, y: target.y + 14 };
    this.guideTimer -= dt;
    if (this.guideTimer <= 0 || this.guideTarget !== target.id || !this.guideGoal
      || Math.hypot(goal.x - this.guideGoal.x, goal.y - this.guideGoal.y) > 48) {
      this.guideTarget = target.id;
      this.guideGoal = goal;
      this.guideTimer = .25;
      this.guidePath = this.guideNavigation.route(from, goal);
      this.guideReachable = this.guidePath.length > 0;
    }
    // The destination ring stays beneath fog; it does not reveal undiscovered tiles.
    if (state.world.discovered[state.world.zone].includes(`${Math.floor(target.x / 32)},${Math.floor(target.y / 32)}`)) {
      const pulse = 1 + Math.sin(this.animationTime * 4) * .08;
      this.guideMarker.lineStyle(2, 0x1a211d, .9).strokeEllipse(goal.x, goal.y, 38 * pulse, 20 * pulse);
      this.guideMarker.lineStyle(1.5, 0xf1d58c, .95).strokeEllipse(goal.x, goal.y, 34 * pulse, 16 * pulse);
    }
    if (target.near) return;
    // Aim at the furthest visible waypoint, so the arrow turns through doorways.
    const waypoint = getGuidanceWaypoint(from, this.guidePath, ZONES[state.world.zone].obstacles);
    this.guideReachable = waypoint !== undefined;
    if (!waypoint) return;
    const angle = Math.atan2(waypoint.y - from.y, waypoint.x - from.x);
    // Leave space above the taller head silhouette when pointing north.
    const radius = 32 + Math.max(0, -Math.sin(angle)) * 18 + Math.sin(this.animationTime * 4) * 2;
    this.guideArrow.setPosition(from.x + Math.cos(angle) * radius, from.y + Math.sin(angle) * radius).setRotation(angle);
    this.guideArrow.fillStyle(0x17231d, .95).fillRect(-10, -4, 13, 8).fillTriangle(12, 0, -3, -10, -3, 10);
    this.guideArrow.fillStyle(0xf1d58c, 1).fillRect(-8, -2, 10, 4).fillTriangle(9, 0, -2, -6, -2, 6);
  }

  enterZone(zoneId: ZoneId, x: number, y: number): void {
    this.clearInput();
    this.transitionPending = true;
    this.session.state.world.zone = zoneId;
    this.session.state.world.x = x; this.session.state.world.y = y;
    if (!this.session.state.world.visited.includes(zoneId)) this.session.state.world.visited.push(zoneId);
    const spawn = ZONES[zoneId].spawn;
    this.session.state.checkpoint = { zone: zoneId, ...spawn };
    this.session.inCombat = false; this.session.paused = false;
    this.scene.restart();
    this.session.notify(`${ZONES[zoneId].name} — ${ZONES[zoneId].subtitle}`);
  }

  private drawTerrain(): void {
    const zone = ZONES[this.session.state.world.zone];
    const graphic = this.add.graphics().setDepth(-100);
    paintTerrainArt(this, zone);
    graphic.fillStyle(zone.background).fillRect(0, 0, zone.width, zone.height);
    const dungeon = zone.id === 'dungeon';
    for (let y = 0; y < zone.height; y += 16) {
      for (let x = 0; x < zone.width; x += 16) {
        const mix = (x * 13 + y * 7) % 31;
        if (dungeon) {
          graphic.lineStyle(1, 0x647378, .11).strokeRect(x, y, 16, 16);
          if (mix < 4) graphic.fillStyle(0x3d4c52, .24).fillRect(x + 3, y + 3, 8, 6);
        } else if (mix < 11) {
          graphic.fillStyle(zone.id === 'town' ? 0x62845a : 0x3c6550, .36).fillRect(x + 4, y + 8, 2, 4).fillRect(x + 7, y + 10, 2, 2);
        }
      }
    }
    for (const path of zone.paths) {
      graphic.fillStyle(dungeon ? 0x435157 : zone.id === 'town' ? 0x9a906d : 0x797861).fillRect(path.x, path.y, path.width, path.height);
      for (let y = path.y + 4; y < path.y + path.height - 5; y += 22) {
        for (let x = path.x + 4; x < path.x + path.width - 5; x += 28) {
          if ((x + y) % 3 !== 0) graphic.fillStyle(dungeon ? 0x65767c : 0xb0a280, .23).fillRect(x, y, 11, 6);
        }
      }
    }
    for (const decoration of zone.decorations) {
      if (decoration.kind === 'water') {
        const water = this.add.graphics().setDepth(-85);
        water.fillStyle(0x325f69).fillEllipse(decoration.x, decoration.y, 150, 95);
        water.lineStyle(2, 0x76a2a0, .4).strokeEllipse(decoration.x, decoration.y, 120, 74);
        continue;
      }
      const texture = dungeon && decoration.kind === 'torch' ? 'torch-blue'
        : zone.id === 'forest' && decoration.kind === 'tree' && this.textures.exists('forest-tree') ? 'forest-tree' : decoration.kind;
      const image = this.add.image(decoration.x, decoration.y, texture).setDepth(decoration.y);
      if (decoration.variant) image.setFlipX(decoration.variant % 2 === 1);
      if (decoration.kind === 'torch') {
        const glow = this.add.circle(decoration.x, decoration.y - 14, 22, dungeon ? 0x8bd5e0 : 0xffca72, .12).setDepth(decoration.y + 1);
        this.tweens.add({ targets: glow, alpha: .22, duration: 900 + (decoration.x % 300), yoyo: true, repeat: -1 });
      }
    }
    if (dungeon) {
      for (const rectangle of zone.obstacles) {
        graphic.fillStyle(0x26323d).fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        graphic.lineStyle(2, 0x788281, .3).strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      }
    }
  }

  private createObject(definition: WorldObject): void {
    const portal = definition.kind === 'exit' && definition.target === 'dungeon' && this.textures.exists('dungeon-portal');
    const texture = definition.kind === 'npc' ? `npc-${definition.role}` : portal ? 'dungeon-portal' : definition.kind === 'exit' ? 'travel' : definition.kind;
    const station = definition.role === 'forge' ? 'forge-station' : definition.role === 'alchemy' ? 'alchemy-station'
      : definition.role === 'merchant' ? 'merchant-stall' : '';
    if (station && this.textures.exists(station)) {
      this.add.image(definition.x, definition.y - 38, station).setDepth(definition.y - 38);
    }
    const sprite = this.add.sprite(definition.x, definition.y, texture).setDepth(definition.y + 1);
    if (definition.kind === 'exit') sprite.setAlpha(.8).setScale(portal ? 1 : .7);
    if (definition.kind === 'travel' || definition.kind === 'seal') {
      this.tweens.add({ targets: sprite, alpha: .6, duration: 1000, yoyo: true, repeat: -1 });
    }
    const label = this.add.text(definition.x, definition.y - (definition.kind === 'npc' ? 25 : 20), definition.name, {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#fff0c9',
      stroke: '#15231e', strokeThickness: 3,
    }).setResolution(2).setOrigin(.5).setDepth(1700);
    this.actors.push({ definition: { ...definition }, sprite, label, remaining: 0 });
  }

  private createEnemy(definition: EnemyDefinition): void {
    const tuning = BALANCE.enemies[definition.kind];
    const sprite = this.physics.add.sprite(definition.x, definition.y, definition.kind).setCollideWorldBounds(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const size = definition.kind === 'boss' ? 24 : 14;
    body.setSize(size, size).setOffset((sprite.width - size) / 2, sprite.height - size - 2);
    this.physics.add.collider(sprite, this.obstacles);
    const label = definition.kind === 'boss' ? this.add.text(sprite.x, sprite.y - 45, 'Người Canh Tàn Nguyệt · Giai đoạn 1', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#fff0c9', stroke: '#111b24', strokeThickness: 3,
    }).setResolution(2).setOrigin(.5).setDepth(1700) : null;
    this.enemies.push({ definition, sprite, label, bar: this.add.graphics().setDepth(1700), hp: tuning.hp,
      maxHp: tuning.hp, phase: 1, mode: 'idle', cooldown: .8, windup: 0, strikeVisual: 0, targetX: 0, targetY: 0, respawn: 0, warning: null, path: [], routeTimer: 0 });
  }

  private updateObjects(dt: number): void {
    let nearest: ObjectActor | null = null;
    let nearestDistance: number = BALANCE.interactDistance;
    for (const actor of this.actors) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, actor.sprite.x, actor.sprite.y);
      if (actor.definition.kind === 'npc') updateActorVisual(actor.sprite, `npc-${actor.definition.role}`, this.animationTime);
      actor.remaining = Math.max(0, actor.remaining - dt);
      if (actor.definition.kind === 'ore' && this.textures.exists('ore-depleted')) {
        actor.sprite.setTexture(actor.remaining > 0 ? 'ore-depleted' : 'ore');
      } else if (actor.definition.kind === 'ore' || actor.definition.kind === 'herb') actor.sprite.setAlpha(actor.remaining > 0 ? .35 : 1);
      actor.label.setVisible(distance < 120 && (actor.definition.kind !== 'secret' || distance < 50));
      if (distance < nearestDistance) { nearest = actor; nearestDistance = distance; }
      if (actor.definition.kind === 'travel' && distance < 75 && !this.session.state.world.travelUnlocked) {
        this.session.state.world.travelUnlocked = true;
        this.session.notify('Đã mở điểm dịch chuyển Rừng Vọng Nguyệt.', 'success');
        this.feedback.play('quest');
      }
    }
    // Wider, sharper names must not paint over each other at the night-time
    // meeting point or the ore clusters. Keep the closest readable label.
    const occupiedLabels: Phaser.Geom.Rectangle[] = [];
    for (const actor of [...this.actors].sort((a, b) =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, a.sprite.x, a.sprite.y)
      - Phaser.Math.Distance.Between(this.player.x, this.player.y, b.sprite.x, b.sprite.y))) {
      if (!actor.label.visible) continue;
      const bounds = actor.label.getBounds();
      if (occupiedLabels.some(other => Phaser.Geom.Intersects.RectangleToRectangle(bounds, other))) actor.label.setVisible(false);
      else occupiedLabels.push(bounds);
    }
    if (!this.keys.E.isDown) { this.mining = 0; this.miningBlocked = false; this.miningId = ''; }
    if (nearest?.definition.kind !== 'ore' || nearest.definition.id !== this.miningId) {
      this.mining = 0; this.miningId = ''; this.miningBlocked = false;
    }
    this.pickaxe.clear();
    if (!nearest) { this.callbacks.nearby(''); return; }
    const object = nearest.definition;
    if (nearest.remaining > 0) { this.callbacks.nearby(`${object.name} tái sinh sau ${Math.ceil(nearest.remaining)}s`); return; }
    if (object.kind === 'ore') {
      if (this.keys.E.isDown && !this.miningBlocked) {
        if (this.miningId !== object.id) { this.miningId = object.id; this.mining = 0; }
        this.mining += dt;
        this.player.setVelocity(0);
        const angle = Math.sin(this.mining * 14);
        this.pickaxe.lineStyle(3, 0x977149).lineBetween(this.player.x + 7, this.player.y, this.player.x + 15 + angle * 4, this.player.y - 16);
        this.pickaxe.lineStyle(3, 0xc5d2c4).lineBetween(this.player.x + 8 + angle * 4, this.player.y - 17, this.player.x + 23 + angle * 4, this.player.y - 15);
        if (Math.floor(this.mining * 3) !== Math.floor((this.mining - dt) * 3)) this.feedback.play('mine');
        if (this.mining >= BALANCE.mineDuration) {
          const result = addItem(this.session.state, 'ore', 1);
          if (result.ok) {
            this.session.state.progress.oreMined += 1;
            nearest.remaining = BALANCE.oreRespawn;
            this.feedback.play('pickup'); this.particle(nearest.sprite.x, nearest.sprite.y, 0xc6b777, 18);
            this.session.notify('Khai thác +1 Quặng sắt', 'success');
            updateQuests(this.session.state);
          } else { this.session.notify(result.message, 'danger'); this.miningBlocked = true; }
          this.mining = 0;
          this.session.changed();
        }
      }
      this.callbacks.nearby('Giữ E · Khai thác quặng', this.mining / BALANCE.mineDuration);
      return;
    }
    this.callbacks.nearby(`E · ${object.kind === 'npc' ? 'Trò chuyện: ' : ''}${object.name}`);
    if (!Phaser.Input.Keyboard.JustDown(this.keys.E)) return;
    if (object.kind === 'npc') {
      if (this.session.inCombat) { this.session.notify('Hãy thoát giao tranh trước khi trò chuyện.'); return; }
      this.clearInput(); this.callbacks.interaction(object);
    } else if (object.kind === 'herb') {
      const result = addItem(this.session.state, 'herb', 2);
      if (result.ok) { nearest.remaining = BALANCE.herbRespawn; this.feedback.play('pickup'); }
      this.session.notify(result.ok ? 'Thu hái +2 Thảo dược' : result.message, result.ok ? 'success' : 'danger');
      this.session.changed();
    } else if (object.kind === 'exit') this.useExit(object);
    else if (object.kind === 'seal') this.breakSeal();
    else if (object.kind === 'travel') this.session.notify('Điểm dịch chuyển đã mở. Nhấn M để đi nhanh ngoài giao tranh.');
    else if (object.kind === 'secret') this.findSecret(nearest);
  }

  private useExit(object: WorldObject): void {
    if (!object.target) return;
    if (this.session.inCombat) { this.session.notify('Hãy thoát giao tranh trước khi chuyển khu.'); return; }
    if (object.target === 'forest' && this.session.state.classId === 'civilian') {
      this.session.notify('Hãy chế tạo vũ khí rồi học Class tại người huấn luyện trước khi vào rừng.'); return;
    }
    if (object.target === 'dungeon' && this.session.state.quests.seal !== 'done') {
      this.session.notify('Cửa hầm mộ đang khóa. Giải quyết phong ấn rồi về trưởng làng nộp nhiệm vụ.'); return;
    }
    const spawn = ZONES[object.target].spawn;
    this.enterZone(object.target, object.spawnX ?? spawn.x, object.spawnY ?? spawn.y);
  }

  private breakSeal(): void {
    const state = this.session.state;
    if (state.progress.sealResolved) { this.session.notify('Phong ấn đã được ổn định. Khu rừng an toàn trở lại.'); return; }
    if (state.progress.sealBroken) {
      if (state.progress.sealKills >= 3) {
        state.progress.sealResolved = true;
        this.session.notify('Bạn đã khép vết nứt. Phong ấn ổn định! Về trưởng làng nộp nhiệm vụ.', 'success');
        this.feedback.play('quest'); updateQuests(state); this.session.changed();
      } else this.session.notify(`Hạ các linh thể quanh phong ấn: ${state.progress.sealKills}/3.`);
      return;
    }
    if (state.quests.seal !== 'active') { this.session.notify('Trưởng làng có nhiệm vụ điều tra phong ấn sau khi bạn nộp nhiệm vụ đầu.'); return; }
    state.progress.sealBroken = true;
    for (const definition of ZONES.forest.enemies.filter(enemy => enemy.eventEnemy)) this.createEnemy(definition);
    this.shake(300, .006);
    this.feedback.play('magic');
    this.session.notify('Bạn đã phá phong ấn! Ba linh thể thoát ra. Hạ chúng để khôi phục khu rừng.', 'danger');
    updateQuests(state); this.session.changed();
  }

  private findSecret(actor: ObjectActor): void {
    const state = this.session.state;
    if (state.progress.secretFound) { this.session.notify('Hốc cây đã trống. Mảnh thư vẫn nhắc: “Ánh trăng không phải lời nguyền…”'); return; }
    const result = addItem(state, 'moon-shard', 1);
    if (!result.ok) { this.session.notify(result.message, 'danger'); return; }
    state.progress.secretFound = true;
    state.coins.copper += 25;
    gainXp(state, 15);
    actor.sprite.setTint(0x6a745f);
    this.feedback.play('quest');
    this.session.notify('Bí mật: mảnh thư cũ và Mảnh Nguyệt. “Ánh trăng không phải lời nguyền…” +25 Đồng.', 'success');
    this.session.changed();
  }

  private updateEnemies(dt: number): void {
    const state = this.session.state;
    for (const enemy of this.enemies) {
      if (enemy.mode === 'dead') {
        if (enemy.definition.kind === 'boss' || enemy.definition.eventEnemy) continue;
        enemy.respawn -= dt;
        if (enemy.respawn <= 0) {
          enemy.hp = enemy.maxHp; enemy.mode = 'idle'; enemy.cooldown = 1;
          enemy.sprite.enableBody(true, enemy.definition.x, enemy.definition.y, true, true);
        }
        continue;
      }
      if (!enemy.sprite.active) continue;
      if (enemy.definition.eventEnemy && state.progress.sealResolved) { this.hideEnemy(enemy); continue; }
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      const tuning = BALANCE.enemies[enemy.definition.kind];
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      enemy.strikeVisual = Math.max(0, enemy.strikeVisual - dt);
      if (enemy.definition.kind === 'boss' && enemy.phase === 1 && enemy.hp <= enemy.maxHp * .5) {
        enemy.phase = 2;
        enemy.sprite.setTint(0xcbb5ff);
        this.session.notify('Boss bước vào giai đoạn 2! Phạm vi đòn đánh lớn hơn, hãy né vùng báo hiệu.', 'danger');
        this.shake(200, .005);
        this.feedback.play('magic');
      }
      if (enemy.mode === 'telegraph') {
        enemy.sprite.setVelocity(0);
        enemy.windup -= dt;
        enemy.warning?.setAlpha(.5 + Math.sin(enemy.windup * 18) * .2);
        if (enemy.windup <= 0) {
          enemy.strikeVisual = .18;
          enemy.warning?.destroy(); enemy.warning = null;
          if (enemy.definition.kind === 'wraith') this.spawnProjectile(enemy.sprite.x, enemy.sprite.y, this.player.x - enemy.sprite.x, this.player.y - enemy.sprite.y, tuning.damage, false, 140);
          else {
            const radius = enemy.definition.kind === 'boss' ? (enemy.phase === 2 ? 78 : 57) : tuning.reach + 9;
            this.particle(enemy.targetX, enemy.targetY, enemy.phase === 2 ? 0xa994ef : 0xd09076, radius);
            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.targetX, enemy.targetY) < radius && this.canHit(enemy.sprite, this.player)) this.hurtPlayer(tuning.damage + (enemy.phase === 2 ? 7 : 0));
            if (enemy.definition.kind === 'boss' && enemy.phase === 2) {
              const aim = new Phaser.Math.Vector2(enemy.targetX - enemy.sprite.x, enemy.targetY - enemy.sprite.y).normalize();
              for (const angle of [-.45, 0, .45]) {
                const direction = aim.clone().rotate(angle);
                this.spawnProjectile(enemy.sprite.x, enemy.sprite.y, direction.x, direction.y, 10, false, 160);
              }
            }
          }
          enemy.mode = 'chase';
          enemy.cooldown = enemy.definition.kind === 'boss' ? (enemy.phase === 2 ? 1.1 : 1.7) : 1.25;
        }
      } else if (distance < tuning.detection || enemy.hp < enemy.maxHp) {
        if (distance < tuning.detection + 90) {
          enemy.mode = 'chase'; this.combatTimer = Math.max(this.combatTimer, 1.1);
          const reach = enemy.definition.kind === 'boss' ? 190 : tuning.reach;
          if (distance < reach && enemy.cooldown <= 0 && this.canHit(enemy.sprite, this.player)) {
            enemy.mode = 'telegraph';
            enemy.windup = enemy.definition.kind === 'boss' ? (enemy.phase === 2 ? .65 : .95) : .5;
            enemy.targetX = enemy.definition.kind === 'boss' ? this.player.x : enemy.sprite.x;
            enemy.targetY = enemy.definition.kind === 'boss' ? this.player.y : enemy.sprite.y;
            enemy.warning = this.add.graphics().setDepth(1600);
            const radius = enemy.definition.kind === 'boss' ? (enemy.phase === 2 ? 78 : 57) : tuning.reach + 9;
            enemy.warning.lineStyle(2, enemy.phase === 2 ? 0xd1a5ff : 0xf1a078, .9).fillStyle(0xc25455, .25)
              .fillCircle(enemy.targetX, enemy.targetY, radius).strokeCircle(enemy.targetX, enemy.targetY, radius);
          } else {
            const target = this.chaseTarget(enemy, dt);
            const vector = new Phaser.Math.Vector2(target.x - enemy.sprite.x, target.y - enemy.sprite.y).normalize().scale(tuning.speed * (enemy.phase === 2 ? 1.25 : 1));
            enemy.sprite.setVelocity(vector.x, vector.y);
          }
        } else { enemy.mode = 'idle'; enemy.sprite.setVelocity(0); }
      } else {
        enemy.mode = 'idle';
        const seed = enemy.definition.x * .013 + enemy.definition.y * .021;
        const targetX = enemy.definition.x + Math.cos(state.world.elapsedSeconds * .4 + seed) * 26;
        const targetY = enemy.definition.y + Math.sin(state.world.elapsedSeconds * .4 + seed) * 22;
        const vector = new Phaser.Math.Vector2(targetX - enemy.sprite.x, targetY - enemy.sprite.y).normalize().scale(tuning.speed * .35);
        enemy.sprite.setVelocity(vector.x, vector.y);
      }
      enemy.sprite.setDepth(enemy.sprite.y + 40);
      const enemyBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;
      updateActorVisual(enemy.sprite, enemy.definition.kind, this.animationTime, {
        moving: enemyBody.velocity.lengthSq() > 1, attacking: enemy.strikeVisual > 0, phase: enemy.phase === 2 ? 2 : 1,
      });
      if (enemy.sprite.body && (enemy.sprite.body as Phaser.Physics.Arcade.Body).velocity.x) enemy.sprite.setFlipX((enemy.sprite.body as Phaser.Physics.Arcade.Body).velocity.x < 0);
      const width = enemy.definition.kind === 'boss' ? 64 : 23;
      const y = enemy.definition.kind === 'boss' ? -38 : -18;
      enemy.bar.clear().fillStyle(0x162220, .9).fillRect(-width / 2, y, width, 4)
        .fillStyle(enemy.phase === 2 ? 0xb594db : 0xc28b70).fillRect(-width / 2, y, width * enemy.hp / enemy.maxHp, 4)
        .setPosition(enemy.sprite.x, enemy.sprite.y);
      enemy.label?.setPosition(enemy.sprite.x, enemy.sprite.y - 49).setText(`Người Canh Tàn Nguyệt · Giai đoạn ${enemy.phase}${enemy.mode === 'telegraph' ? ' · NÉ ĐÒN!' : ''}`);
    }
  }

  private attack(): void {
    const state = this.session.state;
    if (this.attackTimer > 0 || this.deathPending) return;
    this.attackTimer = BALANCE.attackCooldown;
    if (state.classId === 'civilian') { this.session.notify('Dân thường chưa có đòn chiến đấu. Học Class tại người huấn luyện.'); return; }
    const damage = this.playerDamage();
    this.attackPose = .18; this.attackPoseDuration = .18;
    if (state.classId === 'mage') {
      if (state.mp < 2) { this.session.notify('Thiếu năng lượng. Dùng thuốc MP bằng R.'); return; }
      state.mp -= 2;
      this.spawnProjectile(this.player.x, this.player.y, this.facing.x, this.facing.y, damage, true, 300);
      this.feedback.play('magic');
    } else {
      const arc = this.add.graphics().setDepth(1700);
      const angle = this.facing.angle();
      arc.lineStyle(4, 0xe4d4a0, .9).beginPath().arc(this.player.x, this.player.y, 42, angle - .9, angle + .9).strokePath();
      this.tweens.add({ targets: arc, alpha: 0, duration: 150, onComplete: () => arc.destroy() });
      for (const enemy of this.enemies) {
        if (enemy.mode === 'dead') continue;
        const vector = new Phaser.Math.Vector2(enemy.sprite.x - this.player.x, enemy.sprite.y - this.player.y);
        if (vector.length() < 62 && vector.normalize().dot(this.facing) > -.1 && this.canHit(this.player, enemy.sprite)) this.hurtEnemy(enemy, damage);
      }
      this.feedback.play('attack');
    }
    this.session.changed();
  }

  private skill(index: number): void {
    const state = this.session.state;
    if (state.classId === 'civilian') { this.session.notify('Học một Class để mở kỹ năng.'); return; }
    const tuning = index === 0 ? BALANCE.skills.primary : BALANCE.skills.secondary;
    if (this.skillTimers[index] > 0) { this.session.notify(`Kỹ năng hồi lại sau ${Math.ceil(this.skillTimers[index])}s.`); return; }
    if (state.mp < tuning.mp) { this.session.notify('Không đủ năng lượng cho kỹ năng.'); return; }
    state.mp -= tuning.mp; this.skillTimers[index] = tuning.cooldown;
    this.attackPose = .22; this.attackPoseDuration = .22;
    const damage = this.playerDamage() * (index === 0 ? 1.8 : 2.4);
    if (state.classId === 'mage' && index === 0) {
      for (const angle of [-.18, 0, .18]) {
        const vector = this.facing.clone().rotate(angle);
        this.spawnProjectile(this.player.x, this.player.y, vector.x, vector.y, damage * .65, true, 340);
      }
    } else {
      const radius = index === 0 ? 78 : 112;
      this.particle(this.player.x, this.player.y, state.classId === 'mage' ? 0xa78dce : 0xddc283, radius);
      for (const enemy of this.enemies) {
        if (enemy.mode !== 'dead' && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y) <= radius
          && this.canHit(this.player, enemy.sprite)) this.hurtEnemy(enemy, damage);
      }
    }
    this.feedback.play(state.classId === 'mage' ? 'magic' : 'attack');
    this.session.changed();
  }

  private playerDamage(): number {
    const state = this.session.state;
    const weapon = state.classId === 'civilian' ? null : state.equipped[state.classId];
    return 8 + state.level * 2 + (weapon ? ITEMS[weapon].power ?? 0 : 0);
  }

  private spawnProjectile(x: number, y: number, dx: number, dy: number, damage: number, friendly: boolean, speed: number): void {
    const vector = new Phaser.Math.Vector2(dx, dy).normalize();
    const sprite = this.physics.add.image(x + vector.x * 16, y + vector.y * 16, 'projectile');
    this.projectiles.add(sprite);
    sprite.setVelocity(vector.x * speed, vector.y * speed).setTint(friendly ? 0xe5bf91 : 0xd29be6).setDepth(1500);
    this.shots.push({ sprite, damage, friendly, life: friendly ? 1.25 : 2.4 });
  }

  private updateProjectiles(dt: number): void {
    this.shots = this.shots.filter(shot => {
      if (!shot.sprite.active) return false;
      shot.life -= dt;
      if (shot.life <= 0) { shot.sprite.destroy(); return false; }
      if (shot.friendly) {
        for (const enemy of this.enemies) {
          if (enemy.mode !== 'dead' && Phaser.Math.Distance.Between(shot.sprite.x, shot.sprite.y, enemy.sprite.x, enemy.sprite.y) < (enemy.definition.kind === 'boss' ? 27 : 18)) {
            this.hurtEnemy(enemy, shot.damage); shot.sprite.destroy(); return false;
          }
        }
      } else if (Phaser.Math.Distance.Between(shot.sprite.x, shot.sprite.y, this.player.x, this.player.y) < 17) {
        this.hurtPlayer(shot.damage); shot.sprite.destroy(); return false;
      }
      return true;
    });
  }

  private hurtEnemy(enemy: EnemyActor, damage: number): void {
    if (enemy.mode === 'dead') return;
    enemy.hp -= Math.round(damage); this.combatTimer = BALANCE.combatGrace;
    this.floating(enemy.sprite.x, enemy.sprite.y - 16, `-${Math.round(damage)}`, '#eee0b0');
    this.feedback.play('hit');
    enemy.sprite.setAlpha(.5);
    this.tweens.add({ targets: enemy.sprite, alpha: 1, duration: 130 });
    if (enemy.hp > 0) return;
    const state = this.session.state;
    const oldLevel = state.level;
    gainXp(state, BALANCE.enemies[enemy.definition.kind].xp);
    state.progress.kills += 1;
    state.coins.copper += enemy.definition.kind === 'boss' ? 35 : 3;
    const itemId: ItemId = enemy.definition.kind === 'boss' ? 'moon-shard' : enemy.definition.kind === 'wolf' ? 'fang' : 'herb';
    const drop = this.add.sprite(enemy.sprite.x, enemy.sprite.y, 'drop').setDepth(enemy.sprite.y + 10);
    this.loot.push({ sprite: drop, itemId, quantity: 1, warned: false });
    if (enemy.definition.eventEnemy) {
      state.progress.sealKills = Math.min(3, state.progress.sealKills + 1);
      if (state.progress.sealKills >= 3) {
        this.session.notify('Ba linh thể đã tan biến. Tương tác phong ấn bằng E để khép vết nứt.', 'success');
      }
    }
    if (enemy.definition.kind === 'boss') {
      state.progress.bossDefeated = true;
      this.session.notify('Bạn đã hạ Người Canh Tàn Nguyệt! Trở về thị trấn và nộp nhiệm vụ cho trưởng làng.', 'success');
      this.feedback.play('quest');
    }
    this.hideEnemy(enemy);
    enemy.respawn = BALANCE.enemyRespawn;
    if (state.level > oldLevel) { this.feedback.play('level'); this.session.notify(`Lên cấp ${state.level}! Giới hạn HP và MP tăng lên.`, 'success'); }
    updateQuests(state); this.session.changed();
  }

  private hideEnemy(enemy: EnemyActor): void {
    enemy.mode = 'dead';
    enemy.sprite.disableBody(true, true); enemy.bar.clear(); enemy.label?.setVisible(false);
    enemy.warning?.destroy(); enemy.warning = null;
  }

  private hurtPlayer(damage: number): void {
    if (this.invulnerable > 0 || this.deathPending) return;
    const state = this.session.state;
    const armor = state.equipped.armor ? ITEMS[state.equipped.armor].power ?? 0 : 0;
    const total = Math.max(1, damage - armor);
    state.hp = Math.max(0, state.hp - total);
    this.hurtPose = .24;
    this.invulnerable = BALANCE.invulnerabilityAfterHit; this.combatTimer = BALANCE.combatGrace;
    this.floating(this.player.x, this.player.y - 20, `-${total}`, '#eea295');
    this.feedback.play('hurt'); this.shake(90, .003);
    this.session.changed();
    if (state.hp > 0) { this.updateAppearance(); return; }
    this.deathPending = true;
    this.deathElapsed = 0; this.updateAppearance();
    this.player.setVelocity(0); this.cameras.main.fadeOut(300, 12, 14, 23);
    this.time.delayedCall(350, () => {
      respawn(state);
      this.session.inCombat = false;
      this.session.notify('Bạn hồi sinh tại checkpoint. Vật phẩm, cấp và tiến độ được giữ nguyên.', 'info');
      this.scene.restart();
    });
  }

  private collectLoot(): void {
    this.loot = this.loot.filter(loot => {
      if (Phaser.Math.Distance.Between(loot.sprite.x, loot.sprite.y, this.player.x, this.player.y) > 25) return true;
      const result = addItem(this.session.state, loot.itemId, loot.quantity);
      if (!result.ok) {
        if (!loot.warned) { this.session.notify('Túi đầy. Vật phẩm vẫn ở dưới đất.', 'info'); loot.warned = true; }
        return true;
      }
      this.session.notify(`Nhặt ${ITEMS[loot.itemId].name}`, 'success');
      this.feedback.play('pickup'); loot.sprite.destroy(); this.session.changed();
      return false;
    });
  }

  private revealMap(): void {
    const state = this.session.state;
    const zone = ZONES[state.world.zone];
    const discovered = new Set(state.world.discovered[state.world.zone]);
    const column = Math.floor(this.player.x / 32); const row = Math.floor(this.player.y / 32);
    for (let y = row - 4; y <= row + 4; y++) {
      for (let x = column - 4; x <= column + 4; x++) {
        if (x >= 0 && y >= 0 && x < zone.width / 32 && y < zone.height / 32 && Math.hypot(x - column, y - row) <= 4.6) discovered.add(`${x},${y}`);
      }
    }
    state.world.discovered[state.world.zone] = [...discovered];
    const fogAlpha = zone.id === 'town' ? .58 : zone.id === 'forest' ? .72 : .76;
    this.fog.clear().fillStyle(0x0b1719, fogAlpha);
    for (let y = 0; y < zone.height / 32; y++) {
      for (let x = 0; x < zone.width / 32; x++) if (!discovered.has(`${x},${y}`)) this.fog.fillRect(x * 32, y * 32, 32, 32);
    }
  }

  private updateNpcSchedule(): void {
    const time = this.session.state.world.elapsedSeconds % BALANCE.dayLength;
    const night = time >= BALANCE.dayLength * .65;
    this.dusk.setAlpha(this.session.state.world.zone === 'dungeon' ? .08 : night ? .24 : 0);
    const period = night ? 'night' : 'day';
    if (this.lastDayPeriod === period) return;
    this.lastDayPeriod = period;
    for (const actor of this.actors) {
      if (actor.definition.kind !== 'npc') continue;
      const definition = actor.definition;
      const x = night ? definition.nightX ?? definition.x : definition.x;
      const y = night ? definition.nightY ?? definition.y : definition.y;
      actor.sprite.setPosition(x, y).setDepth(y + 1);
      actor.label.setPosition(x, y - 25);
    }
  }

  private updateAppearance(): void {
    const texture = this.playerTexture();
    if (texture !== this.lastTexture) { this.player.setTexture(texture); this.lastTexture = texture; }
  }

  private playerTexture(): string {
    const state = this.session.state;
    const armed = state.classId !== 'civilian' && Boolean(state.equipped[state.classId]);
    const direction = Math.abs(this.facing.x) > Math.abs(this.facing.y) ? this.facing.x < 0 ? 'left' : 'right' : this.facing.y < 0 ? 'up' : 'down';
    const moving = this.player?.body && (this.player.body as Phaser.Physics.Arcade.Body).velocity.lengthSq() > 1;
    const pose = playerAnimationPose({ time: this.animationTime, moving: Boolean(moving),
      attackRemaining: this.attackPose, attackDuration: this.attackPoseDuration, hurtRemaining: this.hurtPose,
      dodgeRemaining: this.dodgeTimer, dodgeDuration: BALANCE.dodgeDuration, deathElapsed: this.deathElapsed });
    return generatePlayerTexture(this, state.character, state.classId, Boolean(state.equipped.armor), armed, direction, pose);
  }

  private floating(x: number, y: number, text: string, color: string): void {
    if (!this.settings.showDamageNumbers) return;
    const label = this.add.text(x, y, text, { fontFamily: 'Segoe UI, sans-serif', fontSize: '13px', fontStyle: 'bold', color, stroke: '#111f19', strokeThickness: 3 }).setResolution(2).setOrigin(.5).setDepth(1800);
    this.tweens.add({ targets: label, y: y - 24, alpha: 0, duration: 650, onComplete: () => label.destroy() });
  }

  private particle(x: number, y: number, color: number, radius: number): void {
    const circle = this.add.circle(x, y, radius * .25, color, .25).setStrokeStyle(2, color, .8).setDepth(1500);
    this.tweens.add({ targets: circle, radius, alpha: 0, duration: 380, onComplete: () => circle.destroy() });
  }

  getPosition(): { x: number; y: number; zone: ZoneId } {
    return { x: this.player.x, y: this.player.y, zone: this.session.state.world.zone };
  }

  getVitals(): { hp: number; mp: number } {
    return { hp: this.session.state.hp / maxHp(this.session.state), mp: this.session.state.mp / maxMp(this.session.state) };
  }

  getBossStatus(): { phase: number; hp: number; warning: boolean } | null {
    const boss = this.enemies.find(enemy => enemy.definition.kind === 'boss');
    return boss ? { phase: boss.phase, hp: Math.max(0, boss.hp), warning: boss.mode === 'telegraph' } : null;
  }

  setSettings(settings: GameSettings): void { this.settings = { ...settings }; }

  getCombatStatus(): { attack: number; dodge: number; skills: [number, number]; boss: { name: string; hp: number; maxHp: number; phase: number; warning: boolean } | null } {
    const boss = this.enemies.find(enemy => enemy.definition.kind === 'boss' && enemy.mode !== 'dead');
    return { attack: this.attackTimer, dodge: this.dodgeCooldown, skills: [this.skillTimers[0], this.skillTimers[1]],
      boss: boss ? { name: 'Người Canh Tàn Nguyệt', hp: boss.hp, maxHp: boss.maxHp, phase: boss.phase, warning: boss.mode === 'telegraph' } : null };
  }

  private shake(duration: number, intensity: number): void {
    if (this.settings.screenShake) this.cameras.main.shake(duration, intensity);
  }

  private canHit(from: Phaser.GameObjects.Sprite, to: Phaser.GameObjects.Sprite): boolean {
    return !segmentBlocked(from, to, ZONES[this.session.state.world.zone].obstacles);
  }

  private chaseTarget(enemy: EnemyActor, dt: number): Point {
    const offset = enemy.sprite.height / 2 - (enemy.definition.kind === 'boss' ? 12 : 7) - 2;
    const origin = { x: enemy.sprite.x, y: enemy.sprite.y + offset };
    const goal = { x: this.player.x, y: this.player.y + 14 };
    const clearance = enemy.definition.kind === 'boss' ? 14 : 9;
    if (!segmentBlocked(origin, goal, ZONES[this.session.state.world.zone].obstacles, clearance)) {
      enemy.path = []; return { x: goal.x, y: goal.y - offset };
    }
    enemy.routeTimer -= dt;
    if (enemy.routeTimer <= 0) {
      const grid = enemy.definition.kind === 'boss' ? this.bossNavigation : this.navigation;
      enemy.path = grid.route(origin, goal); enemy.routeTimer = .6;
    }
    while (enemy.path.length && Phaser.Math.Distance.Between(origin.x, origin.y, enemy.path[0].x, enemy.path[0].y) < 2) enemy.path.shift();
    const target = enemy.path[0];
    return target ? { x: target.x, y: target.y - offset } : { x: enemy.sprite.x, y: enemy.sprite.y };
  }
}
