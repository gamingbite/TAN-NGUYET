import type { DecorationDefinition, RectDefinition, ZoneDefinition, ZoneId } from '../model/types';

// Handcrafted demo layouts. Rectangles use their top-left corner; sprites and
// interaction points use their centre. These coordinates are content prototypes.
const tree = (x: number, y: number, variant = 0): DecorationDefinition => ({ kind: 'tree', x, y, variant });
const trees = (points: number[][]): DecorationDefinition[] => points.map(([x, y], index) => tree(x, y, index % 3));
const trunks = (decorations: DecorationDefinition[]): RectDefinition[] => decorations
  .filter((decoration) => decoration.kind === 'tree')
  .map(({ x, y }) => ({ x: x - 7, y: y + 16, width: 14, height: 16 }));

// Additional homes fill grass parcels around the existing streets. Their lower
// footprints follow the original house rule; roofs never become full blockers.
// Existing homes, road rectangles, NPC schedules and gathering points stay put.
export const VILLAGE_ADDED_HOUSES: DecorationDefinition[] = [
  { kind: 'house', x: 70, y: 104, variant: 4 },
  { kind: 'house', x: 310, y: 120, variant: 5 },
  { kind: 'house', x: 610, y: 102, variant: 6 },
  { kind: 'house', x: 875, y: 126, variant: 7 },
  { kind: 'house', x: 388, y: 180, variant: 4 },
  { kind: 'house', x: 875, y: 240, variant: 5 },
  { kind: 'house', x: 330, y: 394, variant: 6 },
  { kind: 'house', x: 100, y: 555, variant: 7 },
  { kind: 'house', x: 284, y: 552, variant: 4 },
  { kind: 'house', x: 650, y: 547, variant: 5 },
];

export const VILLAGE_ADDED_FOOTPRINTS: RectDefinition[] = VILLAGE_ADDED_HOUSES
  .map(({ x, y }) => ({ x: x - 46, y: y - 6, width: 92, height: 34 }));

const townTrees = trees([
  [52, 50], [112, 58], [262, 58], [346, 62], [608, 50], [680, 48], [892, 64],
  [52, 130], [92, 216], [328, 172], [606, 162], [902, 184], [52, 408],
  [72, 502], [326, 442], [348, 558], [70, 592], [150, 590], [620, 580],
  [928, 414], [906, 584], [748, 596], [834, 598],
]);

