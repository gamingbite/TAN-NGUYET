import Phaser from 'phaser';
import type { CharacterAppearance, ClassId, RaceId } from '../model/types';
import type { ActorDirection, PlayerPose } from './textures';
import { ART_PALETTE } from './ArtManifest';
import { loadB2PlayerArt, installB2PlayerArt, createB2PlayerTexture } from './B2PlayerArt';

/** Explicit source layout. Each race occupies two rows, with four independent
 * directions for every pose; equipment never comes from the base sheet. */
export const PLAYER_ART = {
  id: 'player-bases-v1',
  path: 'assets/atlases/player_bases_v1.png',
  columns: 8,
  rows: 8,
  width: 32,
  height: 42,
  groundY: 36,
  sourceWidth: 1254,
  sourceHeight: 1254,
  // The generated sheet is not an evenly divided grid. These inspected row
  // bands include complete heads/feet, and the shared ground lines align rows.
  sourceRows: [
    { top: 22, bottom: 175, ground: 164 }, { top: 176, bottom: 327, ground: 317 },
    { top: 328, bottom: 486, ground: 479 }, { top: 486, bottom: 640, ground: 630 },
    { top: 644, bottom: 794, ground: 785 }, { top: 796, bottom: 944, ground: 935 },
    { top: 944, bottom: 1090, ground: 1084 }, { top: 1090, bottom: 1254, ground: 1236 },
  ],
  directions: ['down', 'left', 'right', 'up'],
  races: ['human', 'elf', 'dwarf', 'beast'],
  poses: ['idle', 'walk1', 'walk2', 'attack'],
} as const;

const SOURCE_KEY = `art-source-${PLAYER_ART.id}`;
interface Bounds { left: number; top: number; right: number; bottom: number }
interface SourceFrame { canvas: HTMLCanvasElement; race: RaceId; direction: ActorDirection; pose: PlayerPose; bounds: Bounds }
const bases = new WeakMap<Phaser.Textures.TextureManager, Map<string, HTMLCanvasElement>>();
const frameKey = (race: RaceId, direction: ActorDirection, pose: PlayerPose): string => `${race}-${direction}-${pose}`;
const nativeHeight: Record<RaceId, number> = { human: 30, elf: 31, dwarf: 26, beast: 33 };
const classCoats: Record<ClassId, string> = { civilian: '#7f7751', swordsman: '#536b71', mage: '#6f537c' };

function canvasOf(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function contextOf(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Không tạo được canvas nhân vật.');
  context.imageSmoothingEnabled = false;
  return context;
}

/** Used in preload; installation falls back to the original procedural player
 * when loading fails, rather than changing the character or gameplay data. */
export function loadPlayerArt(scene: Phaser.Scene): void {
  loadB2PlayerArt(scene);
  if (!scene.textures.exists(SOURCE_KEY)) scene.load.image(SOURCE_KEY, PLAYER_ART.path);
}

function extract(image: CanvasImageSource, width: number, height: number, race: RaceId, raceIndex: number, direction: ActorDirection, directionIndex: number, pose: PlayerPose): SourceFrame | null {
  const secondRow = pose === 'walk2' || pose === 'attack';
  const column = directionIndex + ((pose === 'walk1' || pose === 'attack') ? 4 : 0);
  const row = raceIndex * 2 + (secondRow ? 1 : 0);
  const sourceX = Math.round(column * width / PLAYER_ART.columns);
  const band = PLAYER_ART.sourceRows[row];
  const sourceY = Math.round(band.top * height / PLAYER_ART.sourceHeight);
  const cellWidth = Math.round((column + 1) * width / PLAYER_ART.columns) - sourceX;
  const cellHeight = Math.round(band.bottom * height / PLAYER_ART.sourceHeight) - sourceY;
  // Equal logical source canvases retain one crop/scale per race while aligning
  // two irregular source rows at a common foot line. No per-pose tight crop.
  const canvas = canvasOf(160, 176);
  const context = contextOf(canvas);
  const logicalWidth = Math.round(cellWidth * PLAYER_ART.sourceWidth / width);
  const logicalHeight = Math.round(cellHeight * PLAYER_ART.sourceHeight / height);
  const logicalGround = band.ground - band.top;
  context.drawImage(image, sourceX, sourceY, cellWidth, cellHeight, Math.round((160 - logicalWidth) / 2), 164 - logicalGround, logicalWidth, logicalHeight);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const bounds: Bounds = { left: canvas.width, right: -1, top: canvas.height, bottom: -1 };
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] < 220) continue;
      bounds.left = Math.min(bounds.left, x); bounds.right = Math.max(bounds.right, x);
      bounds.top = Math.min(bounds.top, y); bounds.bottom = Math.max(bounds.bottom, y);
    }
  }
  return bounds.right < bounds.left ? null : { canvas, race, direction, pose, bounds };
}

