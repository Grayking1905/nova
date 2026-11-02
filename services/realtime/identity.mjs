import { hairstyles, outfits, accessories } from '../../apps/desktop/src/world/avatarOptions.ts';
const color=(value,fallback)=>typeof value==='string'&&/^#[a-f\d]{6}$/i.test(value)?value:fallback;
export function avatarProfile(value={}) {
  return {name:typeof value.name==='string'?value.name.trim().slice(0,24)||'Teammate':'Teammate',skin:color(value.skin,'#d8a17b'),hair:color(value.hair,'#302332'),shirt:color(value.shirt,'#8a70bc'),style:hairstyles.includes(value.style)?value.style:'short',outfit:outfits.includes(value.outfit)?value.outfit:'crew',accessory:accessories.includes(value.accessory)?value.accessory:'none',pants:color(value.pants,'#3b435e'),shoes:color(value.shoes,'#f7f1e6')};
}
