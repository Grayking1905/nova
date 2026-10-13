import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audible, canStand, findPath, fixtures, zones, SPAWN, WORLD, interactionPoint, fixtureDistance } from './map.ts';
import { followPoint } from './follow.ts';
import { zoneAt } from './map.ts';

test('all nine room entrances are reachable through furniture and walls',()=>{
  for(const start of zones)for(const end of zones){
    assert.ok(canStand(start.entry.x,start.entry.y),`${start.name} entry is walkable`);
    if(start.id===end.id)continue;
    const path=findPath(start.entry,end.entry);
    assert.ok(path.length,`${start.name} → ${end.name} has a route`);
    let previous=start.entry;
    for(const point of path){for(let step=1;step<=10;step++){const t=step/10;assert.ok(canStand(previous.x+(point.x-previous.x)*t,previous.y+(point.y-previous.y)*t),`${start.name} → ${end.name} crosses a wall`);}previous=point;}
  }
});
test('every interactive component and all 72 seats are reachable',()=>{
  assert.equal(zones.length,9);
  assert.ok(canStand(SPAWN.x,SPAWN.y));
  for(const z of zones){const seats=fixtures.filter(f=>f.zoneId===z.id&&f.type==='chair');assert.equal(seats.length,8,`${z.name} has eight seats`);for(const seat of seats)assert.ok(canStand(seat.x+seat.w/2,seat.y+seat.h-8),`${seat.id} has clear sitting space`);}
  for(const f of fixtures.filter(f=>f.label)){
    const route=findPath(SPAWN,interactionPoint(f));assert.ok(route.length,`${f.id} is reachable`);
    assert.ok(fixtureDistance(f,route.at(-1).x,route.at(-1).y)<100,`${f.id} can be interacted with`);
    for(const p of route)assert.ok(canStand(p.x,p.y),`${f.id} route is walkable`);
  }
});
test('large room audio reaches all seats while proximity respects room boundaries',()=>{
  for(const z of zones.filter(z=>z.audio==='room')){const seats=fixtures.filter(f=>f.zoneId===z.id&&f.type==='chair');assert.ok(audible({x:seats[0].x,y:seats[0].y},{x:seats.at(-1).x,y:seats.at(-1).y}));}
  assert.ok(!audible(zones[0].entry,zones[1].entry));
  assert.ok(!audible({x:200,y:1200},{x:1000,y:1200}));
  assert.ok(audible({x:200,y:1200},{x:1000,y:1200},'work'));
  assert.ok(audible(SPAWN,{x:SPAWN.x+50,y:SPAWN.y}));
});
test('navigation follows expanded bounds and can cross to the south wing',()=>{
  assert.equal(WORLD.width,3600);assert.equal(WORLD.height,2600);
  const route=findPath(SPAWN,zones.at(-1).entry);assert.ok(route.some(p=>p.x>2000));assert.ok(route.some(p=>p.y>2000));
  assert.ok(!canStand(-1,10));assert.ok(!canStand(WORLD.width+1,WORLD.height));
});
test('following keeps teammates in the same room at entrances and occupied seats',()=>{
  for(const z of zones){
    const positions=[z.entry,...fixtures.filter(f=>f.zoneId===z.id&&f.type==='chair').map(f=>({x:f.x+f.w/2,y:f.y+f.h-8}))];
    for(const player of positions){const point=followPoint(player);assert.ok(canStand(point.x,point.y));assert.equal(zoneAt(point.x,point.y)?.id,z.id);assert.ok(findPath(SPAWN,point).length);assert.ok(audible(player,point));}
  }
});
