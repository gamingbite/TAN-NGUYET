import type { RectDefinition, ZoneDefinition } from '../model/types';

export interface Point { x: number; y: number }

/** Slab intersection, including endpoints: attacks cannot cross solid walls. */
export function segmentBlocked(from: Point, to: Point, obstacles: readonly RectDefinition[], padding = 0): boolean {
  const dx = to.x - from.x; const dy = to.y - from.y;
  return obstacles.some(rect => {
    let near = 0; let far = 1;
    for (const [origin, delta, min, max] of [
      [from.x, dx, rect.x - padding, rect.x + rect.width + padding],
      [from.y, dy, rect.y - padding, rect.y + rect.height + padding],
    ]) {
      if (Math.abs(delta) < .0001) { if (origin < min || origin > max) return false; }
      else {
        const entry = (min - origin) / delta; const exit = (max - origin) / delta;
        near = Math.max(near, Math.min(entry, exit)); far = Math.min(far, Math.max(entry, exit));
        if (near > far) return false;
      }
    }
    return true;
  });
}

/** Small fixed grid used only when a chase is obstructed. Coordinates are feet. */
export class NavigationGrid {
  private readonly step = 8;
  private readonly columns: number;
  private readonly rows: number;
  private readonly open: Uint8Array;

  constructor(private readonly zone: ZoneDefinition, private readonly clearance: number) {
    this.columns = Math.ceil(zone.width / this.step);
    this.rows = Math.ceil(zone.height / this.step);
    this.open = new Uint8Array(this.columns * this.rows);
    for (let id = 0; id < this.open.length; id++) {
      const point = this.point(id);
      this.open[id] = Number(point.x >= 18 + clearance && point.y >= 18 + clearance && point.x <= zone.width - 18 - clearance
        && point.y <= zone.height - 18 - clearance && !segmentBlocked(point, point, zone.obstacles, clearance));
    }
  }

  route(from: Point, to: Point): Point[] {
    if (!segmentBlocked(from, to, this.zone.obstacles, this.clearance)) return [to];
    const start = this.nearest(from); const goal = this.nearest(to);
    if (start === null || goal === null) return [];
    const parents = new Int32Array(this.open.length).fill(-1);
    const queue = new Int32Array(this.open.length);
    queue[0] = start; parents[start] = start;
    let head = 0; let tail = 1;
    while (head < tail && parents[goal] === -1) {
      const current = queue[head++];
      for (const next of [current + 1, current - 1, current + this.columns, current - this.columns]) {
        if (next < 0 || next >= this.open.length || !this.open[next] || parents[next] !== -1
          || Math.abs(next % this.columns - current % this.columns) > 1) continue;
        parents[next] = current; queue[tail++] = next;
      }
    }
    if (parents[goal] === -1) return [];
    const path: Point[] = [];
    for (let id = goal; id !== start; id = parents[id]) path.unshift(this.point(id));
    // Include a nearby open start when the actor spawned between grid cells.
    path.unshift(this.point(start));
    return path;
  }

  private nearest(point: Point): number | null {
    const column = Math.round(point.x / this.step); const row = Math.round(point.y / this.step);
    for (let radius = 0; radius <= 6; radius++) {
      let best: number | null = null; let distance = Infinity;
      for (let y = row - radius; y <= row + radius; y++) for (let x = column - radius; x <= column + radius; x++) {
        if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) continue;
        const id = y * this.columns + x;
        if (!this.open[id]) continue;
        const target = this.point(id); const length = Math.hypot(target.x - point.x, target.y - point.y);
        if (length < distance) { best = id; distance = length; }
      }
      if (best !== null) return best;
    }
    return null;
  }

  private point(id: number): Point { return { x: id % this.columns * this.step, y: Math.floor(id / this.columns) * this.step }; }
}
