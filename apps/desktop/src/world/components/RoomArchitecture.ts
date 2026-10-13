import type { Context } from './primitives';
import { rect, line, text } from './primitives';
import type { Zone } from '../map';

export function drawRoomArchitecture(c: Context, z: Zone, number: number) {
  const wall = (x: number, y: number, w: number, h: number) => {
    rect(c, x + 2, y + 7, w, h, 3, '#6b77784a');
    rect(c, x, y + 3, w, h, 3, '#c8c9bc');
    rect(c, x, y - 3, w, h, 3, '#f7f4e9');
    line(c, x + 3, y - 2, x + w - 3, y - 2, '#ffffffa0');
  };
  const half = z.w / 2 - 80;
  wall(z.x, z.y, z.w, 16);
  wall(z.x, z.y, 14, z.h);
  wall(z.x + z.w - 14, z.y, 14, z.h);
  wall(z.x, z.y + z.h - 14, half, 14);
  wall(z.x + z.w / 2 + 80, z.y + z.h - 14, half, 14);
  if (z.y > 100) {
    rect(c, z.x + half, z.y - 4, 160, 28, 0, '#e5e7dc');
    line(c, z.x + half + 5, z.y + 10, z.x + half + 155, z.y + 10, '#b7bbae', 2);
  }
  // Door jambs and a flush brass threshold communicate the actual opening.
  const doorX = z.x + z.w / 2 - 80;
  rect(c, doorX - 5, z.y + z.h - 20, 6, 26, 2, z.accent);
  rect(c, doorX + 159, z.y + z.h - 20, 6, 26, 2, z.accent);
  line(c, doorX + 4, z.y + z.h - 3, doorX + 156, z.y + z.h - 3, '#a7997c', 2);
  if (z.id !== 'stage' && z.id !== 'studio') {
    const positions=z.y>100?[120,186,252,690,756,822]:[z.w/2-98,z.w/2-32,z.w/2+34];
    for (const offset of positions) {
      const x=z.x+offset;
      rect(c,x,z.y-5,60,16,3,'#9ebfc4','#f7ffff');
      rect(c,x+3,z.y-2,54,8,1,'#cae2dc');
      line(c,x+8,z.y,x+29,z.y,'#ffffffa6',2);
    }
  }
  // Legible room plaque, rather than lettering floating on the floor.
  const width = z.id === 'hub' ? 240 : 215;
  const x = z.x + z.w / 2 - width / 2, y = z.y + z.h - 73;
  rect(c, x, y, width, 43, 11, '#f8f3e7b5', '#ffffff60');
  rect(c, x + 8, y + 8, 27, 27, 8, `${z.accent}24`);
  text(c, `0${number}`, x + 21.5, y + 26, 11, z.accent, 700);
  text(c, z.name, x + 46, y + 19, 17, z.accent, 700, 'left');
  text(c, `${z.capacity} SEATS · ${z.subtitle}`, x + 46, y + 33, 6.5, z.accent, 600, 'left');
}