/** Normalize a complete race together. Every pose uses the same crop and scale;
 * moving a hand cannot resize or re-center its body between animation frames. */
export function installPlayerArt(scene: Phaser.Scene): { installed: number; warnings: string[] } {
  const b2 = installB2PlayerArt(scene);
  const retained = bases.get(scene.textures);
  if (retained) return { installed: b2.installed || retained.size, warnings: b2.warnings };
  const installed = new Map<string, HTMLCanvasElement>();
  const warnings: string[] = [];
  if (!scene.textures.exists(SOURCE_KEY)) {
    warnings.push(`Thiếu ${PLAYER_ART.path}; dùng nhân vật procedural hiện có.`);
    return { installed: b2.installed, warnings: b2.installed === 384 ? b2.warnings : [...warnings, ...b2.warnings] };
  }
  try {
    const image = scene.textures.get(SOURCE_KEY).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
    const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
    if (!width || !height || width < PLAYER_ART.columns || height < PLAYER_ART.rows) throw new Error('Kích thước atlas không hợp lệ.');
    PLAYER_ART.races.forEach((race, raceIndex) => {
      const frames: SourceFrame[] = [];
      for (const pose of PLAYER_ART.poses) {
        PLAYER_ART.directions.forEach((direction, directionIndex) => {
          const frame = extract(image, width, height, race, raceIndex, direction, directionIndex, pose);
          if (frame) frames.push(frame);
        });
      }
      // A partly generated race must not alternate raster and procedural poses.
      if (frames.length !== 16) { warnings.push(`Atlas ${race} thiếu frame; giữ toàn bộ animation procedural của chủng tộc này.`); return; }
      const common: Bounds = {
        left: Math.min(...frames.map(frame => frame.bounds.left)),
        right: Math.max(...frames.map(frame => frame.bounds.right)),
        top: Math.min(...frames.map(frame => frame.bounds.top)),
        bottom: Math.max(...frames.map(frame => frame.bounds.bottom)),
      };
      const sourceWidth = common.right - common.left + 1;
      const sourceHeight = common.bottom - common.top + 1;
      const scale = Math.min(27 / sourceWidth, nativeHeight[race] / sourceHeight);
      const destinationWidth = Math.max(1, Math.round(sourceWidth * scale));
      const destinationHeight = Math.max(1, Math.round(sourceHeight * scale));
      const x = Math.round((PLAYER_ART.width - destinationWidth) / 2);
      const y = PLAYER_ART.groundY - destinationHeight;
      for (const frame of frames) {
        const canvas = canvasOf(PLAYER_ART.width, PLAYER_ART.height);
        const context = contextOf(canvas);
        context.drawImage(frame.canvas, common.left, common.top, sourceWidth, sourceHeight, x, y, destinationWidth, destinationHeight);
        const normalized = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < normalized.data.length; i += 4) normalized.data[i] = normalized.data[i] < 220 ? 0 : 255;
        context.putImageData(normalized, 0, 0);
        installed.set(frameKey(race, frame.direction, frame.pose), canvas);
      }
    });
    bases.set(scene.textures, installed);
  } catch (error) {
    warnings.push(`${PLAYER_ART.path}: ${error instanceof Error ? error.message : 'Không đọc được ảnh'}; giữ nhân vật procedural.`);
  }
  for (const warning of warnings) console.warn(`[TÀN NGUYỆT player art] ${warning}`);
  return { installed: b2.installed || installed.size, warnings: [...warnings, ...b2.warnings] };
}

const rgb = (hex: string): readonly [number, number, number] => {
  const valid = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#c89e7c';
  return [Number.parseInt(valid.slice(1, 3), 16), Number.parseInt(valid.slice(3, 5), 16), Number.parseInt(valid.slice(5, 7), 16)];
};
const palette = ART_PALETTE.map(rgb);
const nearestColor = (red: number, green: number, blue: number): readonly [number, number, number] => {
  let nearest = palette[0];
  let distance = Infinity;
  for (const candidate of palette) {
    const score = (red - candidate[0]) ** 2 * 2 + (green - candidate[1]) ** 2 * 3 + (blue - candidate[2]) ** 2;
    if (score < distance) { nearest = candidate; distance = score; }
  }
  return nearest;
};

/** Swap three restrained skin/hair tones only. Dark ink outline and eyes are
 * protected, and shoes/belts below the head are never treated as human hair. */
