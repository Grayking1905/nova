import type { ComponentFrame } from './animation';
import { pulse, steam, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, line, text, surface } from './primitives';
import type { Fixture } from '../map';
import { drawCup as cup } from './Cup';

export function drawCoffeeMachine(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  surface(c, x, y, w, h, 9, '#e6c8a4', '#aa8468');
  rect(c, x + 8, y + 8, w - 16, h - 19, 6, '#edddc5', '#d8bfa4');
  for (let i = 0; i < 20; i++) line(c, x + 10 + i * 14, y + h - 7, x + 10 + i * 14, y + h + 4, '#a8866c', 2);
  surface(c, x + 23, y + 9, 71, 52, 8, '#575568', '#343341');
  rect(c, x + 31, y + 14, 54, 22, 4, '#303445');
  rect(c, x + 37, y + 18, 20, 7, 2, '#9fbda6');
  oval(c, x + 75, y + 24, 4, 4, '#d7c3a2');
  rect(c, x + 31, y + 42, 54, 15, 3, '#85838c');
  for (let i = 0; i < 6; i++) line(c, x + 36 + i * 8, y + 45, x + 36 + i * 8, y + 53, '#4d4b58');
  cup(c, x + 58, y + 46);
  rect(c, x + 108, y + 23, 114, 36, 7, '#c7ad8a');
  for (let i = 0; i < 3; i++) cup(c, x + 126 + i * 35, y + 39);
  surface(c, x + w - 52, y + 18, 28, 39, 4, '#b59b7a', '#94775b');
  rect(c, x + w - 47, y + 21, 18, 27, 2, '#ecdfc3');
  text(c, 'N', x + w - 38, y + 39, 12, '#9f7f65', 800);
  text(c, 'BREW SOMETHING GOOD', x + 169, y + 77, 7, '#aa8668');
}

export function animateCoffeeMachine(c:Context,f:Fixture,frame:ComponentFrame) { steam(c,f.x+f.w*.2,f.y+f.h*.47,frame);pulse(c,f,frame,'#efd5a5'); }
export function poseCoffeeMachine(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
