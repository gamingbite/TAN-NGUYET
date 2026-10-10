export type RaceId = 'human' | 'elf' | 'dwarf' | 'beast';
export type ClassId = 'civilian' | 'swordsman' | 'mage';
export type ZoneId = 'town' | 'forest' | 'dungeon';
export type QuestId = 'work' | 'seal' | 'boss';
export type QuestStatus = 'locked' | 'active' | 'ready' | 'done';
export type ItemId = 'ore' | 'herb' | 'wood' | 'fang' | 'moon-shard' | 'sword' | 'staff' | 'armor' | 'hp-potion' | 'mp-potion';
export type RecipeId = 'sword' | 'staff' | 'armor' | 'hp-potion' | 'mp-potion';

export interface CharacterAppearance {
  name: string;
  race: RaceId;
  gender: 'female' | 'male';
  hair: 'short' | 'long' | 'braid';
  hairColor: string;
  skinColor: string;
}

export interface InventorySlot { itemId: ItemId; quantity: number }
export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  icon: string;
  kind: 'material' | 'weapon' | 'armor' | 'potion';
  stack: number;
  buy: number;
  sell: number;
  classId?: ClassId;
  power?: number;
}
export interface RecipeDefinition {
  id: RecipeId;
  name: string;
  station: 'forge' | 'alchemy';
  ingredients: Partial<Record<ItemId, number>>;
  output: ItemId;
}
export interface QuestDefinition {
  id: QuestId;
  name: string;
  description: string;
  rewardCopper: number;
  rewardXp: number;
}

export interface GameState {
  version: 1;
  character: CharacterAppearance;
  classId: ClassId;
  unlockedClasses: ClassId[];
  level: number;
  xp: number;
  hp: number;
  mp: number;
  inventory: InventorySlot[];
  equipped: { swordsman: ItemId | null; mage: ItemId | null; armor: ItemId | null };
  learnedRecipes: RecipeId[];
  coins: { copper: number; silver: number; gold: number };
  quests: Record<QuestId, QuestStatus>;
  progress: {
    oreMined: number;
    craftedEquipment: boolean;
    brewedPotion: boolean;
    learnedClass: boolean;
    sealBroken: boolean;
    sealKills: number;
    sealResolved: boolean;
    bossDefeated: boolean;
    demoCompleted: boolean;
    secretFound: boolean;
    kills: number;
  };
  world: {
    zone: ZoneId;
    x: number;
    y: number;
    elapsedSeconds: number;
    discovered: Record<ZoneId, string[]>;
    visited: ZoneId[];
    travelUnlocked: boolean;
  };
  checkpoint: { zone: ZoneId; x: number; y: number };
  potionCooldown: number;
}

export interface ActionResult { ok: boolean; message: string }
export interface GameSession {
  state: GameState;
  inCombat: boolean;
  paused: boolean;
  notify: (message: string, tone?: 'info' | 'success' | 'danger') => void;
  changed: () => void;
}

export interface RectDefinition { x: number; y: number; width: number; height: number }
export interface WorldObject {
  id: string;
  kind: 'npc' | 'ore' | 'herb' | 'seal' | 'travel' | 'secret' | 'exit';
  name: string;
  x: number;
  y: number;
  role?: 'elder' | 'trainer' | 'forge' | 'alchemy' | 'merchant';
  nightX?: number;
  nightY?: number;
  target?: ZoneId;
  spawnX?: number;
  spawnY?: number;
}
export interface EnemyDefinition {
  id: string;
  kind: 'slime' | 'wolf' | 'wraith' | 'boss';
  x: number;
  y: number;
  eventEnemy?: boolean;
}
export interface DecorationDefinition {
  kind: 'tree' | 'house' | 'rock' | 'bush' | 'water' | 'pillar' | 'torch' | 'flower' | 'fence';
  x: number;
  y: number;
  variant?: number;
}
export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  background: number;
  paths: RectDefinition[];
  obstacles: RectDefinition[];
  decorations: DecorationDefinition[];
  objects: WorldObject[];
  enemies: EnemyDefinition[];
}
