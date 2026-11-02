import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { once } from 'node:events';
import sharp from 'sharp';
import { WebSocket } from 'ws';
import { createAuth, passwordHash, passwordMatches } from './auth.mjs';
import { createOfficeServer } from './server.mjs';
import { connectDatabase, workspaceStore } from './database.mjs';

// These deliberately public fixtures are never used for a real user account.
const passphrase='Nova integration test passphrase';
const origin='http://127.0.0.1:5173';

test('passwords use distinct salted hashes and reject invalid values',async()=>{
  const a=await passwordHash(passphrase),b=await passwordHash(passphrase);
  assert.notEqual(a,b);assert.ok(await passwordMatches(passphrase,a));
  assert.equal(await passwordMatches('incorrect',a),false);
  assert.equal(await passwordMatches(passphrase,'invalid'),false);
  await assert.rejects(passwordHash('short'),{status:400});
});

async function peer(address,cookie,options={}){
  const socket=new WebSocket(address,{headers:{Origin:origin,...cookie?{Cookie:cookie}:{}}}),queue=[],waiters=[];
  socket.on('message',raw=>{const value=JSON.parse(raw),i=waiters.findIndex(w=>w.type===value.type);if(i<0)queue.push(value);else{const w=waiters.splice(i,1)[0];clearTimeout(w.timer);w.resolve(value);}});
  const wait=type=>{const i=queue.findIndex(m=>m.type===type);if(i>=0)return Promise.resolve(queue.splice(i,1)[0]);return new Promise((resolve,reject)=>waiters.push({type,resolve,timer:setTimeout(()=>reject(new Error(`Missing ${type}`)),8000)}));};
  await once(socket,'open');socket.send(JSON.stringify({type:'join',profile:{name:'Spoofed identity'},...options}));return {socket,wait,queue};
}

