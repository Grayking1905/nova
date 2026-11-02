import { useEffect, useRef, useState } from 'react';
import { API } from '../../hooks/useRoom';
export function UserPhoto({name,url,className=''}:{name:string;url?:string|null;className?:string}){
  const [failed,setFailed]=useState('');const src=url?`${API}${url}`:'';
  return <span className={`account-photo ${className}`}>{src&&failed!==src?<img src={src} crossOrigin="use-credentials" alt={`${name}'s profile`} onError={()=>setFailed(src)}/>:<span aria-label={`${name}'s initials`}>{name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'N'}</span>}</span>;
}
export function LocalPhoto({file}:{file:File}){const ref=useRef<HTMLImageElement>(null);useEffect(()=>{const url=URL.createObjectURL(file);if(ref.current)ref.current.src=url;return()=>URL.revokeObjectURL(url);},[file]);return <img ref={ref} alt="Your selected profile photo"/>;}