function customize(context: CanvasRenderingContext2D, appearance: CharacterAppearance, classId: ClassId): void {
  const image = context.getImageData(0, 0, PLAYER_ART.width, PLAYER_ART.height);
  const skin = rgb(appearance.skinColor), hair = rgb(appearance.hairColor), coat = rgb(classCoats[classId]);
  const headBottom = appearance.race === 'dwarf' ? 28 : 21;
  for (let i = 0; i < image.data.length; i += 4) {
    if (!image.data[i + 3]) continue;
    const red = image.data[i], green = image.data[i + 1], blue = image.data[i + 2];
    const x = (i / 4) % PLAYER_ART.width;
    const y = Math.floor(i / 4 / PLAYER_ART.width);
    const brightness = (red * 2 + green * 3 + blue) / 6;
    let replacement: readonly [number, number, number];
    // All source ink is normalized once, then protected from appearance swaps.
    // Red/green extraction fringes are ink too, never warning-colored pixels.
    const fringe = (red > green * 2.4 && red > blue * 2.4 && brightness < 130)
      || (green > red * 2.4 && green > blue * 2.4);
    if (brightness < 45 || fringe) replacement = palette[0];
    else {
      const skinPixel = red >= 148 && green >= 85 && red > green * 1.20 && red < green * 1.85 && green > blue * 1.42;
      const hairRegion = y < headBottom || (appearance.race === 'beast' && (x < 8 || x > 25));
      const hairPixel = !skinPixel && hairRegion && red > green * 1.48 && green >= blue && green < blue * 1.85 && brightness < 170;
      const beardPixel = hairPixel && appearance.race === 'dwarf' && appearance.gender === 'female' && y >= 20 && x >= 9 && x <= 23;
      const clothPixel = y >= headBottom - 4 && green > blue * 1.45 && red > green * .75 && red < green * 1.35;
      const target = skinPixel || beardPixel ? skin : hairPixel ? hair : clothPixel ? coat : null;
      if (target) {
        const factor = beardPixel ? .85 : skinPixel ? brightness < 132 ? .70 : brightness < 181 ? 1 : 1.12 : hairPixel ? brightness < 65 ? .65 : brightness < 93 ? 1 : 1.25 : brightness < 80 ? .65 : brightness < 120 ? 1 : 1.2;
        replacement = [Math.min(255, Math.round(target[0] * factor)), Math.min(255, Math.round(target[1] * factor)), Math.min(255, Math.round(target[2] * factor))];
      } else replacement = nearestColor(red, green, blue);
    }
    image.data[i] = replacement[0]; image.data[i + 1] = replacement[1]; image.data[i + 2] = replacement[2];
  }
  context.putImageData(image, 0, 0);
}

