import { useEffect, useRef } from 'react';
import type { Player, ChatMessage, WorldInteraction } from '../types';
import { canStand, findPath, nearbyFixture, fixtures, WORLD, SPAWN, zoneAt } from './map';
import type { Fixture } from './map';
import { drawMap } from './draw';
import { drawConversationRange } from './components/ConversationRange';
import { drawPathTrail } from './components/PathTrail';
import { createScene } from './components/Scene';
import { drawInteraction } from './components/InteractionHint';

type Props = { me: Player; players: Player[]; messages: ChatMessage[]; zoom: number; target: {x:number;y:number;nonce:number}|null; interactions:WorldInteraction[]; fixtureStates:Record<string,boolean>; presentationZone?:string; onRequest:(fixture:Fixture)=>void; onCancelNavigate:()=>void; blocked: boolean; onMove: (p: Pick<Player,'x'|'y'|'direction'|'moving'|'seated'>) => void; onInteract: (fixture:Fixture) => void; onNearby: (fixture:Fixture|undefined) => void; onChat:()=>void };
export default function World(props:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null);const state=useRef(props);useEffect(()=>{state.current=props;},[props]);
  useEffect(()=>{
    const canvas=canvasRef.current!;const context=canvas.getContext('2d')!;const backdrop=document.createElement('canvas');backdrop.width=WORLD.width;backdrop.height=WORLD.height;drawMap(backdrop.getContext('2d')!,false);const scene=createScene();
    const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');let reducedMotion=motionPreference.matches;const onMotionPreference=()=>{reducedMotion=motionPreference.matches;};motionPreference.addEventListener('change',onMotionPreference);
    const local={...state.current.me,id:props.me.id};const keys=new Set<string>();let path:{x:number;y:number}[]=[];let animation=0;let last=performance.now(),lastSend=0,lastNear='';let w=0,h=0,scale=1,camX=SPAWN.x,camY=SPAWN.y;let targetNonce=-1;let previousMoving=false;let lastSeat=local.seatId;const remote=new Map<string,{x:number;y:number}>();
    const resize=()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const dpr=Math.min(window.devicePixelRatio,2);canvas.width=w*dpr;canvas.height=h*dpr;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const keydown=(event:KeyboardEvent)=>{
      if(state.current.blocked||(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]'))return;
      const key=event.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)){event.preventDefault();keys.add(key);path=[];state.current.onCancelNavigate();}
      if(key==='e'&&!event.repeat){const f=nearbyFixture(local.x,local.y);if(f)state.current.onInteract(f);}
      if(key==='enter'&&!(event.target as HTMLElement)?.closest('button')){event.preventDefault();state.current.onChat();}
    };
    const keyup=(event:KeyboardEvent)=>keys.delete(event.key.toLowerCase());const blur=()=>keys.clear();
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
    const click=(event:MouseEvent)=>{if(state.current.blocked)return;const b=canvas.getBoundingClientRect();const x=(event.clientX-b.left-w/2)/scale+camX,y=(event.clientY-b.top-h/2)/scale+camY;const f=fixtures.findLast(f=>f.label&&x>=f.x&&x<=f.x+f.w&&y>=f.y&&y<=f.y+f.h);if(f)state.current.onRequest(f);else{state.current.onCancelNavigate();path=findPath(local,{x,y});}canvas.focus();};canvas.addEventListener('click',click);
    const frame=(now:number)=>{
      const dt=Math.min((now-last)/1000,.035);last=now;const s=state.current;
      if(s.target&&s.target.nonce!==targetNonce){targetNonce=s.target.nonce;path=findPath(local,s.target);}
      if(s.blocked){keys.clear();path=[];}
      if(s.me.seatId!==lastSeat){lastSeat=s.me.seatId;local.seatId=s.me.seatId;local.seated=s.me.seated;if(s.me.seatId){local.x=s.me.x;local.y=s.me.y;path=[];keys.clear();}}
      let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));let dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
      let travel=dt*340;
      if(!dx&&!dy&&path.length){const next=path[0],dist=Math.hypot(next.x-local.x,next.y-local.y);if(dist<0.01)path.shift();else{travel=Math.min(travel,dist);dx=(next.x-local.x)/dist;dy=(next.y-local.y)/dist;}}
      const length=Math.hypot(dx,dy);local.moving=length>0&&!s.blocked;
      if(local.moving){local.seated=false;local.seatId=null;dx=dx/length*travel;dy=dy/length*travel;const oldX=local.x,oldY=local.y;if(canStand(local.x+dx,local.y))local.x+=dx;if(canStand(local.x,local.y+dy))local.y+=dy;if(Math.abs(dx)>Math.abs(dy))local.direction=dx>0?'right':'left';else local.direction=dy>0?'down':'up';if(local.x===oldX&&local.y===oldY){path=[];local.moving=false;}}
      if((local.moving&&now-lastSend>85)||local.moving!==previousMoving){lastSend=now;state.current.onMove({...local});}previousMoving=local.moving;
      const near=nearbyFixture(local.x,local.y);if((near?.id||'')!==lastNear){lastNear=near?.id||'';s.onNearby(near);}
      scale=Math.min(w/WORLD.width,h/WORLD.height)*s.zoom;const halfW=w/scale/2,halfH=h/scale/2;
      const zone=zoneAt(local.x,local.y);const roomFits=zone&&w/scale>zone.w+80&&h/scale>zone.h+60;
      const focusX=roomFits?zone.x+zone.w/2:local.x,focusY=roomFits?zone.y+zone.h/2:local.y;
      const aimX=halfW>=WORLD.width/2?WORLD.width/2:Math.min(WORLD.width-halfW,Math.max(halfW,focusX));const aimY=halfH>=WORLD.height/2?WORLD.height/2:Math.min(WORLD.height-halfH,Math.max(halfH,focusY));camX+=(aimX-camX)*Math.min(1,dt*7);camY+=(aimY-camY)*Math.min(1,dt*7);
      const dpr=Math.min(window.devicePixelRatio,2);context.setTransform(dpr,0,0,dpr,0,0);context.fillStyle='#142329';context.fillRect(0,0,w,h);context.translate(w/2,h/2);context.scale(scale,scale);context.translate(-camX,-camY);context.drawImage(backdrop,0,0);
      drawConversationRange(context,local.x,local.y,s.presentationZone);
      drawPathTrail(context,local,path);
      const rendered=s.players.map(p=>{if(p.id===local.id)return {...p,...local,hand:p.hand,reaction:p.reaction,reactionAt:p.reactionAt,mic:p.mic};let pos=remote.get(p.id);if(!pos){pos={x:p.x,y:p.y};remote.set(p.id,pos);}pos.x+=(p.x-pos.x)*Math.min(1,dt*14);pos.y+=(p.y-pos.y)*Math.min(1,dt*14);return {...p,...pos};}).sort((a,b)=>a.y-b.y);
      scene.draw(context,rendered,s.me.id,now,s.interactions,s.fixtureStates,reducedMotion,{left:camX-halfW,top:camY-halfH,right:camX+halfW,bottom:camY+halfH},id=>s.messages.findLast(m=>m.playerId===id&&Date.now()-m.time<4500)?.text);
      if(near)drawInteraction(context,near,now,reducedMotion);
      animation=requestAnimationFrame(frame);
    };animation=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(animation);observer.disconnect();scene.dispose();motionPreference.removeEventListener('change',onMotionPreference);backdrop.width=0;backdrop.height=0;window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);canvas.removeEventListener('click',click);};
  },[props.me.id]);
  return <canvas ref={canvasRef} className="world-canvas" tabIndex={0} aria-label="Interactive 2D workplace. Move with arrow keys or WASD. E interacts. Enter opens chat."/>;
}
