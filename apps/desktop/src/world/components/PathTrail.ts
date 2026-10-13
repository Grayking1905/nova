import type { Context } from './primitives';
import { oval } from './primitives';
export function drawPathTrail(c:Context,origin:{x:number;y:number},path:{x:number;y:number}[]) {
  if(!path.length)return;
  c.save();c.beginPath();c.moveTo(origin.x,origin.y);for(const p of path)c.lineTo(p.x,p.y);
  c.strokeStyle='#8b73d980';c.lineWidth=4;c.setLineDash([4,9]);c.stroke();c.setLineDash([]);
  const destination=path[path.length-1];
  oval(c,destination.x,destination.y,17,9,'#9d83d82a');
  c.beginPath();c.ellipse(destination.x,destination.y,17,9,0,0,Math.PI*2);c.strokeStyle='#9d83d8';c.lineWidth=2;c.stroke();
  oval(c,destination.x,destination.y,3,3,'#8a70bc');c.restore();
}
