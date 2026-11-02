import type { Fixture } from '../map';
import type { ComponentFrame } from './animation';

const symbols:Record<string,string>={desk:'💻',plant:'🌱',sofa:'✨',table:'💡',screen:'📺',board:'✏️',chair:'✦',coffee:'☕',shelf:'📁',podium:'🎙',lamp:'💡',fountain:'💧',arcade:'🎮',noticeboard:'📌',clock:'🕒',door:'✦'};
export function drawComponentFeedback(c:CanvasRenderingContext2D,f:Fixture,frame:ComponentFrame){
  if(!frame.active)return;const p=frame.progress,x=f.x+f.w/2,y=f.y;
  c.save();c.globalAlpha=Math.sin(Math.PI*p)*.8;
  if(!frame.reducedMotion){c.beginPath();c.ellipse(x,f.y+f.h+4,20+p*26,6+p*7,0,0,Math.PI*2);c.strokeStyle='#e7d4ac';c.lineWidth=2;c.stroke();}
  c.font='19px "Segoe UI Emoji",sans-serif';c.textAlign='center';c.fillStyle='#d8b9ee';c.fillText(symbols[f.type]||'✦',x,y-14-(frame.reducedMotion?0:p*29));
  if(!frame.reducedMotion){c.fillStyle='#fff6ce';for(let i=0;i<3;i++){const a=frame.tick/450+i*2.1;c.beginPath();c.arc(x+Math.cos(a)*(19+p*8),y-22-p*17+Math.sin(a)*8,1.5,0,Math.PI*2);c.fill();}}
  c.restore();
}
