import { fixtures, zones, WORLD } from './map';
import type { Context } from './components/primitives';
import { rect, line, surface } from './components/primitives';
import { drawRoomFloor } from './components/RoomFloor';
import { drawRoomDecor } from './components/RoomDecor';
import { drawRoomArchitecture } from './components/RoomArchitecture';
import { drawCorridors } from './components/Corridor';
import { drawFixture } from './components';

export function drawMap(c:Context,includeFixtures=true) {
  c.save();c.lineCap='round';c.lineJoin='round';
  c.fillStyle='#87999f';c.fillRect(0,0,WORLD.width,WORLD.height);
  surface(c,22,20,WORLD.width-44,WORLD.height-44,25,'#e5e7dc','#677e83');
  for(let y=30;y<WORLD.height-25;y+=40)line(c,28,y,WORLD.width-28,y,'#b7c1b81e');
  for(let x=30;x<WORLD.width-25;x+=40)line(c,x,30,x,WORLD.height-30,'#b7c1b81e');
  drawCorridors(c);
  for(const z of zones){rect(c,z.x+7,z.y+12,z.w,z.h,13,'#4d656333');drawRoomFloor(c,z);drawRoomDecor(c,z);}
  if(includeFixtures)for(const f of fixtures)drawFixture(c,f);
  zones.forEach((z,i)=>drawRoomArchitecture(c,z,i+1));c.restore();
}

