import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ArrowRight, CalendarDays, Copy, Hand, LayoutGrid, MessageCircle, Mic, MicOff, Navigation, Reply, Search, Send, Users, X } from 'lucide-react';
import type { useRoom } from '../hooks/useRoom';
import type { ChatMessage } from '../types';
import { zones, zoneAt } from '../world/map';
import { followPoint } from '../world/follow';
import { AvatarPreview } from './AvatarPreview';
import { CampusAgenda } from './CampusAgenda';
import { RoomIllustration } from './RoomIllustration';
import { availabilityLabels, roomDetails } from './workspaceContent';

export type Panel = 'chat' | 'people' | 'spaces' | 'agenda';
type Props = { room: ReturnType<typeof useRoom>; panel: Panel; setPanel: (panel: Panel) => void; selectedConversation: string; onConversation: (conversation: string) => void; zoneId?: string; question: boolean; setQuestion: (question: boolean) => void; chatInput: RefObject<HTMLInputElement | null>; onNavigate: (x: number, y: number) => void; onInvite: () => void; followId: string | null; onFollow: (id: string | null) => void };

export function WorkspacePanel({ room, panel, setPanel, selectedConversation, onConversation, zoneId, question, setQuestion, chatInput, onNavigate, onInvite, followId, onFollow }: Props) {
  const [draft, setDraft] = useState(''), [search, setSearch] = useState(''), [reply, setReply] = useState<ChatMessage | null>(null);
  const conversation = question ? (zoneId ? 'room' : 'campus') : selectedConversation;
  const end = useRef<HTMLDivElement>(null);
  const dmId = conversation.startsWith('dm:') ? conversation.slice(3) : undefined;
  const peer = room.players.find(p => p.id === dmId);
  const channelZone = conversation === 'room' ? zoneId : undefined;
  const visible = room.messages.filter(message => dmId ? !!message.recipientId && (message.playerId === room.id && message.recipientId === dmId || message.playerId === dmId && message.recipientId === room.id) : !message.recipientId && message.zoneId === channelZone);
  const goConversation = (next: string) => { onConversation(next); setReply(null); setDraft(''); setQuestion(false); };
  const validReply = reply && !question && (dmId ? !!reply.recipientId && [reply.playerId, reply.recipientId].every(id => id === room.id || id === dmId) : !reply.recipientId && reply.zoneId === channelZone) ? reply : null;
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [room.messages, panel, conversation]);
  useEffect(() => { if (panel === 'chat') chatInput.current?.focus(); }, [panel, selectedConversation, question, chatInput]);
  const people = room.players.filter(player => `${player.name} ${player.statusText} ${zoneAt(player.x, player.y)?.name}`.toLowerCase().includes(search.toLowerCase()));
  return <aside className="communication-panel">
    <div className="panel-tabs">{([{ id: 'chat', label: 'Chat', icon: MessageCircle }, { id: 'people', label: 'People', icon: Users }, { id: 'spaces', label: 'Spaces', icon: LayoutGrid }, { id: 'agenda', label: 'Agenda', icon: CalendarDays }] as const).map(({ id, label, icon: Icon }) => <button key={id} className={panel === id ? 'selected' : ''} onClick={() => { setPanel(id); setSearch(''); }}><Icon size={16} /><span>{label}</span></button>)}</div>
    {panel === 'chat' ? <>
      <div className="panel-heading"><span className="eyebrow">A LITTLE CONVERSATION GOES A LONG WAY</span><h2>{dmId ? peer?.name || 'Direct message' : 'Say something good.'}<span>✦</span></h2><p>{dmId ? 'Just between the two of you.' : 'Ideas, hellos, and everything in between.'}</p></div>
      {dmId ? <div className="dm-heading"><button className="small-button" onClick={() => goConversation('campus')}>← Campus chat</button><span><span className={`presence-dot ${peer?.availability || 'away'}`} />{peer ? availabilityLabels[peer.availability || 'available'] : 'Left the campus'}</span></div> : <div className="panel-switch"><button className={conversation === 'campus' ? 'selected' : ''} onClick={() => goConversation('campus')}># campus</button><button className={conversation === 'room' ? 'selected' : ''} disabled={!zoneId} onClick={() => goConversation('room')}># this room</button></div>}
      <div className="messages"><div className="chat-date">TODAY IN {dmId ? 'YOUR CONVERSATION' : channelZone ? zones.find(z => z.id === channelZone)?.name.toUpperCase() : 'NOVA'}</div>
        {!visible.length && <div className="panel-empty"><span>{dmId ? '💌' : '👋'}</span><h3>{dmId ? 'Make their day.' : 'A hello is a great start.'}</h3><p>{dmId ? 'Send a thought, a question, or a friendly wave.' : 'Your next good conversation starts with a little hello.'}</p></div>}
        {visible.map(message => <article className={`message ${message.playerId === room.id ? 'own' : ''}`} key={message.id}><span className="message-avatar" style={{ background: message.color }}>{message.name.slice(0, 1)}</span><div><header><strong>{message.name}{message.playerId === room.id ? ' (you)' : ''}</strong><time>{new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></header>
          {message.replyTo && <div className="reply-context"><Reply size={12} />{room.messages.find(m => m.id === message.replyTo)?.text || 'Earlier message'}</div>}{message.kind === 'question' && <span className="question-tag">QUESTION</span>}<p>{message.text}</p><button className="message-reply" aria-label={`Reply to ${message.name}`} onClick={() => { setReply(message); chatInput.current?.focus(); }}><Reply size={12} /> Reply</button></div></article>)}<div ref={end} />
      </div>
      <form className="chat-compose" onSubmit={e => { e.preventDefault(); if (!draft.trim() || dmId && !peer) return; room.send({ type: 'chat', text: draft, kind: question ? 'question' : 'message', ...(dmId ? { recipientId: dmId } : channelZone ? { zoneId: channelZone } : {}), ...(validReply ? { replyTo: validReply.id } : {}) }); setDraft(''); setReply(null); setQuestion(false); }}>
        {validReply && <div className="question-mode"><span><Reply size={12} /> Reply to {validReply.name}</span><button type="button" onClick={() => setReply(null)} aria-label="Cancel reply"><X size={13} /></button></div>}
        {question && <div className="question-mode">Asking a question<button type="button" onClick={() => setQuestion(false)} aria-label="Cancel question"><X size={13} /></button></div>}
        <div className="compose-input"><input ref={chatInput} value={draft} maxLength={1200} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }} placeholder={dmId ? `Message ${peer?.name || 'teammate'}…` : question ? 'Ask the presenter…' : 'A thought? A hello?'} aria-label="Message your team" /><button disabled={!draft.trim() || room.status !== 'connected' || !!dmId && !peer} aria-label="Send message"><Send size={17} /></button></div><span>{dmId ? 'Only you and this teammate can see these messages' : channelZone ? 'Visible in this room’s chat channel' : 'Shared with everyone in this workplace'}</span>
      </form>
    </> : panel === 'people' ? <>
      <div className="panel-heading"><span className="eyebrow">GOOD COMPANY, ONE CLICK AWAY</span><h2>Your people.<span>☺</span></h2><p><span className="status-dot" /> {room.players.length} here · {room.players.filter(p => !p.availability || p.availability === 'available').length} happy to connect</p></div>
      <label className="panel-search"><Search size={16} /><input placeholder="Find a teammate…" aria-label="Find a teammate" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="people-list panel-scroll">{people.map(player => <article className="person-card" key={player.id}><div className="person-row"><span className="person-avatar" style={{ background: `${player.shirt}25` }}><AvatarPreview avatar={player} size={55} portrait /><i className={`presence-dot ${player.availability || 'available'}`} /></span><div><strong>{player.name}{player.id === room.id ? ' (you)' : ''}</strong><small>{player.statusText || availabilityLabels[player.availability || 'available']}</small><span>{roomDetails[zoneAt(player.x, player.y)?.id || 'hub'].emoji} {zoneAt(player.x, player.y)?.name || 'On the walkway'}</span></div>{player.hand ? <Hand size={15} className="raised" /> : player.mic ? <Mic size={14} /> : <MicOff size={14} />}</div>{player.id !== room.id && <div className="person-actions"><button onClick={() => { const point = followPoint(player); onNavigate(point.x, point.y); }}><Navigation size={13} /> Walk over</button><button onClick={() => onFollow(followId === player.id ? null : player.id)} aria-pressed={followId === player.id}>{followId === player.id ? 'Following ✓' : 'Follow'}</button><button onClick={() => { goConversation(`dm:${player.id}`); setPanel('chat'); }} aria-label={`Message ${player.name}`}><MessageCircle size={14} /></button></div>}</article>)}{!people.length && <p className="empty-search">No teammates found. Try another name.</p>}</div>
      <div className="panel-note"><Users size={19} /><p>Walk over to connect. A teammate in focus mode has a little quiet space.</p></div><button className="panel-invite" onClick={onInvite}><Copy size={15} /> Invite a little company</button>
    </> : panel === 'spaces' ? <>
      <div className="panel-heading"><span className="eyebrow">TAKE THE SCENIC ROUTE</span><h2>Find your happy place.<span>✿</span></h2><p>Nine little worlds. Room for eight in each.</p></div>
      <label className="panel-search"><Search size={16} /><input placeholder="Find a space…" aria-label="Find a space" value={search} onChange={e => setSearch(e.target.value)} /></label>
      <div className="spaces-list panel-scroll">{zones.filter(z => `${z.name} ${roomDetails[z.id].description}`.toLowerCase().includes(search.toLowerCase())).map(z => { const count = room.players.filter(p => zoneAt(p.x, p.y)?.id === z.id).length; return <button className={`space-card ${zoneId === z.id ? 'current' : ''}`} key={z.id} onClick={() => onNavigate(z.entry.x, z.entry.y)} style={{ '--room-color': z.color, '--room-accent': z.accent } as React.CSSProperties}><div className="space-picture"><RoomIllustration zoneId={z.id} />{zoneId === z.id && <span className="you-are-here">YOU’RE HERE</span>}</div><div className="space-info"><span><strong>{roomDetails[z.id].emoji} {z.name}</strong><small>{roomDetails[z.id].description}</small></span><ArrowRight size={17} /></div><div className="space-meta"><span>{count ? `${count} here` : 'Ready for you'} · {z.capacity} seats</span><span>{z.audio === 'room' ? 'Room audio' : 'Proximity audio'}</span></div></button>; })}</div>
    </> : <CampusAgenda events={room.events} notes={room.notes} id={room.id} zoneId={zoneId} send={room.send} onNavigate={onNavigate} />}
  </aside>;
}
