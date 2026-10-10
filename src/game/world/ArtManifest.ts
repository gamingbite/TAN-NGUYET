/**
 * AI-assisted raster assets and the existing gameplay texture contract.
 * All source sheets are divided into explicit, equal-sized cells. Native sizes
 * below keep the scene's current sprite origins and foot colliders unchanged.
 */
export interface RasterArtFrame {
  key: string;
  column: number;
  row: number;
  width: number;
  height: number;
  state?: 'static' | 'idle' | 'walk' | 'attack' | 'blink';
  direction?: 'down' | 'right';
  stateFrame?: number;
  /** Frames in one animation share a scale so limbs cannot resize the body. */
  scaleGroup?: string;
  /** Empty pixels below ground contact, in the final native frame. */
  bottomPadding?: number;
  /** Measured source rectangle, in fractions of the complete source image. */
  sourceRect?: { x: number; y: number; width: number; height: number };
  /** Terrain cells are resized edge to edge, without transparency trimming. */
  tile?: boolean;
  /** Palette snapping defaults to true; used by prepared palette-exact PNGs. */
  paletteSnap?: boolean;
}

export interface RasterArtSheet {
  id: string;
  path: string;
  columns: number;
  rows: number;
  frames: readonly RasterArtFrame[];
  /** Runtime timing contract, independent from the visual source image. */
  animation?: { walkFps: number; walkCycle?: readonly string[]; attackHitFrame?: number; damageTiming?: 'scene-logic'; blinkIntervalSeconds?: number; blinkFrameSeconds?: number };
}

/** Art-guide palette, plus skin/hair tones for subsequent actor sheets. */
export const ART_PALETTE = [
  '#171c2b', '#2a3448', '#586579', '#e3d7b5', '#674533', '#ae7548',
  '#d6ac59', '#294c3d', '#5b8b54', '#a1bd73', '#8778c6', '#6fc4cf',
  '#8fd5a3', '#e47770', '#f2bd70', '#f4eed9', '#a0abb4', '#3d4235',
  '#4b322b', '#80533a', '#c89e7c', '#e1bb96', '#7e6454', '#483b35',
] as const;

/**
 * world_props_v1.png: four columns × four rows, ordered left to right.
 * The delivered 1254×1254 PNG has uneven row padding. Measured source rectangles
 * keep tree roots and portal bases out of neighboring cells without editing it.
 * Additional scenery keys have no collider; the handcrafted map still owns it.
 */
const prop = (key: string, column: number, row: number, top: number, bottom: number, width: number, height: number, scaleGroup?: string): RasterArtFrame => ({
  key, column, row, width, height, scaleGroup, state: 'static', stateFrame: 0,
  sourceRect: {
    x: key === 'forge-station' ? 330 / 1254 : column / 4,
    y: top / 1254,
    width: key === 'house' ? 330 / 1254 : key === 'forge-station' ? (627 - 330) / 1254 : 1 / 4,
    height: (bottom - top) / 1254,
  },
});

// Measured, non-overlapping regions of the corrected 1254×1254 v2 sheet.
const enemyRows = [0, 300, 492, 710, 952, 1254];
const enemyColumns = [
  [0, 209, 418, 627, 820, 1025, 1254],
  [0, 209, 418, 627, 820, 1025, 1254],
  [0, 209, 418, 627, 820, 1025, 1254],
  [0, 209, 418, 627, 820, 1025, 1254],
  [0, 209, 418, 627, 820, 1025, 1254],
];
const enemyFrames = (base: string, row: number, width: number, height: number): RasterArtFrame[] =>
  ['', '-walk1', '-walk2', '-walk3', '-walk4', '-attack'].map((suffix, column) => ({
    key: `${base}${suffix}`, column, row, width, height, scaleGroup: base,
    state: column === 0 ? 'idle' : column === 5 ? 'attack' : 'walk', direction: 'right', stateFrame: column > 0 && column < 5 ? column - 1 : 0,
    sourceRect: { x: enemyColumns[row][column] / 1254, y: enemyRows[row] / 1254, width: (enemyColumns[row][column + 1] - enemyColumns[row][column]) / 1254, height: (enemyRows[row + 1] - enemyRows[row]) / 1254 },
  }));