const forestTrees = trees([
  [36, 42], [96, 46], [152, 44], [216, 40], [282, 46], [342, 40], [406, 44], [464, 38],
  [596, 42], [662, 40], [730, 40], [802, 38], [928, 42],
  [52, 126], [116, 138], [186, 110], [258, 120], [314, 112], [382, 104], [454, 124],
  [54, 216], [150, 208], [258, 220], [328, 204], [846, 216], [920, 206],
  [50, 416], [130, 422], [202, 486], [262, 554], [334, 582], [424, 558],
  [514, 550], [596, 582], [684, 590], [858, 544], [922, 588],
  [68, 584], [150, 584], [52, 514], [940, 350], [862, 416], [720, 440],
  [602, 252], [690, 310], [770, 296], [610, 344],
]);

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  town: {
    id: 'town', name: 'Thị trấn Tro Tàn', subtitle: 'Một mái nhà dưới vầng trăng tàn',
    width: 960, height: 640, spawn: { x: 480, y: 400 }, background: 0x293c31,
    paths: [
      { x: 28, y: 286, width: 910, height: 70 },
      { x: 434, y: 180, width: 92, height: 426 },
      { x: 106, y: 218, width: 718, height: 58 },
      { x: 158, y: 244, width: 76, height: 298 },
      { x: 706, y: 228, width: 76, height: 110 },
      { x: 230, y: 456, width: 276, height: 56 },
      { x: 500, y: 394, width: 358, height: 58 },
      { x: 714, y: 432, width: 182, height: 100 },
      { x: 386, y: 278, width: 204, height: 174 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 960, height: 16 }, { x: 0, y: 624, width: 960, height: 16 },
      { x: 0, y: 16, width: 16, height: 608 },
      { x: 944, y: 16, width: 16, height: 256 }, { x: 944, y: 368, width: 16, height: 256 },
      // Only the lower house footprint collides; roofs are visual overhead.
      { x: 134, y: 152, width: 92, height: 34 },
      { x: 434, y: 122, width: 92, height: 34 },
      { x: 714, y: 162, width: 92, height: 34 },
      { x: 134, y: 424, width: 92, height: 34 },
      { x: 464, y: 522, width: 92, height: 34 },
      ...VILLAGE_ADDED_FOOTPRINTS,
      ...trunks(townTrees),
    ],
    decorations: [
      ...townTrees,
      { kind: 'house', x: 180, y: 158, variant: 0 },
      { kind: 'house', x: 480, y: 128, variant: 1 },
      { kind: 'house', x: 760, y: 168, variant: 2 },
      { kind: 'house', x: 180, y: 430, variant: 3 },
      { kind: 'house', x: 510, y: 528, variant: 0 },
      ...VILLAGE_ADDED_HOUSES,
      { kind: 'fence', x: 118, y: 390 }, { kind: 'fence', x: 270, y: 390 },
      { kind: 'fence', x: 665, y: 466 }, { kind: 'fence', x: 907, y: 538 },
      { kind: 'torch', x: 445, y: 203 }, { kind: 'torch', x: 514, y: 203 },
      { kind: 'torch', x: 158, y: 480 }, { kind: 'torch', x: 866, y: 294 },
      { kind: 'rock', x: 723, y: 486 }, { kind: 'rock', x: 874, y: 414 },
      { kind: 'rock', x: 910, y: 480 }, { kind: 'rock', x: 827, y: 555 },
      { kind: 'bush', x: 354, y: 358 }, { kind: 'bush', x: 634, y: 246 },
      { kind: 'bush', x: 281, y: 431 }, { kind: 'bush', x: 555, y: 478 },
      { kind: 'flower', x: 378, y: 228 }, { kind: 'flower', x: 352, y: 254 },
      { kind: 'flower', x: 408, y: 474 }, { kind: 'flower', x: 672, y: 228 },
      { kind: 'flower', x: 692, y: 250 }, { kind: 'flower', x: 590, y: 396 },
    ],
    objects: [
      { id: 'elder', kind: 'npc', role: 'elder', name: 'Trưởng làng An', x: 480, y: 213, nightX: 480, nightY: 582 },
      { id: 'trainer', kind: 'npc', role: 'trainer', name: 'Sư phụ Dạ', x: 276, y: 324, nightX: 452, nightY: 578 },
      { id: 'forge', kind: 'npc', role: 'forge', name: 'Thợ rèn Lâm', x: 186, y: 502, nightX: 508, nightY: 583 },
      { id: 'alchemy', kind: 'npc', role: 'alchemy', name: 'Giả kim Liên', x: 756, y: 247, nightX: 536, nightY: 584 },
      { id: 'merchant', kind: 'npc', role: 'merchant', name: 'Thương nhân Vũ', x: 620, y: 326, nightX: 565, nightY: 581 },
      { id: 'town-ore-1', kind: 'ore', name: 'Mạch quặng sắt', x: 755, y: 486 },
      { id: 'town-ore-2', kind: 'ore', name: 'Mạch quặng sắt', x: 820, y: 500 },
      { id: 'town-ore-3', kind: 'ore', name: 'Mạch quặng sắt', x: 874, y: 456 },
      { id: 'town-herb-1', kind: 'herb', name: 'Nguyệt thảo', x: 672, y: 212 },
      { id: 'town-herb-2', kind: 'herb', name: 'Nguyệt thảo', x: 580, y: 468 },
      { id: 'town-forest', kind: 'exit', name: 'Đường tới Rừng Vọng Nguyệt', x: 916, y: 320, target: 'forest', spawnX: 80, spawnY: 320 },
    ],
    enemies: [],
  },
  forest: {
    id: 'forest', name: 'Rừng Vọng Nguyệt', subtitle: 'Tiếng thì thầm bên kia phong ấn',
    width: 960, height: 640, spawn: { x: 80, y: 320 }, background: 0x172d2b,
    paths: [
      { x: 16, y: 288, width: 556, height: 64 },
      { x: 496, y: 112, width: 68, height: 250 },
      { x: 496, y: 92, width: 436, height: 64 },
      { x: 372, y: 220, width: 160, height: 140 },
      { x: 264, y: 340, width: 64, height: 168 },
      { x: 306, y: 464, width: 318, height: 56 },
      { x: 578, y: 338, width: 68, height: 174 },
      { x: 636, y: 362, width: 164, height: 56 },
      { x: 736, y: 402, width: 58, height: 158 },
      { x: 710, y: 510, width: 122, height: 64 },
    ],
    obstacles: [
      { x: 0, y: 0, width: 960, height: 16 }, { x: 0, y: 624, width: 960, height: 16 },
      { x: 0, y: 16, width: 16, height: 256 }, { x: 0, y: 368, width: 16, height: 256 },
      { x: 944, y: 16, width: 16, height: 608 },
      ...trunks(forestTrees),
      { x: 364, y: 406, width: 32, height: 22 },
      { x: 830, y: 284, width: 36, height: 22 },
    ],
    decorations: [
      ...forestTrees,
      { kind: 'rock', x: 380, y: 408 }, { kind: 'rock', x: 848, y: 286 },
      { kind: 'rock', x: 424, y: 188 }, { kind: 'rock', x: 448, y: 365 },
      { kind: 'rock', x: 885, y: 87 }, { kind: 'rock', x: 880, y: 171 },
      { kind: 'pillar', x: 856, y: 92 }, { kind: 'pillar', x: 911, y: 92 },
      { kind: 'torch', x: 862, y: 135 }, { kind: 'torch', x: 909, y: 135 },
      { kind: 'bush', x: 228, y: 382 }, { kind: 'bush', x: 432, y: 477 },
      { kind: 'bush', x: 682, y: 479 }, { kind: 'bush', x: 790, y: 594 },
      { kind: 'flower', x: 174, y: 360 }, { kind: 'flower', x: 337, y: 390 },
      { kind: 'flower', x: 469, y: 190 }, { kind: 'flower', x: 666, y: 515 },
      { kind: 'flower', x: 726, y: 572 },
    ],
    objects: [
      { id: 'forest-town', kind: 'exit', name: 'Trở về Thị trấn Tro Tàn', x: 40, y: 320, target: 'town', spawnX: 850, spawnY: 320 },
      { id: 'forest-travel', kind: 'travel', name: 'Bia dịch chuyển', x: 180, y: 320 },
      { id: 'forest-seal', kind: 'seal', name: 'Phong ấn Tàn Nguyệt', x: 450, y: 280 },
      { id: 'forest-secret', kind: 'secret', name: 'Phiến đá cũ', x: 760, y: 540 },
      { id: 'forest-herb-1', kind: 'herb', name: 'Nguyệt thảo', x: 312, y: 432 },
      { id: 'forest-herb-2', kind: 'herb', name: 'Nguyệt thảo', x: 655, y: 470 },
      { id: 'forest-dungeon', kind: 'exit', name: 'Cửa Hầm mộ Tàn Nguyệt', x: 884, y: 120, target: 'dungeon', spawnX: 80, spawnY: 500 },
    ],
    enemies: [
      { id: 'forest-slime-1', kind: 'slime', x: 275, y: 408 },
      { id: 'forest-slime-2', kind: 'slime', x: 360, y: 486 },
      { id: 'forest-slime-3', kind: 'slime', x: 600, y: 430 },
      { id: 'forest-wolf-1', kind: 'wolf', x: 678, y: 250 },
      { id: 'forest-wolf-2', kind: 'wolf', x: 786, y: 382 },
      { id: 'forest-wraith-1', kind: 'wraith', x: 640, y: 150 },
      { id: 'seal-wraith-1', kind: 'wraith', x: 410, y: 240, eventEnemy: true },
      { id: 'seal-wraith-2', kind: 'wraith', x: 490, y: 230, eventEnemy: true },
      { id: 'seal-slime-3', kind: 'slime', x: 492, y: 330, eventEnemy: true },
    ],
  },
  dungeon: {
    id: 'dungeon', name: 'Hầm mộ Tàn Nguyệt', subtitle: 'Ba căn phòng. Một lời nguyền chưa ngủ.',
    width: 960, height: 640, spawn: { x: 80, y: 500 }, background: 0x11191f,
    paths: [
      { x: 40, y: 360, width: 260, height: 232 },
      { x: 300, y: 424, width: 68, height: 64 },
      { x: 352, y: 260, width: 240, height: 260 },
      { x: 520, y: 184, width: 64, height: 92 },
      { x: 520, y: 184, width: 136, height: 64 },
      { x: 640, y: 48, width: 280, height: 272 },
    ],
    obstacles: [
      // Vestibule: the east doorway opens onto a 64 px corridor.
      { x: 24, y: 344, width: 292, height: 16 }, { x: 24, y: 344, width: 16, height: 264 },
      { x: 24, y: 592, width: 292, height: 16 },
      { x: 300, y: 360, width: 16, height: 64 }, { x: 300, y: 488, width: 16, height: 104 },
      { x: 300, y: 408, width: 68, height: 16 }, { x: 300, y: 488, width: 68, height: 16 },
      // Reliquary: west and north doorways remain physically open.
      { x: 336, y: 244, width: 16, height: 180 }, { x: 336, y: 488, width: 16, height: 48 },
      { x: 336, y: 244, width: 184, height: 16 }, { x: 584, y: 244, width: 24, height: 16 },
      { x: 336, y: 520, width: 272, height: 16 }, { x: 592, y: 260, width: 16, height: 260 },
      // L-shaped upper corridor, 64 px wide throughout.
      { x: 504, y: 168, width: 16, height: 76 }, { x: 504, y: 168, width: 152, height: 16 },
      { x: 584, y: 248, width: 56, height: 16 },
      // Boss arena: west entrance at y 184–248; centre left clear to dodge.
      { x: 624, y: 32, width: 312, height: 16 }, { x: 920, y: 48, width: 16, height: 272 },
      { x: 624, y: 320, width: 312, height: 16 },
      { x: 624, y: 48, width: 16, height: 136 }, { x: 624, y: 248, width: 16, height: 72 },
      { x: 396, y: 320, width: 20, height: 24 }, { x: 530, y: 432, width: 20, height: 24 },
      { x: 664, y: 79, width: 20, height: 24 }, { x: 876, y: 254, width: 20, height: 24 },
    ],
    decorations: [
      { kind: 'pillar', x: 406, y: 319 }, { kind: 'pillar', x: 540, y: 431 },
      { kind: 'pillar', x: 674, y: 78 }, { kind: 'pillar', x: 886, y: 253 },
      { kind: 'torch', x: 65, y: 386 }, { kind: 'torch', x: 273, y: 388 },
      { kind: 'torch', x: 80, y: 574 }, { kind: 'torch', x: 377, y: 289 },
      { kind: 'torch', x: 569, y: 494 }, { kind: 'torch', x: 550, y: 209 },
      { kind: 'torch', x: 660, y: 295 }, { kind: 'torch', x: 894, y: 81 },
      { kind: 'torch', x: 728, y: 63 }, { kind: 'torch', x: 841, y: 63 },
      { kind: 'rock', x: 90, y: 390 }, { kind: 'rock', x: 266, y: 567 },
      { kind: 'rock', x: 373, y: 492 }, { kind: 'rock', x: 694, y: 287 },
    ],
    objects: [
      { id: 'dungeon-forest', kind: 'exit', name: 'Trở về Rừng Vọng Nguyệt', x: 80, y: 552, target: 'forest', spawnX: 840, spawnY: 120 },
    ],
    enemies: [
      { id: 'dungeon-slime-1', kind: 'slime', x: 180, y: 440 },
      { id: 'dungeon-wolf-1', kind: 'wolf', x: 240, y: 546 },
      { id: 'dungeon-wraith-1', kind: 'wraith', x: 438, y: 342 },
      { id: 'dungeon-wolf-2', kind: 'wolf', x: 510, y: 470 },
      { id: 'moon-warden', kind: 'boss', x: 780, y: 180 },
    ],
  },
};
