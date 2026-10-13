import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Avatar } from '../types';
import { AvatarEditor } from './AvatarEditor';
import { Dialog } from './Dialog';

export function AvatarEditorDialog({ avatar, onSave, onClose }: { avatar: Avatar; onSave: (avatar: Avatar) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(avatar);
  return <Dialog title="A little more you." onClose={onClose}><form className="edit-avatar-form" onSubmit={e => { e.preventDefault(); if (draft.name.trim()) onSave({ ...draft, name: draft.name.trim() }); }}><AvatarEditor avatar={draft} onChange={setDraft} /><button className="primary-button" disabled={!draft.name.trim()}>Save your look <Check size={16} /></button></form></Dialog>;
}
