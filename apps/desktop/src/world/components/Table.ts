import type { ComponentFrame } from './animation';
import { shimmer, spring } from './animation';
import type { Context } from './primitives';
import { rect, oval, line, text, surface } from './primitives';
import type { Fixture } from '../map';
import { drawCup as cup } from './Cup';
import { drawNotebook as notebook } from './Notebook';

export function drawTable(c: Context, f: Fixture) {
  const { x, y, w, h } = f;
  const reception = f.variant === 'reception';
  surface(c, x, y, w, h, reception ? 27 : h / 2, '#f0ddbc', '#bd9f7c');
  rect(c, x + 7, y + 7, w - 14, h - 15, reception ? 22 : h / 2 - 7, '#f4e3c5', '#dbc3a0');
  if (reception) {
    // Fluted front and curved reception counter.
    for (let i = 0; i < 18; i++) line(c, x + 22 + i * 12, y + h - 7, x + 22 + i * 12, y + h + 3, '#a98c69', 2);
    rect(c, x + 94, y + 24, 77, 49, 7, '#cfbfa5');
    rect(c, x + 111, y + 11, 59, 35, 5, '#4b5261');
    rect(c, x + 116, y + 15, 49, 25, 2, '#2e4050');
    text(c, 'hello, you.', x + 140, y + 31, 8, '#d7e9dc');
    rect(c, x + 109, y + 53, 54, 12, 3, '#f8f2e2');
    notebook(c, x + 32, y + 31, '#91a596');
    rect(c, x + w - 50, y + 33, 27, 22, 4, '#ebe6d5', '#b6a98a');
    text(c, 'N', x + w - 36, y + 48, 11, '#948369', 800);
  } else if (f.variant === 'conference') {
    notebook(c, x + 83, y + 27, '#ba9bc8', .15);
    rect(c, x + 114, y + 22, 48, 51, 2, '#fff8e9', '#ddccb0');
    line(c, x + 123, y + 35, x + 148, y + 35, '#b5b8a6', 2);
    line(c, x + 123, y + 43, x + 142, y + 43, '#b5b8a6');
    for (let i = 0; i < 3; i++) rect(c, x + 30 + i * 10, y + 35 + i * 5, 18, 17, 2, ['#c4b2d9', '#d8dca6', '#e8c195'][i]);
    line(c, x + 167, y + 63, x + 175, y + 27, '#9e7a64', 3);
    cup(c, x + w - 30, y + 41);
  } else {
    notebook(c, x + w / 2 - 15, y + 13, f.id === 'garden-table' ? '#7c9b83' : '#bf9bad');
    cup(c, x + 27, y + 30);
    oval(c, x + w - 23, y + h - 19, 11, 8, '#e9d3b3');
    oval(c, x + w - 23, y + h - 20, 7, 5, '#b78b60');
  }
}

export function animateTable(c:Context,f:Fixture,frame:ComponentFrame) { shimmer(c,f,frame); }
export function poseTable(frame:ComponentFrame) {return {y:spring(frame)*-3,angle:spring(frame)*0};}
