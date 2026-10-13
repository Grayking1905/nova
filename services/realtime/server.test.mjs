import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createOfficeServer } from './server.mjs';
import { SPAWN, fixtures, WORLD, interactionPoint } from '../../apps/desktop/src/world/map.ts';

async function setup(t) { const service=createOfficeServer();await new Promise(resolve=>service.server.listen(0,'127.0.0.1',resolve));t.after(()=>service.close());const address=`127.0.0.1:${service.server.address().port}`;return {service,address,base:`http://${address}`}; }
async function client(address,options={}) {
  const socket=new WebSocket(`ws://${address}`);const queue=[];const listeners=[];
  socket.on('message',raw=>{const message=JSON.parse(raw);const index=listeners.findIndex(item=>item.type===message.type);if(index>=0){const listener=listeners.splice(index,1)[0];clearTimeout(listener.timer);listener.resolve(message);}else queue.push(message);});
  const wait=type=>{const i=queue.findIndex(message=>message.type===type);if(i>=0)return Promise.resolve(queue.splice(i,1)[0]);return new Promise((resolve,reject)=>{const listener={type,resolve,timer:setTimeout(()=>reject(new Error(`Timed out waiting for ${type}`)),2500)};listeners.push(listener);});};
  await new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject);});
  const send=message=>socket.send(JSON.stringify(message));send({type:'join',roomId:'nova-campus',profile:{name:'Tester'},...options});return{socket,send,wait,queue};
}

test('two participants synchronize movement, chat, reactions, whiteboard, and signaling',async t=>{
  const {address}=await setup(t);const a=await client(address,{profile:{name:'Alice'}});const aw=await a.wait('welcome');const b=await client(address,{profile:{name:'Bob'}});const bw=await b.wait('welcome');assert.equal(bw.players.length,2);assert.equal((await a.wait('player')).player.name,'Bob');
  a.send({type:'move',x:123,y:234,direction:'left',moving:true});const moved=await b.wait('player');assert.equal(moved.player.x,123);assert.equal(moved.player.id,aw.id);
  a.send({type:'chat',text:'A shared idea',kind:'question'});assert.equal((await b.wait('chat')).message.text,'A shared idea');assert.equal((await a.wait('chat')).message.kind,'question');
  a.send({type:'status',hand:true,reaction:'👏'});assert.equal((await b.wait('player')).player.hand,true);
  a.send({type:'stroke',stroke:{points:[[.1,.2],[.5,.6]],width:4,color:'#123456'}});assert.equal((await b.wait('stroke')).stroke.color,'#123456');
  b.send({type:'clear-board'});await a.wait('clear-board');
  a.send({type:'signal',target:bw.id,data:{description:{type:'offer',sdp:'test'}}});assert.equal((await b.wait('signal')).from,aw.id);
  a.socket.close();assert.equal((await b.wait('left')).id,aw.id);
});

test('private rooms require a password and stay outside public listings and room traffic',async t=>{
  const {address,base}=await setup(t);const host=await client(address,{create:true,roomName:'Private team',password:'test-secret'});const hw=await host.wait('welcome');
  const rooms=await (await fetch(`${base}/rooms`)).json();assert.ok(!rooms.some(r=>r.id===hw.room.id));
  const denied=await client(address,{roomId:hw.room.id,password:'wrong'});assert.match((await denied.wait('error')).message,/password/);
  const guest=await client(address,{roomId:hw.room.id,password:'test-secret'});assert.equal((await guest.wait('welcome')).players.length,2);
  const outsider=await client(address);const ow=await outsider.wait('welcome');assert.equal(ow.players.length,1);
  host.send({type:'chat',text:'Private message'});await guest.wait('chat');assert.ok(!outsider.queue.some(m=>m.type==='chat'));
});

test('authorized uploads, presentation ownership, page changes, late join, and presenter departure',async t=>{
  const {address,base}=await setup(t);const a=await client(address);const aw=await a.wait('welcome');const b=await client(address);await b.wait('welcome');
  assert.equal((await fetch(`${base}/upload`,{method:'POST',body:'no session'})).status,401);
  const response=await fetch(`${base}/upload`,{method:'POST',headers:{Authorization:`Bearer ${aw.token}`,'Content-Type':'application/pdf'},body:'%PDF-1.4\n test'});assert.equal(response.status,201);const asset=await response.json();
  a.send({type:'presentation',source:{kind:'pdf',name:'Demo.pdf',url:asset.url,page:1}});const started=await b.wait('presentation');assert.equal(started.source.ownerId,aw.id);
  b.send({type:'presentation',source:null});assert.match((await b.wait('error')).message,/already presenting/);
  a.send({type:'slide',page:3});assert.equal((await b.wait('presentation')).source.page,3);
  const c=await client(address);assert.equal((await c.wait('welcome')).presentation.page,3);
  const served=await fetch(`${base}${asset.url}`);assert.equal(served.headers.get('content-type'),'application/pdf');assert.match(await served.text(),/%PDF/);
  a.socket.close();assert.equal((await b.wait('presentation')).source,null);
});

