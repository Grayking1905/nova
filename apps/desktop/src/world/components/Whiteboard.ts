import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, line, surface } from './primitives';
import type { Fixture } from '../map';

export function drawWhiteboard(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  surface(c, x - 6, y - 5, w + 12, h + 6, 10, '#ceb99e', '#a28b70');
  rect(c, x, y, w, h - 3, 7, '#393a4c');
    rect(c, x + 5, y + 4, w - 10, h - 12, 3, '#faf7ed');
    for (let i = 0; i < 5; i++) {
      const sx = x + 20 + i * 48;
      rect(c, sx + 1, y + 12, 33, 27, 2, '#423d4520');
      rect(c, sx, y + 10 + (i % 2) * 3, 33, 26, 2, ['#d6bde4', '#edcf8e', '#aed2ba'][i % 3]);
      line(c, sx + 6, y + 18, sx + 25, y + 18, '#68606255');
      line(c, sx + 6, y + 23, sx + 20, y + 23, '#68606235');
    }
    // A hand-drawn flow connects the notes to a small idea sketch.
    line(c, x + 263, y + 25, x + 282, y + 25, '#aa9777', 2);
    line(c, x + 276, y + 20, x + 282, y + 25, '#aa9777', 2);
    line(c, x + 276, y + 30, x + 282, y + 25, '#aa9777', 2);
    rect(c, x + 295, y + 12, 44, 29, 5, '#edf1df', '#a8b6a0');
    oval(c, x + 317, y + 22, 6, 6, '#c4b677');
    line(c, x + 313, y + 32, x + 321, y + 32, '#a19356', 2);
  rect(c, x + 10, y + h - 3, w - 20, 5, 2, '#d0c9c0');
  if (f.type === 'board') {
    for (let i = 0; i < 3; i++) rect(c, x + w - 70 + i * 15, y + h - 5, 11, 4, 1, ['#8a70bc', '#648d9f', '#a46c65'][i]);
  }
}

export function animateWhiteboard(c:Context,f:Fixture,frame:ComponentFrame) { if(frame.active){c.save();c.globalAlpha=Math.sin(Math.PI*frame.progress);line(c,f.x+20,f.y+f.h-15,f.x+20+(f.w-40)*frame.progress,f.y+f.h-15,'#8a70bc',3);c.restore();}shimmer(c,f,frame); }
export function poseWhiteboard(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
