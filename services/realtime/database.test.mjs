import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { createOfficeServer } from './server.mjs';
import { connectDatabase, workspaceStore } from './database.mjs';

async function participant(address, options) {
  const socket = new WebSocket(address), messages = [], waiters = [];
  socket.on('message', raw => {
    const value = JSON.parse(raw), index = waiters.findIndex(w => w.type === value.type);
    if (index < 0) messages.push(value);
    else { const w = waiters.splice(index, 1)[0]; clearTimeout(w.timer); w.resolve(value); }
  });
  const wait = type => {
    const index = messages.findIndex(m => m.type === type);
    if (index >= 0) return Promise.resolve(messages.splice(index, 1)[0]);
    return new Promise((resolve, reject) => waiters.push({ type, resolve, timer: setTimeout(() => reject(new Error(`Missing ${type}`)), 10000) }));
  };
  await once(socket, 'open');
  const send = message => socket.send(JSON.stringify(message));
  send({ type: 'join', profile: { name: 'Database QA' }, ...options });
  return { socket, send, wait, messages };
}
async function listen(store) {
  const service = createOfficeServer({ store }); await service.ready;
  await new Promise(resolve => service.server.listen(0, '127.0.0.1', resolve));
  return { service, address: `ws://127.0.0.1:${service.server.address().port}`, base: `http://127.0.0.1:${service.server.address().port}` };
}

test('world seeds join the same isolated workplace and concurrent membership respects capacity', async t => {
  const { service, address } = await listen(null); t.after(() => service.close());
  const host = await participant(address, { create: true, roomName: 'Seed QA' }); const welcome = await host.wait('welcome');
  const peers = await Promise.all(Array.from({ length: 11 }, () => participant(address, { roomId: welcome.room.worldSeed })));
  const welcomes = await Promise.all(peers.map(peer => peer.wait('welcome')));
  assert.ok(welcomes.every(value => value.room.id === welcome.room.id));
  assert.equal(service.rooms.get(welcome.room.id).players.size, 12);
  const overflow = await participant(address, { roomId: welcome.room.id }); assert.match((await overflow.wait('error')).message, /full/);
  const outsider = await participant(address, { create: true, roomName: 'Other workplace' }); await outsider.wait('welcome');
  host.send({ type: 'chat', text: 'Only this workplace' }); await peers[0].wait('chat');
  host.send({ type: 'status', hand: true }); await host.wait('player');
  assert.ok(!outsider.messages.some(m => m.type === 'chat'));
});

test('failed database writes roll back changes instead of broadcasting success', async t => {
  const store = { load: async () => null, create: async () => {}, save: async () => { throw new Error('Simulated outage'); }, close: async () => {} };
  const { service, address } = await listen(store); t.after(() => service.close());
  const a = await participant(address, {}); await a.wait('welcome');
  a.send({ type: 'chat', text: 'Must not be acknowledged' }); assert.match((await a.wait('error')).message, /could not save/);
  assert.equal(service.rooms.get('nova-campus').messages.length, 0);
  assert.ok(!a.messages.some(m => m.type === 'chat'));
});

test('PostgreSQL retains private workplaces, room state and assets across server restarts', { skip: process.env.NOVA_DATABASE_TEST !== '1' }, async t => {
  const db = await connectDatabase(), ids = [], servers = [];
  const store = { ...workspaceStore(db), close: async () => {} };
  t.after(async () => {
    for (const server of servers) await server.close();
    // Remove only the exact workspace created by this test; cascading FKs remove its QA data.
    await db.workspace.deleteMany({ where: { id: { in: ids } } }); await db.$disconnect();
  });
  const first = await listen(store); servers.push(first.service);
  const a = await participant(first.address, { create: true, roomName: 'Persistence QA', password: 'test-only-password' });
  const aw = await a.wait('welcome'); ids.push(aw.room.id);
  a.send({ type: 'chat', text: 'A durable idea', zoneId: 'studio' }); await a.wait('chat');
  a.send({ type: 'note-create', text: 'A durable note', zoneId: 'studio' }); await a.wait('notes');
  a.send({ type: 'stroke', boardId: 'board', stroke: { points: [[.1,.2],[.3,.4]], color: '#123456', width: 4 } }); await a.wait('stroke');
  const upload = await fetch(`${first.base}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${aw.token}`, 'Content-Type': 'application/pdf' }, body: '%PDF-1.4 QA' });
  assert.equal(upload.status, 201); const asset = await upload.json();
  assert.equal(await db.space.count({ where: { workspaceId: aw.room.id } }), 9);
  const shelf=(await import('../../apps/desktop/src/world/map.ts')).fixtures.find(f=>f.type==='shelf');
  const folderResponse=await fetch(`${first.base}/library/folders`,{method:'POST',headers:{Authorization:`Bearer ${aw.token}`,'Content-Type':'application/json'},body:JSON.stringify({name:'Saved team files',shelfId:shelf.id})});
  assert.equal(folderResponse.status,200);const folder=(await folderResponse.json()).folders[0];await a.wait('library');
  const resourceResponse=await fetch(`${first.base}/library/upload`,{method:'POST',headers:{Authorization:`Bearer ${aw.token}`,'Content-Type':'text/plain','X-File-Name':'Handbook.txt','X-Folder-Id':folder.id,'X-Shelf-Id':shelf.id},body:'A persistent shared handbook'});
  assert.equal(resourceResponse.status,200);const resource=(await resourceResponse.json()).files[0];await a.wait('library');
  await first.service.close(); servers.pop();
  const second = await listen(store); servers.push(second.service);
  const denied = await participant(second.address, { roomId: aw.room.worldSeed, password: 'wrong' }); assert.match((await denied.wait('error')).message, /password/);
  const b = await participant(second.address, { roomId: aw.room.worldSeed, password: 'test-only-password' }); const bw = await b.wait('welcome');
  assert.equal(bw.room.id, aw.room.id); assert.equal(bw.messages[0].text, 'A durable idea'); assert.equal(bw.notes[0].text, 'A durable note'); assert.equal(bw.boards.board.length, 1);
  assert.equal(bw.library.folders[0].name,'Saved team files');assert.equal(bw.library.files[0].id,resource.id);
  const resourceDownload=await fetch(`${second.base}/assets/${resource.id}`,{headers:{Authorization:`Bearer ${bw.token}`}});assert.equal(await resourceDownload.text(),'A persistent shared handbook');
  assert.equal(bw.players.length, 1); assert.equal(bw.presentation, null);
  const peer = await participant(second.address, { roomId: aw.room.id, password: 'test-only-password' }); assert.equal((await peer.wait('welcome')).players.length, 2);
  assert.equal((await fetch(`${second.base}${asset.url}`)).status, 401);
  const file = await fetch(`${second.base}${asset.url}`, { headers: { Authorization: `Bearer ${bw.token}` } }); assert.equal(file.status, 200); assert.match(await file.text(), /%PDF/);
  const outsider = await participant(second.address, {}); const ow = await outsider.wait('welcome');
  assert.equal((await fetch(`${second.base}${asset.url}`, { headers: { Authorization: `Bearer ${ow.token}` } })).status, 404);
  assert.ok(!(await (await fetch(`${second.base}/rooms`)).json()).some(room => room.id === aw.room.id));
});
