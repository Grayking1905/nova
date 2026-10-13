import { useCallback, useEffect, useRef, useState } from 'react';
import type { CampusEvent, ChatMessage, JoinOptions, MeetingNote, Player, PresentationSource, Room, Stroke, WorldInteraction } from '../types';

export const API = import.meta.env.VITE_ROOM_SERVER || (location.protocol === 'file:' ? 'http://localhost:3001' : `${location.protocol}//${location.hostname}:3001`);
export function useRoom() {
  const [status,setStatus]=useState<'idle'|'connecting'|'connected'|'disconnected'>('idle');
  const [error,setError]=useState('');const [id,setId]=useState('');const [room,setRoom]=useState<Room|null>(null);
  const [players,setPlayers]=useState<Player[]>([]);const [messages,setMessages]=useState<ChatMessage[]>([]);const [strokes,setStrokes]=useState<Stroke[]>([]);const [presentation,setPresentation]=useState<PresentationSource|null>(null);
  const [interactions,setInteractions]=useState<WorldInteraction[]>([]);const [fixtureStates,setFixtureStates]=useState<Record<string,boolean>>({});const [boards,setBoards]=useState<Record<string,Stroke[]>>({});
  const [events,setEvents]=useState<CampusEvent[]>([]);const [notes,setNotes]=useState<MeetingNote[]>([]);
  const socket=useRef<WebSocket|null>(null);const token=useRef('');const signalHandler=useRef<(from:string,data:unknown)=>void>(()=>{});
  const send=useCallback((data:Record<string,unknown>)=>{if(socket.current?.readyState===WebSocket.OPEN)socket.current.send(JSON.stringify(data));},[]);
  const setSignalHandler=useCallback((handler:(from:string,data:unknown)=>void)=>{signalHandler.current=handler;},[]);
  const join=useCallback((options:JoinOptions)=>{
    socket.current?.close();token.current='';setStatus('connecting');setError('');setPlayers([]);setMessages([]);setStrokes([]);setPresentation(null);setInteractions([]);setFixtureStates({});setBoards({});setEvents([]);setNotes([]);
    const ws=new WebSocket(API.replace(/^http/,'ws'));socket.current=ws;
    const timeout=window.setTimeout(()=>{if(ws.readyState!==WebSocket.OPEN){setError('The room server is unavailable. Start the project with pnpm dev.');ws.close();setStatus('idle');}},10000);
    ws.onopen=()=>{clearTimeout(timeout);ws.send(JSON.stringify({type:'join',...options}));};
    ws.onmessage=event=>{if(socket.current!==ws)return;const m=JSON.parse(event.data);
      switch(m.type){
        case 'welcome':setId(m.id);token.current=m.token;setRoom(m.room);setPlayers(m.players);setMessages(m.messages);setStrokes(m.strokes);setPresentation(m.presentation);setFixtureStates(m.fixtureStates||{});setBoards(m.boards||{board:m.strokes});setEvents(m.events||[]);setNotes(m.notes||[]);setStatus('connected');break;
        case 'player':setPlayers(current=>{const found=current.some(p=>p.id===m.player.id);return found?current.map(p=>p.id===m.player.id?m.player:p):[...current,m.player];});break;
        case 'left':setPlayers(current=>current.filter(p=>p.id!==m.id));break;
        case 'chat':setMessages(current=>[...current,m.message].slice(-100));break;
        case 'events':setEvents(m.events);break;
        case 'notes':setNotes(m.notes);break;
        case 'stroke':if(!m.boardId||m.boardId==='board')setStrokes(current=>[...current,m.stroke]);setBoards(current=>({...current,[m.boardId||'board']:[...(current[m.boardId||'board']||[]),m.stroke]}));break;
        case 'clear-board':if(!m.boardId||m.boardId==='board')setStrokes([]);setBoards(current=>({...current,[m.boardId||'board']:[]}));break;
        case 'interaction':setInteractions(current=>[...current.filter(event=>Date.now()-event.startedAt<3000),m.interaction].slice(-64));break;
        case 'fixture-state':setFixtureStates(current=>({...current,[m.fixtureId]:m.on}));break;
        case 'presentation':setPresentation(m.source);break;
        case 'signal':signalHandler.current(m.from,m.data);break;
        case 'error':setError(m.message);if(!token.current){setStatus('idle');ws.close();}break;
      }
    };
    ws.onerror=()=>{if(socket.current===ws)setError('Cannot reach the room server. Run pnpm dev and try again.');};
    ws.onclose=()=>{clearTimeout(timeout);if(socket.current===ws){setStatus(current=>current==='connected'?'disconnected':'idle');token.current='';}};
  },[]);
  const leave=useCallback(()=>{const ws=socket.current;socket.current=null;ws?.close();token.current='';setStatus('idle');setRoom(null);setPlayers([]);setMessages([]);setEvents([]);setNotes([]);setInteractions([]);setFixtureStates({});setBoards({});setPresentation(null);setError('');},[]);
  useEffect(()=>()=>socket.current?.close(),[]);
  const move=useCallback((p:Pick<Player,'x'|'y'|'direction'|'moving'|'seated'>)=>{const update={x:p.x,y:p.y,direction:p.direction,moving:p.moving,seated:p.seated,...(p.moving?{seatId:null}:{})};setPlayers(current=>current.map(player=>player.id===id?{...player,...update}:player));send({type:'move',...update});},[id,send]);
  const upload=async(file:Blob)=>{const response=await fetch(`${API}/upload`,{method:'POST',headers:{Authorization:`Bearer ${token.current}`,'Content-Type':file.type},body:file});const result=await response.json();if(!response.ok)throw new Error(result.error||'Upload failed');return result.url as string;};
  return {status,error,setError,id,room,players,messages,events,notes,strokes,boards,interactions,fixtureStates,presentation,send,join,leave,move,upload,setSignalHandler};
}
