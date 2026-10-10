import { unzipSync } from 'fflate';
import type { Deck, DeckElement } from '../types';
const decoder=new TextDecoder();
const elements=(node:Element|Document,name:string)=>Array.from(node.getElementsByTagNameNS('*',name));
const first=(node:Element|Document,name:string)=>elements(node,name)[0];
const value=(node:Element|undefined,attribute:string,fallback=0)=>Number(node?.getAttribute(attribute)||fallback);
const parse=(bytes:Uint8Array)=>new DOMParser().parseFromString(decoder.decode(bytes),'application/xml');
function relative(base:string,target:string){const parts=base.split('/').slice(0,-1);for(const part of target.split('/')){if(part==='..')parts.pop();else if(part!=='.')parts.push(part);}return parts.join('/');}
function dataUrl(bytes:Uint8Array,path:string){const extension=path.split('.').pop()?.toLowerCase();const mime=extension==='png'?'image/png':extension==='jpg'||extension==='jpeg'?'image/jpeg':extension==='gif'?'image/gif':extension==='webp'?'image/webp':null;if(!mime)return '';let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return `data:${mime};base64,${btoa(binary)}`;}

export async function parsePowerPoint(file:File):Promise<Deck>{
  let expanded=0;
  const files=unzipSync(new Uint8Array(await file.arrayBuffer()),{filter:entry=>{expanded+=entry.originalSize;if(expanded>60*1024*1024)throw new Error('This PowerPoint is too large when expanded. Export it as PDF.');return entry.name.startsWith('ppt/');}});
  if(!files['ppt/presentation.xml'])throw new Error('This is not a valid PowerPoint (.pptx) file.');
  const presentation=parse(files['ppt/presentation.xml']);const size=first(presentation,'sldSz');
  const width=value(size,'cx',12192000)/9525,height=value(size,'cy',6858000)/9525;
  const slidePaths=Object.keys(files).filter(path=>/^ppt\/slides\/slide\d+\.xml$/.test(path)).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1])-Number(b.match(/slide(\d+)/)?.[1]));
  if(!slidePaths.length||slidePaths.length>200)throw new Error('Choose a PowerPoint with between 1 and 200 slides.');
  const slides=slidePaths.map(path=>{
    const doc=parse(files[path]);const slide:DeckElement[]=[];const relationships:Record<string,string>={};const relPath=path.replace('slides/','slides/_rels/')+'.rels';
    if(files[relPath])for(const rel of elements(parse(files[relPath]),'Relationship'))if(rel.getAttribute('TargetMode')!=='External')relationships[rel.getAttribute('Id')||'']=relative(path,rel.getAttribute('Target')||'');
    const background=first(doc,'bg');const bg=background&&first(background,'srgbClr')?.getAttribute('val');if(bg)slide.push({type:'shape',x:0,y:0,w:width,h:height,fill:`#${bg}`});
    const tree=first(doc,'spTree');if(!tree)return slide;
    for(const node of Array.from(tree.children)){
      if(!['sp','pic'].includes(node.localName))continue;
      const transform=first(node,'xfrm'),off=transform&&first(transform,'off'),ext=transform&&first(transform,'ext');
      const x=value(off,'x')/9525,y=value(off,'y')/9525,w=value(ext,'cx',9144000)/9525,h=value(ext,'cy',914400)/9525;
      if(node.localName==='pic'){
        const blip=first(node,'blip');const rid=blip?.getAttribute('r:embed');const imagePath=rid&&relationships[rid];
        if(imagePath&&files[imagePath]){const src=dataUrl(files[imagePath],imagePath);if(src)slide.push({type:'image',x,y,w,h,src});}
      }else{
        const shapeProps=first(node,'spPr');const fill=shapeProps&&Array.from(shapeProps.children).find(child=>child.localName==='solidFill');const fillColor=fill&&first(fill,'srgbClr')?.getAttribute('val');
        if(fillColor)slide.push({type:'shape',x,y,w,h,fill:`#${fillColor}`});
        const paragraphs=elements(node,'p');const text=paragraphs.map(p=>elements(p,'t').map(t=>t.textContent).join('')).join('\n');
        if(text){const run=first(node,'rPr');const textColor=run&&first(run,'srgbClr')?.getAttribute('val');slide.push({type:'text',x,y,w,h,text,fontSize:Math.max(12,Math.min(100,value(run,'sz',2400)/75)),bold:run?.getAttribute('b')==='1',color:textColor?`#${textColor}`:'#25253a'});}
      }
    }
    return slide;
  });
  return{width,height,slides};
}