function paintLayers(context: CanvasRenderingContext2D, appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed: boolean, direction: ActorDirection, pose: PlayerPose): void {
  const dwarf = appearance.race === 'dwarf';
  const hair = appearance.hairColor, skin = appearance.skinColor;
  const color = (hex: string, factor: number): string => `rgb(${rgb(hex).map(component => Math.min(255, Math.round(component * factor))).join(',')})`;
  const personY = (y: number): number => !dwarf || y <= 13 ? y : y <= 24 ? 13 + Math.round((y - 13) * .64) : y - 4;
  const draw = (fill: string, x: number, y: number, width: number, height: number): void => {
    context.fillStyle = fill;
    const top = personY(y);
    context.fillRect(x + 4, top + (dwarf ? 9 : 5), width, Math.max(1, personY(y + height) - top));
  };
  const profile = direction === 'left' || direction === 'right';
  const right = direction === 'right';
  const attacking = pose === 'attack';
  if (classId === 'mage') {
    draw(color(classCoats.mage, .75), profile ? 7 : 6, 24, profile ? 11 : 13, 4);
    draw('#b2b0ce', direction === 'up' ? 7 : right ? 16 : profile ? 7 : 10, 25, direction === 'up' ? 11 : 2, direction === 'up' ? 1 : 3);
  }
  if (armored) {
    const torso = dwarf ? 14 : 16;
    draw('#344851', profile ? 6 : 5, torso, profile ? 13 : 15, dwarf ? 11 : 9);
    draw(direction === 'up' ? '#637e86' : '#80959a', profile ? 8 : 7, torso, profile ? 9 : 11, dwarf ? 9 : 7);
    draw('#b8c5b6', profile && right ? 13 : 8, torso + 1, 3, dwarf ? 7 : 5);
    draw('#526b75', profile && right ? 8 : 14, torso + 1, 2, dwarf ? 8 : 6);
    draw('#c6b27a', profile ? 7 : 6, 24, profile ? 11 : 13, 2);
    draw('#6f858b', profile ? right ? 14 : 7 : 4, torso - 1, 5, 3);
    if (!profile) draw('#6f858b', 17, torso - 1, 5, 3);
  }
  // Hairstyles remain real character choices, layered after armor for the back
  // view. All rectangles use the procedural native coordinates and foot anchor.
  if (appearance.hair === 'long') {
    if (direction === 'up') {
      draw(color(hair, .65), 6, 7, 13, 14); draw(hair, 7, 8, 11, 12); draw(color(hair, 1.15), 8, 9, 2, 9);
    } else if (profile) {
      const x = right ? 7 : 16;
      draw(color(hair, .75), x, 7, 4, 13); draw(hair, x, 8, 3, 11); draw(color(hair, 1.2), x, 9, 1, 9);
    } else {
      draw(color(hair, .8), 5, 7, 3, 12); draw(color(hair, .8), 17, 7, 3, 12);
      draw(color(hair, 1.2), 6, 9, 1, 9); draw(color(hair, 1.2), 18, 9, 1, 9);
    }
  } else if (appearance.hair === 'braid') {
    const x = direction === 'up' ? 11 : profile ? right ? 6 : 17 : 18;
    for (let y = direction === 'up' ? 12 : 10; y < 23; y += 3) {
      draw(color(hair, .7), x + (y % 2 ? 0 : 1), y, 3, 3); draw(hair, x + 1, y, 2, 2);
    }
    draw('#cfb677', x + 1, 23, 3, 2);
  }
  if (appearance.gender === 'female' && direction !== 'up') draw('#d3bd81', profile ? right ? 11 : 15 : 18, 11, 1, 2);
  if (!armed || classId === 'civilian') return;
  if (classId === 'mage') {
    const x = direction === 'up' ? 0 : direction === 'left' ? 0 : profile ? 23 : 22;
    const raised = attacking ? -3 : 0;
    draw('#746348', x, 9 + raised, 2, 22); draw('#9aa8b8', x - 2, 6 + raised, 6, 6);
    draw('#b9dfe1', x - 1, 5 + raised, 4, 4); draw('#e0ece0', x, 6 + raised, 2, 2);
    if (attacking) draw(skin, direction === 'left' || direction === 'up' ? 1 : 19, 13, 4, 3);
  } else if (attacking && profile) {
    draw('#7e9495', right ? 20 : -3, 17, 8, 3); draw('#c5d4c5', right ? 20 : -3, 17, 8, 1);
    draw('#d0b57c', right ? 20 : 4, 15, 2, 7); draw('#6d563b', right ? 17 : 6, 18, 3, 2);
  } else if (attacking && direction === 'down') {
    draw('#7e9495', 2, 20, 20, 3); draw('#c5d4c5', 3, 20, 19, 1);
    draw('#e3ead1', 20, 21, 3, 1); draw('#d0b57c', 3, 18, 2, 7); draw('#6d563b', 0, 21, 3, 2);
    draw(skin, 4, 19, 4, 3);
  } else {
    const x = direction === 'up' || direction === 'right' ? 22 : 0;
    const raised = attacking ? -5 : 0;
    draw('#c5d4c5', x, 7 + raised, 2, 15); draw('#7e9495', x + 2, 8 + raised, 1, 14);
    draw('#d0b57c', x - 2, 22 + raised, 7, 2); draw('#6d563b', x + 1, 24 + raised, 2, 4);
    if (direction === 'down') draw(skin, 4, 21, 4, 3);
  }
}

/** Return false to keep the existing procedural generator. No physics, naming,
 * state timing, or save data changes accompany the raster texture replacement. */
export function createRasterPlayerTexture(scene: Phaser.Scene, key: string, appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed: boolean, direction: ActorDirection, pose: PlayerPose): boolean {
  if (createB2PlayerTexture(scene, key, appearance, classId, armored, armed, direction, pose)) return true;
  const legacyPose: PlayerPose = pose.startsWith('walk') ? pose === 'walk1' || pose === 'walk3' ? 'walk1' : 'walk2' : pose.startsWith('attack') ? 'attack' : 'idle';
  const base = bases.get(scene.textures)?.get(frameKey(appearance.race, direction, legacyPose));
  if (!base) return false;
  if (scene.textures.exists(key)) return true;
  const canvas = canvasOf(PLAYER_ART.width, PLAYER_ART.height);
  const context = contextOf(canvas);
  context.drawImage(base, 0, 0);
  customize(context, appearance, classId);
  paintLayers(context, appearance, classId, armored, armed, direction, pose);
  const texture = scene.textures.addCanvas(key, canvas);
  if (!texture) return false;
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return true;
}
