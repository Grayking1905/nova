import type { Fixture } from '../map';
import type { Context } from './primitives';
import { surface, text } from './primitives';
export function drawInteraction(c: Context, f: Fixture, tick: number, reducedMotion: boolean) {
  const { x, y, w, h } = f;
  const pulse = reducedMotion ? .5 : (Math.sin(tick / 420) + 1) / 2;
  c.save();
  c.lineCap = 'round';
  // Four small corners expose the target without obscuring its artwork.
  c.shadowColor = '#f8e9c5'; c.shadowBlur = 9 + pulse * 5;
  const inset = 9, length = 14;
  c.strokeStyle = '#ffefd0'; c.lineWidth = 2.5;
  for (const [cx, cy, dx, dy] of [
    [x - inset, y - inset, 1, 1], [x + w + inset, y - inset, -1, 1],
    [x - inset, y + h + inset, 1, -1], [x + w + inset, y + h + inset, -1, -1],
  ]) {
    c.beginPath(); c.moveTo(cx + dx * length, cy); c.lineTo(cx, cy); c.lineTo(cx, cy + dy * length); c.stroke();
  }
  c.shadowBlur = 0;
  const badgeY = y - 25 - (reducedMotion ? 0 : pulse * 3);
  surface(c, x + w / 2 - 14, badgeY - 14, 28, 27, 9, '#fbf1da', '#bba987');
  text(c, 'E', x + w / 2, badgeY + 5, 14, '#756043', 800);
  c.restore();
}
