export const WORLD = { width: 3600, height: 2600 };
export type Rect = { x: number; y: number; w: number; h: number };
export type FixtureType = 'desk' | 'plant' | 'sofa' | 'table' | 'screen' | 'board' | 'chair' | 'coffee' | 'shelf' | 'podium' | 'lamp' | 'fountain' | 'arcade' | 'noticeboard' | 'clock' | 'door';
export type Fixture = Rect & { id: string; type: FixtureType; zoneId: string; label?: string; color?: string; variant?: string; approach?: {x:number;y:number} };
export type Zone = Rect & { id:string; name:string; subtitle:string; color:string; accent:string; capacity:number; audio:'room'|'near'; entry:{x:number;y:number} };
const definitions = [
  ['stage','The Forum','PRESENT & INSPIRE','#d5ccef','#8a70bc','room'],
  ['studio','Idea Studio','MAKE SOMETHING GREAT','#e5c9ad','#b4845d','room'],
  ['garden','Quiet Garden','TAKE A BREATH','#a9cbb7','#5c8e75','near'],
  ['work','Focus Lab','BIG IDEAS START HERE','#b5cdd6','#648d9f','near'],
  ['hub','Welcome Hub','YOUR NEXT GREAT CONNECTION','#d9d3c7','#938873','near'],
  ['lounge','The Commons','COFFEE & CONVERSATION','#d6b9b1','#a46c65','near'],
  ['meeting','Orbit Room','MEET & MOVE FORWARD','#c9cce6','#7b7da7','room'],
  ['sprint','Project Lab','PLAN Ã‚Â· BUILD Ã‚Â· CELEBRATE','#d3dcc0','#87986a','room'],
  ['library','Reading Lounge','A LITTLE ROOM TO RECHARGE','#e2ccba','#ae896c','near'],
] as const;
export const zones: Zone[] = definitions.map(([id,name,subtitle,color,accent,audio],i)=>({id,name,subtitle,color,accent,audio,capacity:8,x:100+(i%3)*1170,y:100+Math.floor(i/3)*840,w:1060,h:680,entry:{x:630+(i%3)*1170,y:690+Math.floor(i/3)*840}}));
export const AUDIO_RADIUS=420;
export const SPAWN = { x:1800, y:1480 };
export const fixtures: Fixture[] = [];
function add(z:Zone,id:string,type:FixtureType,x:number,y:number,w:number,h:number,label?:string,color?:string,variant?:string) {
  const f:Fixture={id,type,zoneId:z.id,x:z.x+x,y:z.y+y,w,h,label:label||(type==='sofa'?'Fluff the cushions':type==='table'?'Gather around the table':undefined),color,variant};
  fixtures.push(f);return f;
}
function seat(z:Zone,id:string,x:number,y:number) { add(z,id,'chair',x,y,52,54,'Take a seat'); }
function conference(z:Zone,prefix:string) {
  add(z,`${prefix}-table`,'table',315,330,430,140,undefined,undefined,'conference');
  [360,505,650].forEach((x,i)=>{seat(z,`${prefix}-north-${i}`,x,235);seat(z,`${prefix}-south-${i}`,x,520);});
  seat(z,`${prefix}-west`,205,365);seat(z,`${prefix}-east`,805,365);
}
for(const z of zones) {
  // All furniture sits inside the room; central doorways have broad clear aisles.
  [[65,70],[945,70],[65,575],[945,575]].forEach(([x,y],i)=>add(z,`${z.id}-plant-${i}`,'plant',x,y,49,49,'Water the plant'));
  add(z,`${z.id}-clock`,'clock',875,52,60,60,'Check the time');
  add(z,`${z.id}-door`,'door',450,661,160,18,'Enter / leave room');
  if(z.y>100)add(z,`${z.id}-north-door`,'door',450,0,160,18,'Enter / leave room');
  add(z,`${z.id}-lamp`,'lamp',915,470,45,60,'Toggle reading light');
  if(z.id==='stage') {
    add(z,'stage-screen','screen',300,85,460,94,'Start a presentation');
    add(z,'stage-podium','podium',805,175,74,78,'Take the stage');
    for(let row=0;row<2;row++)for(let col=0;col<4;col++)seat(z,`stage-seat-${row*4+col}`,250+col*170,345+row*128);
    add(z,'stage-notices','noticeboard',60,265,112,145,'Read team moments');
  } else if(z.id==='studio'||z.id==='meeting'||z.id==='sprint') {
    const id=z.id==='studio'?'board':`${z.id}-board`;
    add(z,id,'board',300,85,460,78,'Open shared whiteboard');
    conference(z,z.id);
    add(z,`${z.id}-screen`,'screen',60,220,115,80,'Present to this room');
    add(z,`${z.id}-shelf`,'shelf',820,260,145,54,'Browse the bookshelf');
    if(z.id==='sprint')add(z,'sprint-notices','noticeboard',810,145,122,91,'Read team moments');
  } else if(z.id==='work') {
    for(let row=0;row<2;row++)for(let col=0;col<4;col++) {
      const n=row*4+col+1,x=70+col*240,y=175+row*240;
      add(z,`desk-${n}`,'desk',x,y,180,80,'Share at this workstation');
      seat(z,`desk-chair-${n}`,x+64,y+140);
    }
  } else if(z.id==='hub') {
    add(z,'reception','table',385,190,290,105,'Say hello',undefined,'reception');
    add(z,'hub-directory','noticeboard',810,195,122,130,'Explore campus');
    add(z,'hub-books','shelf',65,365,145,54,'Browse the bookshelf');
    add(z,'hub-sofa','sofa',355,430,350,83,undefined,'#aaa08b');
    [250,420,590,760].forEach((x,i)=>{seat(z,`hub-seat-a-${i}`,x,340);seat(z,`hub-seat-b-${i}`,x,525);});
  } else if(z.id==='garden') {
    add(z,'garden-fountain','fountain',410,280,240,150,'Take a water break');
    add(z,'garden-bench','sofa',345,140,370,80,undefined,'#568f79');
    add(z,'garden-table','table',105,285,140,85);
    for(let i=0;i<4;i++){seat(z,`garden-west-${i}`,290,245+i*80);seat(z,`garden-east-${i}`,730,245+i*80);}
    add(z,'garden-books','shelf',820,300,140,54,'Browse the bookshelf');
  } else if(z.id==='lounge') {
    add(z,'cafe','coffee',350,80,350,105,'Brew a coffee');
    add(z,'lounge-sofa','sofa',135,265,310,85,undefined,'#bd8379');
    add(z,'lounge-sofa-2','sofa',610,265,310,85,undefined,'#bd8379');
    add(z,'lounge-table','table',215,410,145,80);
    add(z,'lounge-table-2','table',695,410,145,80);
    [125,390,605,870].forEach((x,i)=>{seat(z,`lounge-seat-a-${i}`,x,370);seat(z,`lounge-seat-b-${i}`,x,525);});
    add(z,'lounge-arcade','arcade',60,115,92,112,'Play a quick break game');
  } else if(z.id==='library') {
    [110,375,640].forEach((x,i)=>add(z,`library-shelf-${i}`,'shelf',x,130,180,65,'Browse the bookshelf'));
    add(z,'library-table','table',365,320,330,120,undefined,undefined,'conference');
    [240,410,580,750].forEach((x,i)=>{seat(z,`library-seat-a-${i}`,x,245);seat(z,`library-seat-b-${i}`,x,500);});
    add(z,'library-sofa','sofa',820,270,150,85,undefined,'#b49782');
  }
}
const solid = (f:Fixture)=>!['chair','door','clock','noticeboard'].includes(f.type);
export const obstacles: Rect[] = [
  ...zones.flatMap(z=>[
    ...(z.y===100?[{x:z.x,y:z.y,w:z.w,h:16}]:[{x:z.x,y:z.y,w:450,h:16},{x:z.x+610,y:z.y,w:450,h:16}]),
    {x:z.x,y:z.y,w:14,h:z.h},{x:z.x+z.w-14,y:z.y,w:14,h:z.h},
    {x:z.x,y:z.y+z.h-14,w:450,h:14},{x:z.x+610,y:z.y+z.h-14,w:450,h:14},
  ]),
  ...fixtures.filter(solid).map(f=>({x:f.x,y:f.y,w:f.w,h:f.h})),
];
export function canStand(x:number,y:number) {const r=15;return x>26&&y>26&&x<WORLD.width-26&&y<WORLD.height-26&&!obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);}
export function zoneAt(x:number,y:number) {return zones.find(z=>x>z.x&&y>z.y&&x<z.x+z.w&&y<z.y+z.h);}
export function fixtureDistance(f:Fixture,x:number,y:number) {return Math.hypot(Math.max(f.x-x,0,x-f.x-f.w),Math.max(f.y-y,0,y-f.y-f.h));}
export function interactionPoint(f:Fixture) {if(f.approach)return f.approach;const options=[{x:f.x+f.w/2,y:f.y+f.h+55},{x:f.x+f.w+55,y:f.y+f.h/2},{x:f.x-55,y:f.y+f.h/2},{x:f.x+f.w/2,y:f.y-55}];return options.find(p=>canStand(p.x,p.y))||options[0];}
export function presentationPoint(zoneId:string) {const f=fixtures.find(f=>f.zoneId===zoneId&&f.type==='screen');return f?interactionPoint(f):zones.find(z=>z.id===zoneId)!.entry;}
export function nearbyFixture(x:number,y:number) {return fixtures.filter(f=>f.label).map(f=>({f,d:fixtureDistance(f,x,y)})).filter(({f,d})=>d<(f.type==='screen'||f.type==='board'?110:75)).sort((a,b)=>a.d-b.d)[0]?.f;}
export function audible(a:{x:number;y:number;availability?:string},b:{x:number;y:number;availability?:string},presentationZone?:string) {if([a.availability,b.availability].some(status=>status==='focus'||status==='away'))return false;const za=zoneAt(a.x,a.y),zb=zoneAt(b.x,b.y);return za?.id===zb?.id&&(za?.audio==='room'||za?.id===presentationZone&&!!presentationZone||Math.hypot(a.x-b.x,a.y-b.y)<AUDIO_RADIUS);}

