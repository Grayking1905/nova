import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, MonitorUp } from 'lucide-react';
import type { Deck, PresentationSource } from '../types';
import { API } from '../hooks/useRoom';
import { PdfPage } from './PdfPage';
import { MediaView } from './MediaView';
export function PresentationView({source,stream,mine,onPage,assetToken}:{assetToken:string;source:PresentationSource;stream:MediaStream|null;mine:boolean;onPage:(page:number)=>void}){
  const [pdfCount,setPdfCount]=useState(0);
  const [assetUrl,setAssetUrl]=useState('');
  const [deck,setDeck]=useState<Deck|null>(null);const [error,setError]=useState('');
  useEffect(()=>{
    if(source.kind==='screen')return;
    const controller=new AbortController();let objectUrl='';let cancelled=false;
    void fetch(`${API}${source.url}`,{signal:controller.signal,headers:{Authorization:`Bearer ${assetToken}`}}).then(async response=>{
      if(!response.ok)throw new Error();
      if(source.kind==='slides'){const value=await response.json();if(!cancelled)setDeck(value);}
      else{const blob=await response.blob();if(!cancelled){objectUrl=URL.createObjectURL(blob);setAssetUrl(objectUrl);}}
    }).catch(error=>{if(error.name!=='AbortError'&&!cancelled)setError('This presentation could not be loaded. Rejoin its workplace and try again.');});
    return()=>{cancelled=true;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[source.kind,source.url,assetToken]);
  return <div className="presentation-view"><div className="presentation-title"><span><MonitorUp size={16}/>{source.name}</span><small>{source.ownerName} is presenting</small></div><div className="presentation-surface">{error&&source.kind!=='slides'&&<div className="empty-media">{error}</div>}{source.kind==='image'&&assetUrl&&<img src={assetUrl} alt={source.name}/ >}{source.kind==='pdf'&&assetUrl&&<PdfPage key={source.page} url={assetUrl} page={source.page} onCount={setPdfCount}/>}{source.kind==='screen'&&(stream?<MediaView stream={stream} muted/>:<div className="empty-media"><MonitorUp size={36}/><p>Connecting to the presenter's screen…</p></div>)}{source.kind==='slides'&&(deck?<div className="slide-canvas" style={{aspectRatio:`${deck.width}/${deck.height}`}}>{deck.slides[Math.min(source.page-1,deck.slides.length-1)]?.map((element,index)=><div key={index} className={`slide-element ${element.type}`} style={{left:`${element.x/deck.width*100}%`,top:`${element.y/deck.height*100}%`,width:`${element.w/deck.width*100}%`,height:`${element.h/deck.height*100}%`,color:element.color,background:element.fill,fontSize:`${(element.fontSize||24)/deck.width*100}cqw`,fontWeight:element.bold?700:400}}>{element.type==='image'?<img src={element.src} alt="Slide illustration"/>:element.text}</div>)}</div>:<div className="empty-media"><FileText size={30}/>{error||'Loading slides…'}</div>)}</div>{['slides','pdf'].includes(source.kind)&&<div className="slide-controls"><button disabled={!mine||source.page<=1} onClick={()=>onPage(source.page-1)} aria-label="Previous slide"><ChevronLeft size={17}/></button><span>{source.kind==='pdf'?'Page':'Slide'} {source.page}{deck?` / ${deck.slides.length}`:pdfCount?` / ${pdfCount}`:''}</span><button disabled={!mine||(deck?source.page>=deck.slides.length:source.page>=(pdfCount||1))} onClick={()=>onPage(source.page+1)} aria-label="Next slide"><ChevronRight size={17}/></button><small>{mine?'You control the presentation':'Following the presenter'}</small></div>}</div>;
}
