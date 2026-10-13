import type { Avatar } from '../types';
import { AvatarCustomizerPreview } from '../world/components/AvatarCustomizerPreview';

export function AvatarEditor({ avatar, onChange }: { avatar: Avatar; onChange: (avatar: Avatar) => void }) {
  const swatches = (label: string, key: 'shirt' | 'skin' | 'hair', colors: string[]) => <div className="customize-row"><span>{label}</span><div>{colors.map(color => <button type="button" key={color} aria-label={`${label} ${color}`} aria-pressed={avatar[key] === color} className={`color-swatch ${avatar[key] === color ? 'chosen' : ''}`} style={{ background: color }} onClick={() => onChange({ ...avatar, [key]: color })} />)}</div></div>;
  return <section className="avatar-builder">
    <AvatarCustomizerPreview avatar={avatar} />
    <label className="field-label">Your name<input required maxLength={24} value={avatar.name} onChange={e => onChange({ ...avatar, name: e.target.value })} placeholder="What should we call you?" autoFocus /></label>
    {swatches('Outfit', 'shirt', ['#8a70bc', '#5c8e75', '#a46c65', '#648d9f', '#b4845d', '#3d485e'])}
    {swatches('Skin tone', 'skin', ['#f1c9a6', '#d8a17b', '#b67a55', '#845538', '#563a31'])}
    {swatches('Hair', 'hair', ['#302332', '#70452e', '#bb864a', '#b8b5ca'])}
    <div className="segmented compact">{(['short', 'long', 'curly'] as const).map(style => <button type="button" className={avatar.style === style ? 'active' : ''} key={style} onClick={() => onChange({ ...avatar, style })}>{style}</button>)}</div>
  </section>;
}