// Cache the navigation grid once. Its dimensions follow the actual campus bounds.
const step=25,cols=Math.floor(WORLD.width/step),rows=Math.floor(WORLD.height/step);
const cell=(index:number)=>({x:(index%cols)*step+step/2,y:Math.floor(index/cols)*step+step/2});
const walkable=Uint8Array.from({length:cols*rows},(_,i)=>{const p=cell(i);return Number(canStand(p.x,p.y));});
function clearSegment(a:{x:number;y:number},b:{x:number;y:number}) {const count=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/8);for(let i=1;i<=count;i++)if(!canStand(a.x+(b.x-a.x)*i/count,a.y+(b.y-a.y)*i/count))return false;return true;}
export function findPath(start:{x:number;y:number},end:{x:number;y:number}) {
  if(!canStand(start.x,start.y))return [];
  const nearest=(p:{x:number;y:number},checkStart:boolean)=>{let best=-1,distance=Infinity;const px=Math.floor(p.x/step),py=Math.floor(p.y/step);for(let y=Math.max(1,py-7);y<=Math.min(rows-2,py+7);y++)for(let x=Math.max(1,px-7);x<=Math.min(cols-2,px+7);x++){const i=y*cols+x,q=cell(i),d=Math.hypot(q.x-p.x,q.y-p.y);if(walkable[i]&&d<distance&&(!checkStart||clearSegment(p,q))){best=i;distance=d;}}return best;};
  const first=nearest(start,true),last=nearest(end,false);if(first<0||last<0)return [];
  const previous=new Int32Array(cols*rows).fill(-2),queue=new Int32Array(cols*rows);let head=0,tail=1;queue[0]=first;previous[first]=-1;
  while(head<tail){const i=queue[head++];if(i===last)break;for(const n of [i-1,i+1,i-cols,i+cols]){if(n<0||n>=previous.length||Math.abs((i%cols)-(n%cols))>1||previous[n]!==-2||!walkable[n])continue;previous[n]=i;queue[tail++]=n;}}
  if(previous[last]===-2)return [];
  const route:{x:number;y:number}[]=[];for(let i=last;i!==-1;i=previous[i])route.push(cell(i));route.reverse();
  return route.filter((p,i)=>i===0||i===route.length-1||((p.x-route[i-1].x)!==(route[i+1].x-p.x))||((p.y-route[i-1].y)!==(route[i+1].y-p.y)));
}
