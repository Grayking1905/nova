import { useEffect, useRef } from 'react';
import { reactions } from '../reactions';

export function ReactionPicker({onSelect,onClose}:{onSelect:(emoji:string)=>void;onClose:()=>void}){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const pointer=(event:PointerEvent)=>{if(!ref.current?.contains(event.target as Node))onClose();};const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};document.addEventListener('pointerdown',pointer);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',pointer);document.removeEventListener('keydown',key);};},[onClose]);
  return <div className="expressive-reactions" ref={ref} role="group" aria-label="Express yourself"><header><strong>A little more expressive.</strong><span>Your character joins in, too.</span></header><div>{reactions.map(reaction=><button key={reaction.emoji} aria-label={`React ${reaction.label}`} title={reaction.label} onClick={()=>onSelect(reaction.emoji)}><span>{reaction.emoji}</span><small>{reaction.label}</small></button>)}</div><footer>Wave, dance, laugh, or share a little love.</footer></div>;
}
