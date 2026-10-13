import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAvatarMotion, advanceAvatarMotion } from './AvatarMotion.ts';

const input={x:0,y:0,moving:false,direction:'down',seated:false};
function walk(fps){const state=createAvatarMotion('walker');advanceAvatarMotion(state,input,0);for(let frame=1;frame<=fps;frame++)advanceAvatarMotion(state,{...input,moving:true,x:340*frame/fps},frame*1000/fps);return state;}

test('footsteps follow traveled distance at different frame rates',()=>{
  const a=walk(60),b=walk(30);assert.ok(Math.abs(a.pose.phase-b.pose.phase)<1e-8);assert.ok(a.pose.walk>.99);assert.ok(b.pose.walk>.99);
});

test('a blocked or stopped avatar settles without running in place',()=>{
  const state=walk(60),phase=state.pose.phase;
  for(let frame=1;frame<=30;frame++)advanceAvatarMotion(state,{...input,x:340,moving:true},1000+frame*1000/60);
  assert.equal(state.pose.phase,phase);assert.ok(state.pose.walk<.001);
  advanceAvatarMotion(state,{...input,x:1500,moving:true},1520);assert.equal(state.pose.phase,phase,'a teleport is not a stride');
});

test('turning, sitting, and gestures ease between bounded poses',()=>{
  const state=createAvatarMotion('guest');advanceAvatarMotion(state,input,0);
  const first=advanceAvatarMotion(state,{...input,direction:'right',seated:true,hand:true,reaction:'👋',reactionAge:0},16);
  assert.ok(first.facing>0&&first.facing<1);assert.ok(first.seat>0&&first.seat<1);assert.ok(first.wave>0&&first.wave<1);
  for(let frame=2;frame<=60;frame++)advanceAvatarMotion(state,{...input,direction:'right',seated:true,hand:true,reaction:'👋',reactionAge:frame*16},frame*16);
  assert.ok(state.pose.seat>.99);assert.ok(state.pose.raised>.99);assert.ok(state.pose.wave>.99);
  for(let frame=61;frame<=120;frame++)advanceAvatarMotion(state,{...input,direction:'left',reaction:'👋',reactionAge:4000},frame*16);
  assert.ok(state.pose.facing<-.99);assert.ok(state.pose.seat<.001);assert.ok(state.pose.wave<.001);assert.ok(state.pose.raised<.001);
});

test('reduced motion preserves pose and direction without idle or stride motion',()=>{
  const state=createAvatarMotion('accessible');const phase=state.pose.phase;
  const p=advanceAvatarMotion(state,{...input,x:10,moving:true,direction:'up',seated:true,hand:true,reaction:'👋',reactionAge:0},1000,true);
  assert.equal(p.phase,phase);assert.equal(p.walk,0);assert.equal(p.seat,1);assert.equal(p.raised,1);assert.equal(p.back,1);
  for(const key of ['blink','breath','lean','hairSway','gestureTime'])assert.equal(p[key],0);
});
