import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { surface, rect, oval, line, text } from './primitives';
import { shimmer } from './animation';
export function drawNoticeboard(c:Context,f:Fixture) {
  surface(c,f.x,f.y,f.w,f.h,7,'#bc9f80','#8c735a');
  rect(c,f.x+6,f.y+6,f.w-12,f.h-12,4,'#d7bc97');
  text(c,f.id==='hub-directory'?'CAMPUS / 09':'TEAM MOMENTS',f.x+f.w/2,f.y+18,7,'#866a51');
  for(let i=0;i<4;i++){const x=f.x+14+(i%2)*(f.w/2-10),y=f.y+28+Math.floor(i/2)*(f.h/2-13);rect(c,x,y,f.w/2-21,f.h/2-23,2,['#f4e4bf','#d8c7e3','#c5d8bf','#f1d0bd'][i]);oval(c,x+(f.w/2-21)/2,y+4,2,2,'#a38565');line(c,x+6,y+13,x+f.w/2-29,y+13,'#947c643e');}
}
export function animateNoticeboard(c:Context,f:Fixture,frame:ComponentFrame){shimmer(c,f,frame);}
