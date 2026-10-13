import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { surface, rect, oval, text, line } from './primitives';
import { shimmer, spring } from './animation';
export function drawArcade(c:Context,f:Fixture) {
  surface(c,f.x+4,f.y+30,f.w-8,f.h-30,9,'#9f81a8','#6c5379');
  surface(c,f.x,f.y,f.w,60,8,'#b699bf','#735b86');
  rect(c,f.x+10,f.y+10,f.w-20,37,5,'#2d354c');
  for(let i=0;i<3;i++)rect(c,f.x+17+i*20,f.y+20,13,13,3,['#dac48b','#ad91cf','#87b9aa'][i]);
  text(c,'PLAY / PAUSE',f.x+f.w/2,f.y+56,7,'#f9e6ef',700);
  rect(c,f.x+6,f.y+64,f.w-12,25,5,'#c4a4cc');
  line(c,f.x+25,f.y+78,f.x+25,f.y+66,'#756181',3);oval(c,f.x+25,f.y+66,6,6,'#e0b4bb');
  oval(c,f.x+60,f.y+75,5,5,'#e6d29b');oval(c,f.x+72,f.y+80,5,5,'#9cbdab');
  rect(c,f.x+f.w/2-12,f.y+99,24,4,2,'#5a4468');
}
export function animateArcade(c:Context,f:Fixture,frame:ComponentFrame){shimmer(c,f,frame,'#e9d2a0');if(frame.active)rect(c,f.x+10,f.y+10,f.w-20,37,5,`rgba(209,176,242,${Math.sin(frame.progress*Math.PI)*.35})`);}
export function poseArcade(frame:ComponentFrame){return {y:spring(frame)*-4};}
