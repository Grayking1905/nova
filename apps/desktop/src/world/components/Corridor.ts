import type { Context } from './primitives';
import { rect, line, text } from './primitives';
import { WORLD } from '../map';
export function drawCorridors(c:Context) {
  for(const y of [795,1635,2470]) {
    rect(c,60,y,WORLD.width-120,100,18,'#c9d1c7');
    line(c,80,y+8,WORLD.width-80,y+8,'#eef0e5',2);
    line(c,80,y+92,WORLD.width-80,y+92,'#a4b3a751',2);
    for(let x=140;x<WORLD.width-120;x+=230)rect(c,x,y+49,42,3,1,'#edf0e17a');
    text(c,y===795?'NORTH WING / PRESENT · CREATE · RECHARGE':y===1635?'SOUTH WING / MEET · BUILD · DISCOVER':'NOVA / MAKE ROOM FOR POSSIBILITY',1800,y+62,13,'#7c8b7d',700);
  }
}
