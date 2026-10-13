import type { Context } from './primitives';
import { oval } from './primitives';

export function drawCup(c: Context, x: number, y: number, color = '#faf3e6') {
  oval(c, x + 2, y + 4, 11, 7, '#55433325');
  oval(c, x + 8, y, 5, 4, color);
  oval(c, x, y, 9, 9, color);
  oval(c, x, y, 5.5, 5.5, '#795947');
  c.beginPath(); c.arc(x - 1, y - 1, 3, Math.PI, Math.PI * 1.8);
  c.strokeStyle = '#c09a70'; c.lineWidth = 1.3; c.stroke();
}
