import type { Fixture } from '../map';
import type { Context } from './primitives';
import { line, oval } from './primitives';
export type ComponentFrame = { tick:number; progress:number; active:boolean; occupied:boolean; on:boolean; reducedMotion:boolean; nearby:boolean; openness:number };
export type Pose = { y?:number; angle?:number; scale?:number };
export function spring(frame:ComponentFrame) {return frame.active&&!frame.reducedMotion?Math.sin(frame.progress*Math.PI*5)*Math.exp(-frame.progress*5):0;}
export function shimmer(c:Context,f:Fixture,frame:ComponentFrame,color='#f7e7bc') {
  if(!frame.active)return;c.save();c.globalAlpha=Math.sin(Math.PI*frame.progress);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,dx=Math.cos(a)*(frame.reducedMotion?24:20+frame.progress*40),dy=Math.sin(a)*(frame.reducedMotion?14:12+frame.progress*26);oval(c,f.x+f.w/2+dx,f.y-7+dy,2.5,2.5,color);}
  c.restore();
}
export function steam(c:Context,x:number,y:number,frame:ComponentFrame) {
  if(!frame.active||frame.reducedMotion)return;c.save();c.strokeStyle='#fff7e1';c.lineWidth=2;c.globalAlpha=Math.sin(Math.PI*frame.progress)*.7;
  for(let i=0;i<3;i++){const height=frame.progress*50;c.beginPath();c.moveTo(x+(i-1)*10,y-height);c.bezierCurveTo(x+(i-1)*10-9,y-height-8,x+(i-1)*10+9,y-height-16,x+(i-1)*10,y-height-26);c.stroke();}c.restore();
}
export function pulse(c:Context,f:Fixture,frame:ComponentFrame,color:string) {if(!frame.active)return;c.save();c.globalAlpha=(1-frame.progress)*.7;line(c,f.x+8,f.y+f.h+8,f.x+f.w-8,f.y+f.h+8,color,3);c.restore();}
