import type { Avatar } from '../types';
import { useState } from 'react';
import { hairstyles, outfits, accessories, characterPresets } from '../world/avatarOptions';
import { AvatarPreview } from './AvatarPreview';
import { AvatarCustomizerPreview } from '../world/components/AvatarCustomizerPreview';

export function AvatarEditor({ avatar, onChange }: { avatar: Avatar; onChange: (avatar: Avatar) => void }) {
  const [tab,setTab]=useState<'look'|'wardrobe'|'characters'>('look');
  const swatches = (label: string, key: 'shirt' | 'skin' | 'hair', colors: string[]) => <div className="customize-row"><span>{label}</span><div>{colors.map(color => <button type="button" key={color} aria-label={`${label} ${color}`} aria-pressed={avatar[key] === color} className={`color-swatch ${avatar[key] === color ? 'chosen' : ''}`} style={{ background: color }} onClick={() => onChange({ ...avatar, [key]: color })} />)}</div></div>;
  return <section className="avatar-builder">
    <div className="avatar-preview-column"><AvatarCustomizerPreview avatar={avatar} /></div>
    <div className="avatar-options-column">
    <label className="field-label">Your name<input required maxLength={24} value={avatar.name} onChange={e => onChange({ ...avatar, name: e.target.value })} placeholder="What should we call you?" autoFocus /></label>
    <div className="wardrobe-tabs" role="group" aria-label="Character customization">{(['look','wardrobe','characters'] as const).map(value=><button type="button" key={value} className={tab===value?'selected':''} aria-pressed={tab===value} onClick={()=>setTab(value)}>{value==='characters'?'Choose a character':value==='wardrobe'?'Wardrobe':'Your look'}</button>)}</div>
    {tab==='look'&&<>
    {swatches('Outfit', 'shirt', ['#8a70bc', '#5c8e75', '#a46c65', '#648d9f', '#b4845d', '#3d485e'])}
    {swatches('Skin tone', 'skin', ['#f1c9a6', '#d8a17b', '#b67a55', '#845538', '#563a31'])}
    {swatches('Hair', 'hair', ['#302332', '#70452e', '#bb864a', '#b8b5ca'])}
    <span className="wardrobe-label">Hairstyle</span><div className="wardrobe-options">{hairstyles.map(style=><button type="button" aria-pressed={avatar.style===style} className={avatar.style===style?'selected':''} key={style} onClick={()=>onChange({...avatar,style})}>{style}</button>)}</div></>}
    {tab==='wardrobe'&&<><span className="wardrobe-label">Dress for your kind of day</span><div className="wardrobe-options">{outfits.map(outfit=><button type="button" key={outfit} aria-pressed={(avatar.outfit||'crew')===outfit} className={(avatar.outfit||'crew')===outfit?'selected':''} onClick={()=>onChange({...avatar,outfit})}>{outfit}</button>)}</div>{swatches('Fabric','shirt',['#8a70bc','#5c8e75','#a46c65','#648d9f','#b4845d','#3d485e'])}<span className="wardrobe-label">A little finishing touch</span><div className="wardrobe-options">{accessories.map(accessory=><button type="button" key={accessory} aria-pressed={(avatar.accessory||'none')===accessory} className={(avatar.accessory||'none')===accessory?'selected':''} onClick={()=>onChange({...avatar,accessory})}>{accessory.replace('-',' ')}</button>)}</div>{(['pants','shoes'] as const).map(key=><div key={key} className="customize-row"><span>{key==='pants'?'Bottoms':'Footwear'}</span><div>{['#3b435e','#7e7060','#a46c65','#5c8e75','#f7f1e6'].map(color=><button type="button" key={color} className={`color-swatch ${(avatar[key]||(key==='pants'?'#3b435e':'#f7f1e6'))===color?'chosen':''}`} style={{background:color}} aria-label={`${key} ${color}`} aria-pressed={(avatar[key]||(key==='pants'?'#3b435e':'#f7f1e6'))===color} onClick={()=>onChange({...avatar,[key]:color})}/>)}</div></div>)}</>}
    {tab==='characters'&&<><p className="wardrobe-description">Start with a personality. Make every detail yours.</p><div className="character-presets">{characterPresets.map(({label,...look})=><button type="button" key={label} aria-label={`Choose ${label}`} onClick={()=>onChange({...avatar,...look})}><AvatarPreview avatar={{...avatar,...look}} size={64} portrait/><strong>{label}</strong></button>)}</div></>}
    </div>
  </section>;
}
