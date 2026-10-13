import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { oval, line, rect } from './primitives';
export function drawLamp(c:Context,f:Fixture) {
  oval(c,f.x+f.w/2+4,f.y+f.h+5,22,9,'#34423526');
  oval(c,f.x+f.w/2,f.y+f.h-4,19,8,'#9c886b');
  line(c,f.x+f.w/2,f.y+f.h-9,f.x+f.w/2,f.y+14,'#8a795f',5);
  rect(c,f.x+2,f.y,f.w-4,24,9,'#e9d9b9','#b6a184');
  line(c,f.x+8,f.y+20,f.x+f.w-8,f.y+20,'#fff2d4',2);
}
export function animateLamp(c:Context,f:Fixture,frame:ComponentFrame) {
  if(!frame.on)return;
  const light=c.createRadialGradient(f.x+f.w/2,f.y+f.h,0,f.x+f.w/2,f.y+f.h,94);
  light.addColorStop(0,'#fff0b447');light.addColorStop(1,'#fff0b400');
  oval(c,f.x+f.w/2,f.y+f.h,94,55,light);
}
