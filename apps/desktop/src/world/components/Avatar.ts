import type { Avatar } from '../../types';
function box(c: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string) { c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();} }
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}


export function drawAvatar(c: CanvasRenderingContext2D, avatar: Avatar, x:number, y:number, options: { moving?:boolean; direction?:string; tick?:number; selected?:boolean; seated?:boolean } = {}) {
  const { moving=false,direction='down',tick=0,selected=false,seated=false }=options;
  c.save();c.translate(x,y);if(direction==='left')c.scale(-1,1);
  const step=moving?Math.sin(tick/75)*5:0;const bob=moving?Math.abs(Math.sin(tick/75))*2:Math.sin(tick/500)*.8;
  ellipse(c,2,5,24,9,'#182b4428');
  ellipse(c,0,3,18,6,'#182b4422');
  if(selected){ellipse(c,0,4,30,12,'#b8a0eb24');c.beginPath();c.ellipse(0,4,30,12,0,0,Math.PI*2);c.strokeStyle='#ab8bfa';c.lineWidth=2.5;c.stroke();}
  c.translate(0,-bob);
  box(c,-15,-15+step,11,seated?10:19,4,'#2f3655');box(c,4,-15-step,11,seated?10:19,4,'#2f3655');
  box(c,-17,3+step,15,7,3,'#ccc6c7');box(c,3,3-step,15,7,3,'#ccc6c7');
  box(c,-17,1+step,15,7,3,'#faf3e8');box(c,3,1-step,15,7,3,'#faf3e8');
  box(c,-19,-40,38,29,11,avatar.shirt);
  const fabric=c.createLinearGradient(-19,-40,19,-11);fabric.addColorStop(0,'#ffffff20');fabric.addColorStop(1,'#28304720');
  c.fillStyle=fabric;c.beginPath();c.roundRect(-19,-40,38,29,11);c.fill();
  box(c,-24,-35-step/2,9,23,4,avatar.skin);box(c,15,-35+step/2,9,23,4,avatar.skin);
  box(c,-25,-36-step/2,11,10,4,avatar.shirt);box(c,14,-36+step/2,11,10,4,avatar.shirt);
  box(c,-13,-17,26,2,1,'#ffffff20');
  box(c,-6,-44,12,10,4,avatar.skin);
  if(avatar.style==='long')box(c,-23,-72,46,44,12,avatar.hair);
  ellipse(c,-20,-49,4,6,avatar.skin);ellipse(c,20,-49,4,6,avatar.skin);
  box(c,-20,-67,40,34,12,avatar.skin);
  box(c,-17,-44,34,10,6,'#965b4420');
  if(direction==='up')box(c,-22,-72,44,37,12,avatar.hair);
  else {
    box(c,-22,-73,44,17,10,avatar.hair);box(c,-22,-64,8,17,3,avatar.hair);
    box(c,-13,-70,27,3,2,'#ffffff17');
    if(avatar.style==='curly') for(let i=0;i<5;i++)ellipse(c,-17+i*8,-68-(i%2)*4,9,9,avatar.hair);
    if(avatar.style==='long'){box(c,15,-64,8,30,4,avatar.hair);box(c,-23,-64,8,30,4,avatar.hair);}
    const offset=direction==='right'?5:0;
    ellipse(c,-7+offset,-48,2.2,3,'#2c2436');ellipse(c,8+offset,-48,2.2,3,'#2c2436');
    ellipse(c,-7.5+offset,-49,0.7,0.8,'#fff8e6');ellipse(c,7.5+offset,-49,0.7,0.8,'#fff8e6');
    ellipse(c,-12+offset,-42,3.5,2,'#d3827d35');ellipse(c,13+offset,-42,3.5,2,'#d3827d35');
    c.strokeStyle='#9e605b';c.lineWidth=2;c.beginPath();c.arc(1+offset,-43,4,0,Math.PI);c.stroke();
  }
  c.beginPath();c.arc(0,-39,7,0,Math.PI);c.strokeStyle='#ffffff40';c.lineWidth=2;c.stroke();
  box(c,8,-27,7,8,2,'#ffffff21');c.restore();
}

