import { useEffect, useState } from 'react';
import { Dialog } from '../../components/Dialog';

export function BreakGame({onClose}:{onClose:()=>void}) {
  const [active,setActive]=useState(false),[score,setScore]=useState(0),[remaining,setRemaining]=useState(20),[target,setTarget]=useState(4);
  const playing=active&&remaining>0;
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>clearInterval(timer);},[playing]);
  return <Dialog title="A little play. A fresh perspective." onClose={onClose}>
    <p className="dialog-description">Tap the glowing tile. Take a 20-second break and see how many you can catch.</p>
    <div className="break-score"><span>{remaining}s remaining</span><strong>{score} caught</strong></div>
    <div className="break-grid">{Array.from({length:9},(_,i)=><button key={i} className={playing&&i===target?'lit':''} disabled={!playing} aria-label={`Tile ${i+1}${playing&&i===target?' glowing':''}`} onClick={()=>{if(i!==target)return;setScore(value=>value+1);setTarget((target+1+Math.floor(Math.random()*8))%9);}}>{playing&&i===target?'✦':'·'}</button>)}</div>
    <button className="primary-button" onClick={()=>{setRemaining(20);setScore(0);setTarget(4);setActive(true);}}>{playing?'Restart':active?'Play again':'Start a little break'}</button>
    {active&&remaining===0&&<p className="dialog-note" role="status">{score} tiles caught. Ready for your next good idea?</p>}
  </Dialog>;
}
