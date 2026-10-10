import type { RaceId } from '../model/types';
import type { ActorDirection, PlayerPose } from './textures';
import { PLAYER_ANIMATION_POSES, PLAYER_ANIMATION_STATES } from './PlayerAnimation';
import { B2_BODY_BOUNDS, B2_BACK_BOUNDS } from './B2SourceBounds';

export const B2_RACES = ['human', 'elf', 'dwarf', 'beast'] as const;
export const B2_DIRECTIONS = ['down', 'left', 'right', 'up'] as const;
export const B2_NATIVE = { width: 32, height: 42, groundY: 36 } as const;
export const b2PlayerPath = (race: RaceId): string => `assets/atlases/player_${race}_b2.png`;
export const b2PlayerBackPath = (race: RaceId): string => `assets/atlases/player_${race}_b2_back.png`;
export interface B2SourceFrame {
  sheet: 'body' | 'back'; row: number; cell: number; mirror: boolean;
  /** Exact measured crop; independent of the nominal row/column count. */
  rect: readonly [number, number, number, number];
  /** Records intentional source-pose reuse instead of claiming new artwork. */
  note?: string;
}
type Action = typeof PLAYER_ANIMATION_STATES[number];
type Ref = { row: number; cell: number; mirror?: boolean; note?: string; sheet?: 'body' | 'back' };
type Actions = Record<Action, Ref[]>;
type DirectionMap = Record<ActorDirection, Actions>;
const sequence = (row: number, start = 0, note?: string): Ref[] =>
  Array.from({ length: 4 }, (_, frame) => ({ row, cell: start + frame, note }));
const cells = (row: number, values: number[], note?: string): Ref[] => values.map(cell => ({ row, cell, note }));
const mirrored = (frames: Ref[]): Ref[] => frames.map(frame => ({ ...frame, mirror: !frame.mirror,
  note: [frame.note, 'Mirrored side profile; no independent opposite-side drawing.'].filter(Boolean).join(' ') }));
