import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { rect, line, surface } from './primitives';
import type { Fixture } from '../map';

export function drawSofa(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  const color = f.color || '#bd8379';
  rect(c, x + 14, y + h, 12, 12, 3, '#806f65');
  rect(c, x + w - 26, y + h, 12, 12, 3, '#806f65');
  surface(c, x, y + 5, w, h - 5, 14, color, '#455750');
  rect(c, x + 6, y, w - 12, 24, 10, color);
  rect(c, x + 12, y + 4, w - 24, 13, 7, '#ffffff25');
  const sw = (w - 46) / 3;
  for (let i = 0; i < 3; i++) {
    rect(c, x + 20 + i * (sw + 3), y + 27, sw, h - 39, 8, '#ffffff18', '#2338321c');
    line(c, x + 26 + i * (sw + 3), y + h - 17, x + 14 + (i + 1) * (sw + 3), y + h - 17, '#ffffff25');
  }
  surface(c, x - 3, y + 10, 21, h - 20, 8, color, '#35493b30');
  surface(c, x + w - 18, y + 10, 21, h - 20, 8, color, '#35493b30');
  for (const [px, angle, cushion] of [[x + 39, -.15, '#e8dcc0'], [x + w - 60, .18, f.id === 'garden-bench' ? '#a4bc94' : '#d0afb6']] as const) {
    c.save(); c.translate(px, y + 31); c.rotate(angle);
    rect(c, 1, 4, 27, 27, 5, '#293c3327');
    rect(c, 0, 0, 27, 27, 5, cushion, '#ffffff55');
    line(c, 6, 5, 6, 22, '#ffffff40');
    c.restore();
  }
  // A folded throw on the end of the couch.
  rect(c, x + w - 98, y + 37, 26, 36, 3, '#dfd1b8a0');
  for (let i = 0; i < 4; i++) line(c, x + w - 94 + i * 6, y + 41, x + w - 94 + i * 6, y + 70, '#fff4dd55');
}

export function animateSofa(c:Context,f:Fixture,frame:ComponentFrame) { shimmer(c,f,frame,'#f3ddc4'); }
export function poseSofa(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
