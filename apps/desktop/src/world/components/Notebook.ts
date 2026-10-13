import type { Context } from './primitives';
import { rect, line } from './primitives';

export function drawNotebook(c: Context, x: number, y: number, color: string, angle = -.1) {
  c.save(); c.translate(x, y); c.rotate(angle);
  rect(c, 1, 3, 28, 35, 3, '#3d394528');
  rect(c, 0, 0, 28, 35, 3, color);
  line(c, 5, 1, 5, 34, '#ffffff55', 2);
  rect(c, 9, 8, 12, 3, 1, '#ffffff7d');
  c.restore();
}