test('invalid movement and malformed strokes do not corrupt room state',async t=>{
  const {address,service}=await setup(t);const a=await client(address);const welcome=await a.wait('welcome');
  a.send({type:'move',x:'bad',y:-99999});a.send({type:'stroke',stroke:{points:[[-1,3],[Infinity,2]],color:'#fff',width:100}});a.send({type:'chat',text:'barrier'});await a.wait('chat');
  const room=service.rooms.get('nova-campus');assert.equal(room.players.get(welcome.id).x,SPAWN.x-66);assert.equal(room.strokes.length,0);
});

test('expanded bounds, shared component effects, lamp state, and occupied seats',async t=>{
  const {address}=await setup(t);const a=await client(address);const aw=await a.wait('welcome');
  const b=await client(address);await b.wait('welcome');await a.wait('player');
  a.send({type:'move',x:3200,y:2300,moving:true});assert.equal((await b.wait('player')).player.x,3200);
  const coffee=fixtures.find(f=>f.id==='cafe'),point=interactionPoint(coffee);
  a.send({type:'move',...point,moving:false});await b.wait('player');
  a.send({type:'interact',fixtureId:coffee.id});const brewed=await b.wait('interaction');assert.equal(brewed.interaction.fixtureId,'cafe');assert.equal(brewed.interaction.playerId,aw.id);await a.wait('interaction');
  const lamp=fixtures.find(f=>f.id==='lounge-lamp');b.send({type:'move',...interactionPoint(lamp)});await a.wait('player');
  b.send({type:'interact',fixtureId:lamp.id});assert.equal((await a.wait('fixture-state')).on,false);await a.wait('interaction');
  const late=await client(address);const welcome=await late.wait('welcome');assert.equal(welcome.fixtureStates[lamp.id],false);await a.wait('player');await b.wait('player');
  await new Promise(resolve=>setTimeout(resolve,300));
  const seat=fixtures.find(f=>f.id==='lounge-seat-a-0'),near=interactionPoint(seat);
  a.send({type:'move',...near});await b.wait('player');a.send({type:'interact',fixtureId:seat.id});
  const seated=await b.wait('player');assert.equal(seated.player.seatId,seat.id);assert.equal(seated.player.seated,true);await a.wait('player');
  b.send({type:'move',...near});await a.wait('player');b.send({type:'interact',fixtureId:seat.id});assert.match((await b.wait('error')).message,/occupied/);
  a.send({type:'move',x:near.x,y:near.y,moving:true});assert.equal((await b.wait('player')).player.seatId,null);
  a.send({type:'move',x:WORLD.width+999,y:WORLD.height+999,moving:true});const bounded=await b.wait('player');assert.equal(bounded.player.x,WORLD.width-40);assert.equal(bounded.player.y,WORLD.height-40);
});

test('boards keep separate drawings and presentations remember their spatial room',async t=>{
  const {address}=await setup(t);const a=await client(address);await a.wait('welcome');const b=await client(address);await b.wait('welcome');
  a.send({type:'stroke',boardId:'meeting-board',stroke:{points:[[.1,.2],[.3,.4]],color:'#123456',width:4}});assert.equal((await b.wait('stroke')).boardId,'meeting-board');
  const c=await client(address);const cw=await c.wait('welcome');assert.equal(cw.boards['meeting-board'].length,1);assert.equal(cw.boards.board.length,0);
  b.send({type:'clear-board',boardId:'board'});await a.wait('clear-board');
  a.send({type:'presentation',source:{kind:'screen',url:'',name:'Orbit screen',page:1,zoneId:'meeting'}});assert.equal((await b.wait('presentation')).source.zoneId,'meeting');
  const d=await client(address);const dw=await d.wait('welcome');assert.equal(dw.boards['meeting-board'].length,1);assert.equal(dw.presentation.zoneId,'meeting');
});
