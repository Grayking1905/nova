import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Download, ExternalLink, File, FileText, Folder, FolderPlus, FolderUp, Link, Search, Trash2, Upload, X } from 'lucide-react';
import type { LibraryFile, ResourceLibrary as LibraryData } from '../../types';
import type { useRoom } from '../../hooks/useRoom';
import { fixtures, zones } from '../map';
import { Dialog } from '../../components/Dialog';

type Props={room:ReturnType<typeof useRoom>;shelfId:string;onClose:()=>void};
const size=(bytes:number)=>bytes>1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.max(1,Math.round(bytes/1024))} KB`;
export function ResourceLibrary({room,shelfId,onClose}:Props) {
  const library=room.library;
  const [folderId,setFolderId]=useState<string|null>(null),[search,setSearch]=useState(''),[all,setAll]=useState(false);
  const [form,setForm]=useState<'folder'|'link'|null>(null),[title,setTitle]=useState(''),[url,setUrl]=useState('');
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(''),[removing,setRemoving]=useState<{kind:'files'|'folders';id:string;name:string}|null>(null);
  const [moving,setMoving]=useState<LibraryFile|null>(null),[destination,setDestination]=useState('');
  const input=useRef<HTMLInputElement>(null),directory=useRef<HTMLInputElement>(null),controller=useRef(new AbortController());
  useEffect(()=>{const abort=new AbortController();controller.current=abort;directory.current?.setAttribute('webkitdirectory','');return()=>abort.abort();},[]);
  const activeFolder=library.folders.find(f=>f.id===folderId),activeShelf=activeFolder?.shelfId||shelfId;
  const zone=zones.find(z=>z.id===fixtures.find(f=>f.id===activeShelf)?.zoneId);
  const trail=[];let parent=activeFolder;while(parent&&trail.length<8){trail.unshift(parent);parent=library.folders.find(f=>f.id===parent!.parentId);}
  const match=(name:string)=>name.toLowerCase().includes(search.toLowerCase());
  const folders=library.folders.filter(f=>match(f.name)&&(search?all||f.shelfId===activeShelf:f.parentId===folderId&&(all||f.shelfId===activeShelf)));
  const files=library.files.filter(f=>match(f.name)&&(search?all||f.shelfId===activeShelf:f.folderId===folderId&&(all||f.shelfId===activeShelf)));
  const request=(path:string,init:RequestInit={})=>room.libraryRequest(path,{...init,signal:controller.current.signal});
  const post=(path:string,value:unknown)=>request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
  async function perform(work:()=>Promise<void>){setBusy(true);setError('');setStatus('');try{await work();}catch(e){if(!controller.current.signal.aborted)setError(e instanceof Error?e.message:'Unable to save this resource.');}finally{if(!controller.current.signal.aborted)setBusy(false);}}
  async function upload(files:FileList|null){if(!files?.length)return;const selected=Array.from(files);await perform(async()=>{
    let current:LibraryData=library,count=0;
    for(const file of selected){
      if(file.size>20*1048576)throw new Error(`${file.name} is larger than 20 MB. ${count} files were saved.`);
      let destination=folderId;
      for(const segment of file.webkitRelativePath.split('/').slice(0,-1)){
        let folder=current.folders.find(f=>f.parentId===destination&&f.shelfId===activeShelf&&f.name.toLowerCase()===segment.toLowerCase());
        if(!folder){current=await post('/folders',{name:segment,folderId:destination,shelfId:activeShelf});folder=current.folders.find(f=>f.parentId===destination&&f.shelfId===activeShelf&&f.name.toLowerCase()===segment.toLowerCase());}
        if(!folder)throw new Error('Unable to create this folder.');destination=folder.id;
      }
      current=await request('/upload',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name),'X-Folder-Id':destination||'','X-Shelf-Id':activeShelf},body:file});
      count++;if(!controller.current.signal.aborted)setStatus(`Shared ${count} of ${selected.length} files…`);
    }
    if(!controller.current.signal.aborted)setStatus(`${count} ${count===1?'file is':'files are'} ready for your team.`);
  });}
  async function download(file:LibraryFile){await perform(async()=>{const blob=await room.downloadResource(file.id,controller.current.signal);const link=document.createElement('a'),objectUrl=URL.createObjectURL(blob);link.href=objectUrl;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);});}
  return <Dialog title="Your team's little knowledge corner." onClose={onClose} wide>
    <div className="library-hero"><span><BookOpen size={27}/></span><div><strong>{zone?.name} · shared bookshelf</strong><p>Important files, useful links, and folders worth keeping. Shared with this workplace.</p></div><span className="library-count">{library.files.length}/100 resources</span></div>
    <div className="library-toolbar"><label className="panel-search"><Search size={16}/><input aria-label="Search shared resources" placeholder="Find something useful…" value={search} onChange={e=>setSearch(e.target.value)}/></label><button className="small-button" disabled={busy} onClick={()=>input.current?.click()}><Upload size={15}/> Add files</button><button className="small-button" disabled={busy} onClick={()=>directory.current?.click()}><FolderUp size={15}/> Upload folder</button><button className="small-button" disabled={busy} onClick={()=>{setForm('folder');setTitle('');}}><FolderPlus size={15}/> New folder</button><button className="small-button" disabled={busy} onClick={()=>{setForm('link');setTitle('');setUrl('');}}><Link size={15}/> Add link</button></div>
    <input hidden multiple type="file" ref={input} onChange={e=>{void upload(e.target.files);e.target.value='';}}/><input hidden multiple type="file" ref={directory} onChange={e=>{void upload(e.target.files);e.target.value='';}}/>
    <div className="library-breadcrumb"><button onClick={()=>{setFolderId(null);setSearch('');}}><BookOpen size={14}/> Bookshelf</button>{trail.map(folder=><span key={folder.id}><ChevronRight size={13}/><button onClick={()=>{setFolderId(folder.id);setSearch('');}}>{folder.name}</button></span>)}<label><input type="checkbox" checked={all} onChange={e=>{setAll(e.target.checked);setFolderId(null);}}/> All campus shelves</label></div>
    {form&&<form className="library-add-form" onSubmit={e=>{e.preventDefault();void perform(async()=>{await post(form==='folder'?'/folders':'/links',{name:title,url,folderId,shelfId:activeShelf});if(!controller.current.signal.aborted){setForm(null);setTitle('');setStatus(form==='folder'?'A new home for good ideas.':'Link shared with your team.');}});}}><input autoFocus required maxLength={120} aria-label={form==='folder'?'Folder name':'Link title'} placeholder={form==='folder'?'Folder name…':'A title for this link…'} value={title} onChange={e=>setTitle(e.target.value)}/>{form==='link'&&<input required type="url" aria-label="Resource URL" placeholder="https://…" value={url} onChange={e=>setUrl(e.target.value)}/>}<button className="small-button" disabled={busy}>Create {form}</button><button type="button" className="icon-btn" aria-label="Cancel new resource" onClick={()=>setForm(null)}><X size={15}/></button></form>}
    {error&&<p className="form-error" role="alert">{error}</p>}{status&&<p className="library-status" role="status">{status}</p>}
    {moving&&<form className="library-add-form" onSubmit={e=>{e.preventDefault();void perform(async()=>{await post(`/files/${moving.id}/move`,{folderId:destination||null,shelfId:moving.shelfId});if(!controller.current.signal.aborted){setMoving(null);setStatus('Resource moved. A little more organized.');}});}}><span>Move “{moving.name}” to</span><select aria-label="Destination folder" value={destination} onChange={e=>setDestination(e.target.value)}><option value="">Its bookshelf root</option>{library.folders.map(folder=><option value={folder.id} key={folder.id}>{folder.name}</option>)}</select><button className="small-button" disabled={busy}>Move resource</button><button type="button" className="icon-btn" aria-label="Cancel move" onClick={()=>setMoving(null)}><X size={15}/></button></form>}
    {removing&&<div className="library-confirm"><span>Remove “{removing.name}” for everyone in this workplace?</span><button disabled={busy} onClick={()=>void perform(async()=>{await request(`/${removing.kind}/${removing.id}`,{method:'DELETE'});if(!controller.current.signal.aborted)setRemoving(null);})}>Remove</button><button onClick={()=>setRemoving(null)}>Keep it</button></div>}
    <div className="library-grid" aria-label="Shared folders and files">
      {folderId&&<button className="library-back" onClick={()=>{setFolderId(activeFolder?.parentId||null);setSearch('');}}><ArrowLeft size={18}/> Back one folder</button>}
      {folders.map(folder=><article key={folder.id} className="resource-card folder-card"><button className="resource-open" onClick={()=>{setFolderId(folder.id);setSearch('');}}><span className="resource-icon"><Folder size={30}/></span><strong>{folder.name}</strong><small>{library.files.filter(file=>file.folderId===folder.id).length} resources · {folder.createdBy}</small></button><button className="resource-remove" disabled={busy} aria-label={`Remove folder ${folder.name}`} onClick={()=>setRemoving({kind:'folders',id:folder.id,name:folder.name})}><Trash2 size={13}/></button></article>)}
      {files.map(file=><article className="resource-card" key={file.id}><span className={`resource-icon ${file.kind==='link'?'link-icon':''}`}>{file.kind==='link'?<Link size={26}/>:file.type.includes('pdf')?<FileText size={28}/>:<File size={28}/>}</span><strong>{file.name}</strong><small>{file.kind==='link'?'Shared link':size(file.size)} · {file.createdBy}</small><div className="resource-actions">{file.kind==='link'?<a href={file.url} target="_blank" rel="noopener noreferrer">Open link <ExternalLink size={13}/></a>:<button disabled={busy} onClick={()=>void download(file)}>Download <Download size={14}/></button>}<button disabled={busy} aria-label={`Move ${file.name}`} onClick={()=>{setMoving(file);setDestination(file.folderId||'');}}><Folder size={13}/></button><button disabled={busy} aria-label={`Remove ${file.name}`} onClick={()=>setRemoving({kind:'files',id:file.id,name:file.name})}><Trash2 size={13}/></button></div></article>)}
      {!folders.length&&!files.length&&<div className="library-empty"><span>📚</span><h3>A place for your team's good stuff.</h3><p>Add a project folder, a brief, a handbook, or a link everyone should have.</p></div>}
    </div><p className="dialog-note">Up to 20 MB per file, 100 resources, and 40 folders per workplace. Every member can add, download, and remove shared resources. Files are stored in PostgreSQL; access requires an active workplace session.</p>
  </Dialog>;
}
