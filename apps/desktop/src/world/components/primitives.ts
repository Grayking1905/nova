export type Context = CanvasRenderingContext2D;

export function rect(c: Context, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); }
}

export function oval(c: Context, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, rotation = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}

export function line(c: Context, x: number, y: number, x2: number, y2: number, color: string, width = 1) {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2);
  c.strokeStyle = color; c.lineWidth = width; c.stroke();
}

export function text(c: Context, value: string, x: number, y: number, size: number, color: string, weight = 600, align: CanvasTextAlign = 'center') {
  c.font = `${weight} ${size}px "Segoe UI", sans-serif`;
  c.textAlign = align; c.fillStyle = color; c.fillText(value, x, y);
}

export function surface(c: Context, x: number, y: number, w: number, h: number, r: number, top: string, edge: string) {
  // A consistent raised edge makes objects read as furniture at every zoom level.
  c.save();
  c.shadowColor = '#293b4330'; c.shadowBlur = 15; c.shadowOffsetY = 9;
  rect(c, x, y + 5, w, h, r, edge);
  c.restore();
  rect(c, x, y + 5, w, h, r, edge);
  rect(c, x, y, w, h, r, top, '#ffffff75');
}
