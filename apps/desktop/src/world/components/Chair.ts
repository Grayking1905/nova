import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, line, surface } from './primitives';
import type { Fixture } from '../map';

export function drawChair(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  oval(c, x + w / 2 + 3, y + h + 7, w / 2 + 3, 9, '#2c39432a');
  // Five-point base and upholstered seat with stitched seams.
  const cx = x + w / 2, cy = y + h - 1;
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const ex = cx + Math.cos(a) * 20, ey = cy + Math.sin(a) * 10;
    line(c, cx, cy, ex, ey, '#526476', 3);
    oval(c, ex, ey + 2, 3, 2.5, '#3c495b');
  }
  surface(c, x + 3, y + 9, w - 6, h - 9, 11, '#879db6', '#536c87');
  rect(c, x + 8, y + 16, w - 16, h - 22, 6, '#93a7bc');
  line(c, x + 12, y + h - 10, x + w - 12, y + h - 10, '#b8c9d3', 1.5);
  surface(c, x + 1, y, w - 2, 18, 7, '#a7b9c8', '#6f87a0');
  rect(c, x + 8, y + 4, w - 16, 7, 3, '#b9c8d2');
  rect(c, x - 2, y + 17, 7, h - 23, 3, '#566c82');
  rect(c, x + w - 5, y + 17, 7, h - 23, 3, '#566c82');
}

export function animateChair(c:Context,f:Fixture,frame:ComponentFrame) { if(frame.occupied)oval(c,f.x+f.w/2,f.y+f.h+9,4,2,'#bb9ce8');shimmer(c,f,frame,'#d6c7eb'); }
export function poseChair(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0.04};}
