import { useCallback, useEffect, useRef, useState } from 'react';
import type { Player } from '../types';
import { audible, zoneAt } from '../world/map';

type Signal={description?:RTCSessionDescriptionInit;candidate?:RTCIceCandidateInit};
type Peer={pc:RTCPeerConnection;makingOffer:boolean;ignoreOffer:boolean;polite:boolean;settingAnswer:boolean;pending:RTCIceCandidateInit[];audio:MediaStream;camera:MediaStream;screen:MediaStream};
export type RemoteMedia={id:string;audio:MediaStream;camera:MediaStream;screen:MediaStream};
type Props={id:string;players:Player[];connected:boolean;presentationZone?:string;send:(data:Record<string,unknown>)=>void;onError:(message:string)=>void};
export function useMedia(props:Props){
  const [mic,setMic]=useState(false),[camera,setCamera]=useState(false),[sharing,setSharing]=useState(false);
  const [localCamera,setLocalCamera]=useState<MediaStream|null>(null),[localScreen,setLocalScreen]=useState<MediaStream|null>(null);
  const [remotes,setRemotes]=useState<RemoteMedia[]>([]);
  const peers=useRef(new Map<string,Peer>());const audioStream=useRef<MediaStream|null>(null),videoStream=useRef<MediaStream|null>(null),shareStream=useRef<MediaStream|null>(null);const current=useRef(props);const busy=useRef(new Set<string>());const generation=useRef(0);
  useEffect(()=>{current.current=props;},[props]);
  useEffect(()=>{if(!props.connected){generation.current++;[audioStream,videoStream,shareStream].forEach(ref=>{ref.current?.getTracks().forEach(track=>track.stop());ref.current=null;});for(const peer of peers.current.values())peer.pc.close();peers.current.clear();}},[props.connected]);
  const refresh=useCallback(()=>setRemotes([...peers.current].map(([id,p])=>({id,audio:p.audio,camera:p.camera,screen:p.screen}))),[]);
  const updateTracks=useCallback(()=>{
    const me=current.current.players.find(p=>p.id===current.current.id);if(!me)return;
    for(const [id,peer] of peers.current){const player=current.current.players.find(p=>p.id===id);if(!player||peer.pc.signalingState==='closed')continue;const near=audible(me,player,current.current.presentationZone);const stage=zoneAt(player.x,player.y)?.id===(current.current.presentationZone||'stage');const tracks=[near?audioStream.current?.getAudioTracks()[0]:null,near?videoStream.current?.getVideoTracks()[0]:null,stage?shareStream.current?.getVideoTracks()[0]:null];
      peer.pc.getTransceivers().slice(0,3).forEach((t,i)=>{t.direction='sendrecv';const track=tracks[i]||null;if(t.sender.track!==track)t.sender.replaceTrack(track).catch(()=>{});});
    }
  },[]);
  const createPeer=useCallback((id:string)=>{
    const existing=peers.current.get(id);if(existing)return existing;
    let iceServers:RTCIceServer[]=[{urls:'stun:stun.l.google.com:19302'}];
    try{if(import.meta.env.VITE_ICE_SERVERS)iceServers=JSON.parse(import.meta.env.VITE_ICE_SERVERS);}catch{current.current.onError('The ICE server configuration is invalid.');}
    const pc=new RTCPeerConnection({iceServers});
    const peer:Peer={pc,makingOffer:false,ignoreOffer:false,polite:current.current.id.localeCompare(id)>0,settingAnswer:false,pending:[],audio:new MediaStream(),camera:new MediaStream(),screen:new MediaStream()};
    peers.current.set(id,peer);
    const streams=[new MediaStream(),new MediaStream(),new MediaStream()];
    // Exactly one side creates the three slots, avoiding duplicate transceivers.
    if(!peer.polite)['audio','video','video'].forEach((kind,i)=>pc.addTransceiver(kind,{direction:'sendrecv',streams:[streams[i]]}));
    pc.onicecandidate=({candidate})=>{if(candidate)current.current.send({type:'signal',target:id,data:{candidate:candidate.toJSON()}});};
    pc.onnegotiationneeded=async()=>{if(peer.polite)return;try{peer.makingOffer=true;await pc.setLocalDescription();current.current.send({type:'signal',target:id,data:{description:pc.localDescription}});}catch{ /* closed peer */ }finally{peer.makingOffer=false;}};
    pc.ontrack=event=>{const index=pc.getTransceivers().indexOf(event.transceiver);const stream=index===0?peer.audio:index===1?peer.camera:peer.screen;stream.addTrack(event.track);event.track.onunmute=refresh;refresh();};
    pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed')current.current.onError('A peer connection failed. A TURN server may be needed on this network.');};
    updateTracks();return peer;
  },[refresh,updateTracks]);
  const handleSignal=useCallback(async(from:string,raw:unknown)=>{
    if(!current.current.connected)return;const signal=raw as Signal;const peer=createPeer(from);const pc=peer.pc;
    try{
      if(signal.description){const ready=!peer.makingOffer&&(pc.signalingState==='stable'||peer.settingAnswer);const collision=signal.description.type==='offer'&&!ready;peer.ignoreOffer=!peer.polite&&collision;if(peer.ignoreOffer)return;peer.settingAnswer=signal.description.type==='answer';await pc.setRemoteDescription(signal.description);peer.settingAnswer=false;for(const candidate of peer.pending.splice(0))await pc.addIceCandidate(candidate);if(signal.description.type==='offer'){updateTracks();await pc.setLocalDescription();current.current.send({type:'signal',target:from,data:{description:pc.localDescription}});}}
      else if(signal.candidate){if(!pc.remoteDescription){peer.pending.push(signal.candidate);return;}try{await pc.addIceCandidate(signal.candidate);}catch(error){if(!peer.ignoreOffer)throw error;}}
    }catch{ /* A departed peer can leave late signaling messages. */ }
  },[createPeer,updateTracks]);
  useEffect(()=>{
    if(!props.connected)return;
    for(const player of props.players)if(player.id!==props.id)createPeer(player.id);
    for(const [id,p] of peers.current)if(!props.players.some(player=>player.id===id)){p.pc.close();peers.current.delete(id);}
    updateTracks();
  },[props.players,props.connected,props.id,props.presentationZone,createPeer,updateTracks]);
  const stopAll=useCallback(()=>{generation.current++;[audioStream,videoStream,shareStream].forEach(ref=>{ref.current?.getTracks().forEach(t=>t.stop());ref.current=null;});for(const p of peers.current.values())p.pc.close();peers.current.clear();setMic(false);setCamera(false);setSharing(false);setLocalCamera(null);setLocalScreen(null);setRemotes([]);},[]);
  useEffect(()=>()=>{generation.current++;[audioStream,videoStream,shareStream].forEach(ref=>ref.current?.getTracks().forEach(t=>t.stop()));for(const p of peers.current.values())p.pc.close();},[]);
  const toggleMic=async()=>{if(busy.current.has('mic'))return;busy.current.add('mic');const request=generation.current;try{if(audioStream.current){audioStream.current.getTracks().forEach(t=>t.stop());audioStream.current=null;setMic(false);current.current.send({type:'status',mic:false});}else{const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});if(request!==generation.current||!current.current.connected){stream.getTracks().forEach(t=>t.stop());return;}audioStream.current=stream;setMic(true);current.current.send({type:'status',mic:true});}updateTracks();}catch{current.current.onError('Microphone access is unavailable. Check your device permissions.');}finally{busy.current.delete('mic');}};
  const toggleCamera=async()=>{if(busy.current.has('camera'))return;busy.current.add('camera');const request=generation.current;try{if(videoStream.current){videoStream.current.getTracks().forEach(t=>t.stop());videoStream.current=null;setCamera(false);setLocalCamera(null);current.current.send({type:'status',camera:false});}else{const stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:360}});if(request!==generation.current||!current.current.connected){stream.getTracks().forEach(t=>t.stop());return;}videoStream.current=stream;setLocalCamera(videoStream.current);setCamera(true);current.current.send({type:'status',camera:true});}updateTracks();}catch{current.current.onError('Camera access is unavailable. Check your device permissions.');}finally{busy.current.delete('camera');}};
  const stopShare=useCallback(()=>{shareStream.current?.getTracks().forEach(t=>t.stop());shareStream.current=null;setSharing(false);setLocalScreen(null);current.current.send({type:'status',sharing:false});updateTracks();},[updateTracks]);
  const startShare=async()=>{const request=generation.current;try{const stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});if(request!==generation.current||!current.current.connected){stream.getTracks().forEach(t=>t.stop());return false;}shareStream.current=stream;setLocalScreen(stream);setSharing(true);current.current.send({type:'status',sharing:true});stream.getVideoTracks()[0].onended=()=>{stopShare();current.current.send({type:'presentation',source:null});};updateTracks();return true;}catch{current.current.onError('Screen sharing was cancelled or is unavailable.');return false;}};
  return{mic,camera,sharing,localCamera,localScreen,remotes,handleSignal,toggleMic,toggleCamera,startShare,stopShare,stopAll};
}
