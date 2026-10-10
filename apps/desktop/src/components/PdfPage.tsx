import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc = workerUrl;

export function PdfPage({url,page,onCount}:{url:string;page:number;onCount:(count:number)=>void}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const [error,setError]=useState('');
  useEffect(()=>{
    let cancelled=false;let render:RenderTask|undefined;
    const task=getDocument({url});
    void task.promise.then(async document=>{
      if(cancelled)return;
      onCount(document.numPages);
      const sheet=await document.getPage(Math.min(page,document.numPages));
      if(cancelled||!canvas.current)return;
      const viewport=sheet.getViewport({scale:Math.min(2,1600/sheet.getViewport({scale:1}).width)});
      canvas.current.width=viewport.width;canvas.current.height=viewport.height;
      render=sheet.render({canvas:canvas.current,viewport});await render.promise;
    }).catch(error=>{if(!cancelled)setError(error?.name==='PasswordException'?'This PDF requires a password. Share an unlocked copy.':'Unable to render this PDF. Try another file.');});
    return()=>{cancelled=true;render?.cancel();void task.destroy();};
  },[url,page,onCount]);
  return error?<p role="alert">{error}</p>:<canvas ref={canvas} className="pdf-page" aria-label={`PDF page ${page}`}/>;
}

