import type { Context } from './primitives';
import { rect, oval, line } from './primitives';
import type { Zone } from '../map';

export function drawRoomFloor(c: Context, z: Zone) {
  c.save();
  c.beginPath(); c.roundRect(z.x, z.y, z.w, z.h, 10); c.clip();
  c.fillStyle = z.color; c.fillRect(z.x, z.y, z.w, z.h);
  const light = c.createLinearGradient(z.x, z.y, z.x + z.w * .75, z.y + z.h);
  light.addColorStop(0, '#ffffff24'); light.addColorStop(1, '#ffffff00');
  c.fillStyle = light; c.fillRect(z.x, z.y, z.w, z.h);

  if (z.id === 'studio' || z.id === 'hub') {
    // Long staggered timber planks, with quiet grain instead of a grid.
    for (let row = 0, y = z.y + 16; y < z.y + z.h; row++, y += 28) {
      line(c, z.x, y, z.x + z.w, y, '#6b543117');
      for (let x = z.x - 100 + (row % 3) * 65; x < z.x + z.w; x += 195) {
        line(c, x, y, x, y + 28, '#6b543114');
        line(c, x + 15, y + 9, x + 165, y + 9, '#ffffff14');
      }
    }
  } else if (z.id === 'garden') {
    for (let y = z.y + 20; y < z.y + z.h; y += 52) {
      for (let x = z.x + 18; x < z.x + z.w; x += 58) {
        rect(c, x, y, 54, 48, 5, '#ffffff0a', '#557b6512');
      }
    }
    // A planted border sits against the perimeter wall, outside the walkways.
    rect(c, z.x + 17, z.y + 21, z.w - 34, 28, 8, '#729781');
    for (let x = z.x + 29; x < z.x + z.w - 25; x += 22) {
      oval(c, x, z.y + 34, 14, 9, x % 3 ? '#8aaf90' : '#638f77', -.4);
    }
  } else {
    for (let y = z.y + 24; y < z.y + z.h; y += 42) line(c, z.x, y, z.x + z.w, y, '#ffffff13');
    for (let x = z.x + 35; x < z.x + z.w; x += 84) line(c, x, z.y, x, z.y + z.h, '#34445608');
  }
  // Ambient occlusion beneath the wall and natural light from the glazing.
  const shade = c.createLinearGradient(0, z.y + 14, 0, z.y + 60);
  shade.addColorStop(0, '#25323a20'); shade.addColorStop(1, '#25323a00');
  c.fillStyle = shade; c.fillRect(z.x + 14, z.y + 14, z.w - 28, 46);
  if (z.id !== 'stage' && z.id !== 'studio') {
    c.beginPath(); c.moveTo(z.x + z.w / 2 - 95, z.y + 16); c.lineTo(z.x + z.w / 2 + 95, z.y + 16);
    c.lineTo(z.x + z.w / 2 + 175, z.y + 185); c.lineTo(z.x + z.w / 2 - 15, z.y + 185); c.closePath();
    const sun = c.createLinearGradient(0, z.y, 0, z.y + 185);
    sun.addColorStop(0, '#fff9dc30'); sun.addColorStop(1, '#fff9dc00');
    c.fillStyle = sun; c.fill();
  }
  c.restore();
}
