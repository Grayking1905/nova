import type { ComponentFrame } from './animation';
import { shimmer, pulse, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, text, surface } from './primitives';
import type { Fixture } from '../map';

export function drawScreen(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  surface(c, x - 6, y - 5, w + 12, h + 6, 10, '#b4a7c4', '#9484a7');
  rect(c, x, y, w, h - 3, 7, '#393a4c');
    const screen = c.createLinearGradient(x, y, x + w, y + h);
    screen.addColorStop(0, '#3f3757'); screen.addColorStop(1, '#222c40');
    c.fillStyle = screen; c.beginPath(); c.roundRect(x + 6, y + 5, w - 12, h - 14, 4); c.fill();
    c.save(); c.beginPath(); c.roundRect(x + 6, y + 5, w - 12, h - 14, 4); c.clip();
    oval(c, x + w - 30, y + 8, 68, 38, '#b5a5de12', -.6);
    oval(c, x + w - 42, y + 30, 37, 22, '#b5a5de16', -.6);
    c.restore();
    rect(c, x + 19, y + 14, 28, 28, 8, '#9f88d0');
    text(c, 'n', x + 33, y + 35, 24, '#f5efff', 800);
    text(c, 'Your next big idea.', x + 59, y + 29, 16, '#eee7ff', 600, 'left');
    text(c, 'PRESENT · CONNECT · INSPIRE', x + 59, y + 43, 7, '#b7accb', 600, 'left');
    oval(c, x + w / 2, y + h - 7, 2, 2, '#c2aaf0');

  rect(c, x + 10, y + h - 3, w - 20, 5, 2, '#d0c9c0');
}

export function animateScreen(c:Context,f:Fixture,frame:ComponentFrame) { pulse(c,f,frame,'#c5aff5');shimmer(c,f,frame,'#d4c2ff'); }
export function poseScreen(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
