import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { rect, line, text, surface } from './primitives';
import { shimmer, spring } from './animation';
export function drawPodium(c:Context,f:Fixture) {
  surface(c,f.x+5,f.y+23,f.w-10,f.h-23,9,'#b8a3c9','#87709b');
  for(let i=0;i<5;i++)line(c,f.x+17+i*10,f.y+36,f.x+17+i*10,f.y+f.h-8,'#d4c3df',2);
  surface(c,f.x,f.y,f.w,32,8,'#e5d6ec','#ab96b9');
  rect(c,f.x+14,f.y+6,31,18,3,'#525068');
  line(c,f.x+55,f.y+13,f.x+58,f.y-9,'#696473',3);
  rect(c,f.x+55,f.y-13,7,8,3,'#34364b');
  text(c,'n',f.x+f.w/2,f.y+f.h-12,19,'#eee4f5',800);
}
export function animatePodium(c:Context,f:Fixture,frame:ComponentFrame){shimmer(c,f,frame,'#d4baf2');}
export function posePodium(frame:ComponentFrame){return {y:spring(frame)*-3};}
