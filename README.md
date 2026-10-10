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
- Original animated avatars with skin, hair, hairstyle, and outfit choices. Your avatar preferences are saved on this device.
- Six original rooms: Forum, Idea Studio, Quiet Garden, Focus Lab, Welcome Hub, and Commons.
- Continuous WASD/arrow movement, click-to-walk pathfinding, collision with walls and furniture, camera following, zoom, minimap, and room navigation.
- Shared participant presence, room chat and temporary speech bubbles, raised hands, reactions, chair interaction, and a coffee interaction.
- Native WebRTC microphone/camera connections within proximity and the same room. All participants inside the Forum can hear one another. Tracks are removed from distant peer connections. Incoming audio can be muted independently.
- Shared whiteboard with pen colors, thickness, clear confirmation, and PNG export.
- Shared PDF, image, and PPTX presentations with presenter-owned page controls. PPTX previews support text, raster images, and basic solid shapes; themes, masters, charts, transitions, animations, and exact PowerPoint typography are not reproduced. Share the PowerPoint window for exact playback or legacy `.ppt` files.
- Screen sharing to attendees in the Forum; desktop capture has an explicit window/display picker. Browser capture uses the browser’s picker. System audio capture is not enabled.
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

## Architecture

- `apps/desktop/src/world`: map geometry, collision/pathfinding, original drawing, and the animation loop.
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
