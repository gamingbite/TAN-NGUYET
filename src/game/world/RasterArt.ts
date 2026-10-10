import Phaser from 'phaser';
import { ART_PALETTE, WORLD_ART_SHEETS, type RasterArtFrame, type RasterArtSheet } from './ArtManifest';
import type { ZoneDefinition } from '../model/types';

interface Bounds { x: number; y: number; width: number; height: number }
interface ExtractedFrame { definition: RasterArtFrame; canvas: HTMLCanvasElement; bounds: Bounds; registration: Bounds }

export interface ArtInstallResult {
  installed: string[];
  missing: string[];
  warnings: string[];
}

const sourceKey = (sheet: RasterArtSheet): string => `art-source-${sheet.id}`;
const palette = ART_PALETTE.map(hex => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
] as const);
const snappedColors = new Map<number, readonly [number, number, number]>();
const installedByManager = new WeakMap<Phaser.Textures.TextureManager, Set<string>>();

function colorInPalette(red: number, green: number, blue: number): readonly [number, number, number] {
  const key = (red << 16) | (green << 8) | blue;
  const cached = snappedColors.get(key);
  if (cached) return cached;
  let nearest = palette[0];
  let best = Infinity;
  for (const candidate of palette) {
    const distance = (red - candidate[0]) ** 2 * 2 + (green - candidate[1]) ** 2 * 3 + (blue - candidate[2]) ** 2;
    if (distance < best) { best = distance; nearest = candidate; }
  }
  snappedColors.set(key, nearest);
  return nearest;
}

function canvasOf(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function extractFrame(image: CanvasImageSource, imageWidth: number, imageHeight: number, sheet: RasterArtSheet, definition: RasterArtFrame): ExtractedFrame | null {
  const region = definition.sourceRect ?? { x: definition.column / sheet.columns, y: definition.row / sheet.rows, width: 1 / sheet.columns, height: 1 / sheet.rows };
  const x = Math.round(region.x * imageWidth);
  const y = Math.round(region.y * imageHeight);
  const width = Math.round((region.x + region.width) * imageWidth) - x;
  const height = Math.round((region.y + region.height) * imageHeight) - y;
  const canvas = canvasOf(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Không tạo được canvas chuẩn hóa asset.');
  context.imageSmoothingEnabled = false;
  context.drawImage(image, x, y, width, height, 0, 0, width, height);
  if (definition.tile) return { definition, canvas, bounds: { x: 0, y: 0, width, height }, registration: { x: 0, y: 0, width, height } };
  const pixels = context.getImageData(0, 0, width, height).data;
  let left = width, right = -1, top = height, bottom = -1;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      if (pixels[(py * width + px) * 4 + 3] < 8) continue;
      left = Math.min(left, px); right = Math.max(right, px);
      top = Math.min(top, py); bottom = Math.max(bottom, py);
    }
  }
  if (right < left || bottom < top) return null;
  const bounds = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
  // Measured crops may cross a nominal cell boundary to retain a hand/weapon.
  // Keep their offsets relative to that original cell, preserving body position.
  const registration = { ...bounds,
    x: left + x - Math.round(definition.column * imageWidth / sheet.columns),
    y: top + y - Math.round(definition.row * imageHeight / sheet.rows),
  };
  return { definition, canvas, bounds, registration };
}