test('accounts, private profiles, authenticated multiplayer and revoked sessions survive PostgreSQL restarts',{skip:process.env.NOVA_DATABASE_TEST!=='1',timeout:120000},async t=>{
  const db=await connectDatabase(),users=[],workspaces=[],servers=[];
  const store={...workspaceStore(db),close:async()=>{}};
  let base,address;
  async function start(){const service=createOfficeServer({store,auth:createAuth(db)});await service.ready;await new Promise(resolve=>service.server.listen(0,'127.0.0.1',resolve));servers.push(service);base=`http://127.0.0.1:${service.server.address().port}`;address=base.replace('http:','ws:');return service;}
  async function api(path,{method='GET',value,cookie,headers={},body}={}){
    const response=await fetch(`${base}${path}`,{method,headers:{Origin:origin,'X-Nova-Request':'1',...value?{'Content-Type':'application/json'}:{},...cookie?{Cookie:cookie}:{},...headers},body:value?JSON.stringify(value):body});
    const data=response.headers.get('content-type')?.includes('application/json')?await response.json():null;
    return {response,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
  }
  t.after(async()=>{for(const service of servers)await service.close();await db.workspace.deleteMany({where:{id:{in:workspaces}}});await db.user.deleteMany({where:{id:{in:users}}});await db.$disconnect();});
  const first=await start(),suffix=randomUUID().slice(0,8);
  const profile={name:'Auth QA',email:`nova-${suffix}@example.invalid`,username:`qa_${suffix}`,password:passphrase,dateOfBirth:'1995-03-12'};
  assert.equal((await api('/rooms')).response.status,401);
  assert.equal((await api('/auth/register',{method:'POST',value:profile,headers:{Origin:'https://untrusted.invalid'}})).response.status,403);
  assert.equal((await api('/auth/register',{method:'POST',value:profile,headers:{'X-Nova-Request':''}})).response.status,403);
  assert.equal((await api('/auth/register',{method:'POST',value:{...profile,dateOfBirth:'2999-01-01'}})).response.status,400);
  assert.equal((await api('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'})).response.status,400);
  const registration=await api('/auth/register',{method:'POST',value:profile});assert.equal(registration.response.status,201);const id=registration.data.user.id;users.push(id);
  const cookie=registration.cookie;assert.match(registration.response.headers.get('set-cookie'),/HttpOnly; SameSite=Lax/);
  assert.equal(registration.data.user.dateOfBirth,'1995-03-12');assert.ok(!('passwordHash' in registration.data.user));assert.ok(!('photoData' in registration.data.user));
  const stored=await db.user.findUnique({where:{id}});assert.notEqual(stored.passwordHash,passphrase);
  assert.ok(await db.authSession.findUnique({where:{tokenHash:createHash('sha256').update(cookie.split('=')[1]).digest('hex')}}));
  assert.equal((await api('/auth/register',{method:'POST',value:profile})).response.status,409);
  assert.equal((await api('/auth/login',{method:'POST',value:{email:profile.email,password:'incorrect'}})).response.status,401);
  const login=await api('/auth/login',{method:'POST',value:{email:profile.email,password:passphrase,remember:true}});assert.equal(login.response.status,200);assert.match(login.response.headers.get('set-cookie'),/Max-Age=2592000/);
  const secondSession=login.cookie;
  assert.equal((await api('/auth/profile',{method:'PATCH',cookie,value:{...profile,name:'QA Profile',bio:'Building together',jobTitle:'Designer',company:'Nova'}})).response.status,200);
  const longName='A thoughtfully named Nova teammate';
  await api('/auth/profile',{method:'PATCH',cookie,value:{...profile,name:longName}});
  const look=await api('/auth/avatar',{method:'POST',cookie,value:{name:longName.slice(0,24),shirt:'#aabbcc'}});assert.equal(look.data.user.name,longName);
  await api('/auth/profile',{method:'PATCH',cookie,value:{...profile,name:'QA Profile',bio:'Building together',jobTitle:'Designer',company:'Nova'}});
  const photo=await sharp({create:{width:40,height:30,channels:3,background:'#aecab9'}}).png().toBuffer();
  assert.equal((await api('/auth/photo',{method:'POST',cookie,headers:{'Content-Type':'image/png'},body:'invalid'})).response.status,400);
  const upload=await api('/auth/photo',{method:'POST',cookie,headers:{'Content-Type':'image/png'},body:photo});assert.equal(upload.response.status,200);
  const photoURL=upload.data.user.photoUrl;assert.equal((await api(photoURL)).response.status,401);
  const image=await fetch(`${base}${photoURL}`,{headers:{Cookie:cookie}});assert.equal(image.headers.get('content-type'),'image/webp');const metadata=await sharp(Buffer.from(await image.arrayBuffer())).metadata();assert.equal(metadata.width,256);assert.equal(metadata.height,256);
  const anonymous=await peer(address,null);assert.equal((await anonymous.wait('error')).code,'AUTH_REQUIRED');
  const host=await peer(address,cookie,{create:true,roomName:'Account QA'}),welcome=await host.wait('welcome');workspaces.push(welcome.room.id);
  assert.equal(welcome.id,id);assert.equal(welcome.players[0].name,'QA Profile');assert.equal(welcome.players[0].photoUrl,photoURL);assert.ok(!JSON.stringify(welcome).includes('1995-03-12'));assert.ok(!JSON.stringify(welcome).includes(profile.email));
  const duplicate=await peer(address,secondSession,{roomId:welcome.room.id});assert.match((await duplicate.wait('error')).message,/another tab/);duplicate.socket.close();
  assert.equal(await db.workspaceMember.count({where:{userId:id,workspaceId:welcome.room.id}}),1);
  const other=await api('/auth/register',{method:'POST',value:{...profile,email:`other-${suffix}@example.invalid`,username:`other_${suffix}`,name:'Other Person'}});assert.equal(other.response.status,201);users.push(other.data.user.id);
  const teammate=await peer(address,other.cookie,{roomId:welcome.room.worldSeed});const otherWelcome=await teammate.wait('welcome');assert.equal(otherWelcome.players.length,2);assert.equal(otherWelcome.room.id,welcome.room.id);
  const pending=new WebSocket(address,{headers:{Origin:origin,Cookie:cookie}});await once(pending,'open');
  const ended=once(host.socket,'close');assert.equal((await api('/auth/logout',{method:'POST',cookie})).response.status,200);assert.equal((await ended)[0],4401);
  const rejected=once(pending,'message');pending.send(JSON.stringify({type:'join',roomId:welcome.room.id}));assert.equal(JSON.parse((await rejected)[0]).code,'AUTH_REQUIRED');
  assert.equal((await api('/auth/me',{cookie})).response.status,401);assert.equal((await api('/auth/me',{cookie:secondSession})).response.status,200);
  await first.close();servers.pop();await start();
  const restored=await api('/auth/me',{cookie:secondSession});assert.equal(restored.data.user.id,id);assert.equal(restored.data.user.bio,'Building together');assert.equal(restored.data.user.dateOfBirth,'1995-03-12');
  const rejoined=await peer(address,secondSession,{roomId:welcome.room.worldSeed});assert.equal((await rejoined.wait('welcome')).id,id);
  assert.equal((await api('/auth/password',{method:'POST',cookie:secondSession,value:{currentPassword:'wrong',newPassword:'Another integration passphrase'}})).response.status,401);
  const revoked=once(rejoined.socket,'close');assert.equal((await api('/auth/password',{method:'POST',cookie:secondSession,value:{currentPassword:passphrase,newPassword:'Another integration passphrase'}})).response.status,200);assert.equal((await revoked)[0],4401);
  assert.equal(await db.authSession.count({where:{userId:id}}),0);assert.equal((await api('/auth/me',{cookie:secondSession})).response.status,401);
  assert.equal((await api('/auth/login',{method:'POST',value:{email:profile.email,password:passphrase}})).response.status,401);
  assert.equal((await api('/auth/login',{method:'POST',value:{email:profile.email,password:'Another integration passphrase'}})).response.status,200);
});
