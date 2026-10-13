import type { Context } from './primitives';
import { AUDIO_RADIUS, zoneAt } from '../map';
export function drawConversationRange(c:Context,x:number,y:number,presentationZone?:string) {
  const zone=zoneAt(x,y);
  c.save();c.strokeStyle='#9e88ec35';c.lineWidth=2;c.setLineDash([8,9]);
  if(zone){c.beginPath();c.rect(zone.x+18,zone.y+18,zone.w-36,zone.h-36);c.clip();}
  c.beginPath();
  if(zone&&(zone.audio==='room'||zone.id===presentationZone))c.roundRect(zone.x+25,zone.y+25,zone.w-50,zone.h-50,14);
  else c.arc(x,y,AUDIO_RADIUS,0,Math.PI*2);
  c.stroke();c.restore();
}
