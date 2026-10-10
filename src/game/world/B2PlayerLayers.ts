import type { CharacterAppearance, ClassId } from '../model/types';
import type { ActorDirection, PlayerPose } from './textures';

type RGB = readonly [number, number, number];
interface Pixel { x: number; y: number; index: number; brightness: number }
interface Bounds { left: number; top: number; right: number; bottom: number }
interface Cluster { pixels: Pixel[]; x: number; y: number; bounds: Bounds }
const INK: RGB = [23, 28, 43];
const COATS: Record<ClassId, RGB> = { civilian: [117, 123, 76], swordsman: [65, 105, 109], mage: [107, 76, 139] };

function rgb(hex: string, fallback: RGB): RGB {
  return /^#[\da-f]{6}$/i.test(hex)
    ? [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)] : fallback;
}
function shade(color: RGB, factor: number): RGB {
  return color.map(value => Math.max(0, Math.min(255, Math.round(value * factor)))) as unknown as RGB;
}
function boundsOf(pixels: readonly Pixel[]): Bounds {
  return { left: Math.min(...pixels.map(pixel => pixel.x)), right: Math.max(...pixels.map(pixel => pixel.x)),
    top: Math.min(...pixels.map(pixel => pixel.y)), bottom: Math.max(...pixels.map(pixel => pixel.y)) };
}
function clustersOf(pixels: readonly Pixel[], width: number): Cluster[] {
  const available = new Map(pixels.map(pixel => [pixel.index, pixel]));
  const clusters: Cluster[] = [];
  for (const first of pixels) {
    if (!available.delete(first.index)) continue;
    const cluster = [first];
    for (let cursor = 0; cursor < cluster.length; cursor++) {
      const pixel = cluster[cursor];
      for (const next of [pixel.index - 1, pixel.index + 1, pixel.index - width, pixel.index + width]) {
        const neighbour = available.get(next);
        if (!neighbour || Math.abs(neighbour.x - pixel.x) + Math.abs(neighbour.y - pixel.y) !== 1) continue;
        available.delete(next); cluster.push(neighbour);
      }
    }
    clusters.push({ pixels: cluster, x: cluster.reduce((sum, pixel) => sum + pixel.x, 0) / cluster.length,
      y: cluster.reduce((sum, pixel) => sum + pixel.y, 0) / cluster.length, bounds: boundsOf(cluster) });
  }
  return clusters.sort((a, b) => b.pixels.length - a.pixels.length);
}

/** Layers for unarmed, olive-cloth B2 frames. Masks are measured from the
 * original pose BEFORE recolouring; no torso/head rectangle is shared between
 * upright, hurt, dodge and prone death. Original alpha and ink are retained.
 * The caller must draw the untouched normalized B2 base first. */
