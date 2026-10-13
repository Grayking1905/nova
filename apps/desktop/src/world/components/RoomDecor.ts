import type { Zone } from '../map';
import { fixtures } from '../map';
import type { Context } from './primitives';
import { rect, text, line, oval, surface } from './primitives';
import { drawRug } from './Rug';

export function drawRoomDecor(c:Context,z:Zone) {
  const {x,y,w}=z;
  if(z.id==='stage') {
    drawRug(c,x+205,y+300,650,265,'#b9a6d1','#a99ac3',28);
    surface(c,x+240,y+190,580,68,12,'#d7cbe8','#a99abe');
    line(c,x+260,y+241,x+800,y+241,'#eee6fa',3);
    for(const px of [x+205,x+795])for(let i=0;i<4;i++)rect(c,px+i*12,y+80,8,95,4,'#b29bc8','#cebde0');
    text(c,'GREAT IDEAS TAKE THE STAGE',x+w/2,y+285,12,'#826ca2');
  } else if(['studio','meeting','sprint'].includes(z.id)) {
    drawRug(c,x+190,y+216,680,378,z.id==='studio'?'#ccb291':z.id==='meeting'?'#aeb3d1':'#b6c09b',z.accent+'65',45);
    text(c,z.id==='sprint'?'MAKE A LITTLE PROGRESS, TOGETHER':z.id==='meeting'?'EVERY VOICE HAS A SEAT':'A GOOD IDEA STARTS WITH A CONVERSATION',x+w/2,y+196,11,z.accent);
    for(let i=0;i<3;i++){rect(c,x+210+i*185,y+37,130,17,5,'#ffffff28');line(c,x+223+i*185,y+44,x+325+i*185,y+44,'#ffffff38');}
  } else if(z.id==='work') {
    for(const f of fixtures.filter(f=>f.zoneId===z.id&&f.type==='desk')) {
      drawRug(c,f.x-12,f.y-18,f.w+24,230,'#9fbbc77a','#8ba8b638',18);
      text(c,`0${f.id.split('-').pop()}`,f.x+8,f.y+197,12,z.accent,700,'left');
    }
    text(c,'ROOM TO DO YOUR BEST WORK',x+w/2,y+100,14,z.accent);
  } else if(z.id==='garden') {
    drawRug(c,x+252,y+116,556,486,'#90b59b','#719b80',60);
    text(c,'BREATHE IN. THINK BIG.',x+w/2,y+78,14,z.accent);
    for(let i=0;i<9;i++)oval(c,x+475+(i%3)*45,y+483+Math.floor(i/3)*35,17,11,'#c8d6b660',.1);
  } else if(z.id==='hub') {
    drawRug(c,x+235,y+145,590,457,'#cec5b4','#b8ac96',50);
    text(c,'NOVA',x+w/2,y+115,44,'#96866c',800);
    text(c,'A LITTLE CLOSER, EVERY DAY',x+w/2,y+134,10,'#9b8c74');
    text(c,'YOU BELONG HERE',x+w/2,y+588,12,'#96866c');
  } else if(z.id==='lounge') {
    drawRug(c,x+106,y+240,365,347,'#c69c94','#b88680',30);
    drawRug(c,x+587,y+240,365,347,'#c69c94','#b88680',30);
    text(c,'THE DAILY PAUSE',x+w/2,y+56,16,z.accent);
    for(let px=x+350;px<x+700;px+=27)rect(c,px,y+67,24,9,2,'#efd4bd','#b4917c45');
  } else {
    drawRug(c,x+203,y+228,660,360,'#d0b497','#bd9b7a',34);
    text(c,'SLOW DOWN. FIND SOMETHING GOOD.',x+w/2,y+80,13,z.accent);
    for(let i=0;i<3;i++)rect(c,x+110+i*265,y+107,180,7,3,'#f4dfbf');
  }
  // Interior uplights and entry mat: decorative surfaces stay walkable.
  for(const px of [x+185,x+w-185])rect(c,px,y+610,70,4,2,'#f9f3d08a');
}
