import { useEffect, useRef } from 'react';
import type { Player, ChatMessage } from '../types';
import { canStand, findPath, nearbyFixture, WORLD } from './map';
import type { Fixture } from './map';
import { drawMap, drawPlayer } from './draw';

type Props = { me: Player; players: Player[]; messages: ChatMessage[]; zoom: number; target: {x:number;y:number;nonce:number}|null; blocked: boolean; onMove: (p: Pick<Player,'x'|'y'|'direction'|'moving'|'seated'>) => void; onInteract: (fixture:Fixture) => void; onNearby: (fixture:Fixture|undefined) => void; onChat:()=>void };
export default function World(props:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null);const state=useRef(props);useEffect(()=>{state.current=props;},[props]);
  useEffect(()=>{
    const canvas=canvasRef.current!;const context=canvas.getContext('2d')!;const backdrop=document.createElement('canvas');backdrop.width=WORLD.width;backdrop.height=WORLD.height;drawMap(backdrop.getContext('2d')!);
    const local={...state.current.me};const keys=new Set<string>();let path:{x:number;y:number}[]=[];let animation=0;let last=performance.now(),lastSend=0,lastNear='';let w=0,h=0,scale=1,camX=1000,camY=640;let targetNonce=-1;let previousMoving=false;const remote=new Map<string,{x:number;y:number}>();
    const resize=()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const dpr=Math.min(window.devicePixelRatio,2);canvas.width=w*dpr;canvas.height=h*dpr;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const keydown=(event:KeyboardEvent)=>{
      if(state.current.blocked||(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]'))return;
      const key=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)){event.preventDefault();keys.add(key);path=[];}
      if(key==='e'&&!event.repeat){const f=nearbyFixture(local.x,local.y);if(f){if(f.type==='chair'){local.seated=!local.seated;state.current.onMove(local);}else state.current.onInteract(f);}}
      if(key==='enter'&&!(event.target as HTMLElement)?.closest('button')){event.preventDefault();state.current.onChat();}
    };
    const keyup=(event:KeyboardEvent)=>keys.delete(event.key.toLowerCase());const blur=()=>keys.clear();
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
    const click=(event:MouseEvent)=>{if(state.current.blocked)return;const b=canvas.getBoundingClientRect();const x=(event.clientX-b.left-w/2)/scale+camX,y=(event.clientY-b.top-h/2)/scale+camY;path=findPath(local,{x,y});canvas.focus();};canvas.addEventListener('click',click);
    const frame=(now:number)=>{
      const dt=Math.min((now-last)/1000,.035);last=now;const s=state.current;
      if(s.target&&s.target.nonce!==targetNonce){targetNonce=s.target.nonce;path=findPath(local,s.target);}
      if(s.blocked){keys.clear();path=[];}
      if(!local.moving)local.seated=s.me.seated;
      let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
      let travel=dt*220;
      if(!dx&&!dy&&path.length){const next=path[0],dist=Math.hypot(next.x-local.x,next.y-local.y);if(dist<0.01)path.shift();else{travel=Math.min(travel,dist);dx=(next.x-local.x)/dist;dy=(next.y-local.y)/dist;}}
      const length=Math.hypot(dx,dy);local.moving=length>0&&!s.blocked;
      if(local.moving){local.seated=false;dx=dx/length*travel;dy=dy/length*travel;const oldX=local.x,oldY=local.y;if(canStand(local.x+dx,local.y))local.x+=dx;if(canStand(local.x,local.y+dy))local.y+=dy;if(Math.abs(dx)>Math.abs(dy))local.direction=dx>0?'right':'left';else local.direction=dy>0?'down':'up';if(local.x===oldX&&local.y===oldY){path=[];local.moving=false;}}
      if((local.moving&&now-lastSend>85)||local.moving!==previousMoving){lastSend=now;state.current.onMove({...local});}previousMoving=local.moving;
      const near=nearbyFixture(local.x,local.y);if((near?.id||'')!==lastNear){lastNear=near?.id||'';s.onNearby(near);}
      scale=Math.min(w/WORLD.width,h/WORLD.height)*s.zoom;const halfW=w/scale/2,halfH=h/scale/2;
      const aimX=halfW>=WORLD.width/2?WORLD.width/2:Math.min(WORLD.width-halfW,Math.max(halfW,local.x));const aimY=halfH>=WORLD.height/2?WORLD.height/2:Math.min(WORLD.height-halfH,Math.max(halfH,local.y));camX+=(aimX-camX)*Math.min(1,dt*7);camY+=(aimY-camY)*Math.min(1,dt*7);
      const dpr=Math.min(window.devicePixelRatio,2);context.setTransform(dpr,0,0,dpr,0,0);context.fillStyle='#142329';context.fillRect(0,0,w,h);context.translate(w/2,h/2);context.scale(scale,scale);context.translate(-camX,-camY);context.drawImage(backdrop,0,0);
      // The proximity ring conveys who can hear you.
      context.beginPath();context.arc(local.x,local.y,150,0,Math.PI*2);context.strokeStyle='#9e88ec45';context.lineWidth=2;context.setLineDash([8,9]);context.stroke();context.setLineDash([]);
      if(path.length){context.beginPath();context.moveTo(local.x,local.y);for(const p of path)context.lineTo(p.x,p.y);context.strokeStyle='#8b73d980';context.lineWidth=4;context.setLineDash([4,9]);context.stroke();context.setLineDash([]);}
      const rendered=s.players.map(p=>{if(p.id===local.id)return {...p,...local,hand:p.hand,reaction:p.reaction,reactionAt:p.reactionAt,mic:p.mic};let pos=remote.get(p.id);if(!pos){pos={x:p.x,y:p.y};remote.set(p.id,pos);}pos.x+=(p.x-pos.x)*Math.min(1,dt*14);pos.y+=(p.y-pos.y)*Math.min(1,dt*14);return {...p,...pos};}).sort((a,b)=>a.y-b.y);
      for(const p of rendered){const bubble=s.messages.findLast(m=>m.playerId===p.id&&Date.now()-m.time<4500);drawPlayer(context,p,p.id===local.id,now,bubble?.text);}
      if(near){context.beginPath();context.roundRect(near.x-5,near.y-5,near.w+10,near.h+10,12);context.strokeStyle='#fff8cd';context.lineWidth=3;context.stroke();}
      animation=requestAnimationFrame(frame);
    };animation=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(animation);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);canvas.removeEventListener('click',click);};
  },[]);
  return <canvas ref={canvasRef} className="world-canvas" tabIndex={0} aria-label="Interactive 2D workplace. Move with arrow keys or WASD. E interacts. Enter opens chat."/>;
}