const backActions = (): Pick<Actions, 'hurt' | 'death' | 'dodge'> => ({
  hurt: sequence(0).map(frame => ({ ...frame, sheet: 'back' })),
  death: sequence(1).map(frame => ({ ...frame, sheet: 'back' })),
  dodge: sequence(2).map(frame => ({ ...frame, sheet: 'back' })),
});
const backAttack = 'Back-facing body motion reused; separate equipment layers provide the attack gesture.';
const maps = {} as Record<RaceId, DirectionMap>;
{
  const down: Actions = { idle: sequence(0), walk: sequence(2), attack: sequence(4),
    hurt: [{ row: 6, cell: 0, note: 'Collapse-intro body reused as flinch.' }, { row: 6, cell: 1, note: 'Collapse-intro body reused as flinch.' },
      { row: 6, cell: 0, note: 'Flinch body reused.' }, { row: 0, cell: 0, note: 'Idle body reused for recovery.' }],
    death: sequence(6), dodge: cells(9, [0, 1, 2, 4], 'Front brace/step bodies reused for dodge.') };
  const right: Actions = { idle: sequence(0, 5), walk: sequence(2, 5), attack: sequence(4, 5),
    hurt: [{ row: 6, cell: 4, note: 'Collapse-intro body reused as flinch.' }, { row: 6, cell: 5, note: 'Collapse-intro body reused as flinch.' },
      { row: 6, cell: 4, note: 'Flinch body reused.' }, { row: 0, cell: 5, note: 'Idle body reused for recovery.' }],
    death: [{ row: 6, cell: 4 }, { row: 6, cell: 5 }, { row: 6, cell: 6 },
      { row: 6, cell: 3, note: 'Front prone body reused for side final, preserving a readable fixed native scale.' }],
    dodge: cells(8, [4, 5, 6, 8], 'Side brace/step bodies reused for dodge.') };
  maps.human = { down, right, left: { idle: sequence(1), walk: mirrored(right.walk), attack: mirrored(right.attack),
    hurt: mirrored(right.hurt), death: mirrored(right.death), dodge: mirrored(right.dodge) },
    up: { idle: sequence(1, 5), walk: sequence(3, 5), attack: sequence(5, 5, backAttack), ...backActions() } };
}
{
  const right: Actions = { idle: sequence(0, 4), walk: sequence(2, 4), attack: sequence(4, 4),
    hurt: sequence(6, 4), death: sequence(8, 4), dodge: sequence(10, 4) };
  maps.elf = { down: { idle: sequence(0), walk: sequence(2), attack: sequence(4), hurt: sequence(6), death: sequence(8), dodge: sequence(10) },
    right, left: { idle: sequence(1), walk: sequence(3), attack: sequence(5),
      hurt: cells(7, [0, 1, 2, 0], 'First flinch body reused for recovery; prone source excluded.'),
      death: mirrored(right.death), dodge: sequence(11) },
    up: { idle: sequence(1, 4), walk: sequence(3, 4), attack: sequence(5, 4, backAttack), ...backActions() } };
}
{
  const left: Actions = { idle: cells(0, [4, 5, 4, 5], 'Two genuine side-idle bodies repeated.'), walk: sequence(2, 4),
    attack: [{ row: 5, cell: 4, note: 'Side guard reused for anticipation.' }, { row: 4, cell: 4 }, { row: 4, cell: 5 },
      { row: 5, cell: 4, note: 'Side guard reused for recovery.' }],
    hurt: cells(5, [4, 5, 6, 4], 'Side guard/flinch bodies reused; recovery repeats guard.'),
    death: [{ row: 7, cell: 4, note: 'Side guard reused as collapse start.' }, { row: 7, cell: 5 },
      { row: 6, cell: 3, note: 'Shared curl body.' }, { row: 6, cell: 4, note: 'Shared prone body.' }],
    dodge: cells(8, [4, 5, 6, 4], 'Side brace/step bodies reused; recovery repeats brace.') };
  maps.dwarf = { left, right: { idle: sequence(1), walk: mirrored(left.walk), attack: mirrored(left.attack),
    hurt: mirrored(left.hurt), death: mirrored(left.death), dodge: mirrored(left.dodge) },
    down: { idle: sequence(0), walk: sequence(2), attack: sequence(4), hurt: sequence(5),
      death: [{ row: 6, cell: 0 }, { row: 6, cell: 2 }, { row: 6, cell: 3 }, { row: 6, cell: 5, note: 'Shared front prone body.' }],
      dodge: sequence(8, 0, 'Front brace/step bodies reused for dodge.') },
    up: { idle: sequence(1, 4), walk: sequence(3, 4), attack: sequence(3, 4, backAttack), ...backActions() } };
}
{
  const right: Actions = { idle: sequence(1), walk: sequence(3), attack: sequence(5),
    hurt: cells(7, [0, 1, 2, 0], 'First side flinch body reused for recovery; prone source excluded.'),
    death: sequence(8), dodge: mirrored(sequence(9, 4)) };
  maps.beast = { right, left: { idle: sequence(0, 4), walk: sequence(2, 4), attack: sequence(4, 4),
    hurt: sequence(6, 4), death: mirrored(right.death), dodge: sequence(9, 4) },
    down: { idle: sequence(0), walk: sequence(2), attack: sequence(4), hurt: sequence(6),
      death: [{ row: 6, cell: 0 }, { row: 7, cell: 1, note: 'Side collapse body reused; turns while falling.' },
        { row: 7, cell: 2, note: 'Side collapse body reused.' }, { row: 7, cell: 3, note: 'Side prone body reused.' }],
      dodge: sequence(9) }, up: { idle: sequence(1, 4), walk: sequence(3, 4), attack: sequence(5, 4, backAttack), ...backActions() } };
}

export const B2_SOURCE_LAYOUTS = {
  human: { columns: 10, rows: 10 }, elf: { columns: 8, rows: 12 },
  dwarf: { columns: 8, rows: 10 }, beast: { columns: 8, rows: 11 },
} as const;
export const B2_FRAME_SOURCES = Object.fromEntries(B2_RACES.map(race => [race,
  Object.fromEntries(B2_DIRECTIONS.map(direction => [direction, Object.fromEntries(PLAYER_ANIMATION_POSES.map((pose, index) => {
    const reference = maps[race][direction][PLAYER_ANIMATION_STATES[Math.floor(index / 4)]][index % 4];
    const sheet = reference.sheet ?? 'body';
    const rect = (sheet === 'back' ? B2_BACK_BOUNDS : B2_BODY_BOUNDS)[race][reference.row][reference.cell];
    if (!rect) throw new Error(`Missing B2 crop: ${race}/${direction}/${pose}`);
    return [pose, { ...reference, sheet, mirror: reference.mirror ?? false, rect }];
  }))]))])) as Record<RaceId, Record<ActorDirection, Record<PlayerPose, B2SourceFrame>>>;

