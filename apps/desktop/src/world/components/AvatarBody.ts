import type { Avatar } from '../../types';
import type { AvatarPose } from './AvatarMotion';
import type { AvatarContext } from './AvatarPaint';
import { capsule, oval, material, stroke } from './AvatarPaint';

export function drawAvatarLegs(c:AvatarContext,p:AvatarPose) {
  const stride=Math.sin(p.phase)*p.walk;
  for(const side of [-1,1]) {
    const swing=stride*side;
    c.save();c.translate(side*(8+p.seat*2),-24+p.seat*3);
    c.rotate(swing*.16*(1-p.seat)+side*p.seat*.2);
    material(c,-5.7,0,11.4,22-p.seat*7,4,'#3b435e',.16);
    stroke(c,[[-2,5],[-2,16-p.seat*5]],'#78849a30',1.4);
    if(p.seat>.01){c.save();c.globalAlpha=p.seat;oval(c,side*1.5,8,5.5,4.5,'#4b526b');stroke(c,[[-3,9],[3,10]],'#7c859a45');c.restore();}
    const footY=21+swing*5*(1-p.seat)-p.seat*3;
    const lift=Math.max(0,swing)*3;
    c.save();c.translate(p.facing*2,footY-lift);c.rotate(-Math.max(0,swing)*.1+side*p.seat*.1);
    capsule(c,-7.5,0,16.5,8,4,'#bfc4c9');
    material(c,-7.5,-3,16.5,8,4,'#f7f1e6',.1);
    capsule(c,-4,-2,8,2,1,'#d3d6d7');
    stroke(c,[[-2,0],[3,0]],'#9ba4ad',.8);stroke(c,[[-2,2],[3,2]],'#9ba4ad',.8);
    c.restore();c.restore();
  }
}

export function drawAvatarArm(c:AvatarContext,avatar:Avatar,p:AvatarPose,side:number,front:boolean) {
  const wavingSide=p.facing<-.25?-1:1;
  const raised=side===wavingSide?Math.max(p.raised,p.wave):0;
  const waving=p.wave*Math.sin(p.gestureTime/115)*.17;
  const walkSwing=Math.sin(p.phase+(side===1?Math.PI:0))*.28*p.walk;
  const clap=p.clap*(.78+.22*Math.sin(p.gestureTime/90));
  c.save();c.translate(side*17,-46);
  c.rotate(walkSwing-side*(raised*2.65+p.celebrate*2.45)+waving+side*clap*.45);
  // Shoulder, elbow and wrist share pivots, keeping the hands attached through gestures.
  material(c,-5,3,10,17,5,avatar.skin,.1);
  material(c,-7,-1,14,12,5,avatar.shirt,.14);
  stroke(c,[[-5,8],[5,8]],'#ffffff24');
  c.translate(0,17);c.rotate(side*clap*1.2+(front?side*p.seat*.4:side*p.seat*.15));
  material(c,-4.5,-2,9,14,4,avatar.skin,.08);
  c.translate(0,13);c.rotate(waving*.65);
  oval(c,0,0,5.5,6,avatar.skin);oval(c,side*4,-2,2.5,3.5,avatar.skin);
  if(raised>.3||p.celebrate>.3){for(let i=0;i<3;i++)capsule(c,-4+i*3,2,2.1,5,1,avatar.skin);}
  stroke(c,[[-2,3],[2,3]],'#85534424');
  c.restore();
}

export function drawAvatarTorso(c:AvatarContext,avatar:Avatar,p:AvatarPose) {
  material(c,-18,-48,36,29,11,avatar.shirt,.19);
  capsule(c,-7,-55,14,12,5,avatar.skin);
  c.save();c.globalAlpha=1-p.back;
  // Knit collar and shirt pocket, with one small Nova stitch.
  c.beginPath();c.arc(0,-47,7,0,Math.PI);c.strokeStyle='#ffffff66';c.lineWidth=2.5;c.stroke();
  capsule(c,7,-35,8,9,2,'#ffffff1d');stroke(c,[[8,-33],[13,-33]],'#ffffff52');
  oval(c,11,-29,1.2,1.2,'#eee5d5a0');
  c.restore();
  c.save();c.globalAlpha=p.back;stroke(c,[[-8,-41],[8,-41]],'#ffffff23',1.5);c.restore();
  stroke(c,[[-12,-22],[12,-22]],'#ffffff25',1.5);
}
