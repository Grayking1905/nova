import { useEffect, useRef } from 'react';
import type { Avatar } from '../types';
import { drawAvatar } from '../world/draw';
export function AvatarPreview({avatar,size=170}:{avatar:Avatar;size?:number}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const c=ref.current!.getContext('2d')!;let animation=0;const frame=(now:number)=>{c.clearRect(0,0,320,320);c.save();c.scale(3,3);drawAvatar(c,avatar,53,87,{tick:now,selected:true});c.restore();animation=requestAnimationFrame(frame);};animation=requestAnimationFrame(frame);return()=>cancelAnimationFrame(animation);},[avatar]);
  return <canvas ref={ref} width={320} height={320} style={{width:size,height:size}} aria-label={`${avatar.name}'s custom avatar`}/>;
}
