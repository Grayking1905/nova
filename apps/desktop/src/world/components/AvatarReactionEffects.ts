import type { AvatarPose } from './AvatarMotion';
import { capsule, oval, stroke } from './AvatarPaint';

export function drawAvatarReactionEffects(c:CanvasRenderingContext2D,p:AvatarPose,reduced:boolean){
  const t=p.gestureTime;
  if(p.coffee>.1){c.save();c.globalAlpha=p.coffee;capsule(c,9,-49,12,14,3,'#fff1d5');c.beginPath();c.arc(22,-43,4,-Math.PI/2,Math.PI/2);c.strokeStyle='#fff1d5';c.lineWidth=2;c.stroke();if(!reduced)for(let i=0;i<2;i++)stroke(c,[[12+i*5,-54],[11+i*5+Math.sin(t/180+i)*2,-60],[13+i*5,-66]],'#fff9e4aa',1);c.restore();}
  if(p.heart>.1){c.save();c.globalAlpha=p.heart;c.font='16px "Segoe UI Emoji"';c.textAlign='center';for(let i=0;i<3;i++){const age=reduced?i*.2:((t/1500+i*.3)%1);c.fillText('♥',-24+i*24+Math.sin(age*4)*4,-92-age*24);}c.restore();}
  if(p.celebrate>.15&&!reduced){c.save();c.globalAlpha=p.celebrate*.8;for(let i=0;i<9;i++){const a=i*.9+t/800,r=18+(t%900)/45;c.fillStyle=['#d5ccef','#a9cbb7','#e5c9ad','#d6b9b1'][i%4];c.fillRect(Math.cos(a)*r,-94+Math.sin(a)*r*.45,3,5);}c.restore();}
  if(p.sleep>.2){c.save();c.globalAlpha=p.sleep;c.fillStyle='#9f89c2';c.font='bold 12px "Segoe UI"';c.fillText('z',24,-89-(reduced?0:Math.sin(t/400)*4));c.font='bold 9px "Segoe UI"';c.fillText('z',33,-100);c.restore();}
  if(p.surprise>.2){c.save();c.globalAlpha=p.surprise;stroke(c,[[-29,-94],[-35,-100]],'#d4b06e',2);stroke(c,[[29,-94],[35,-100]],'#d4b06e',2);oval(c,0,-108,1.5,1.5,'#d4b06e');c.restore();}
}
