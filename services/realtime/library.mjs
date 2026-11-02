import { randomUUID } from 'node:crypto';
import { fixtures } from '../../apps/desktop/src/world/map.ts';

const name = value => typeof value === 'string' ? value.replace(/[\x00-\x1f/\\]/g,' ').trim().slice(0,120) : '';
const failure = (status,message) => Object.assign(new Error(message),{status});
async function body(req,limit) {
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>limit)throw failure(413,'Choose files smaller than 20 MB.');chunks.push(chunk);}
  return Buffer.concat(chunks);
}

export function libraryHandler({clients,store,enqueue,broadcast,json}) {
  return async (req,res,url) => {
    const client=[...clients.values()].find(c=>c.token===req.headers.authorization?.replace('Bearer ',''));
    if(!client)return json(res,401,{error:'Join the workplace to use its library.'});
    try {
      if(req.method==='GET'&&url.pathname==='/library')return json(res,200,client.room.library);
      const data=req.method==='POST'?await body(req,url.pathname==='/library/upload'?20*1024*1024:16384):null;
      const input=data&&url.pathname!=='/library/upload'?JSON.parse(data.toString()):{};
      await enqueue(async()=>{
        if(!clients.has(client.socket))throw failure(401,'Your workplace session ended.');
        const room=client.room,library=structuredClone(room.library),change={};
        const folderId=(url.pathname==='/library/upload'?req.headers['x-folder-id']:input.folderId)||null;
        const folder=folderId?library.folders.find(f=>f.id===folderId):null;
        if(folderId&&!folder)throw failure(404,'That folder is no longer available.');
        const shelfId=folder?.shelfId||(url.pathname==='/library/upload'?req.headers['x-shelf-id']:input.shelfId);
        if(req.method==='POST'&&!fixtures.some(f=>f.id===shelfId&&f.type==='shelf'))throw failure(400,'Choose a bookshelf for this resource.');
        if(url.pathname==='/library/folders'&&req.method==='POST') {
          const title=name(input.name);if(!title)throw failure(400,'Give the folder a name.');
          if(library.folders.length>=40)throw failure(409,'This library supports up to 40 folders.');
          let parent=folder,depth=0;while(parent){depth++;parent=library.folders.find(f=>f.id===parent.parentId);}
          if(depth>=8)throw failure(400,'Keep folders within eight levels.');
          if(library.folders.some(f=>f.parentId===folderId&&f.shelfId===shelfId&&f.name.toLowerCase()===title.toLowerCase()))throw failure(409,'A folder with that name already exists here.');
          library.folders.push({id:randomUUID(),name:title,parentId:folderId,shelfId,createdBy:client.room.players.get(client.id)?.name||'Teammate'});
        } else if(url.pathname==='/library/upload'&&req.method==='POST') {
          if(library.files.length>=100)throw failure(409,'This library supports up to 100 resources.');
          const title=name(decodeURIComponent(req.headers['x-file-name']||''));if(!title||!data.length)throw failure(400,'Choose a non-empty file.');
          const type=String(req.headers['content-type']||'application/octet-stream').split(';')[0];
          const id=randomUUID();change.put={id,type,data};
          library.files.push({id,name:title,folderId,shelfId,kind:'file',type,size:data.length,createdAt:Date.now(),createdBy:room.players.get(client.id)?.name||'Teammate'});
        } else if(url.pathname==='/library/links'&&req.method==='POST') {
          if(library.files.length>=100)throw failure(409,'This library supports up to 100 resources.');
          const target=new URL(input.url);if(!['http:','https:'].includes(target.protocol)||target.username||target.password)throw failure(400,'Use an ordinary https or http link.');
          const title=name(input.name);if(!title)throw failure(400,'Give the link a title.');
          library.files.push({id:randomUUID(),name:title,folderId,shelfId,kind:'link',type:'link',url:target.href,size:0,createdAt:Date.now(),createdBy:room.players.get(client.id)?.name||'Teammate'});
        } else if(req.method==='POST'&&/^\/library\/files\/[^/]+\/move$/.test(url.pathname)) {
          const id=url.pathname.split('/')[3],file=library.files.find(f=>f.id===id);if(!file)throw failure(404,'That resource is no longer available.');
          file.folderId=folderId;file.shelfId=shelfId;
        } else if(req.method==='DELETE'&&url.pathname.startsWith('/library/files/')) {
          const id=url.pathname.split('/').pop(),file=library.files.find(f=>f.id===id);if(!file)throw failure(404,'That resource is no longer available.');
          library.files=library.files.filter(f=>f.id!==id);if(file.kind==='file')change.remove=id;
        } else if(req.method==='DELETE'&&url.pathname.startsWith('/library/folders/')) {
          const id=url.pathname.split('/').pop();if(!library.folders.some(f=>f.id===id))throw failure(404,'That folder is no longer available.');
          if(library.files.some(f=>f.folderId===id)||library.folders.some(f=>f.parentId===id))throw failure(409,'Remove the contents before removing this folder.');
          library.folders=library.folders.filter(f=>f.id!==id);
        } else throw failure(404,'Library action not found.');
        // Commit file bytes and metadata atomically, then notify this workplace only.
        if(store)await store.saveLibrary(room.id,library,change);
        else {if(change.put)room.assets.set(change.put.id,{...change.put,purpose:'library'});if(change.remove)room.assets.delete(change.remove);}
        room.library=library;
        broadcast(room,{type:'library',library});json(res,200,library);
      });
    } catch(error) {if(!res.headersSent)json(res,error.status||400,{error:error.status?error.message:'Unable to save this resource. Check your connection and try again.'});}
  };
}
