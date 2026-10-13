# Nova — a shared spatial workplace

An original 2D office in the existing React + TypeScript + Electron project. SkyOffice informed the functionality; its source, maps, sprites, and other artwork are not included. The Nova campus and customizable avatars are drawn from original Canvas 2D code.

## Run locally

Requires Node.js 22.18+ (24 recommended) and pnpm 10.

```sh
pnpm install
pnpm dev
```

This starts the room server on `localhost:3001`, Vite on `localhost:5173`, and Electron. For a browser-only session:

```sh
pnpm dev:web
```

Open `http://localhost:5173` in two browser windows, enter different names, and join **Nova Campus** to verify shared presence, movement, chat, and collaboration. The browser entry point and the desktop app use the same room server. Close other Vite instances first if port 5173 is occupied.

## Included behavior

- Landing page → avatar builder → public room, room-code join, or room creation. An optional password makes a room private.
- Original articulated avatars with shaded clothing, three hair silhouettes, front/back/side turning, distance-driven footsteps, breathing, blinking, hair sway, seated poses, hand raising, waving, clapping, and celebration. The builder previews Idle, Walk, Turn, Sit, and Wave. Your skin, hair, hairstyle, and outfit preferences are saved on this device.
- Nine spacious rooms on a 3600 × 2600 campus: Forum, Idea Studio, Quiet Garden, Focus Lab, Welcome Hub, Commons, Orbit Room, Project Lab, and Reading Lounge. Each room has eight usable chairs (72 seats); the existing 12-participant campus limit remains.
- Continuous WASD/arrow movement, click-to-walk pathfinding, collision with walls and furniture, camera following, zoom, minimap, and room navigation.
- Shared participant presence, room chat and temporary speech bubbles, raised hands, reactions, chair interaction, and a coffee interaction.
- Native WebRTC microphone/camera connections within proximity and the same room. Participants in the Forum, Idea Studio, Orbit Room, and Project Lab have room-wide audio. Tracks are removed from distant peer connections. Incoming audio can be muted independently.
- Shared whiteboard with pen colors, thickness, clear confirmation, and PNG export.
- Shared PDF, image, and PPTX presentations with presenter-owned page controls. PPTX previews support text, raster images, and basic solid shapes; themes, masters, charts, transitions, animations, and exact PowerPoint typography are not reproduced. Share the PowerPoint window for exact playback or legacy `.ppt` files.
- Screen sharing to attendees in the selected spatial room; desktop capture has an explicit window/display picker. Browser capture uses the browser’s picker. System audio capture is not enabled.
- Presentation questions in chat, hand raising, and navigation into/out of the presentation area.
- Leave/rejoin flow, device error messages, keyboard-accessible controls, and native dialogs with focus trapping.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Move |
| Click floor / minimap / space | Find a route and walk |
| E | Interact with the nearest screen, whiteboard, chair, desk, or coffee counter |
| Enter | Focus room chat |
| Escape | Leave the chat input or close a dialog |

Microphone and camera start off. Turning them on requires normal device permission. Headphones help avoid feedback when testing multiple clients nearby.

## Checks and production build

```sh
pnpm test
pnpm lint
pnpm build
pnpm server
pnpm --filter @spatialmeet/desktop start
```

The build includes TypeScript checks. Tests exercise two-client synchronization, room isolation/passwords, uploads and presentation ownership, whiteboard events, disconnects, collision routes between every room, and proximity boundaries.

## Campus components and interactions

Each spatial model lives in `apps/desktop/src/world/components`, with its own drawing and interaction animation code. Shared primitives handle material edges, light, and contact shadows; the scene caches component artwork and sorts furniture and avatars by depth. Interaction effects are relayed to participants in the same campus and expire locally after 2.4 seconds. The canvas loop owns all animation; sprites and observers are released on unmount.

- Click an interactive component to walk to it, then interact automatically. Use E nearby. Manual movement cancels the requested interaction.
- Chair occupancy is shared; moving releases your seat. Every room has eight reachable seats.
- Brew coffee, water plants, toggle lamps, splash the garden fountain, check a live clock, browse shelves, and read team moments. The café arcade opens a playable 20-second tile game.
- Each board keeps a separate drawing; meeting screens present to their own spatial room. Lamp settings and board contents are included for late joiners.
- Sliding door panels retract as people approach. Sparkles, spring motion, screen highlights, and coffee steam provide interaction feedback. Reduced motion suppresses movement effects.

After updating from the original smaller map, restart `pnpm dev` so the server uses the expanded bounds and spawn location.

## Architecture

- `apps/desktop/src/world`: campus geometry, cached navigation grid, original drawing, and the animation loop.
- `apps/desktop/src/world/components`: separate furniture, architectural, avatar, HUD, and activity modules, plus the cached scene renderer.
- `apps/desktop/src/hooks/useRoom.ts`: WebSocket state and uploads.
- `apps/desktop/src/hooks/useMedia.ts`: peer signaling, fixed audio/camera/screen tracks, and proximity rules.
- `apps/desktop/src/components`: avatar preview, whiteboard, presentations, media, and dialogs.
- `services/realtime/server.mjs`: room membership, passwords, messages, whiteboard, signaling relay, and temporary presentation uploads.
- `services/api`: the existing FastAPI health endpoint remains available for future persistent APIs; the current realtime service does not require Python.

## Hosting and current limits

This is a working local development application, not a deployed service. Rooms, chat, boards, and uploaded files live in server memory. Restarting the server clears them; custom rooms expire after the last participant leaves. Rooms are capped at 12 participants and uploads at 20 MB each / 8 files per room.

For a shared network deployment, set `HOST=0.0.0.0` on the room server, expose it behind HTTPS/WSS, and set `VITE_ROOM_SERVER` in `apps/desktop/.env.local` before building. Use a reachable HTTPS frontend URL for invitations; localhost invites only work on the same computer. Browser mic/camera require a secure context (HTTPS or localhost).

Configure `VITE_ICE_SERVERS` with a TURN service for reliable calls across NATs and restrictive networks. The default public STUN server alone cannot cover every network. The current small-room peer mesh should be replaced with an SFU for larger groups. Persistent storage, account authentication, room moderation, and a deployed TURN service are follow-on production work.

Reference: [SkyOffice](https://github.com/kevinshen56714/SkyOffice) feature set. No reference repository code or design assets were copied.
