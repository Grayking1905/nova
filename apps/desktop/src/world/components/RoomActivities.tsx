import { Coffee, Gamepad2, BookOpen, Droplets, Lightbulb, MonitorUp, PenTool, Sprout, Pin } from 'lucide-react';
import { fixtures } from '../map';

const activities=[
  {type:'screen',icon:MonitorUp},{type:'board',icon:PenTool},{type:'coffee',icon:Coffee},
  {type:'arcade',icon:Gamepad2},{type:'fountain',icon:Droplets},{type:'shelf',icon:BookOpen},
  {type:'lamp',icon:Lightbulb},{type:'plant',icon:Sprout},{type:'noticeboard',icon:Pin},
];
export function RoomActivities({zoneId,onRequest}:{zoneId?:string;onRequest:(id:string)=>void}) {
  const available=activities.map(activity=>({...activity,fixture:fixtures.find(f=>f.zoneId===zoneId&&f.type===activity.type&&f.label)})).filter(activity=>activity.fixture).slice(0,5);
  if(!available.length)return null;
  return <nav className="room-activities" aria-label="Activities in this room"><span>EXPLORE</span>{available.map(({fixture,icon:Icon})=><button key={fixture!.id} title={fixture!.label} aria-label={fixture!.label} onClick={()=>onRequest(fixture!.id)}><Icon size={15}/></button>)}</nav>;
}