const npcRows = [0, 278, 559, 843];
const npcLastBoundary = [1113, 1121, 1116, 1113];
const npcFrames = (role: string, row: number): RasterArtFrame[] =>
  ['', '-walk1', '-walk2', '-blink'].map((suffix, column) => ({
    key: `npc-${role}${suffix}`, column, row, width: 24, height: 32, scaleGroup: `npc-${role}`,
    state: column === 0 ? 'idle' : column === 3 ? 'blink' : 'walk', direction: 'down', stateFrame: column > 0 && column < 3 ? column - 1 : 0,
    // The delivered 1122×1402 image places the merchant hat above the nominal
    // last-row boundary. Column-specific cuts retain both that hat and the
    // alchemist's walking foot without borrowing pixels from the other actor.
    sourceRect: { x: column / 4, y: (row < 4 ? npcRows[row] : npcLastBoundary[column]) / 1402,
      width: 1 / 4, height: ((row < 3 ? npcRows[row + 1] : row === 3 ? npcLastBoundary[column] : 1402) - (row < 4 ? npcRows[row] : npcLastBoundary[column])) / 1402 },
  }));
const itemRows = [0, 335, 638, 920, 1254];

export const WORLD_ART_SHEETS: readonly RasterArtSheet[] = [{
  id: 'world-props-v1',
  path: 'assets/atlases/world_props_v1.png',
  columns: 4,
  rows: 4,
  frames: [
    prop('house', 0, 0, 0, 350, 112, 96),
    prop('forge-station', 1, 0, 0, 334, 64, 48),
    prop('alchemy-station', 2, 0, 0, 350, 64, 40),
    prop('merchant-stall', 3, 0, 0, 350, 64, 48),
    prop('tree', 0, 1, 350, 680, 48, 64),
    prop('forest-tree', 1, 1, 334, 680, 48, 64),
    prop('ore', 2, 1, 350, 680, 34, 28),
    prop('ore-depleted', 3, 1, 350, 672, 34, 28),
    prop('herb', 0, 2, 680, 984, 20, 24),
    prop('travel', 1, 2, 680, 984, 36, 56),
    prop('seal', 2, 2, 680, 984, 64, 48),
    prop('dungeon-portal', 3, 2, 672, 984, 64, 64),
    prop('torch', 0, 3, 984, 1254, 18, 32),
    prop('secret', 1, 3, 984, 1254, 32, 22),
    prop('drop', 2, 3, 984, 1254, 18, 20),
    prop('rock', 3, 3, 984, 1254, 36, 28),
  ],
}, {
  id: 'enemy-animations-v2',
  path: 'assets/atlases/enemy_animations_v2.png',
  columns: 6,
  rows: 5,
  // The single attack pose is frame zero of its visual state. Damage timing is
  // owned by the scene; reading the atlas never creates a combat hit event.
  animation: { walkFps: 8, walkCycle: ['walk1', 'walk2', 'walk3', 'walk4'], attackHitFrame: 0, damageTiming: 'scene-logic' },
  frames: [
    ...enemyFrames('slime', 0, 28, 24),
    ...enemyFrames('wolf', 1, 32, 28),
    ...enemyFrames('wraith', 2, 28, 36),
    ...enemyFrames('boss', 3, 48, 56),
    ...enemyFrames('boss-phase2', 4, 48, 56),
  ],
}, {
  id: 'npc-animations-v1',
  path: 'assets/atlases/npc_animations_v1.png',
  columns: 4,
  rows: 5,
  animation: { walkFps: 8, walkCycle: ['idle', 'walk1', 'idle', 'walk2'], blinkIntervalSeconds: 29 / 8, blinkFrameSeconds: 1 / 8 },
  frames: ['elder', 'trainer', 'forge', 'alchemy', 'merchant'].flatMap(npcFrames),
}, {
  id: 'terrain-tiles-v1',
  path: 'assets/atlases/terrain_tiles_v1.png',
  columns: 4,
  rows: 4,
  frames: [
    'tile-meadow', 'tile-grass', 'tile-earth', 'tile-cobble',
    'tile-forest', 'tile-leaves', 'tile-trail', 'tile-roots',
    'tile-dungeon', 'tile-dungeon-cracked', 'tile-stone', 'tile-wall',
    'tile-moss-wall', 'tile-dark-wall', 'tile-water', 'tile-gravel',
  ].map((key, index) => ({ key, column: index % 4, row: Math.floor(index / 4), width: 32, height: 32, tile: true, state: 'static', stateFrame: 0 })),
}, {
  id: 'item-icons-v1',
  path: 'assets/atlases/item_icons_v1.png',
  columns: 4,
  rows: 4,
  frames: [
    'ore', 'herb', 'wood', 'fang',
    'moon-shard', 'sword', 'staff', 'armor',
    'hp-potion', 'mp-potion', 'copper', 'silver',
    'gold', 'pickaxe', 'chest', 'lootbag',
  ].map((id, index) => {
    const column = index % 4, row = Math.floor(index / 4);
    return { key: `item-${id}`, column, row, width: 32, height: 32, state: 'static', stateFrame: 0,
      sourceRect: { x: column / 4, y: itemRows[row] / 1254, width: 1 / 4, height: (itemRows[row + 1] - itemRows[row]) / 1254 },
    };
  }),
}];
