import { canStand, zoneAt } from './map.ts';

/** Keep the follower beside their teammate, on the same side of room boundaries. */
export function followPoint(player: { x: number; y: number }) {
  const zone = zoneAt(player.x, player.y);
  const offsets = [{ x: 0, y: 65 }, { x: -65, y: 0 }, { x: 65, y: 0 }, { x: 0, y: -65 }];
  return offsets.map(offset => ({ x: player.x + offset.x, y: player.y + offset.y })).find(point => canStand(point.x, point.y) && zoneAt(point.x, point.y)?.id === zone?.id) || player;
}
