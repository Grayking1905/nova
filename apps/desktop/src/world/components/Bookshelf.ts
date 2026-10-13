import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { rect, line, surface } from './primitives';
import type { Fixture } from '../map';

export function drawBookshelf(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  surface(c, x, y, w, h, 5, '#b39c7e', '#8e765d');
  rect(c, x + 5, y + 6, w - 10, h - 16, 2, '#7f715e');
  let offset = 10;
  for (let i = 0; i < 12; i++) {
    const bw = i % 3 === 0 ? 9 : 7;
    const bh = 23 + (i % 4) * 3;
    rect(c, x + offset, y + h - 12 - bh, bw, bh, 1, ['#a9bfaa', '#c3a6b1', '#dfc896', '#899db5'][i % 4]);
    line(c, x + offset + 2, y + h - 18, x + offset + bw - 2, y + h - 18, '#ffffff60');
    offset += bw + 2;
  }
  rect(c, x + 4, y + h - 12, w - 8, 6, 1, '#d4bd99');
}

export function animateBookshelf(c:Context,f:Fixture,frame:ComponentFrame) { if(frame.active){c.save();c.globalAlpha=Math.sin(Math.PI*frame.progress);rect(c,f.x+f.w*.45,f.y-10-frame.progress*15,24,29,3,'#fff1ca','#d3bb8e');c.restore();}shimmer(c,f,frame); }
export function poseBookshelf(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0.04};}
