import type { Avatar, Player } from '../types';
import { fixtures, zones, WORLD } from './map';

function box(c: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number,fill:string,stroke?:string) { c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();} }
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function label(c:CanvasRenderingContext2D,text:string,x:number,y:number,size:number,color:string,weight=600){c.font=`${weight} ${size}px "Segoe UI", sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}

export function drawAvatar(c: CanvasRenderingContext2D, avatar: Avatar, x:number, y:number, options: { moving?:boolean; direction?:string; tick?:number; selected?:boolean; seated?:boolean } = {}) {
  const { moving=false,direction='down',tick=0,selected=false,seated=false }=options;
  c.save();c.translate(x,y);if(direction==='left')c.scale(-1,1);
  const step=moving?Math.sin(tick/75)*5:0;const bob=moving?Math.abs(Math.sin(tick/75))*2:Math.sin(tick/500)*.8;
  ellipse(c,0,3,23,8,'#182b4430');
  if(selected){c.beginPath();c.ellipse(0,4,30,12,0,0,Math.PI*2);c.strokeStyle='#ab8bfa';c.lineWidth=3;c.stroke();}
  c.translate(0,-bob);
  box(c,-15,-15+step,11,seated?10:19,4,'#2f3655');box(c,4,-15-step,11,seated?10:19,4,'#2f3655');
  box(c,-17,1+step,15,7,3,'#faf3e8');box(c,3,1-step,15,7,3,'#faf3e8');
  box(c,-19,-40,38,29,11,avatar.shirt);box(c,-24,-35-step/2,9,23,4,avatar.skin);box(c,15,-35+step/2,9,23,4,avatar.skin);
  box(c,-6,-44,12,10,4,avatar.skin);
  if(avatar.style==='long')box(c,-23,-72,46,44,12,avatar.hair);
  box(c,-20,-67,40,34,12,avatar.skin);
  if(direction==='up')box(c,-22,-72,44,37,12,avatar.hair);
  else {
    box(c,-22,-73,44,17,10,avatar.hair);box(c,-22,-64,8,17,3,avatar.hair);
    if(avatar.style==='curly') for(let i=0;i<5;i++)ellipse(c,-17+i*8,-68-(i%2)*4,9,9,avatar.hair);
    if(avatar.style==='long'){box(c,15,-64,8,30,4,avatar.hair);box(c,-23,-64,8,30,4,avatar.hair);}
    const offset=direction==='right'?5:0;
    ellipse(c,-7+offset,-48,2.2,3,'#2c2436');ellipse(c,8+offset,-48,2.2,3,'#2c2436');
    c.strokeStyle='#9e605b';c.lineWidth=2;c.beginPath();c.arc(1+offset,-43,4,0,Math.PI);c.stroke();
  }
  box(c,-9,-32,18,3,1,'#ffffff45');c.restore();
}

export function drawMap(c: CanvasRenderingContext2D) {
  c.fillStyle='#87999f';c.fillRect(0,0,WORLD.width,WORLD.height);
  box(c,22,22,1956,1236,27,'#e5e7dc');
  for(let x=25;x<1980;x+=40){c.strokeStyle='#b9c8c53b';c.beginPath();c.moveTo(x,25);c.lineTo(x,1255);c.stroke();}
  for(let y=25;y<1255;y+=40){c.strokeStyle='#b9c8c53b';c.beginPath();c.moveTo(25,y);c.lineTo(1975,y);c.stroke();}
  // The central circulation path ties the rooms together.
  box(c,50,542,1900,42,15,'#c7d2cb');
  for(const z of zones){
    box(c,z.x+5,z.y+10,z.w,z.h,16,'#53697645');box(c,z.x,z.y,z.w,z.h,14,z.color);
    c.save();c.beginPath();c.roundRect(z.x,z.y,z.w,z.h,14);c.clip();
    for(let y=z.y+25;y<z.y+z.h;y+=35){c.strokeStyle='#ffffff21';c.beginPath();c.moveTo(z.x,y);c.lineTo(z.x+z.w,y);c.stroke();}
    for(let x=z.x+40;x<z.x+z.w;x+=100){c.strokeStyle='#38394a09';c.beginPath();c.moveTo(x,z.y);c.lineTo(x,z.y+z.h);c.stroke();}
    c.restore();
    box(c,z.x,z.y,z.w,17,6,'#f1f0e7');box(c,z.x,z.y,14,z.h,6,'#faf7ed');box(c,z.x+z.w-14,z.y,14,z.h,6,'#f1f0e7');
    box(c,z.x,z.y+z.h-14,z.w/2-70,14,5,'#faf7ed');box(c,z.x+z.w/2+70,z.y+z.h-14,z.w/2-70,14,5,'#faf7ed');
    if(z.y>550)box(c,z.x+z.w/2-70,z.y,140,18,0,'#e5e7dc');
    label(c,z.name,z.x+z.w/2,z.y+z.h-57,22,z.accent,700);label(c,z.subtitle,z.x+z.w/2,z.y+z.h-34,9,z.accent,600);
    // Architectural glass panels along the top walls.
    if(z.id!=='stage'&&z.id!=='studio'){for(let i=0;i<3;i++){box(c,z.x+z.w/2-95+i*66,z.y-2,58,14,3,'#b7dde0','#e9f8f1');}}
  }
  // Rugs, stage, plants and reception signage.
  box(c,166,206,457,207,30,'#b7a6d544','#c3b3dd');box(c,185,206,419,17,8,'#b2a0cf');
  box(c,893,258,395,170,65,'#c6a68365');box(c,1510,225,350,244,35,'#83aa9170');
  box(c,1510,835,350,263,35,'#c1989055');box(c,989,685,363,360,70,'#c6beb154');
  label(c,'NOVA',1175,715,29,'#a0937a',800);label(c,'MAKE ROOM FOR POSSIBILITY',1175,738,9,'#a0937a');
  for(const f of fixtures){
    const {x,y,w,h,type}=f;
    if(type==='plant'){
      ellipse(c,x+w/2,y+h+7,24,9,'#243a4530');box(c,x+10,y+18,30,33,9,'#d6b9a0');
      for(let i=0;i<6;i++){const a=i*Math.PI/3;ellipse(c,x+25+Math.cos(a)*15,y+19+Math.sin(a)*12,13,19,i%2?'#4f8c78':'#659e81');}
      ellipse(c,x+25,y+15,10,15,'#8cba8b');
    }else if(type==='screen'||type==='board'){
      box(c,x+4,y+14,w,h,10,'#263b4539');box(c,x,y,w,h,9,'#484c61');box(c,x+7,y+6,w-14,h-13,5,type==='board'?'#f5f4e7':'#272741');
      if(type==='screen'){label(c,'nova / live',x+w/2,y+31,20,'#c1b2ff',700);label(c,'IDEAS BELONG HERE',x+w/2,y+48,8,'#8d89b6');}
      else{for(let i=0;i<5;i++)box(c,x+25+i*55,y+15,35,25,3,['#cfb5e8','#efd494','#a8d8bf'][i%3]);}
      box(c,x+15,y+h-2,w-30,7,3,'#7f8090');
    }else if(type==='desk'){
      box(c,x+4,y+10,w,h,12,'#4d687840');box(c,x,y,w,h,12,'#e8d6b9','#bfae97');
      box(c,x+w/2-47,y-8,94,45,6,'#4d5564');box(c,x+w/2-42,y-3,84,34,3,'#334b64');box(c,x+w/2-36,y+2,43,4,1,'#88bfc7');box(c,x+w/2-36,y+11,62,3,1,'#a89cca');
      box(c,x+w/2-26,y+42,52,19,4,'#e6e8e8','#b7bec2');box(c,x+w/2+37,y+46,11,17,5,'#c0c5ce');box(c,x+14,y+27,25,30,3,'#8f97b8');ellipse(c,x+w-22,y+49,9,9,'#f5f3e9');ellipse(c,x+w-22,y+49,5,5,'#8b6652');
    }else if(type==='chair'){
      ellipse(c,x+w/2,y+h+5,w/2,9,'#27324d2b');box(c,x+2,y+5,w-4,h,9,'#4b607b');box(c,x+4,y+3,w-8,h-6,10,'#758bab');box(c,x,y-1,w,13,5,'#95a8c2');box(c,x-3,y+12,7,h-18,3,'#576d8a');box(c,x+w-4,y+12,7,h-18,3,'#576d8a');
    }else if(type==='table'){
      box(c,x+4,y+11,w,h,30,'#47536030');box(c,x,y,w,h,30,'#f2dfbf','#c6ad8e');box(c,x+9,y+8,w-18,h-17,23,'#eddbbd');
      if(f.id==='reception'){box(c,x+w/2-30,y+17,60,38,5,'#4e586b');label(c,'HELLO!',x+w/2,y+43,11,'#d7f0dd');}
      else{box(c,x+w/2-13,y+15,31,37,3,'#b1a3ca');box(c,x+w/2-9,y+17,31,37,3,'#fbf7ef');ellipse(c,x+30,y+30,9,9,'#bb9b7d');}
    }else if(type==='sofa'){
      box(c,x+4,y+10,w,h,16,'#47536035');box(c,x,y,w,h,15,f.color!);box(c,x+7,y,w-14,20,8,'#ffffff30');for(let i=0;i<3;i++)box(c,x+15+i*(w-30)/3,y+24,(w-40)/3,h-35,9,'#ffffff20');box(c,x-3,y+8,18,h-14,7,'#ffffff24');box(c,x+w-15,y+8,18,h-14,7,'#ffffff24');
    }else if(type==='coffee'){
      box(c,x+4,y+10,w,h,8,'#775d5140');box(c,x,y,w,h,8,'#e6c8a4','#b3977e');box(c,x+25,y+12,57,46,8,'#5c5560');box(c,x+33,y+18,40,17,4,'#303745');ellipse(c,x+52,y+47,9,6,'#fff3df');for(let i=0;i<3;i++)ellipse(c,x+130+i*35,y+38,11,11,'#fff0db');box(c,x+w-45,y+14,25,37,4,'#a98d6d');
    }else if(type==='shelf'){
      box(c,x,y,w,h,7,'#a68e72');for(let i=0;i<12;i++)box(c,x+8+i*10,y+8,8,31,1,['#b2c9ae','#c5a7b6','#dfc995','#8195ad'][i%4]);
    }
  }
  // Soft architectural lights, and the entry mat.
  box(c,1055,1168,245,33,8,'#a99e8c');label(c,'WELCOME TO YOUR WORKPLACE',1177,1189,9,'#eee5d4');
}

export function drawPlayer(c:CanvasRenderingContext2D,p:Player,me:boolean,tick:number,bubble?:string){
  drawAvatar(c,p,p.x,p.y,{moving:p.moving,direction:p.direction,tick,selected:me,seated:p.seated});
  const name=p.name+(me?' · you':'');c.font='600 13px "Segoe UI"';const width=c.measureText(name).width+22;
  box(c,p.x-width/2,p.y+17,width,24,8,me?'#7862c9':'#263348e8');label(c,name,p.x,p.y+34,13,'#fff');
  if(p.hand)label(c,'✋',p.x+31,p.y-54,24,'#fff');
  if(p.reaction&&Date.now()-p.reactionAt<3500)label(c,p.reaction,p.x,p.y-95-Math.min(30,(Date.now()-p.reactionAt)/70),31,'#fff');
  if(p.mic){ellipse(c,p.x+width/2+7,p.y+28,4,4,'#52dca6');}
  if(bubble){const text=bubble.length>38?bubble.slice(0,38)+'…':bubble;c.font='13px "Segoe UI"';const bw=c.measureText(text).width+24;box(c,p.x-bw/2,p.y-115,bw,29,9,'#fffdf3','#c9c7db');label(c,text,p.x,p.y-95,13,'#3d3755',500);}
}