function normalizeFrame(frame: ExtractedFrame, reference: Bounds, scale: number): HTMLCanvasElement {
  const { definition, bounds } = frame;
  const canvas = canvasOf(definition.width, definition.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Không tạo được texture canvas.');
  context.imageSmoothingEnabled = false;
  if (definition.tile) {
    context.drawImage(frame.canvas, 0, 0, definition.width, definition.height);
  } else {
    const width = Math.max(1, Math.round(bounds.width * scale));
    const height = Math.max(1, Math.round(bounds.height * scale));
    const x = Math.round((definition.width - reference.width * scale) / 2 + (frame.registration.x - reference.x) * scale);
    const y = Math.round(definition.height - (definition.bottomPadding ?? 1) - reference.height * scale + (frame.registration.y - reference.y) * scale);
    context.drawImage(frame.canvas, bounds.x, bounds.y, bounds.width, bounds.height, x, y, width, height);
  }
  if (definition.paletteSnap === false) return canvas;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    if (image.data[i + 3] === 0) continue;
    const color = colorInPalette(image.data[i], image.data[i + 1], image.data[i + 2]);
    image.data[i] = color[0]; image.data[i + 1] = color[1]; image.data[i + 2] = color[2];
    // Keep the source alpha, including transparent shadows; never fill a matte.
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

/** Call from preload. Missing PNGs are reported by installWorldArt, then the
 * existing procedural generation supplies its original texture keys. */
export function loadWorldArt(scene: Phaser.Scene): void {
  for (const sheet of WORLD_ART_SHEETS) {
    const key = sourceKey(sheet);
    if (!scene.textures.exists(key)) scene.load.image(key, sheet.path);
  }
}

/** Call before generateWorldTextures. No sprite, physics or map data is edited. */
export function installWorldArt(scene: Phaser.Scene): ArtInstallResult {
  const result: ArtInstallResult = { installed: [], missing: [], warnings: [] };
  let installed = installedByManager.get(scene.textures);
  if (!installed) { installed = new Set(); installedByManager.set(scene.textures, installed); }
  for (const sheet of WORLD_ART_SHEETS) {
    const key = sourceKey(sheet);
    if (!scene.textures.exists(key)) {
      result.missing.push(...sheet.frames.map(frame => frame.key));
      result.warnings.push(`Thiếu ${sheet.path}; dùng texture procedural hiện có.`);
      continue;
    }
    try {
      const image = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
      const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
      const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
      if (!imageWidth || !imageHeight) throw new Error('Ảnh nguồn không có kích thước hợp lệ.');
      const frames: ExtractedFrame[] = [];
      const references = new Map<string, Bounds>();
      for (const definition of sheet.frames) {
        if (scene.textures.exists(definition.key)) {
          if (installed.has(definition.key)) result.installed.push(definition.key);
          else {
            result.missing.push(definition.key);
            result.warnings.push(`Giữ texture ${definition.key} đã có; tải lại game để nạp bản PNG mới.`);
          }
          continue;
        }
        const frame = extractFrame(image, imageWidth, imageHeight, sheet, definition);
        if (!frame) {
          result.missing.push(definition.key);
          result.warnings.push(`Ô ${definition.key} trong ${sheet.path} trống; dùng procedural khi có.`);
          continue;
        }
        frames.push(frame);
        const group = definition.scaleGroup ?? definition.key;
        const previous = references.get(group);
        if (!previous) references.set(group, { ...frame.registration });
        else {
          const x = Math.min(previous.x, frame.registration.x), y = Math.min(previous.y, frame.registration.y);
          references.set(group, { x, y,
            width: Math.max(previous.x + previous.width, frame.registration.x + frame.registration.width) - x,
            height: Math.max(previous.y + previous.height, frame.registration.y + frame.registration.height) - y,
          });
        }
      }
      for (const frame of frames) {
        const reference = references.get(frame.definition.scaleGroup ?? frame.definition.key);
        if (!reference) continue;
        const scale = Math.min((frame.definition.width - 2) / reference.width, (frame.definition.height - 2) / reference.height);
        const canvas = normalizeFrame(frame, reference, scale);
        const texture = scene.textures.addCanvas(frame.definition.key, canvas);
        if (!texture) throw new Error(`Không đăng ký được texture ${frame.definition.key}.`);
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        result.installed.push(frame.definition.key);
        installed.add(frame.definition.key);
      }
    } catch (error) {
      const remaining = sheet.frames.filter(frame => !scene.textures.exists(frame.key)).map(frame => frame.key);
      result.missing.push(...remaining);
      result.warnings.push(`${sheet.path}: ${error instanceof Error ? error.message : 'Không đọc được ảnh'}; dùng procedural khi có.`);
    }
  }
  for (const warning of result.warnings) console.warn(`[TÀN NGUYỆT art] ${warning}`);
  return result;
}

/** Draws only visual ground/path/wall layers at the original map coordinates.
 * Existing scene graphics can remain as the fallback at depth -100. */
export function paintTerrainArt(scene: Phaser.Scene, zone: ZoneDefinition): boolean {
  const ground = zone.id === 'town' ? 'tile-meadow' : zone.id === 'forest' ? 'tile-forest' : 'tile-dungeon';
  const path = zone.id === 'town' ? 'tile-cobble' : zone.id === 'forest' ? 'tile-trail' : 'tile-dungeon-cracked';
  const required = zone.id === 'dungeon' ? [ground, path, 'tile-wall'] : [ground, path];
  if (required.some(key => !scene.textures.exists(key))) return false;
  // The native PNG floor is intentionally softened against the existing
  // handcrafted terrain, keeping tiny repeating details below actor contrast.
  const appearance = zone.id === 'town' ? { ground: .7, path: .45 }
    : zone.id === 'forest' ? { ground: .75, path: .6 } : { ground: .86, path: .7 };
  scene.add.tileSprite(0, 0, zone.width, zone.height, ground).setOrigin(0).setDepth(-90).setAlpha(appearance.ground);
  for (const rectangle of zone.paths) {
    scene.add.tileSprite(rectangle.x, rectangle.y, rectangle.width, rectangle.height, path).setOrigin(0).setDepth(-89).setAlpha(appearance.path);
  }
  if (zone.id === 'dungeon') {
    const edges = scene.add.graphics().setDepth(-87);
    edges.lineStyle(1, 0x586579, .55);
    for (const rectangle of zone.obstacles) {
      scene.add.tileSprite(rectangle.x, rectangle.y, rectangle.width, rectangle.height, 'tile-wall').setOrigin(0).setDepth(-88).setTint(0x2a3448);
      edges.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
  }
  return true;
}
