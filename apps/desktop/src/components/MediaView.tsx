import { useEffect, useRef } from 'react';
export function MediaView({stream,muted=false,audio=false}:{stream:MediaStream|null;muted?:boolean;audio?:boolean}){
  const ref=useRef<HTMLVideoElement>(null);
  useEffect(()=>{if(ref.current){ref.current.srcObject=stream;ref.current.play().catch(()=>{});}},[stream]);
  return <video ref={ref} autoPlay playsInline muted={muted} className={audio?'audio-only':'media-video'}/>;
}
