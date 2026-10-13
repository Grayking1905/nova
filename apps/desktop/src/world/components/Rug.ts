import type { Context } from './primitives';
import { rect, line } from './primitives';

export function drawRug(c: Context, x: number, y: number, w: number, h: number, color: string, edge: string, rounded = 20) {
  rect(c, x, y + 3, w, h, rounded, '#3d3e4520');
  rect(c, x, y, w, h, rounded, color, edge);
  c.save();
  c.beginPath(); c.roundRect(x + 5, y + 5, w - 10, h - 10, Math.max(2, rounded - 5)); c.clip();
  for (let row = y + 10; row < y + h; row += 7) line(c, x + 7, row, x + w - 7, row, '#ffffff14');
  c.restore();
  rect(c, x + 10, y + 10, w - 20, h - 20, Math.max(2, rounded - 8), '#ffffff00', '#ffffff38');
}
