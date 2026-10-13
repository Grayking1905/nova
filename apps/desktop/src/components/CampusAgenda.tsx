import { useState } from 'react';
import { ArrowRight, CalendarDays, Download, NotebookPen, Plus, Trash2 } from 'lucide-react';
import type { CampusEvent, MeetingNote } from '../types';
import { zones } from '../world/map';
import { Dialog } from './Dialog';
import { roomDetails } from './workspaceContent';

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function calendarFile(event: CampusEvent) {
  const date = (time: number) => new Date(time).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, value => `\\${value}`);
  download('nova-meeting.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nova//Campus//EN', 'BEGIN:VEVENT', `UID:${event.id}@nova`, `DTSTAMP:${date(Date.now())}`, `DTSTART:${date(event.startAt)}`, `DTEND:${date(event.startAt + event.duration * 60000)}`, `SUMMARY:${escape(event.title)}`, `LOCATION:${escape(zones.find(z => z.id === event.zoneId)!.name)}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n'), 'text/calendar;charset=utf-8');
}
function localMeetingStart() {
  const date = new Date(Date.now() + 30 * 60000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function CampusAgenda({ events, notes, id, zoneId, send, onNavigate }: { events: CampusEvent[]; notes: MeetingNote[]; id: string; zoneId?: string; send: (message: Record<string, unknown>) => void; onNavigate: (x: number, y: number) => void }) {
  const [tab, setTab] = useState<'agenda' | 'notes'>('agenda');
  const [creating, setCreating] = useState(false), [title, setTitle] = useState(''), [duration, setDuration] = useState(30), [eventZone, setEventZone] = useState('meeting');
  const [plannerError, setPlannerError] = useState('');
  const [noteZone, setNoteZone] = useState(zoneId || 'meeting'), [note, setNote] = useState('');
  const selectedNotes = notes.filter(item => item.zoneId === noteZone);
  return <>
    <div className="panel-heading"><span className="eyebrow">MAKE TIME FOR YOUR TEAM</span><h2>A little planning.<span>✳</span></h2><p>Good things happen when you get together.</p></div>
    <div className="panel-switch"><button className={tab === 'agenda' ? 'selected' : ''} onClick={() => setTab('agenda')}><CalendarDays size={15} /> Agenda</button><button className={tab === 'notes' ? 'selected' : ''} onClick={() => setTab('notes')}><NotebookPen size={15} /> Meeting notes</button></div>
    {tab === 'agenda' ? <>
      <div className="section-action"><span>YOUR CAMPUS CALENDAR</span><button className="small-button" onClick={() => { setPlannerError(''); setCreating(true); }}><Plus size={14} /> Plan a meet</button></div>
      <div className="agenda-list panel-scroll">{!events.length && <div className="panel-empty"><span>🗓️</span><h3>Make a little time.</h3><p>Plan a brainstorm, a team catch-up, or a coffee. Everyone here will see it.</p><button className="outline-button" onClick={() => setCreating(true)}><Plus size={15} /> Your first meeting</button></div>}{events.map(event => {
        const z = zones.find(z => z.id === event.zoneId)!;
        return <article className="agenda-card" key={event.id} style={{ '--room-color': z.color } as React.CSSProperties}>
          <div className="agenda-date"><strong>{new Date(event.startAt).getDate()}</strong><span>{new Date(event.startAt).toLocaleDateString([], { month: 'short' })}</span></div>
          <div><small>{new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.duration} min</small><h3>{event.title}</h3><p>{roomDetails[z.id].emoji} {z.name}</p><span className="agenda-host">Planned by {event.creatorName}</span></div>
          <footer><button onClick={() => onNavigate(z.entry.x, z.entry.y)}>Walk to meeting <ArrowRight size={14} /></button><button title="Save to calendar" aria-label={`Save ${event.title} to calendar`} onClick={() => calendarFile(event)}><Download size={15} /></button>{event.creatorId === id && <button aria-label={`Delete ${event.title}`} onClick={() => send({ type: 'event-delete', id: event.id })}><Trash2 size={14} /></button>}</footer>
        </article>;
      })}</div><div className="panel-footnote">Shared with this campus · saved for this server session</div>
    </> : <>
      <div className="notes-toolbar"><select aria-label="Notes room" value={noteZone} onChange={e => setNoteZone(e.target.value)}>{zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}</select><button className="icon-btn" disabled={!selectedNotes.length} aria-label="Export meeting notes" onClick={() => download('nova-meeting-notes.md', `# ${zones.find(z => z.id === noteZone)!.name}\n\n` + selectedNotes.map(item => `## ${item.authorName} · ${new Date(item.time).toLocaleString()}\n\n${item.text}`).join('\n\n'), 'text/markdown;charset=utf-8')}><Download size={17} /></button></div>
      <div className="notes-list panel-scroll">{!selectedNotes.length && <div className="panel-empty"><span>📝</span><h3>Keep the good ideas.</h3><p>Add decisions, next steps, or the idea you don’t want to forget. These notes are shared.</p></div>}{selectedNotes.map(item => <article className="note-card" key={item.id}><header><span>{item.authorName} · {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>{item.authorId === id && <button className="icon-btn" aria-label="Delete your note" onClick={() => send({ type: 'note-delete', id: item.id })}><Trash2 size={13} /></button>}</header><p>{item.text}</p></article>)}</div>
      <form className="note-compose" onSubmit={e => { e.preventDefault(); if (!note.trim()) return; send({ type: 'note-create', text: note, zoneId: noteZone }); setNote(''); }}><textarea value={note} onChange={e => setNote(e.target.value)} maxLength={2000} placeholder="A decision, an idea, a next step…" aria-label="New meeting note" /><button className="small-button" disabled={!note.trim()}><Plus size={14} /> Add shared note</button></form>
    </>}
    {creating && <Dialog title="Put a good thing on the calendar." onClose={() => setCreating(false)}><form className="event-form" onSubmit={e => { e.preventDefault(); const startAt = new Date(String(new FormData(e.currentTarget).get('startAt'))).getTime(); if (!Number.isFinite(startAt) || startAt < Date.now() - 60000 || startAt > Date.now() + 90 * 86400000) { setPlannerError('Choose a future time within the next 90 days.'); return; } send({ type: 'event-create', title, startAt, duration, zoneId: eventZone }); setCreating(false); setTitle(''); }}>
      <label className="field-label">What are we getting together for?<input required maxLength={80} value={title} onChange={e => setTitle(e.target.value)} placeholder="Friday ideas & coffee" /></label>
      <label className="field-label">When?<input required name="startAt" type="datetime-local" defaultValue={localMeetingStart()} /></label>
      <div className="form-columns"><label className="field-label">Duration<select value={duration} onChange={e => setDuration(Number(e.target.value))}>{[15, 30, 45, 60, 90, 120].map(value => <option key={value} value={value}>{value} minutes</option>)}</select></label><label className="field-label">Meet in<select value={eventZone} onChange={e => setEventZone(e.target.value)}>{zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}</select></label></div>
      {plannerError && <p className="form-error" role="alert">{plannerError}</p>}<button className="primary-button"><CalendarDays size={17} /> Add to campus agenda</button><p className="dialog-note">Everyone in this workplace can see the meeting. Download its calendar file to add it to your own calendar.</p>
    </form></Dialog>}
  </>;
}
