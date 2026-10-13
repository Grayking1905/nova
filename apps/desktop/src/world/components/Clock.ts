import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { oval, line } from './primitives';
import { shimmer } from './animation';
export function drawClock(c:Context,f:Fixture) {
  oval(c,f.x+f.w/2+2,f.y+f.h/2+5,f.w/2,f.h/2,'#56605225');
  oval(c,f.x+f.w/2,f.y+f.h/2,f.w/2,f.h/2,'#ad967a');
  oval(c,f.x+f.w/2,f.y+f.h/2,f.w/2-4,f.h/2-4,'#f7f0df');
  for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,f.x+f.w/2+Math.cos(a)*21,f.y+f.h/2+Math.sin(a)*21,f.x+f.w/2+Math.cos(a)*24,f.y+f.h/2+Math.sin(a)*24,'#ae9c85',1.5);}
}
export function animateClock(c:Context,f:Fixture,frame:ComponentFrame) {
  const now=new Date(),cx=f.x+f.w/2,cy=f.y+f.h/2;
  const hand=(a:number,len:number,color:string,width:number)=>line(c,cx,cy,cx+Math.sin(a)*len,cy-Math.cos(a)*len,color,width);
  hand((now.getHours()%12+now.getMinutes()/60)*Math.PI/6,14,'#776655',3);
  hand(now.getMinutes()*Math.PI/30,20,'#776655',2);
  if(!frame.reducedMotion)hand(now.getSeconds()*Math.PI/30,21,'#ac8394',1);
  oval(c,cx,cy,2.5,2.5,'#aa8c73');shimmer(c,f,frame);
}
