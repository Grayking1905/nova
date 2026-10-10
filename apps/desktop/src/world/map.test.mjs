import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audible, canStand, findPath, fixtures, zones } from './map.ts';

test('all six room entrances are reachable through furniture and walls',()=>{
  for(const start of zones)for(const end of zones){
    assert.ok(canStand(start.entry.x,start.entry.y),`${start.name} entry is walkable`);
    if(start.id===end.id)continue;
    const path=findPath(start.entry,end.entry);
    assert.ok(path.length,`${start.name} → ${end.name} has a route`);
    let previous=start.entry;
    for(const point of path){for(let step=1;step<=10;step++){const t=step/10;assert.ok(canStand(previous.x+(point.x-previous.x)*t,previous.y+(point.y-previous.y)*t),`${start.name} → ${end.name} crosses a wall`);}previous=point;}
  }
});
test('screen and whiteboard interaction points are reachable',()=>{
  for(const id of ['board','stage-screen']){const fixture=fixtures.find(f=>f.id===id);const end={x:fixture.x+fixture.w/2,y:fixture.y+fixture.h+70};const path=findPath({x:1040,y:940},end);assert.ok(path.length);assert.ok(Math.hypot(path.at(-1).x-end.x,path.at(-1).y-end.y)<30);}
});
test('proximity respects room boundaries and the Forum has room-wide audio',()=>{
  assert.ok(audible({x:300,y:450},{x:600,y:450}));
  assert.ok(!audible({x:700,y:450},{x:800,y:450}));
  assert.ok(!audible({x:150,y:1100},{x:750,y:1100}));
  assert.ok(audible({x:1050,y:950},{x:1100,y:950}));
});
