import { useEffect, useRef } from 'react';
import { Compass } from 'lucide-react';
import type { Player } from '../../types';
import { WORLD, zones, zoneAt } from '../map';
import { drawMap } from '../interiors';

export function CampusMiniMap({ players, id, onNavigate }: {
  players: Player[];
  id: string;
  onNavigate: (x: number, y: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const me = players.find(player => player.id === id);
  const currentZone = me && zoneAt(me.x, me.y);

  useEffect(() => {
    const context = canvas.current!.getContext('2d')!;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, 400, 289);
    context.scale(400/WORLD.width,289/WORLD.height);
    drawMap(context);
  }, []);

  return <div className="campus-map" aria-label="Campus overview">
    <div className="campus-map-heading"><Compass size={11}/><span>CAMPUS</span><span>01</span></div>
    <div className="campus-map-surface">
      <canvas ref={canvas} width={400} height={289} aria-hidden="true"/>
      {zones.map(zone => <button
        key={zone.id}
        className={currentZone?.id === zone.id ? 'current' : ''}
        title={`Walk to ${zone.name}`}
        aria-label={`Walk to ${zone.name}`}
        aria-current={currentZone?.id === zone.id ? 'location' : undefined}
        style={{left:`${zone.x/WORLD.width*100}%`,top:`${zone.y/WORLD.height*100}%`,width:`${zone.w/WORLD.width*100}%`,height:`${zone.h/WORLD.height*100}%`}}
        onClick={() => onNavigate(zone.entry.x, zone.entry.y)}
      />)}
      {players.map(player => <i key={player.id} className={player.id === id ? 'me' : ''} style={{left:`${player.x/WORLD.width*100}%`,top:`${player.y/WORLD.height*100}%`}}/>)}
    </div>
  </div>;
}
