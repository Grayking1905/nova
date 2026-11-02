import type { Avatar } from '../../types';
import type { AvatarPose } from './AvatarMotion';
import { capsule, material, oval, stroke } from './AvatarPaint';

export function drawAvatarAccessories(c:CanvasRenderingContext2D,avatar:Avatar,p:AvatarPose) {
  const accessory=avatar.accessory||'none';if(accessory==='none')return;
  c.save();c.translate(p.facing*2,-70);
  if(accessory==='headphones'){
    c.beginPath();c.arc(0,-2,25,Math.PI,0);c.strokeStyle='#465367';c.lineWidth=5;c.stroke();
    material(c,-27,-5,8,20,4,'#e2d6bb',.14);material(c,19,-5,8,20,4,'#e2d6bb',.14);
    capsule(c,-28,0,5,12,2,avatar.shirt);capsule(c,23,0,5,12,2,avatar.shirt);
  }else if(accessory==='cap'){
    material(c,-24,-27,48,19,8,avatar.shirt,.18);
    capsule(c,-25,-12,50,6,3,avatar.shirt);c.save();c.globalAlpha=1-p.back;oval(c,8,-8,20,4,avatar.shirt);stroke(c,[[3,-25],[3,-13]],'#ffffff35');c.restore();
  }else if(accessory==='beanie'){
    material(c,-24,-30,48,24,13,avatar.shirt,.16);capsule(c,-25,-13,50,10,4,avatar.shirt);
    for(let x=-19;x<23;x+=5)stroke(c,[[x,-11],[x,-5]],'#ffffff35',1);
    oval(c,0,-32,6,6,avatar.shirt);
  }else{
    c.globalAlpha=1-p.back;const round=accessory==='round-glasses',look=p.facing*4;
    c.strokeStyle='#4a454b';c.lineWidth=1.7;
    for(const x of [-8,9]){c.beginPath();if(round)c.ellipse(x+look,4,7,7,0,0,Math.PI*2);else c.roundRect(x-7+look,-1,14,10,3);c.fillStyle='#bddce420';c.fill();c.stroke();}
    stroke(c,[[-1+look,3],[2+look,3]],'#4a454b',1.7);stroke(c,[[-23,0],[-15+look,2]],'#4a454b');stroke(c,[[16+look,2],[23,0]],'#4a454b');
  }
  c.restore();
}
