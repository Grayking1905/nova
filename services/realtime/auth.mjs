import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { avatarProfile } from './identity.mjs';

const derive=promisify(scrypt),COOKIE='nova_session';
const publicFields={id:true,email:true,username:true,name:true,dateOfBirth:true,bio:true,jobTitle:true,company:true,avatar:true,photoUpdatedAt:true,createdAt:true};
const hash=token=>createHash('sha256').update(token).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const text=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const email=value=>text(value,254).toLowerCase();
const secure=()=>process.env.NODE_ENV==='production'||process.env.AUTH_COOKIE_SECURE==='true';
const origins=()=>new Set((process.env.CLIENT_ORIGIN||'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3001,http://127.0.0.1:3001,http://127.0.0.1:5182').split(',').map(value=>value.trim()));
function sessionToken(req){const part=req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith(`${COOKIE}=`));return part?.slice(COOKIE.length+1)||'';}
function cookie(res,token,remember=false){res.setHeader('Set-Cookie',`${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure()?'; Secure':''}${token?(remember?'; Max-Age=2592000':''):'; Max-Age=0'}`);}
function birthday(value){if(value==null||value==='')return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw fail(400,'Choose a valid date of birth.');const date=new Date(`${value}T00:00:00Z`);if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==value||+date>Date.now()||date.getUTCFullYear()<new Date().getUTCFullYear()-130)throw fail(400,'Choose a valid date of birth.');return date;}
function details(input){const name=text(input.name,50),username=text(input.username,24).toLowerCase();if(!name)throw fail(400,'Add your name.');if(!/^[a-z0-9_]{3,24}$/.test(username))throw fail(400,'Use 3–24 letters, numbers, or underscores for your handle.');return {name,username,dateOfBirth:birthday(input.dateOfBirth),bio:text(input.bio,280),jobTitle:text(input.jobTitle,60),company:text(input.company,80)};}
function password(value){if(typeof value!=='string'||value.length<15||value.length>128)throw fail(400,'Use a password or passphrase with 15–128 characters.');return value;}
let hashing=0;
async function passwordKey(value,salt){if(hashing>=2)throw fail(429,'A few people are signing in. Please try again in a moment.');hashing++;try{return await derive(value,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024});}finally{hashing--;}}
export async function passwordHash(value){const salt=randomBytes(16).toString('hex'),key=await passwordKey(password(value),salt);return `scrypt$${salt}$${key.toString('hex')}`;}
export async function passwordMatches(value,encoded){if(typeof value!=='string'||value.length>128)return false;const [algorithm,salt,key]=String(encoded).split('$');if(algorithm!=='scrypt'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(key))return false;return timingSafeEqual(await passwordKey(value,salt),Buffer.from(key,'hex'));}
async function read(req,limit=16384){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)throw fail(413,'This upload is too large. Profile photos can be up to 2 MB.');chunks.push(chunk);}return Buffer.concat(chunks);}
async function inputJSON(req){try{const input=JSON.parse((await read(req)).toString());if(!input||Array.isArray(input)||typeof input!=='object')throw new Error();return input;}catch(error){if(error.status)throw error;throw fail(400,'Send valid account details.');}}
const publicUser=user=>({...user,dateOfBirth:user.dateOfBirth?.toISOString().slice(0,10)||'',createdAt:user.createdAt.toISOString(),photoUrl:user.photoUpdatedAt?`/auth/photos/${user.id}?v=${user.photoUpdatedAt.getTime()}`:null,photoUpdatedAt:undefined,avatar:avatarProfile({...user.avatar,name:user.name})});