const sourceHeight = (rect: readonly number[]): number => rect[3] - rect[1];
/** Supplement sheets use a larger source pixel unit. Calibrate ONCE against
 * the original back idle, not against each crouch/death frame's tight height. */
export const B2_BODY_CALIBRATION = Object.fromEntries(B2_RACES.map(race => {
  const referenceHeight = sourceHeight(B2_FRAME_SOURCES[race].down.idle.rect);
  const backRatio = sourceHeight(B2_FRAME_SOURCES[race].up.idle.rect) / sourceHeight(B2_BACK_BOUNDS[race][0][0]);
  const selected = B2_DIRECTIONS.flatMap(direction => Object.values(B2_FRAME_SOURCES[race][direction]));
  const widest = Math.max(...selected.map(frame => (frame.rect[2] - frame.rect[0] + 2) * (frame.sheet === 'back' ? backRatio : 1)));
  const tallest = Math.max(...selected.map(frame => (sourceHeight(frame.rect) + 2) * (frame.sheet === 'back' ? backRatio : 1)));
  const scale = Math.min(({ human: 31, elf: 32, dwarf: 27, beast: 33 }[race]) / referenceHeight, 30 / widest, 35 / tallest);
  return [race, { referenceHeight, backRatio, scale, standingHeight: Math.round(referenceHeight * scale) }];
})) as Record<RaceId, { referenceHeight: number; backRatio: number; scale: number; standingHeight: number }>;

export function b2Canvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = B2_NATIVE.width; canvas.height = B2_NATIVE.height; return canvas;
}
export function b2Context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Không tạo được canvas nhân vật B2.');
  context.imageSmoothingEnabled = false; return context;
}

/** Phaser-free normalization shared by gameplay and title/HUD portraits.
 * Fixed race/sheet scale keeps recoil, crouch and prone bodies physically
 * smaller; feet meet native groundY without changing the physics collider. */
export function normalizeB2Body(image: CanvasImageSource, race: RaceId, direction: ActorDirection,
  pose: PlayerPose, backImage?: CanvasImageSource): HTMLCanvasElement | undefined {
  const frame = B2_FRAME_SOURCES[race][direction][pose];
  const source = frame.sheet === 'back' ? backImage : image; if (!source) return undefined;
  const [left, top, right, bottom] = frame.rect;
  const crop = document.createElement('canvas'); crop.width = right - left + 2; crop.height = bottom - top + 2;
  const cropContext = b2Context(crop);
  cropContext.drawImage(source, left - 1, top - 1, crop.width, crop.height, 0, 0, crop.width, crop.height);
  const pixels = cropContext.getImageData(0, 0, crop.width, crop.height).data;
  let minX = crop.width, maxX = -1, minY = crop.height, maxY = -1;
  for (let y = 0; y < crop.height; y++) for (let x = 0; x < crop.width; x++) {
    if (pixels[(y * crop.width + x) * 4 + 3] < 16) continue;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  if (maxX < minX) return undefined;
  // The lower body supplies the horizontal anchor. Final prone poses use the
  // whole silhouette, because a horizontal body no longer has standing feet.
  const prone = pose === 'death4' || maxX - minX > (maxY - minY) * 1.1;
  let footLeft = maxX, footRight = minX;
  if (!prone) for (let y = Math.max(minY, maxY - Math.ceil((maxY - minY) * .12)); y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (pixels[(y * crop.width + x) * 4 + 3] < 128) continue;
    footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x);
  }
  const anchor = prone ? (minX + maxX + 1) / 2 : (footLeft + footRight + 1) / 2;
  const calibration = B2_BODY_CALIBRATION[race];
  const scale = calibration.scale * (frame.sheet === 'back' ? calibration.backRatio : 1);
  const width = Math.max(1, Math.min(30, Math.round(crop.width * scale)));
  const height = Math.max(1, Math.min(35, Math.round(crop.height * scale)));
  const anchorX = frame.mirror ? crop.width - anchor : anchor;
  const x = Math.max(1, Math.min(31 - width, Math.round(16 - anchorX * width / crop.width)));
  const canvas = b2Canvas(), context = b2Context(canvas);
  if (frame.mirror) { context.translate(x + width, B2_NATIVE.groundY - height); context.scale(-1, 1); }
  else context.translate(x, B2_NATIVE.groundY - height);
  context.drawImage(crop, 0, 0, crop.width, crop.height, 0, 0, width, height);
  return canvas;
}
