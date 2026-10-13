import http from 'node:http';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { WORLD, SPAWN, fixtures, fixtureDistance, canStand, zones } from '../../apps/desktop/src/world/map.ts';

const MAX_FILE = 20 * 1024 * 1024;
const clean = (value, max = 40) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const color = (value, fallback) => /^#[a-f\d]{6}$/i.test(value) ? value : fallback;
const profile = value => ({ name: clean(value?.name, 24) || 'Teammate', skin: color(value?.skin, '#d8a17b'), hair: color(value?.hair, '#302332'), shirt: color(value?.shirt, '#8b7cf8'), style: ['short', 'long', 'curly'].includes(value?.style) ? value.style : 'short' });
const makeRoom = (id, name, password = '') => ({ id, name, private: !!password, salt: randomBytes(16).toString('hex'), password, players: new Map(), messages: [], strokes: [], boards: {board:[]}, fixtureStates: {}, presentation: null, assets: new Map() });

export function createOfficeServer() {
  const rooms = new Map();
  rooms.set('nova-campus', makeRoom('nova-campus', 'Nova Campus'));
  const clients = new Map();
  const send = (socket, data) => { if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(data)); };
  const broadcast = (room, data, except) => { for (const [socket, client] of clients) if (client.room === room && socket !== except) send(socket, data); };
  const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname === '/health') return json(res, 200, { status: 'ok', rooms: rooms.size, participants: clients.size });
    if (url.pathname === '/rooms') return json(res, 200, [...rooms.values()].filter(r => !r.private).map(r => ({ id: r.id, name: r.name, count: r.players.size })));
    if (url.pathname.startsWith('/assets/') && req.method === 'GET') {
      const id = url.pathname.split('/').pop();
      for (const room of rooms.values()) {
        const asset = room.assets.get(id);
        if (asset) { res.writeHead(200, { 'Content-Type': asset.type, 'Content-Length': asset.data.length, 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" }); res.end(asset.data); return; }
      }
      return json(res, 404, { error: 'This presentation is no longer available.' });
    }
    if (url.pathname === '/upload' && req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const client = [...clients.values()].find(c => c.token === token);
      if (!client) return json(res, 401, { error: 'Join a room before uploading.' });
      const type = req.headers['content-type']?.split(';')[0];
      if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/json'].includes(type)) return json(res, 415, { error: 'Choose a PDF, image, or PowerPoint deck.' });
      let size = 0; const chunks = [];
      try {
        for await (const chunk of req) { size += chunk.length; if (size > MAX_FILE) { json(res, 413, { error: 'Files must be under 20 MB.' }); return; } chunks.push(chunk); }
        if (!clients.has(client.socket)) return json(res, 401, { error: 'Room session ended.' });
        const data = Buffer.concat(chunks);
        if (type === 'application/json') { const deck = JSON.parse(data.toString()); if (!Array.isArray(deck.slides) || deck.slides.length > 200) throw new Error('Invalid deck'); }
        if (client.room.assets.size >= 8) return json(res, 409, { error: 'Room file limit reached. Start a new room for more files.' });
        const id = randomUUID(); client.room.assets.set(id, { data, type }); json(res, 201, { url: `/assets/${id}` });
      } catch { if (!res.headersSent) json(res, 400, { error: 'The file could not be read.' }); }
      return;
    }
    json(res, 404, { error: 'Not found' });
  });
  const wss = new WebSocketServer({ server, maxPayload: 128 * 1024 });
  wss.on('connection', socket => {
    const joinTimeout = setTimeout(() => { if (!clients.has(socket)) socket.close(1008, 'Join timeout'); }, 15000);
    socket.on('message', raw => {
      try {
        const message = JSON.parse(raw.toString()); let client = clients.get(socket);
        if (!client) {
          if (message.type !== 'join') return;
          let room;
          if (message.create) {
            if (rooms.size >= 100) return send(socket, { type: 'error', message: 'Room limit reached.' });
            const id = randomBytes(4).toString('hex'); const password = clean(message.password, 100);
            room = makeRoom(id, clean(message.roomName) || 'Team space', password);
            if (password) room.password = scryptSync(password, room.salt, 32).toString('hex');
            rooms.set(id, room);
          } else room = rooms.get(clean(message.roomId) || 'nova-campus');
          if (!room) return send(socket, { type: 'error', message: 'Room not found. Check the room code.' });
          if (room.private && !message.create) {
            const hash = scryptSync(clean(message.password, 100), room.salt, 32);
            if (!timingSafeEqual(hash, Buffer.from(room.password, 'hex'))) return send(socket, { type: 'error', message: 'That room password is incorrect.' });
          }
          if (room.players.size >= 12) return send(socket, { type: 'error', message: 'This room is full (12 people).' });
          const id = randomUUID(); const p = { id, ...profile(message.profile), x: SPAWN.x + ((room.players.size % 4)-1.5) * 44, y: SPAWN.y + Math.floor(room.players.size/4)*40, direction: 'down', moving: false, hand: false, mic: false, camera: false, sharing: false, seated: false, seatId: null, reaction: '', reactionAt: 0 };
          client = { id, room, token: randomBytes(24).toString('hex'), socket, lastMessage: 0, windowStart: Date.now(), count: 0 };
          clients.set(socket, client); room.players.set(id, p); clearTimeout(joinTimeout);
          send(socket, { type: 'welcome', id, token: client.token, room: { id: room.id, name: room.name, private: room.private }, players: [...room.players.values()], messages: room.messages, strokes: room.strokes, boards: room.boards, fixtureStates: room.fixtureStates, presentation: room.presentation });
          broadcast(room, { type: 'player', player: p }, socket); return;
        }
        const now = Date.now(); if (now - client.windowStart > 1000) { client.windowStart = now; client.count = 0; }
        if (++client.count > 90) return;
        const { room, id } = client; const p = room.players.get(id);
        switch (message.type) {
          case 'move': {
            if (!Number.isFinite(message.x) || !Number.isFinite(message.y)) return;
            p.x = Math.max(40, Math.min(WORLD.width-40, message.x)); p.y = Math.max(40, Math.min(WORLD.height-40, message.y));
            p.direction = ['up', 'down', 'left', 'right'].includes(message.direction) ? message.direction : p.direction;
            p.moving = !!message.moving;if(p.moving)p.seatId=null;p.seated=!!p.seatId;
            broadcast(room, { type: 'player', player: p }, socket); break;
          }
          case 'interact': {
            const fixture=fixtures.find(f=>f.id===message.fixtureId);
            if(!fixture?.label||fixtureDistance(fixture,p.x,p.y)>150)return send(socket,{type:'error',message:'Walk closer to interact with that component.'});
            if(now-(client.lastInteraction||0)<250)return;
            if(fixture.type==='chair') {
              if([...room.players.values()].some(other=>other.id!==id&&other.seatId===fixture.id))return send(socket,{type:'error',message:'That seat is occupied. Choose another chair.'});
              const x=fixture.x+fixture.w/2,y=fixture.y+fixture.h-8;
              if(!canStand(x,y))return;
              p.seated=p.seatId!==fixture.id;p.seatId=p.seated?fixture.id:null;p.moving=false;
              if(p.seated){p.x=x;p.y=y;p.direction='down';}
              broadcast(room,{type:'player',player:p});
            }
            if(fixture.type==='lamp'){room.fixtureStates[fixture.id]=room.fixtureStates[fixture.id]===false;broadcast(room,{type:'fixture-state',fixtureId:fixture.id,on:room.fixtureStates[fixture.id]});}
            client.lastInteraction=now;
            broadcast(room,{type:'interaction',interaction:{id:randomUUID(),fixtureId:fixture.id,playerId:id,startedAt:now}});
            break;
          }
          case 'status': {
            for (const key of ['hand', 'mic', 'camera', 'sharing']) if (typeof message[key] === 'boolean') p[key] = message[key];
            if (typeof message.reaction === 'string' && ['👋', '👏', '💜', '🎉', '👍', '💡'].includes(message.reaction)) { p.reaction = message.reaction; p.reactionAt = now; }
            broadcast(room, { type: 'player', player: p }); break;
          }
          case 'chat': {
            const text = clean(message.text, 1200); if (!text || now - client.lastMessage < 300) return; client.lastMessage = now;
            const chat = { id: randomUUID(), playerId: id, name: p.name, color: p.shirt, text, time: now, kind: message.kind === 'question' ? 'question' : 'message' };
            room.messages.push(chat); room.messages = room.messages.slice(-100); broadcast(room, { type: 'chat', message: chat }); break;
          }
          case 'stroke': {
            const boardId=clean(message.boardId)||'board';
            if(!fixtures.some(f=>f.id===boardId&&f.type==='board'))return;
            const board=room.boards[boardId]||=[];
            const stroke = message.stroke;
            if (!Array.isArray(stroke?.points) || stroke.points.length < 2 || stroke.points.length > 600 || !stroke.points.every(pt => Array.isArray(pt) && pt.length === 2 && pt.every(n => Number.isFinite(n) && n >= 0 && n <= 1))) return;
            if (Object.values(room.boards).reduce((sum,strokes)=>sum+strokes.length,0) >= 1500) return send(socket, { type: 'error', message: 'Whiteboard is full. Clear it to keep drawing.' });
            const valid = { id: randomUUID(), color: color(stroke.color, '#8b7cf8'), width: [2, 4, 8].includes(stroke.width) ? stroke.width : 4, points: stroke.points };
            board.push(valid);if(boardId==='board')room.strokes=board;broadcast(room,{type:'stroke',boardId,stroke:valid}); break;
          }
          case 'clear-board': {const boardId=clean(message.boardId)||'board';if(!fixtures.some(f=>f.id===boardId&&f.type==='board'))return;room.boards[boardId]=[];if(boardId==='board')room.strokes=[];broadcast(room,{type:'clear-board',boardId});break;}
          case 'presentation': {
            if (room.presentation && room.presentation.ownerId !== id) return send(socket, { type: 'error', message: 'Someone is already presenting.' });
            if (!message.source) { room.presentation = null; broadcast(room, { type: 'presentation', source: null }); break; }
            const source = message.source;
            if (!['pdf', 'image', 'slides', 'screen'].includes(source.kind)) return;
            if (source.kind !== 'screen' && !room.assets.has(clean(source.url, 100).split('/').pop())) return;
            room.presentation = { kind: source.kind, name: clean(source.name, 120), url: clean(source.url, 100), page: Math.max(1, Math.min(200, Math.floor(source.page) || 1)), ownerId: id, ownerName: p.name, zoneId: zones.some(z=>z.id===source.zoneId)?source.zoneId:'stage' };
            broadcast(room, { type: 'presentation', source: room.presentation }); break;
          }
          case 'slide': if (room.presentation?.ownerId === id && Number.isInteger(message.page)) { room.presentation.page = Math.max(1, Math.min(200, message.page)); broadcast(room, { type: 'presentation', source: room.presentation }); } break;
          case 'signal': {
            const target = [...clients.values()].find(c => c.id === message.target && c.room === room);
            if (target && JSON.stringify(message.data).length < 20000) send(target.socket, { type: 'signal', from: id, data: message.data }); break;
          }
        }
      } catch { send(socket, { type: 'error', message: 'The request could not be processed.' }); }
    });
    socket.on('close', () => {
      clearTimeout(joinTimeout); const client = clients.get(socket); if (!client) return;
      clients.delete(socket); const { room, id } = client; room.players.delete(id); broadcast(room, { type: 'left', id });
      if (room.presentation?.ownerId === id) { room.presentation = null; broadcast(room, { type: 'presentation', source: null }); }
      if (!room.players.size) { room.assets.clear(); if (room.id !== 'nova-campus') rooms.delete(room.id); }
    });
    socket.on('error', () => socket.close());
  });
  return { server, wss, rooms, close: () => new Promise(resolve => { for (const socket of wss.clients) socket.terminate(); wss.close(); server.close(resolve); }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { server } = createOfficeServer(); const port = Number(process.env.PORT || 3001);
  server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Nova room server listening on http://localhost:${port}`));
}
