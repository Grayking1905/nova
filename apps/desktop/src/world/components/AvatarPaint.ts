export type AvatarContext=CanvasRenderingContext2D;
export function capsule(c:AvatarContext,x:number,y:number,w:number,h:number,r:number,fill:string|CanvasGradient,stroke?:string) {
  c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}
}
export function oval(c:AvatarContext,x:number,y:number,rx:number,ry:number,fill:string|CanvasGradient) {
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();
}
export function stroke(c:AvatarContext,points:[number,number][],color:string,width=1) {
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();
}
export function material(c:AvatarContext,x:number,y:number,w:number,h:number,r:number,color:string,shade=.12) {
  capsule(c,x,y,w,h,r,color);
  const light=c.createLinearGradient(x,y,x+w,y+h);
  light.addColorStop(0,'#ffffff28');light.addColorStop(.45,'#ffffff05');light.addColorStop(1,`rgba(25,25,45,${shade})`);
  capsule(c,x,y,w,h,r,light);
}
