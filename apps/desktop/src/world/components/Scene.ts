import { fixtures } from '../map';
import type { Fixture } from '../map';
import type { Player, WorldInteraction } from '../../types';
import type { ComponentFrame } from './animation';
import { componentModels, drawFixture } from './index';
import { drawPlayerLabel } from './PlayerLabel';
import { drawAvatar } from './Avatar';
import { createAvatarMotion, advanceAvatarMotion } from './AvatarMotion';
import type { AvatarMotion } from './AvatarMotion';

export function createScene() {
  // Cache each illustration once; only small motion overlays are painted each frame.
  const sprites=new Map<string,HTMLCanvasElement>();
  const doorOpenness=new Map<string,number>();
  const avatarMotions=new Map<string,AvatarMotion>();
  for(const f of fixtures){const sprite=document.createElement('canvas');sprite.width=f.w+80;sprite.height=f.h+110;const c=sprite.getContext('2d')!;c.translate(40,55);drawFixture(c,{...f,x:0,y:0});sprites.set(f.id,sprite);}
  return {
    draw(c:CanvasRenderingContext2D,players:Player[],selfId:string,tick:number,interactions:WorldInteraction[],states:Record<string,boolean>,reducedMotion:boolean,bounds:{left:number;top:number;right:number;bottom:number},bubble:(id:string)=>string|undefined) {
      const now=Date.now();
      for(const id of avatarMotions.keys())if(!players.some(p=>p.id===id))avatarMotions.delete(id);
      const visible=fixtures.filter(f=>f.x+f.w+50>bounds.left&&f.y+f.h+65>bounds.top&&f.x-50<bounds.right&&f.y-60<bounds.bottom);
      const layers:({kind:'fixture';f:Fixture;depth:number}|{kind:'player';p:Player;depth:number})[]=[...visible.map(f=>({kind:'fixture' as const,f,depth:f.y+f.h-(f.type==='chair'?20:0)})),...players.map(p=>({kind:'player' as const,p,depth:p.y}))];
      layers.sort((a,b)=>a.depth-b.depth);
      for(const layer of layers) {
        if(layer.kind==='player'){
          const p=layer.p;let motion=avatarMotions.get(p.id);if(!motion){motion=createAvatarMotion(p.id,p.x,p.y);avatarMotions.set(p.id,motion);}
          const pose=advanceAvatarMotion(motion,{...p,reactionAge:now-p.reactionAt},tick,reducedMotion);
          drawAvatar(c,p,p.x,p.y,{pose,tick:reducedMotion?0:tick,selected:p.id===selfId});continue;
        }
        const f=layer.f,model=componentModels[f.type];
        const event=interactions.findLast(event=>event.fixtureId===f.id&&now-event.startedAt<2400);
        const distance=players.reduce((min,p)=>Math.min(min,Math.hypot(p.x-f.x-f.w/2,p.y-f.y-f.h/2)),Infinity);
        const near=distance<150,open=doorOpenness.get(f.id)||0;
        const target=near||!!event?1:0;
        if(f.type==='door')doorOpenness.set(f.id,reducedMotion?target:open+(target-open)*.09);
        const frame:ComponentFrame={tick,progress:event?Math.max(0,Math.min(1,(now-event.startedAt)/2400)):1,active:!!event,occupied:players.some(p=>p.seatId===f.id),on:states[f.id]!==false,reducedMotion,nearby:near,openness:doorOpenness.get(f.id)||0};
        const pose=model.pose?.(frame)||{};
        c.save();c.translate(f.x+f.w/2,f.y+f.h/2+(pose.y||0));c.rotate(pose.angle||0);c.scale(pose.scale||1,pose.scale||1);c.drawImage(sprites.get(f.id)!,-f.w/2-40,-f.h/2-55);c.restore();
        model.animate?.(c,f,frame);
      }
      for(const player of players)drawPlayerLabel(c,player,player.id===selfId,tick,bubble(player.id));
    },
    dispose(){for(const sprite of sprites.values()){sprite.width=0;sprite.height=0;}sprites.clear();doorOpenness.clear();avatarMotions.clear();},
  };
}
