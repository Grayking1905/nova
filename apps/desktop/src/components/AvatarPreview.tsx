import { useEffect, useRef } from 'react';
import type { Avatar } from '../types';
import { drawAvatar } from '../world/draw';
import { createAvatarMotion, advanceAvatarMotion } from '../world/components/AvatarMotion';
import type { Facing } from '../world/components/AvatarMotion';
export type AvatarPreviewMode='idle'|'walk'|'turn'|'sit'|'wave';

export function AvatarPreview({avatar,size=170,mode='idle',portrait=false}:{avatar:Avatar;size?:number;mode?:AvatarPreviewMode;portrait?:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null),current=useRef({avatar,mode,portrait});
  useEffect(()=>{current.current={avatar,mode,portrait};},[avatar,mode,portrait]);
  useEffect(()=>{
    const canvas=ref.current!,c=canvas.getContext('2d')!;
    const motion=createAvatarMotion('nova-preview');const preference=window.matchMedia('(prefers-reduced-motion: reduce)');let reduced=preference.matches;
    const onPreference=()=>{reduced=preference.matches;};preference.addEventListener('change',onPreference);
    let animation=0,last=0,start=0,x=0;
    const frame=(now:number)=>{
      if(!start)start=now;const props=current.current,dt=last?Math.min((now-last)/1000,.05):0;last=now;
      if(props.mode==='walk')x+=dt*340;
      const directions:Facing[]=['down','right','up','left'];
      const direction=props.mode==='turn'?(reduced?'right':directions[Math.floor((now-start)/1250)%4]):'down';
      const pose=advanceAvatarMotion(motion,{x,y:0,moving:props.mode==='walk',direction,seated:props.mode==='sit',reaction:props.mode==='wave'?'👋':'',reactionAge:(now-start)%(Math.PI*2*115*3)},now,reduced);
      c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,320,320);c.save();
      if(props.portrait){c.translate(160,450);c.scale(4.25,4.25);}else{c.translate(160,271);c.scale(2.55,2.55);}
      drawAvatar(c,props.avatar,0,0,{pose,tick:reduced?0:now,selected:!props.portrait});c.restore();animation=requestAnimationFrame(frame);
    };
    animation=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(animation);preference.removeEventListener('change',onPreference);};
  },[]);
  return <canvas ref={ref} width={320} height={320} style={{width:size,height:size}} aria-label={`${avatar.name||'Your'}'s custom avatar · ${mode}`}/>;
}
