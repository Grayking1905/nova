import { useState } from 'react';
import type { Avatar } from '../../types';
import { AvatarPreview } from '../../components/AvatarPreview';
import type { AvatarPreviewMode } from '../../components/AvatarPreview';

const poses:AvatarPreviewMode[]=['idle','walk','turn','sit','wave'];
export function AvatarCustomizerPreview({avatar}:{avatar:Avatar}) {
  const [mode,setMode]=useState<AvatarPreviewMode>('idle');
  return <>
    <div className="avatar-stage"><div className="avatar-stage-orbit"/><AvatarPreview avatar={avatar} size={240} mode={mode}/></div>
    <span className="avatar-preview-caption">YOUR LITTLE DIGITAL SELF</span>
    <label className="gesture-preview-select">Try an expression<select aria-label="Preview character reaction" value={mode} onChange={e=>setMode(e.target.value as AvatarPreviewMode)}>{['idle','walk','turn','sit','wave','clap','dance','laugh','coffee','think','celebrate','heart','surprise','sleep'].map(value=><option key={value} value={value}>{value}</option>)}</select></label>
    <div className="avatar-pose-controls" role="group" aria-label="Preview avatar animation">{poses.map(pose=><button type="button" key={pose} aria-label={`Preview ${pose} animation`} aria-pressed={mode===pose} className={mode===pose?'chosen':''} onClick={()=>setMode(pose)}>{pose}</button>)}</div>
  </>;
}
