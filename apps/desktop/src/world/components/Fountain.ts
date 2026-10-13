import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { oval, surface } from './primitives';
export function drawFountain(c:Context,f:Fixture) {
  surface(c,f.x,f.y,f.w,f.h,65,'#c8d4c0','#7a9b88');
  oval(c,f.x+f.w/2,f.y+f.h/2,f.w*.43,f.h*.4,'#6d9e9d');
  oval(c,f.x+f.w/2,f.y+f.h/2,f.w*.38,f.h*.34,'#94c4ba');
  oval(c,f.x+f.w/2,f.y+f.h*.38,24,16,'#e8e2c8');
  oval(c,f.x+f.w/2,f.y+f.h*.37,14,9,'#77a6a7');
}
export function animateFountain(c:Context,f:Fixture,frame:ComponentFrame) {
  c.save();c.strokeStyle='#e9f6e1';c.lineWidth=2;
  const time=frame.reducedMotion?0:frame.tick/1300;
  for(let i=0;i<3;i++){const wave=(time+i/3)%1;c.globalAlpha=(1-wave)*.5;c.beginPath();c.ellipse(f.x+f.w/2,f.y+f.h/2,24+wave*65,12+wave*35,0,0,Math.PI*2);c.stroke();}
  if(frame.active&&!frame.reducedMotion){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(c,f.x+f.w/2+Math.cos(a)*frame.progress*60,f.y+f.h*.4-Math.sin(frame.progress*Math.PI)*50+Math.sin(a)*20,3,5,'#d3f3eb');}}
  c.restore();
}
