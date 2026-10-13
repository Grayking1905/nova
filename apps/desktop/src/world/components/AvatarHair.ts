import type { Avatar } from '../../types';
import type { AvatarPose } from './AvatarMotion';
import type { AvatarContext } from './AvatarPaint';
import { capsule, oval, material, stroke } from './AvatarPaint';

export function drawHairBack(c:AvatarContext,avatar:Avatar,p:AvatarPose) {
  if(avatar.style!=='long')return;
  c.save();c.translate(0,-66);c.rotate(p.hairSway);
  material(c,-24,-26,48,60,19,avatar.hair,.2);
  capsule(c,-17,8,34,23,10,'#00000012');
  stroke(c,[[-17,-10],[-19,9],[-16,26]],'#ffffff15',1.5);
  stroke(c,[[17,-10],[19,9],[16,26]],'#ffffff12',1.5);
  c.restore();
}

export function drawHairFront(c:AvatarContext,avatar:Avatar,p:AvatarPose) {
  c.save();c.translate(p.facing*2,-72);c.rotate(p.hairSway*.55);
  if(p.back>.02) {
    c.save();c.globalAlpha=p.back;
    material(c,-22,-20,44,42,18,avatar.hair,.16);
    stroke(c,[[-11,-8],[1,-13],[12,-8]],'#ffffff19',2);
    if(avatar.style==='curly')for(let i=0;i<7;i++)oval(c,-17+i*5.5,-16-(i%2)*3,7.5,8,avatar.hair);
    c.restore();
  }
  c.save();c.globalAlpha=1-p.back;
  if(avatar.style==='curly') {
    for(const [x,y,r] of [[-16,-12,9],[-7,-18,10],[5,-19,10],[15,-13,9],[-19,-1,7],[19,-1,7]]) {
      oval(c,x,y,r,r,avatar.hair);oval(c,x-2,y-3,r*.45,r*.3,'#ffffff13');
    }
  } else {
    // An asymmetric swept fringe and tapered side locks give each style a silhouette.
    c.beginPath();c.moveTo(-22,-4);c.bezierCurveTo(-26,-27,13,-28,22,-13);c.bezierCurveTo(25,-3,15,3,10,-1);
    c.bezierCurveTo(7,-10,-4,-10,-13,-3);c.lineTo(-18,8);c.lineTo(-22,4);c.closePath();c.fillStyle=avatar.hair;c.fill();
    stroke(c,[[-13,-16],[-3,-20],[9,-19]],'#ffffff20',2.5);
    if(avatar.style==='long'){
      material(c,-23,-3,8,32,4,avatar.hair,.12);material(c,15,-2,9,32,4,avatar.hair,.14);
    } else {capsule(c,-22,-3,7,17,3,avatar.hair);capsule(c,16,-4,6,11,3,avatar.hair);}
  }
  c.restore();c.restore();
}
