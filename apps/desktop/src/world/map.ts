export const WORLD = { width: 2000, height: 1280 };
export type Rect = { x: number; y: number; w: number; h: number };
export type Fixture = Rect & { id: string; type: 'desk' | 'plant' | 'sofa' | 'table' | 'screen' | 'board' | 'chair' | 'coffee' | 'shelf'; label?: string; color?: string };
export const zones = [
  { id: 'stage', name: 'The Forum', subtitle: 'PRESENT & INSPIRE', x: 65, y: 65, w: 660, h: 460, color: '#d5ccef', accent: '#8a70bc', entry: { x: 405, y: 440 } },
  { id: 'studio', name: 'Idea Studio', subtitle: 'MAKE SOMETHING GREAT', x: 780, y: 65, w: 635, h: 460, color: '#e5c9ad', accent: '#b4845d', entry: { x: 1090, y: 430 } },
  { id: 'garden', name: 'Quiet Garden', subtitle: 'TAKE A BREATH', x: 1470, y: 65, w: 465, h: 460, color: '#a9cbb7', accent: '#5c8e75', entry: { x: 1670, y: 480 } },
  { id: 'work', name: 'Focus Lab', subtitle: 'BIG IDEAS START HERE', x: 65, y: 600, w: 810, h: 605, color: '#b5cdd6', accent: '#648d9f', entry: { x: 445, y: 1060 } },
  { id: 'hub', name: 'Welcome Hub', subtitle: 'YOUR NEXT GREAT CONNECTION', x: 930, y: 600, w: 485, h: 605, color: '#d9d3c7', accent: '#938873', entry: { x: 1100, y: 950 } },
  { id: 'lounge', name: 'The Commons', subtitle: 'COFFEE & CONVERSATION', x: 1470, y: 600, w: 465, h: 605, color: '#d6b9b1', accent: '#a46c65', entry: { x: 1690, y: 1100 } },
];
export const fixtures: Fixture[] = [
  { id: 'stage-screen', type: 'screen', x: 246, y: 120, w: 300, h: 66, label: 'Present to the room' },
  { id: 'board', type: 'board', x: 911, y: 122, w: 365, h: 60, label: 'Open shared whiteboard' },
  { id: 'stage-seat-1', type: 'chair', x: 240, y: 328, w: 52, h: 50, label: 'Take a seat' },
  { id: 'stage-seat-2', type: 'chair', x: 366, y: 328, w: 52, h: 50, label: 'Take a seat' },
  { id: 'stage-seat-3', type: 'chair', x: 492, y: 328, w: 52, h: 50, label: 'Take a seat' },
  { id: 'studio-table', type: 'table', x: 982, y: 292, w: 225, h: 97 },
  { id: 'studio-seat-1', type: 'chair', x: 915, y: 312, w: 45, h: 50, label: 'Take a seat' },
  { id: 'studio-seat-2', type: 'chair', x: 1230, y: 312, w: 45, h: 50, label: 'Take a seat' },
  { id: 'garden-bench', type: 'sofa', x: 1547, y: 255, w: 250, h: 78, color: '#568f79' },
  { id: 'garden-table', type: 'table', x: 1618, y: 382, w: 116, h: 67 },
  { id: 'desk-1', type: 'desk', x: 159, y: 705, w: 220, h: 89, label: 'Share at this workstation' },
  { id: 'desk-2', type: 'desk', x: 536, y: 705, w: 220, h: 89, label: 'Share at this workstation' },
  { id: 'desk-3', type: 'desk', x: 159, y: 934, w: 220, h: 89, label: 'Share at this workstation' },
  { id: 'desk-4', type: 'desk', x: 536, y: 934, w: 220, h: 89, label: 'Share at this workstation' },
  ...[ [244,825], [621,825], [244,1054], [621,1054] ].map(([x,y], i): Fixture => ({ id: `desk-chair-${i}`, type: 'chair', x, y, w: 48, h: 46, label: 'Take a seat' })),
  { id: 'reception', type: 'table', x: 1046, y: 747, w: 260, h: 95 },
  { id: 'cafe', type: 'coffee', x: 1555, y: 674, w: 294, h: 90, label: 'Grab a coffee' },
  { id: 'lounge-sofa', type: 'sofa', x: 1547, y: 865, w: 250, h: 78, color: '#bd8379' },
  { id: 'lounge-table', type: 'table', x: 1618, y: 993, w: 115, h: 64 },
  { id: 'books', type: 'shelf', x: 960, y: 1090, w: 140, h: 54 },
  ...[[112,117],[625,117],[823,123],[1335,118],[1530,130],[1855,136],[1850,438],[120,1120],[785,1108],[1330,1110],[1845,1108]].map(([x,y], i): Fixture => ({ id: `plant-${i}`, type: 'plant', x, y, w: 49, h: 49 })),
];
// Door openings stay navigable; walls and furniture are solid.
export const obstacles: Rect[] = [
  ...zones.flatMap(z => [
    { x: z.x, y: z.y, w: z.w, h: 16 }, { x: z.x, y: z.y, w: 14, h: z.h }, { x: z.x + z.w - 14, y: z.y, w: 14, h: z.h },
    { x: z.x, y: z.y + z.h - 14, w: z.w / 2 - 70, h: 14 }, { x: z.x + z.w / 2 + 70, y: z.y + z.h - 14, w: z.w / 2 - 70, h: 14 },
  ]),
  ...fixtures.filter(f => f.type !== 'chair').map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
];
// Bottom rooms also open onto the central corridor.
for (const zone of zones.filter(z => z.y > 550)) {
  const index = obstacles.findIndex(o => o.x === zone.x && o.y === zone.y && o.w === zone.w);
  obstacles.splice(index, 1, { x: zone.x, y: zone.y, w: zone.w / 2 - 70, h: 16 }, { x: zone.x + zone.w / 2 + 70, y: zone.y, w: zone.w / 2 - 70, h: 16 });
}
export function canStand(x: number, y: number) { const r = 15; return x > 26 && y > 26 && x < WORLD.width - 26 && y < WORLD.height - 26 && !obstacles.some(o => x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h); }
export function zoneAt(x: number, y: number) { return zones.find(z => x > z.x && y > z.y && x < z.x + z.w && y < z.y + z.h); }
export function nearbyFixture(x: number, y: number) { return fixtures.filter(f => f.label).map(f => ({ fixture: f, distance: Math.hypot(x - (f.x + f.w / 2), y - (f.y + f.h / 2)) })).sort((a,b) => a.distance - b.distance).find(f => f.distance < (f.fixture.type === 'screen' || f.fixture.type === 'board' ? 170 : 110))?.fixture; }
export function audible(a: {x:number;y:number}, b: {x:number;y:number}) { const za = zoneAt(a.x,a.y); const zb = zoneAt(b.x,b.y); return za?.id === zb?.id && (za?.id === 'stage' || Math.hypot(a.x-b.x,a.y-b.y) < 310); }

