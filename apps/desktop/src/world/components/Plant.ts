import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { oval, line, surface } from './primitives';
import type { Fixture } from '../map';

export function drawPlant(c: Context, f: Fixture) {
  const x = f.x + f.w / 2, y = f.y + f.h / 2;
  oval(c, x + 8, y + 24, 27, 12, '#233c3d25');
  surface(c, x - 17, y + 5, 34, 27, 7, '#d4bda2', '#ab917a');
  oval(c, x, y + 6, 17, 9, '#e6d3bc');
  oval(c, x, y + 6, 13, 6, '#7a6957');
  line(c, x, y + 6, x, y - 20, '#497e67', 3);
  c.save(); c.shadowColor = '#284e4427'; c.shadowBlur = 5; c.shadowOffsetY = 3;
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const lx = x + Math.cos(angle) * 14, ly = y - 10 + Math.sin(angle) * 13;
    oval(c, lx, ly, 9, 19, ['#4f826b', '#6a9c7c', '#8aae89'][i % 3], angle - Math.PI / 2);
    line(c, lx - Math.cos(angle) * 6, ly - Math.sin(angle) * 6, lx + Math.cos(angle) * 8, ly + Math.sin(angle) * 8, '#b5cba157');
  }
  c.restore();
  oval(c, x - 3, y - 16, 8, 15, '#98b991', -.2);
}

export function animatePlant(c:Context,f:Fixture,frame:ComponentFrame) { shimmer(c,f,frame,'#b8dcbd');if(frame.active){c.save();c.globalAlpha=1-frame.progress;for(let i=0;i<3;i++)oval(c,f.x+f.w/2-14+i*14,f.y-20+frame.progress*52,2,4,'#9dccda');c.restore();} }
export function posePlant(frame:ComponentFrame) {return {y:spring(frame)*-4,angle:spring(frame)*0.04};}
