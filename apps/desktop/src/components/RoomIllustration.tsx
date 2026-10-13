import { zones } from '../world/map';

/** Original little room portraits, using the campus material palette. */
export function RoomIllustration({ zoneId }: { zoneId: string }) {
  const z = zones.find(zone => zone.id === zoneId)!;
  const plant = (x: number, y: number) => <g transform={`translate(${x} ${y})`}><ellipse cy="21" rx="15" ry="5" fill="#514837" opacity=".12" /><path d="M-10 7H10L7 22H-7Z" fill="#b4845d" /><path d="M0 10V-12" stroke="#4f7a60" strokeWidth="3" /><ellipse cx="-6" cy="-7" rx="6" ry="13" fill="#729f7b" transform="rotate(-30 -6 -7)" /><ellipse cx="7" cy="-11" rx="7" ry="14" fill="#8ab28d" transform="rotate(32 7 -11)" /></g>;
  return <svg className="room-portrait" viewBox="0 0 300 128" aria-hidden="true">
    <rect width="300" height="128" fill={z.color} /><path d="M0 88H300M55 0V128M125 0V128M195 0V128M265 0V128" stroke={z.accent} opacity=".1" />
    <path d="M35 99V24Q35 15 44 15H256Q265 15 265 24V99" fill="#fff9ed" opacity=".45" />
    <rect x="35" y="89" width="230" height="12" rx="5" fill={z.accent} opacity=".15" />
    {['stage', 'meeting', 'sprint', 'studio'].includes(zoneId) ? <>
      <rect x="103" y="20" width="94" height="49" rx="5" fill={z.accent} /><rect x="109" y="25" width="82" height="37" rx="2" fill="#fff9ed" /><path d="M120 47L140 39L156 49L177 33" stroke={z.accent} strokeWidth="3" fill="none" /><circle cx="177" cy="33" r="4" fill="#d0a65e" />
      {[81, 140, 199].map(x => <g key={x}><ellipse cx={x + 10} cy="103" rx="18" ry="4" fill="#514837" opacity=".12" /><rect x={x} y="84" width="23" height="14" rx="4" fill={z.accent} /><rect x={x + 2} y="74" width="19" height="15" rx="5" fill={z.accent} /><path d={`M${x + 4} 97V105M${x + 19} 97V105`} stroke="#776654" strokeWidth="3" /></g>)}
    </> : zoneId === 'garden' ? <><ellipse cx="145" cy="83" rx="56" ry="18" fill="#7aab95" /><ellipse cx="145" cy="79" rx="46" ry="14" fill="#b8dace" /><ellipse cx="145" cy="79" rx="23" ry="7" fill="none" stroke="#eef3d9" strokeWidth="2" /><path d="M142 77Q145 52 148 77" fill="#e1ede1" />{plant(93, 51)}{plant(216, 55)}</> : zoneId === 'work' ? <>
      {[72, 183].map(x => <g key={x}><rect x={x} y="72" width="61" height="9" rx="4" fill="#b4845d" /><path d={`M${x + 5} 81V104M${x + 56} 81V104`} stroke="#9b7354" strokeWidth="4" /><rect x={x + 14} y="42" width="33" height="24" rx="3" fill="#536779" /><rect x={x + 18} y="46" width="25" height="16" fill="#b5cdd6" /><path d={`M${x + 30} 66V73`} stroke="#536779" strokeWidth="3" /></g>)}
    </> : zoneId === 'library' ? <><rect x="96" y="26" width="109" height="67" rx="5" fill="#b4845d" />{[36, 63].map(y => <g key={y}>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={105 + i * 10} y={y} width="7" height="23" rx="1" fill={['#d5ccef', '#a9cbb7', '#b5cdd6', '#e5c9ad'][i % 4]} />)}<path d={`M100 ${y + 24}H201`} stroke="#856046" strokeWidth="3" /></g>)}</> : <>
      <ellipse cx="150" cy="99" rx="82" ry="8" fill="#514837" opacity=".1" /><rect x="79" y="66" width="144" height="31" rx="12" fill={z.accent} /><rect x="87" y="51" width="129" height="28" rx="11" fill={z.color} stroke={z.accent} strokeWidth="4" /><path d="M131 54V76M173 54V76" stroke={z.accent} opacity=".5" strokeWidth="2" /><rect x="113" y="87" width="77" height="14" rx="7" fill="#e9d5b7" /><ellipse cx="153" cy="85" rx="8" ry="4" fill="#faf3e2" /><path d="M150 85V77" stroke="#faf3e2" strokeWidth="8" />
    </>}
    {plant(52, 74)}{plant(247, 74)}
  </svg>;
}