export function createAuth(db){
  const attempts=new Map();
  const service={onUserChanged:()=>{},onSessionsRevoked:()=>{}};
  function limit(key,max=25){const now=Date.now();for(const [id,item] of attempts)if(item.until<=now)attempts.delete(id);if(attempts.size>=3000&&!attempts.has(key))throw fail(429,'Please try again shortly.');let item=attempts.get(key);if(!item){item={count:0,until:now+900000};attempts.set(key,item);}if(++item.count>max)throw fail(429,'Too many attempts. Please try again in 15 minutes.');}
  async function getSession(req){const token=sessionToken(req);if(!/^[a-f0-9]{64}$/.test(token))return null;const session=await db.authSession.findUnique({where:{tokenHash:hash(token)},include:{user:{select:publicFields}}});return session&&session.expiresAt>Date.now()?{tokenHash:session.tokenHash,expiresAt:+session.expiresAt,user:publicUser(session.user)}:null;}
  async function newSession(userId,res,remember){const token=randomBytes(32).toString('hex');await db.$transaction([db.authSession.deleteMany({where:{expiresAt:{lt:new Date()}}}),db.authSession.create({data:{tokenHash:hash(token),userId,expiresAt:new Date(Date.now()+(remember?30*86400000:8*3600000))}})]);cookie(res,token,remember);}
  service.getSession=getSession;
  service.cors=(req,res)=>{const origin=req.headers.origin;if(origin&&!origins().has(origin))return false;if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Vary','Origin');}res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, X-Nova-Request, X-File-Name, X-Folder-Id, X-Shelf-Id');res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');return true;};
  service.authorizeSocket=async req=>{if(!req.headers.origin||!origins().has(req.headers.origin))return null;return getSession(req);};
  service.joined=(userId,workspaceId,owner)=>db.workspaceMember.upsert({where:{workspaceId_userId:{workspaceId,userId}},create:{workspaceId,userId,role:owner?'owner':'member'},update:{}});
  service.saveAvatar=async(userId,value)=>{const avatar=avatarProfile(value),current=await db.user.findUnique({where:{id:userId},select:{name:true}});const name=avatar.name===current.name.slice(0,24)?current.name:avatar.name;const user=await db.user.update({where:{id:userId},data:{avatar,name},select:publicFields});const result=publicUser(user);service.onUserChanged(result);return result;};
  service.handle=async(req,res,url,json)=>{
    try{
      res.setHeader('Cache-Control','no-store');
      const route=url.pathname;
      if(req.method!=='GET'&&req.headers['x-nova-request']!=='1')throw fail(403,'This request could not be verified. Refresh and try again.');
      if(req.method==='POST'&&['/auth/register','/auth/login','/auth/password'].includes(route))limit(`ip:${req.socket.remoteAddress}`);
      if(req.method==='POST'&&['/auth/register','/auth/login'].includes(route)){
        if(!req.headers['content-type']?.startsWith('application/json'))throw fail(415,'Send account details as JSON.');
        const input=await inputJSON(req),address=email(input.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw fail(400,'Enter a valid email address.');
        limit(`email:${address}`,12);
        let user;
        if(route==='/auth/register'){
          const profile=details(input),encoded=await passwordHash(input.password);
          user=await db.user.create({data:{...profile,email:address,passwordHash:encoded,avatar:avatarProfile({name:profile.name})},select:publicFields});
        }else{
          const found=await db.user.findUnique({where:{email:address},select:{...publicFields,passwordHash:true}});
          const valid=found?await passwordMatches(input.password,found.passwordHash):(await passwordHash(typeof input.password==='string'&&input.password.length>=15&&input.password.length<=128?input.password:'A temporary dummy passphrase'),false);
          if(!found||!valid)throw fail(401,'Email or password is incorrect.');
          const {passwordHash:unused,...profile}=found;void unused;user=profile;
        }
        await newSession(user.id,res,input.remember===true);return json(res,route==='/auth/register'?201:200,{user:publicUser(user)});
      }
      const session=await getSession(req);if(!session)throw fail(401,'Sign in to continue.');
      if(route==='/auth/me'&&req.method==='GET')return json(res,200,{user:session.user});
      if(route==='/auth/logout'&&req.method==='POST'){await db.authSession.deleteMany({where:{tokenHash:session.tokenHash}});cookie(res,'');service.onSessionsRevoked(session.user.id,session.tokenHash);return json(res,200,{ok:true});}
      if(route==='/auth/profile'&&req.method==='PATCH'){
        const input=await inputJSON(req),profile=details(input);
        const user=await db.user.update({where:{id:session.user.id},data:{...profile,avatar:avatarProfile({...session.user.avatar,name:profile.name})},select:publicFields});const result=publicUser(user);service.onUserChanged(result);return json(res,200,{user:result});
      }
      if(route==='/auth/avatar'&&req.method==='POST'){const value=await inputJSON(req);return json(res,200,{user:await service.saveAvatar(session.user.id,value)});}
      if(route==='/auth/photo'&&['POST','DELETE'].includes(req.method)){
        let image=null;if(req.method==='POST'){
          if(!['image/jpeg','image/png','image/webp'].includes(req.headers['content-type']?.split(';')[0]))throw fail(415,'Choose a PNG, JPEG, or WebP photo.');
          const bytes=await read(req,2*1024*1024);try{image=await sharp(bytes,{limitInputPixels:20000000}).rotate().resize(256,256,{fit:'cover'}).webp({quality:85}).toBuffer();}catch{throw fail(400,'That image could not be read. Choose a PNG, JPEG, or WebP photo.');}
        }
        const user=await db.user.update({where:{id:session.user.id},data:{photoData:image,photoUpdatedAt:image?new Date():null},select:publicFields});const result=publicUser(user);service.onUserChanged(result);return json(res,200,{user:result});
      }
      if(route.startsWith('/auth/photos/')&&req.method==='GET'){
        const id=route.split('/').pop();if(!/^[a-f0-9-]{36}$/.test(id))throw fail(404,'Photo not found.');
        const photo=await db.user.findUnique({where:{id},select:{photoData:true}});if(!photo?.photoData)throw fail(404,'Photo not found.');res.writeHead(200,{'Content-Type':'image/webp','Content-Length':photo.photoData.length,'Cache-Control':'private, max-age=300','X-Content-Type-Options':'nosniff'});res.end(Buffer.from(photo.photoData));return;
      }
      if(route==='/auth/password'&&req.method==='POST'){
        const input=await inputJSON(req),user=await db.user.findUnique({where:{id:session.user.id},select:{passwordHash:true}});
        if(!await passwordMatches(input.currentPassword,user.passwordHash))throw fail(401,'Your current password is incorrect.');
        const encoded=await passwordHash(input.newPassword);await db.$transaction([db.user.update({where:{id:session.user.id},data:{passwordHash:encoded}}),db.authSession.deleteMany({where:{userId:session.user.id}})]);cookie(res,'');service.onSessionsRevoked(session.user.id);return json(res,200,{ok:true});
      }
      throw fail(404,'Account action not found.');
    }catch(error){if(!res.headersSent)json(res,error.code==='P2002'?409:error.status||500,{error:error.code==='P2002'?'These account details cannot be used. Try signing in or choose a different handle.':error.status?error.message:'Account service is unavailable. Please try again.'});}
  };
  return service;
}
