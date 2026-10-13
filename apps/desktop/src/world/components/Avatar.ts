import type { Avatar } from '../../types';
import type { AvatarPose, Facing } from './AvatarMotion';
import { drawAvatarLegs, drawAvatarArm, drawAvatarTorso } from './AvatarBody';
import { drawAvatarFace } from './AvatarFace';
import { drawHairBack, drawHairFront } from './AvatarHair';
import { oval } from './AvatarPaint';

export type AvatarDrawOptions = { moving?:boolean; direction?:Facing; tick?:number; selected?:boolean; seated?:boolean; hand?:boolean; pose?:AvatarPose };
export const AVATAR_HEIGHT=104;

export function drawAvatar(c:CanvasRenderingContext2D,avatar:Avatar,x:number,y:number,options:AvatarDrawOptions={}) {
  const tick=options.tick||0,direction=options.direction||'down';
  const p:AvatarPose=options.pose||{phase:tick/135,walk:Number(!!options.moving),seat:Number(!!options.seated),raised:Number(!!options.hand),wave:0,clap:0,celebrate:0,facing:direction==='left'?-1:direction==='right'?1:0,back:Number(direction==='up'),gestureTime:0,blink:0,breath:Math.sin(tick/720)*.65,lean:0,hairSway:0};
  const bounce=Math.abs(Math.sin(p.phase*2))*1.45*p.walk;
  const hop=Math.abs(Math.sin(p.gestureTime/140))*3*p.celebrate;
  c.save();c.translate(x,y);c.lineCap='round';c.lineJoin='round';
  oval(c,1,5,22-bounce*.6,7.5-bounce*.25,'#25374720');
  oval(c,0,4,15,4,'#25374716');
  if(options.selected){
    oval(c,0,5,29,11,'#ad94da18');c.beginPath();c.ellipse(0,5,28,10.5,0,0,Math.PI*2);c.strokeStyle='#ac8bdcbb';c.lineWidth=2;c.stroke();
    oval(c,-19,11,2.3,1.3,'#e9d8fa');oval(c,19,11,2.3,1.3,'#e9d8fa');
  }
  c.save();c.scale(1-Math.abs(p.facing)*.13,1);
  drawAvatarLegs(c,p);
  c.translate(0,p.seat*5+p.breath-bounce-hop);c.translate(0,-25);c.rotate(p.lean);c.translate(0,25);
  drawHairBack(c,avatar,p);
  const far=p.facing<-.2?1:-1;
  drawAvatarArm(c,avatar,p,far,false);
  drawAvatarTorso(c,avatar,p);
  drawAvatarFace(c,avatar,p);
  drawHairFront(c,avatar,p);
  drawAvatarArm(c,avatar,p,-far,true);
  // Both arms remain in front for clapping, while the back view retains its silhouette.
  if(p.clap>.15||p.celebrate>.15)drawAvatarArm(c,avatar,p,far,true);
  c.restore();c.restore();
}
