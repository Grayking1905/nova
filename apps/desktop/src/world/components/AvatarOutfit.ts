import type { Avatar } from '../../types';
import type { AvatarPose } from './AvatarMotion';
import { capsule, material, oval, stroke } from './AvatarPaint';

export function drawOutfitDetails(c:CanvasRenderingContext2D,avatar:Avatar,p:AvatarPose){
  const outfit=avatar.outfit||'crew';c.save();
  if(outfit==='hoodie'){
    c.beginPath();c.ellipse(0,-47,13,8,0,0,Math.PI);c.strokeStyle='#00000024';c.lineWidth=5;c.stroke();
    c.globalAlpha=1-p.back;stroke(c,[[-5,-44],[-6,-33]],'#f6eddb',1.5);stroke(c,[[5,-44],[6,-33]],'#f6eddb',1.5);
    capsule(c,-10,-29,20,7,3,'#00000015');
  }else if(outfit==='blazer'||outfit==='jacket'){
    c.globalAlpha=1-p.back;material(c,-7,-45,14,24,2,'#f2ead7',.04);
    for(const side of [-1,1]){c.beginPath();c.moveTo(side*7,-48);c.lineTo(side*15,-38);c.lineTo(side*9,-34);c.lineTo(side*5,-23);c.lineTo(side*3,-41);c.closePath();c.fillStyle='#ffffff35';c.fill();}
    if(outfit==='blazer'){for(const y of [-32,-25])oval(c,2,y,1.3,1.3,'#e1cf9d');}
    else{stroke(c,[[0,-42],[0,-21]],'#535568',1);capsule(c,-14,-32,8,5,1,'#00000020');capsule(c,6,-32,8,5,1,'#00000020');}
  }else if(outfit==='overalls'){
    material(c,-12,-35,24,18,4,avatar.pants||'#3b435e',.12);
    for(const side of [-1,1]){capsule(c,side*9-2,-48,4,20,2,avatar.pants||'#3b435e');oval(c,side*9,-34,1.8,1.8,'#e0c897');}
    c.globalAlpha=1-p.back;capsule(c,-6,-31,12,8,2,'#ffffff22');
  }else if(outfit==='dress'){
    c.beginPath();c.moveTo(-15,-29);c.lineTo(-24,-8+p.seat*4);c.quadraticCurveTo(0,-3+p.seat*4,24,-8+p.seat*4);c.lineTo(15,-29);c.closePath();c.fillStyle=avatar.shirt;c.fill();
    stroke(c,[[-14,-27],[14,-27]],'#fff0cb',2);for(const x of [-13,0,13])stroke(c,[[x*.55,-23],[x,-10+p.seat*3]],'#ffffff28',1);
    c.globalAlpha=1-p.back;oval(c,0,-28,3,2,'#e6c88f');
  }
  c.restore();
}
