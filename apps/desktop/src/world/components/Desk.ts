import type { ComponentFrame } from './animation';
import { shimmer, pulse, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, line, text, surface } from './primitives';
import type { Fixture } from '../map';
import { drawCup as cup } from './Cup';
import { drawNotebook as notebook } from './Notebook';

export function drawDesk(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  // Oak top, chamfered edge, monitor stand, desk mat and personal objects.
  surface(c, x, y, w, h, 13, '#ebd8b9', '#bca185');
  line(c, x + 14, y + h - 7, x + w - 14, y + h - 7, '#fff4d76b', 2);
  for (let i = 0; i < 3; i++) line(c, x + 12, y + 12 + i * 23, x + w - 12, y + 12 + i * 23, '#bba07917');
  rect(c, x + 55, y + 32, 118, 43, 8, '#b5bfc0', '#edf0dc55');
  rect(c, x + w / 2 - 14, y + 21, 28, 23, 4, '#6d7580');
  rect(c, x + w / 2 - 25, y + 37, 50, 7, 3, '#91979b');
  surface(c, x + w / 2 - 48, y - 7, 96, 46, 6, '#454b5a', '#252c3a');
  rect(c, x + w / 2 - 42, y - 2, 84, 32, 3, '#263749');
  rect(c, x + w / 2 - 39, y + 1, 19, 26, 2, '#3c5365');
  for (let i = 0; i < 3; i++) rect(c, x + w / 2 - 35, y + 6 + i * 7, 11, 2, 1, '#8aa8ac');
  for (let i = 0; i < 3; i++) rect(c, x + w / 2 - 15, y + 4 + i * 7, [44, 30, 37][i], 3, 1, ['#9f92c1', '#85b6ac', '#ceb58a'][i]);
  rect(c, x + 76, y + 49, 59, 20, 4, '#eff0e6', '#879ba450');
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) rect(c, x + 81 + i * 5.5, y + 53 + row * 4, 3.5, 2.3, .5, '#a5afb1');
  rect(c, x + 146, y + 49, 13, 20, 6, '#ebeee4', '#96a5ad');
  line(c, x + 152.5, y + 52, x + 152.5, y + 58, '#9daeb0');
  notebook(c, x + 17, y + 36, '#a99dbc');
  line(c, x + 44, y + 61, x + 49, y + 38, '#6c657c', 3);
  cup(c, x + w - 23, y + 55);
  // Screen camera and discreet desk number.
  oval(c, x + w / 2, y - 3.5, 1.5, 1.5, '#a3b1b7');
  text(c, `N / 0${f.id.slice(-1)}`, x + 20, y + 18, 7, '#a58b6c', 700, 'left');
}

export function animateDesk(c:Context,f:Fixture,frame:ComponentFrame) { pulse(c,f,frame,'#b5daed');shimmer(c,f,frame,'#c8e2dc'); }
export function poseDesk(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
