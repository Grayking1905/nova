import type { Avatar } from '../../types';
import type { AvatarPose } from './AvatarMotion';
import type { AvatarContext } from './AvatarPaint';
import { oval, material, stroke } from './AvatarPaint';

export function drawAvatarFace(c:AvatarContext,avatar:Avatar,p:AvatarPose) {
  c.save();c.translate(p.facing*2,-68);
  const profile=Math.abs(p.facing);
  oval(c,-20,1,4.5,6.5,avatar.skin);oval(c,20,1,4.5,6.5,avatar.skin);
  oval(c,-20,2,2,3,'#89594a2c');oval(c,20,2,2,3,'#89594a2c');
  material(c,-20,-22,40,39,16,avatar.skin,.13);
  oval(c,-6,-13,11,6,'#ffffff0b');
  c.save();c.globalAlpha=1-p.back;
  const look=p.facing*4;
  const blink=Math.max(.09,1-p.blink);
  const eye=(x:number,small=false)=>{
    const w=small?1.65:2.3;
    if(blink<.3)stroke(c,[[x-w-1,3],[x+w+1,3]],'#493847',1.7);
    else{oval(c,x,2,w+.65,3.9*blink,'#f7eddcc9');oval(c,x+p.facing*.4,2,w,3.3*blink,'#352c3e');oval(c,x-.55,1-blink,0.75,.9*blink,'#fff7e5');}
    stroke(c,[[x-3,-5],[x,-6],[x+3,-5]],'#46334285',1.3);
  };
  eye(-7+look,p.facing>.5);eye(8+look,p.facing<-.5);
  oval(c,-12+look,8,4,2.2,'#d5797a28');oval(c,13+look,8,4,2.2,'#d5797a28');
  oval(c,look+profile*3*Math.sign(p.facing),7,2,2.7,'#8a584323');
  c.beginPath();c.moveTo(-3+look,11);c.quadraticCurveTo(1+look,14+p.celebrate*3,5+look,10.5);c.strokeStyle='#784d50';c.lineWidth=1.6;c.lineCap='round';c.stroke();
  c.restore();c.restore();
}