export function findPath(start: {x:number;y:number}, end: {x:number;y:number}) {
  const step = 25, cols = 80, rows = 51;
  const index = (x:number,y:number) => y * cols + x;
  const cell = (x:number,y:number) => ({ x: x * step + step / 2, y: y * step + step / 2 });
  const sx = Math.floor(start.x/step), sy = Math.floor(start.y/step);
  let ex = Math.max(1,Math.min(cols-2,Math.floor(end.x/step))), ey = Math.max(1,Math.min(rows-2,Math.floor(end.y/step)));
  if (!canStand(cell(ex,ey).x,cell(ex,ey).y)) {
    let best = Infinity; const originalX=ex, originalY=ey;
    for(let x=Math.max(1,originalX-7);x<Math.min(cols-1,originalX+8);x++) for(let y=Math.max(1,originalY-7);y<Math.min(rows-1,originalY+8);y++) { const p=cell(x,y), d=Math.hypot(p.x-end.x,p.y-end.y); if(canStand(p.x,p.y)&&d<best){best=d;ex=x;ey=y;} }
  }
  const queue = [index(sx,sy)], visited = new Map<number,number>([[queue[0],-1]]); let head=0; const target=index(ex,ey);
  while(head<queue.length) {
    const current=queue[head++]; if(current===target) break;
    const x=current%cols,y=Math.floor(current/cols);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx=x+dx,ny=y+dy,n=index(nx,ny),p=cell(nx,ny); if(nx<1||ny<1||nx>=cols-1||ny>=rows-1||visited.has(n)||!canStand(p.x,p.y))continue; visited.set(n,current);queue.push(n); }
  }
  if(!visited.has(target)) return [];
  const path=[];let current=target;
  while(current!==queue[0]){path.unshift(cell(current%cols,Math.floor(current/cols)));current=visited.get(current)!;}
  return path;
}
