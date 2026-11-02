import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccountDetails, AccountUser, Avatar } from '../types';
import { API } from './useRoom';

async function request(path:string,init:RequestInit={}) {
  let response:Response;
  try{response=await fetch(`${API}/auth${path}`,{...init,credentials:'include',signal:init.signal||AbortSignal.timeout(20000),headers:{'X-Nova-Request':'1',...init.headers}});}catch{throw new Error('We couldn’t reach your workplace. Please try again.');}
  const result=await response.json().catch(()=>({error:'The account service is unavailable. Please try again.'}));
  if(!response.ok)throw Object.assign(new Error(result.error||'Please try again.'),{status:response.status});return result;
}
const json=(method:string,value:unknown):RequestInit=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
export function useAuth(){
  const [user,setUser]=useState<AccountUser|null>(null),[loading,setLoading]=useState(true),[welcome,setWelcome]=useState(false),[warning,setWarning]=useState(''),[signedOut,setSignedOut]=useState(false);
  const version=useRef(0),busy=useRef(false);
  const announce=()=>{try{localStorage.setItem('nova-auth-event',`${Date.now()}-${Math.random()}`);}catch{/* Cookies remain the source of truth when browser storage is unavailable. */}};
  const refresh=useCallback(async()=>{if(busy.current)return;const id=++version.current;try{const result=await request('/me');if(version.current===id)setUser(result.user);}catch(error){if(version.current===id&&(error as {status?:number}).status===401){setUser(null);setWelcome(false);setSignedOut(true);};}finally{if(version.current===id)setLoading(false);}},[]);
  useEffect(()=>{const revision=version;let cancelled=false;queueMicrotask(()=>{if(!cancelled)void refresh();});const storage=(event:StorageEvent)=>{if(event.key==='nova-auth-event')void refresh();};const focus=()=>{void refresh();};window.addEventListener('storage',storage);window.addEventListener('focus',focus);window.addEventListener('nova:auth-expired',focus);return()=>{cancelled=true;revision.current++;window.removeEventListener('storage',storage);window.removeEventListener('focus',focus);window.removeEventListener('nova:auth-expired',focus);};},[refresh]);
  const login=async(email:string,password:string,remember:boolean)=>{busy.current=true;version.current++;try{const result=await request('/login',json('POST',{email,password,remember}));setUser(result.user);setWelcome(false);announce();}finally{busy.current=false;}};
  const register=async(value:AccountDetails&{email:string;password:string},photo:File|null)=>{busy.current=true;version.current++;try{let result=await request('/register',json('POST',{...value,remember:true}));setWarning('');if(photo){try{result=await request('/photo',{method:'POST',headers:{'Content-Type':photo.type},body:photo});}catch{setWarning('Your account is ready. You can add your photo from your profile.');}}setUser(result.user);setWelcome(true);announce();}finally{busy.current=false;}};
  const logout=async()=>{busy.current=true;version.current++;try{try{await request('/logout',{method:'POST'});}catch(error){if((error as {status?:number}).status!==401)throw error;}setUser(null);setWelcome(false);setSignedOut(true);announce();}finally{busy.current=false;}};
  const updateAccount=async(path:string,init:RequestInit)=>{if(busy.current)throw new Error('Please wait for your current change to finish.');busy.current=true;version.current++;try{const result=await request(path,init);setUser(result.user);announce();return result.user as AccountUser;}catch(error){if((error as {status?:number}).status===401){setUser(null);setWelcome(false);setSignedOut(true);}throw error;}finally{busy.current=false;}};
  const saveProfile=(value:AccountDetails)=>updateAccount('/profile',json('PATCH',value));
  const saveAvatar=(value:Avatar)=>updateAccount('/avatar',json('POST',value));
  const savePhoto=(file:File|null)=>updateAccount('/photo',file?{method:'POST',headers:{'Content-Type':file.type},body:file}:{method:'DELETE'});
  const changePassword=async(currentPassword:string,newPassword:string)=>{busy.current=true;version.current++;try{await request('/password',json('POST',{currentPassword,newPassword}));setUser(null);setWelcome(false);setSignedOut(true);announce();}finally{busy.current=false;}};
  return {user,loading,welcome,warning,signedOut,dismissWelcome:()=>setWelcome(false),login,register,logout,saveProfile,saveAvatar,savePhoto,changePassword};
}
