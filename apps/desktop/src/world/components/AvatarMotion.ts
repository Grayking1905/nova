export type Facing = 'down' | 'up' | 'left' | 'right';
export type AvatarPose = {
  phase:number; walk:number; seat:number; raised:number; wave:number; clap:number; celebrate:number;
  facing:number; back:number; gestureTime:number; blink:number; breath:number; lean:number; hairSway:number;
};
export type MotionInput = { x:number; y:number; moving:boolean; direction:Facing; seated:boolean; hand?:boolean; reaction?:string; reactionAge?:number };
export type AvatarMotion = { x:number; y:number; time:number; seed:number; pose:AvatarPose };

export function createAvatarMotion(id:string,x=0,y=0):AvatarMotion {
  const seed=[...id].reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,7)%5200;
  return {x,y,time:-1,seed,pose:{phase:seed/5200*Math.PI*2,walk:0,seat:0,raised:0,wave:0,clap:0,celebrate:0,facing:0,back:0,gestureTime:0,blink:0,breath:0,lean:0,hairSway:0}};
}

const approach=(value:number,target:number,speed:number,dt:number)=>value+(target-value)*(1-Math.exp(-speed*dt));

export function advanceAvatarMotion(state:AvatarMotion,input:MotionInput,time:number,reducedMotion=false):AvatarPose {
  const dt=state.time<0?0:Math.max(0,Math.min(.05,(time-state.time)/1000));
  const distance=Math.hypot(input.x-state.x,input.y-state.y);
  const walking=input.moving&&!input.seated&&distance>.015&&distance<80;
  const reactionAge=input.reactionAge??Infinity;
  const reacting=reactionAge>=0&&reactionAge<2400;
  const wave=reacting&&input.reaction==='👋',clap=reacting&&input.reaction==='👏',celebrate=reacting&&input.reaction==='🎉';
  const facing=input.direction==='right'?1:input.direction==='left'?-1:0;
  const p=state.pose;
  if(walking&&!reducedMotion)p.phase=(p.phase+distance/160*Math.PI*2)%(Math.PI*2);
  const blend=(key:'walk'|'seat'|'raised'|'wave'|'clap'|'celebrate'|'facing'|'back',target:number,speed=13)=>{
    p[key]=reducedMotion?target:approach(p[key],target,speed,dt||1/60);
  };
  blend('walk',reducedMotion?0:Number(walking),walking?16:20);
  blend('seat',Number(input.seated),12);
  blend('raised',Number(!!input.hand),10);
  blend('wave',Number(wave),14);blend('clap',Number(clap),14);blend('celebrate',Number(celebrate),12);
  p.gestureTime=reducedMotion?0:reacting?reactionAge:0;
  blend('facing',facing,15);blend('back',Number(input.direction==='up'),15);
  const idleTime=time+state.seed;
  const blinkTime=((idleTime%5200)+5200)%5200;
  p.blink=reducedMotion?0:blinkTime<145?Math.sin(blinkTime/145*Math.PI):0;
  p.breath=reducedMotion?0:Math.sin(idleTime/720)*.7*(1-p.walk);
  p.lean=reducedMotion?0:Math.sin(p.phase)*p.walk*.035+Math.sin(idleTime/1500)*.008*(1-p.walk);
  p.hairSway=reducedMotion?0:Math.sin(p.phase-.65)*p.walk*.055+Math.sin(idleTime/1900)*.014;
  state.x=input.x;state.y=input.y;state.time=time;
  return p;
}