export function paintB2Layers(
  context: CanvasRenderingContext2D, appearance: CharacterAppearance, classId: ClassId,
  armored: boolean, armed: boolean, direction: ActorDirection, pose: PlayerPose,
): void {
  const width = context.canvas.width, height = context.canvas.height;
  const image = context.getImageData(0, 0, width, height);
  const original = new Uint8ClampedArray(image.data);
  const opaque: Pixel[] = [], cloth: Pixel[] = [], skin: Pixel[] = [], brown: Pixel[] = [];
  for (let index = 0; index < width * height; index++) {
    const offset = index * 4;
    if (original[offset + 3] < 160) continue;
    const red = original[offset], green = original[offset + 1], blue = original[offset + 2];
    const brightness = (red * 2 + green * 3 + blue) / 6;
    const pixel = { x: index % width, y: Math.floor(index / width), index, brightness };
    opaque.push(pixel);
    if (brightness < 43) continue; // outline, eyes and deep material seams
    // Pale peach skin and cream sleeves are warmer/less green than olive
    // cloth. This stronger chroma boundary keeps faces out of Class/armor.
    const clothPixel = green >= red * .79 && green <= red * 1.35 && green > blue * 1.36
      && red > blue * 1.12 && green >= 42;
    const skinPixel = !clothPixel && red >= 139 && green >= 86 && red > green * 1.10
      && red < green * 1.80 && green > blue * 1.12 && brightness >= 110;
    const brownPixel = !clothPixel && !skinPixel && red > green * 1.25 && green >= blue * .92
      && green < blue * 2.25 && brightness < 145;
    if (clothPixel) cloth.push(pixel);
    else if (skinPixel) skin.push(pixel);
    else if (brownPixel) brown.push(pixel);
  }
  if (!opaque.length) return;
  const silhouette = boundsOf(opaque);
  const clothBounds = cloth.length ? boundsOf(cloth) : silhouette;
  const clothCenter = { x: cloth.length ? cloth.reduce((sum, pixel) => sum + pixel.x, 0) / cloth.length : (silhouette.left + silhouette.right) / 2,
    y: cloth.length ? cloth.reduce((sum, pixel) => sum + pixel.y, 0) / cloth.length : (silhouette.top + silhouette.bottom) / 2 };
  const skinClusters = clustersOf(skin, width);
  const hairCluster = clustersOf(brown, width).find(cluster => cluster.bounds.top < clothBounds.top + 3
    && cluster.y < clothCenter.y + 2);
  // Back frames contain hands but no face. Dwarven beards can also leave a
  // smaller face than a clenched fist; select skin near measured head hair.
  const faceCandidates = direction === 'up' ? [] : [...skinClusters];
  if (hairCluster) faceCandidates.sort((a, b) => {
    const forehead = { x: hairCluster.x, y: hairCluster.bounds.top
      + Math.min(4, (hairCluster.bounds.bottom - hairCluster.bounds.top) * .3) };
    // Cream sleeves can form a larger warm cluster than a dwarf's exposed
    // forehead. Proximity to head hair matters more than skin area.
    const score = (cluster: Cluster): number => Math.min(8, cluster.pixels.length) * .75
      - Math.hypot(cluster.x - forehead.x, cluster.y - forehead.y) * 2.2;
    return score(b) - score(a);
  });
  const face = faceCandidates[0];
  const faceBounds = face?.bounds ?? hairCluster?.bounds ?? { left: silhouette.left + 2, right: silhouette.right - 2,
    top: silhouette.top + 1, bottom: Math.min(clothBounds.top + 1, silhouette.top + 7) };
  const head = face ? { x: face.x, y: face.y } : hairCluster ? { x: hairCluster.x, y: hairCluster.y }
    : { x: (faceBounds.left + faceBounds.right) / 2, y: (faceBounds.top + faceBounds.bottom) / 2 };
  const dx = clothCenter.x - head.x, dy = clothCenter.y - head.y;
  const length = Math.hypot(dx, dy);
  // Local v runs from the head towards the body, including a horizontal body
  // on death frames; u runs across the shoulders.
  const axis = length > 1 ? { x: dx / length, y: dy / length } : { x: 0, y: 1 };
  const across = { x: axis.y, y: -axis.x };
  const local = (pixel: { x: number; y: number }): { u: number; v: number } => ({
    u: (pixel.x - clothCenter.x) * across.x + (pixel.y - clothCenter.y) * across.y,
    v: (pixel.x - clothCenter.x) * axis.x + (pixel.y - clothCenter.y) * axis.y,
  });
  const clothLocal = cloth.map(local);
  const minV = clothLocal.length ? Math.min(...clothLocal.map(pixel => pixel.v)) : -3;
  const maxV = clothLocal.length ? Math.max(...clothLocal.map(pixel => pixel.v)) : 4;
  const widths = clothLocal.map(pixel => Math.abs(pixel.u)).sort((a, b) => a - b);
  const halfBody = Math.max(2, widths[Math.floor(widths.length * .8)] ?? 4);
  const skinColor = rgb(appearance.skinColor, [231, 189, 146]);
  const hairColor = rgb(appearance.hairColor, [73, 59, 54]);
  const nearHead = (pixel: Pixel): boolean => Math.hypot(pixel.x - head.x, pixel.y - head.y)
    <= Math.max(faceBounds.right - faceBounds.left, faceBounds.bottom - faceBounds.top, 4) + 4;
  const headHairIds = new Set(hairCluster?.pixels.map(pixel => pixel.index));
  const hairPixels = brown.filter(pixel => headHairIds.has(pixel.index)
    || nearHead(pixel) && local(pixel).v < minV + (maxV - minV) * .45);
  const hairIds = new Set(hairPixels.map(pixel => pixel.index));
  const clothIds = new Set(cloth.map(pixel => pixel.index));
  const skinIds = new Set(skin.map(pixel => pixel.index));
  const replace = (index: number, color: RGB): void => {
    const offset = index * 4;
    image.data[offset] = color[0]; image.data[offset + 1] = color[1]; image.data[offset + 2] = color[2];
  };
  for (const pixel of skin) replace(pixel.index, shade(skinColor, pixel.brightness < 143 ? .77 : pixel.brightness < 185 ? 1 : 1.12));
  for (const pixel of hairPixels) replace(pixel.index, shade(hairColor, pixel.brightness < 72 ? .68 : pixel.brightness < 112 ? 1 : 1.25));
  for (const pixel of cloth) {
    const { u, v } = local(pixel);
    const progress = (v - minV) / Math.max(1, maxV - minV);
    let color = shade(COATS[classId], pixel.brightness < 77 ? .66 : pixel.brightness < 118 ? .92 : 1.18);
    const torso = Math.abs(u) < halfBody * .95;
    if (armored && progress < .72 && torso) {
      // Actual armor follows each tunic pixel and the pose's body axis. Keep
      // source seams through its original luminance rather than flattening it.
      color = shade([116, 144, 151], pixel.brightness < 77 ? .54 : pixel.brightness < 118 ? .85 : 1.16);
      if (Math.abs(u) > halfBody * .7) color = shade([56, 84, 94], pixel.brightness < 95 ? .8 : 1.1);
      if (u < -halfBody * .25 && u > -halfBody * .55 && progress > .15 && progress < .55) color = [181, 202, 197];
    }
    if (torso && progress > .70 && progress < .83) color = [103, 69, 51];
    if (torso && progress > .72 && progress < .84 && Math.abs(u) < .9) color = [214, 172, 89];
    if (classId === 'swordsman' && !armored && torso && Math.abs(u + (progress - .4) * halfBody) < .75) color = [174, 117, 72];
    if (classId === 'mage') {
      if (!armored && ((progress > .87 && torso) || Math.abs(u) > halfBody * .9 && Math.abs(u) < halfBody * 1.2)) color = [214, 172, 89];
      if (torso && progress > .3 && progress < .56 && Math.abs(u) < 1.1) color = pixel.x % 2 === pixel.y % 2 ? [111, 196, 207] : [227, 215, 181];
    }
    replace(pixel.index, color);
  }
  context.putImageData(image, 0, 0);

  const protectedFace = (x: number, y: number): boolean => direction !== 'up'
    && x >= faceBounds.left && x <= faceBounds.right && y >= faceBounds.top && y <= faceBounds.bottom;
  // Every added pixel is integer-aligned and individually bounded. Weapons
  // cannot disappear outside the 32×42 cell when a hand reaches its edge.
  const draw = (x: number, y: number, color: RGB, protectFace = true): void => {
    x = Math.round(x); y = Math.round(y);
    if (x <= 0 || y <= 0 || x >= width - 1 || y >= height - 1 || protectFace && protectedFace(x, y)) return;
    context.fillStyle = `rgb(${color.join(',')})`; context.fillRect(x, y, 1, 1);
  };
  const drawOnCloth = (x: number, y: number, color: RGB): void => {
    const px = Math.round(x), py = Math.round(y);
    if (clothIds.has(py * width + px)) draw(px, py, color);
  };
  if (classId === 'mage' && cloth.length) {
    // Tailor a flared robe to the actual torso axis. Its hem stops before the
    // measured feet and its sleeves grow from olive cloth, never from skin.
    // This changes the mage silhouette instead of just dyeing a civilian top.
    const opaqueIds = new Set(opaque.map(pixel => pixel.index));
    const brownIds = new Set(brown.map(pixel => pixel.index));
    const bodyEnd = Math.max(...opaque.map(pixel => local(pixel).v));
    const startV = minV + (maxV - minV) * .38;
    const endV = Math.min(maxV + 4, bodyEnd - 2);
    const boundary = (index: number): boolean => [-1, 1, -width, width].some(offset => !opaqueIds.has(index + offset));
    if (endV > startV + 2) for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const index = y * width + x, { u, v } = local({ x, y });
      const progress = (v - startV) / (endV - startV);
      if (progress < 0 || progress > 1) continue;
      const halfWidth = halfBody * (.77 + progress * .18) + progress;
      if (Math.abs(u) > halfWidth || skinIds.has(index) || hairIds.has(index) || brownIds.has(index)) continue;
      const offset = index * 4;
      const originalBrightness = (original[offset] * 2 + original[offset + 1] * 3 + original[offset + 2]) / 6;
      // Retain the source's outer outline and boot pixels. Interior trouser
      // seams become robe folds, with all original alpha still untouched.
      if (original[offset + 3] && originalBrightness < 43 && boundary(index)) continue;
      if (progress > .91 && original[offset + 3] && !clothIds.has(index)) continue;
      const edge = Math.abs(u) > halfWidth - .8;
      let color: RGB = edge ? [55, 40, 76] : u < -.5 ? [123, 92, 157] : [89, 62, 118];
      if (!edge && Math.abs(u + halfWidth * .35) < .65) color = [146, 116, 175];
      if (progress > .85 && !edge) color = [214, 172, 89];
      if (!edge && armored && progress < .3 && original[offset + 3]) continue;
      draw(x, y, color);
    }
    for (const pixel of cloth) {
      const { u, v } = local(pixel);
      if (Math.abs(u) < halfBody * .85 || v > minV + (maxV - minV) * .55) continue;
      const side = Math.sign(u);
      const x = Math.round(pixel.x + across.x * side), y = Math.round(pixel.y + across.y * side);
      if (!original[(y * width + x) * 4 + 3] && !protectedFace(x, y)) draw(x, y, [85, 59, 112]);
    }
  }
  // A small asymmetric clasp preserves a visible character choice without
  // replacing facial details or painting a fixed rectangle over the head.
  if (appearance.gender === 'female' && face) draw(faceBounds.right + 1, head.y + 1, [214, 172, 89]);

  const hairBounds = hairPixels.length ? boundsOf(hairPixels) : faceBounds;
  const strandStart = direction === 'up'
    ? { x: head.x, y: Math.max(hairBounds.bottom, faceBounds.bottom) }
    : direction === 'right' ? { x: hairBounds.left, y: head.y }
      : direction === 'left' ? { x: hairBounds.right, y: head.y }
        : { x: hairBounds.right, y: head.y };
  if (appearance.hair === 'long' || appearance.hair === 'braid') {
    const strandLength = appearance.hair === 'long' ? 7 : 8;
    const origins = appearance.hair === 'long' && direction === 'down'
      ? [strandStart, { x: hairBounds.left, y: head.y }] : [strandStart];
    for (const origin of origins) for (let step = 0; step < strandLength; step++) {
      const braid = appearance.hair === 'braid';
      const sway = braid ? step % 3 === 1 ? 1 : 0 : step > 3 ? 1 : 0;
      const x = origin.x + axis.x * step + across.x * sway;
      const y = origin.y + axis.y * step + across.y * sway;
      draw(x - across.x, y - across.y, shade(hairColor, .6));
      draw(x, y, shade(hairColor, braid && step % 3 === 0 ? 1.22 : 1));
      if (step < strandLength - 2) draw(x + across.x, y + across.y, shade(hairColor, .78));
      if (braid && step === strandLength - 1) draw(x, y, [214, 172, 89]);
    }
  } else {
    // Short hair retains its measured source silhouette; add a tiny highlight
    // within existing hair pixels, never a new cap over ears or the face.
    for (const pixel of hairPixels) if (pixel.y === hairBounds.top + 1 && pixel.x % 3 === 0) draw(pixel.x, pixel.y, shade(hairColor, 1.22));
  }
  if (classId === 'mage') {
    // Extra robe folds stay on the original cloth mask and preserve boots,
    // hands, race anatomy, outline and source alpha on every pose.
    for (const pixel of cloth) {
      const { u, v } = local(pixel);
      if (v > minV + (maxV - minV) * .82 && Math.abs(u) < halfBody * .6 && Math.round(u) % 3 === 0) drawOnCloth(pixel.x, pixel.y, [135, 120, 198]);
    }
  }
  if (!armed || classId === 'civilian') return;

  const expectedSide = direction === 'left' || direction === 'down' ? -1 : 1;
  const handCandidates = skinClusters.filter(cluster => cluster !== face && cluster.pixels.length >= 1);
  handCandidates.sort((a, b) => expectedSide * (b.x - a.x)
    + Math.abs(local(a).v - (minV + maxV) / 2) * .25 - Math.abs(local(b).v - (minV + maxV) / 2) * .25);
  const hand = handCandidates[0] ?? {
    x: clothCenter.x + across.x * halfBody * expectedSide,
    y: clothCenter.y + across.y * halfBody * expectedSide + 1,
  };
  const anchor = { x: Math.max(3, Math.min(width - 4, Math.round(hand.x))), y: Math.max(5, Math.min(height - 5, Math.round(hand.y))) };
  const poseText = String(pose);
  const state = poseText.replace(/\d+$/, '');
  const frame = Math.max(0, Math.min(3, Number(poseText.match(/\d+$/)?.[0] ?? 1) - 1));
  const facing = direction === 'down' ? Math.PI / 2 : direction === 'up' ? -Math.PI / 2 : direction === 'left' ? Math.PI : 0;
  const attack = state === 'attack';
  let angle = -Math.PI / 2 + expectedSide * .16;
  if (attack) angle = facing + [-1.05, -.15, .65, .15][frame];
  else if (state === 'dodge') angle = facing + .25;
  else if (state === 'hurt') angle += [.2, .4, .25, .1][frame];
  else if (state === 'death') angle = Math.atan2(axis.y, axis.x) + .13;
  const weaponLength = classId === 'mage' ? 15 : 12;
  const tip = { x: Math.max(3, Math.min(width - 4, Math.round(anchor.x + Math.cos(angle) * weaponLength))),
    y: Math.max(3, Math.min(height - 4, Math.round(anchor.y + Math.sin(angle) * weaponLength))) };
  const wx = tip.x - anchor.x, wy = tip.y - anchor.y, distance = Math.max(1, Math.hypot(wx, wy));
  const vector = { x: wx / distance, y: wy / distance };
  const perpendicular = { x: -vector.y, y: vector.x };
  const line = (from: { x: number; y: number }, to: { x: number; y: number }, color: RGB, thickness = 1): void => {
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
    for (let step = 0; step <= steps; step++) {
      const x = from.x + (to.x - from.x) * step / steps, y = from.y + (to.y - from.y) * step / steps;
      for (let offset = -Math.floor(thickness / 2); offset < Math.ceil(thickness / 2); offset++) draw(x + perpendicular.x * offset, y + perpendicular.y * offset, color);
    }
  };
  if (classId === 'swordsman') {
    line(anchor, tip, INK, 4);
    line(anchor, tip, [88, 113, 133], 3);
    line({ x: anchor.x - perpendicular.x, y: anchor.y - perpendicular.y }, { x: tip.x - perpendicular.x, y: tip.y - perpendicular.y }, [211, 226, 218]);
    const guard = { x: anchor.x + vector.x * 2, y: anchor.y + vector.y * 2 };
    line({ x: guard.x - perpendicular.x * 3, y: guard.y - perpendicular.y * 3 }, { x: guard.x + perpendicular.x * 3, y: guard.y + perpendicular.y * 3 }, [214, 172, 89], 2);
    line({ x: anchor.x - vector.x * 3, y: anchor.y - vector.y * 3 }, anchor, [103, 69, 51], 2);
  } else {
    line({ x: anchor.x - vector.x * 5, y: anchor.y - vector.y * 5 }, tip, INK, 3);
    line({ x: anchor.x - vector.x * 5, y: anchor.y - vector.y * 5 }, tip, [174, 117, 72], 2);
    draw(anchor.x + vector.x * 5, anchor.y + vector.y * 5, [214, 172, 89]);
    for (let cy = -3; cy <= 3; cy++) for (let cx = -2; cx <= 2; cx++) {
      if (Math.abs(cx) * 1.4 + Math.abs(cy) > 3.4) continue;
      draw(tip.x + cx, tip.y + cy, Math.abs(cx) * 1.4 + Math.abs(cy) > 2.3 ? INK : cx < 0 ? [188, 232, 223] : [111, 196, 207]);
    }
    if (attack && frame === 2) {
      draw(tip.x - 3, tip.y - 3, [111, 196, 207]); draw(tip.x + 3, tip.y + 2, [227, 215, 181]);
    }
  }
  // The source hand remains in front of its grip, restricted to actual skin.
  for (let y = anchor.y - 1; y <= anchor.y + 1; y++) for (let x = anchor.x - 1; x <= anchor.x + 1; x++) {
    if (!skinIds.has(y * width + x) || hairIds.has(y * width + x)) continue;
    const offset = (y * width + x) * 4;
    draw(x, y, [image.data[offset], image.data[offset + 1], image.data[offset + 2]]);
  }
}
