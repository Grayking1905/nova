import type { Fixture } from '../map';
import type { Context } from './primitives';
import type { ComponentFrame } from './animation';
import { rect, line } from './primitives';
export function drawDoor(c:Context,f:Fixture) {
  rect(c,f.x,f.y,f.w,f.h,3,'#dedaca');
  line(c,f.x+6,f.y+f.h/2,f.x+f.w-6,f.y+f.h/2,'#bcaf94',2);
  rect(c,f.x,f.y-3,6,f.h+6,2,'#aa9679');rect(c,f.x+f.w-6,f.y-3,6,f.h+6,2,'#aa9679');
}
export function animateDoor(c:Context,f:Fixture,frame:ComponentFrame) {
  // Flush sliding glass: the opening stays walkable while the leaves retract.
  const amount=.12+frame.openness*.8;
  const panel=(f.w/2-8)*(1-amount);
  rect(c,f.x+7,f.y+2,panel,f.h-4,2,'#b7d5d175','#f2f9e855');
  rect(c,f.x+f.w-7-panel,f.y+2,panel,f.h-4,2,'#b7d5d175','#f2f9e855');
}
