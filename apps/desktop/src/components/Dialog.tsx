import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
export function Dialog({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();const element=ref.current;return()=>element?.close();},[]);
  return <dialog ref={ref} className={`dialog ${wide?'dialog-wide':''}`} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="dialog-shell"><header className="dialog-heading"><div><span className="eyebrow">NOVA WORKSPACE</span><h2>{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></header>{children}</div></dialog>;
}
