import type { Player } from '../../types';
import { drawAvatar } from './Avatar';
function box(c: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string) { c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();} }
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function label(c:CanvasRenderingContext2D,text:string,x:number,y:number,size:number,color:string,weight=600){c.font=`${weight} ${size}px "Segoe UI", sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}


export function drawPlayerLabel(c:CanvasRenderingContext2D,p:Player,me:boolean,_tick:number,bubble?:string){
  const name=p.name+(me?' · you':'');c.font='600 13px "Segoe UI"';const width=c.measureText(name).width+22;
  box(c,p.x-width/2,p.y+17,width,24,8,me?'#7862c9':'#263348e8');label(c,name,p.x,p.y+34,13,'#fff');

  if(p.reaction&&Date.now()-p.reactionAt<3500)label(c,p.reaction,p.x,p.y-120-Math.min(30,(Date.now()-p.reactionAt)/70),31,'#fff');
  if(p.mic){ellipse(c,p.x+width/2+7,p.y+28,4,4,'#52dca6');}
  if(bubble){const text=bubble.length>38?bubble.slice(0,38)+'…':bubble;c.font='13px "Segoe UI"';const bw=c.measureText(text).width+24;box(c,p.x-bw/2,p.y-142,bw,29,9,'#fffdf3','#c9c7db');label(c,text,p.x,p.y-122,13,'#3d3755',500);}
}

export function drawPlayer(c:CanvasRenderingContext2D,p:Player,me:boolean,tick:number,bubble?:string){drawAvatar(c,p,p.x,p.y,{moving:p.moving,direction:p.direction,tick,selected:me,seated:p.seated,hand:p.hand});drawPlayerLabel(c,p,me,tick,bubble);}
