# Nova — a shared spatial workplace

An original 2D office in the existing React + TypeScript + Electron project. SkyOffice informed the functionality; its source, maps, sprites, and other artwork are not included. The Nova campus and customizable avatars are drawn from original Canvas 2D code.

## Run locally

Requires Node.js 22.18+ (24 recommended) and pnpm 10.

```sh
pnpm install
pnpm db:migrate
pnpm dev
```

This starts the room server on `localhost:3001`, Vite on `localhost:5173`, and Electron. For a browser-only session:

```sh
pnpm dev:web
```

Open `http://localhost:5173` in two browser windows, enter different names, and join **Nova Campus** to verify shared presence, movement, chat, and collaboration. The browser entry point and the desktop app use the same room server. Close other Vite instances first if port 5173 is occupied.

## Included behavior

- Landing page → avatar builder → public room, room-code join, or room creation. An optional password makes a room private.
- Original articulated avatars with shaded clothing, six hair silhouettes and six outfit styles, front/back/side turning, distance-driven footsteps, breathing, blinking, hair sway, seated poses, hand raising, waving, clapping, and celebration. The builder previews Idle, Walk, Turn, Sit, and Wave. Your skin, hair, hairstyle, and outfit preferences are saved on this device.
- Nine spacious rooms on a 3600 × 2600 campus: Forum, Idea Studio, Quiet Garden, Focus Lab, Welcome Hub, Commons, Orbit Room, Project Lab, and Reading Lounge. Each room has eight usable chairs (72 seats); the existing 12-participant campus limit remains.
- Continuous WASD/arrow movement, click-to-walk pathfinding, collision with walls and furniture, camera following, zoom, minimap, and room navigation.
- Shared participant presence, campus and per-room chat channels, direct messages, contextual replies, recent activity notifications, temporary speech bubbles, raised hands, and reactions. DMs are delivered only to their two participants and excluded from other participants’ join history. Conversation history is limited to the latest 100 messages per campus and identities last for the current connection.
- Availability (available, focus, away), a custom status message, teammate search, walk-to-person and follow controls. Focus/away pauses proximity audio and camera transmission without turning off your local devices. Move manually to stop following.
- A shared campus agenda with named meetings, start times, room selection, 15–120 minute durations, and calendar-file downloads. Shared room notes can be added, removed by their author, and exported as Markdown. These are manually written notes, saved with the workplace.
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

The build includes TypeScript checks. Tests exercise two-client synchronization, room isolation/passwords, uploads and presentation ownership, whiteboard events, disconnects, collision routes between every room, proximity boundaries, direct-message/reply privacy, availability and profile updates, shared agenda/notes ownership, late joins, and bounded notes history.

## Campus components and interactions

Each spatial model lives in `apps/desktop/src/world/components`, with its own drawing and interaction animation code. Shared primitives handle material edges, light, and contact shadows; the scene caches component artwork and sorts furniture and avatars by depth. Interaction effects are relayed to participants in the same campus and expire locally after 2.4 seconds. The canvas loop owns all animation; sprites and observers are released on unmount.

- Click an interactive component to walk to it, then interact automatically. Use E nearby. Manual movement cancels the requested interaction.
- Chair occupancy is shared; moving releases your seat. Every room has eight reachable seats.
- Brew coffee, water plants, toggle lamps, splash the garden fountain, check a live clock, browse shelves, and read team moments. The café arcade opens a playable 20-second tile game.
- Each board keeps a separate drawing; meeting screens present to their own spatial room. Lamp settings and board contents are included for late joiners.
- Sliding door panels retract as people approach. Sparkles, spring motion, screen highlights, and coffee steam provide interaction feedback. Reduced motion suppresses movement effects.

After updating from the original smaller map, restart `pnpm dev` so the server uses the expanded bounds and spawn location.

## Interface and Gather inspiration

The interface uses the campus’s ivory, sage, lavender, clay, and powder blue colors throughout. The welcome page, character builder, illustrated room cards, searchable people panel, conversation bubbles, agenda, dialogs, and meeting controls share rounded materials, subtle shadows, and tactile feedback. Day and dusk themes are saved on this device. Focus view hides the collaboration panel to give the world more room. Animations respect reduced motion. Avatar appearance can be changed while inside the workplace; closing the editor discards its draft.

UI components are separated into `WelcomeScreen`, `AvatarEditor`, `AvatarEditorDialog`, `RoomIllustration`, `WorkspacePanel`, and `CampusAgenda`. Styles are in `apps/desktop/src/ui.css`; spatial objects and animations remain individually implemented in `apps/desktop/src/world/components`.

[Gather’s current feature list](https://www.gather.town/features) informed the collaboration direction. Nova now includes spatial presence, proximity calls, room audio, screen and file presentations, reactions, direct messages, room channels, replies, availability, follow controls, manual shared notes, meeting planning, and theme selection. It does **not** yet have full Gather feature parity. AI transcription/notes, meeting recording, simultaneous screen presenters, custom public/private channels and group messages, a live office editor, desk ownership, desktop Mini Mode, Google Calendar/Spotify/GitHub integrations, production administration still need implementation. Public, room-channel, and direct-message histories are durable. Direct messages are filtered to their two account IDs. The current focus view is an in-app panel toggle, and calendar export creates an `.ics` file; neither is an external integration.

## Architecture

- `apps/desktop/src/world`: campus geometry, cached navigation grid, original drawing, and the animation loop.
- `apps/desktop/src/world/components`: separate furniture, architectural, avatar, HUD, and activity modules, plus the cached scene renderer.
- `apps/desktop/src/hooks/useRoom.ts`: WebSocket state and uploads.
- `apps/desktop/src/hooks/useMedia.ts`: peer signaling, fixed audio/camera/screen tracks, and proximity rules.
- `apps/desktop/src/components`: avatar preview, whiteboard, presentations, media, and dialogs.
- `services/realtime/server.mjs`: room membership, passwords, messages, whiteboard, signaling relay, and temporary presentation uploads.
- `services/api`: the existing FastAPI health endpoint remains available for future persistent APIs; the current realtime service does not require Python.

## Hosting and current limits

This is a working local development application, not a deployed service. Workplace metadata, nine spatial-room records per workplace, public chat, agendas, notes, boards, lamp settings, and uploaded files are stored in PostgreSQL through Prisma. Empty workplaces are evicted from the live cache and restored from PostgreSQL on the next join. Positions, live media, and active presentations are session-only. User identities, profile details, avatar choices, photos, and direct messages persist. Rooms are capped at 12 participants and uploads at 20 MB each / 8 files per room. Agendas hold up to 80 meetings (past entries are pruned when a meeting is added); note history holds the latest 100 notes. Author permissions use permanent account IDs.

For a shared network deployment, set `HOST=0.0.0.0` on the room server, expose it behind HTTPS/WSS, and set `VITE_ROOM_SERVER` in `apps/desktop/.env.local` before building. Use a reachable HTTPS frontend URL for invitations; localhost invites only work on the same computer. Browser mic/camera require a secure context (HTTPS or localhost).

Configure `VITE_ICE_SERVERS` with a TURN service for reliable calls across NATs and restrictive networks. The default public STUN server alone cannot cover every network. The current small-room peer mesh should be replaced with an SFU for larger groups. Room moderation, account email verification/recovery, and a deployed TURN service remain follow-on production work.

Reference: [SkyOffice](https://github.com/kevinshen56714/SkyOffice) feature set. No reference repository code or design assets were copied.


## PostgreSQL and Prisma

The realtime service reads `DATABASE_URL` from the ignored root `.env` file. Keep real credentials only there; never use `VITE_DATABASE_URL`. The desktop renderer receives no database credentials. `.env.example` has an empty placeholder. Project rules in `AGENTS.md` and `.cursor/rules/secrets.mdc` preserve this requirement.

On a fresh checkout, create `.env` with your PostgreSQL URL, then run:

```sh
pnpm install
pnpm db:validate
pnpm db:migrate
pnpm db:check
pnpm dev
```

`pnpm db:generate` regenerates the client (also runs after install). `pnpm db:status` checks migrations. Migration deployment does not reset the database. CLI output and startup errors redact connection credentials. Production startup fails if PostgreSQL is unavailable; it does not silently use temporary storage.

The Prisma schema contains `User`, `AuthSession`, `WorkspaceMember`, `Workspace`, `Space`, `WorkspaceState`, and `Asset`. Each workplace has an immutable random join code and unique world seed; both resolve to the same persisted workplace. Each has nine separate room records. Create a workplace in the join dialog, then share its invitation or copy its world seed from Settings. Private workplaces still require the password. Up to 12 participants can join a workplace simultaneously; each spatial room contains eight usable seats. Code/seed matching is case insensitive. A seed identifies a workplace; it does not change the campus geometry.

Durable changes are saved before success is broadcast. Failed saves roll back the changed durable fields. WebSocket traffic, signaling, histories, boards, notes, and authenticated asset downloads are scoped to the joined workplace. The current server coordinates live presence in one Node process. Multiple server replicas need a shared pub/sub layer and presence coordination; PostgreSQL persistence alone does not synchronize live sockets between processes.

Run `pnpm test` for local regression tests, and `pnpm test:database` for the opt-in real PostgreSQL restart/isolation test. The latter also tests registration, private profiles, profile photo normalization, authenticated multiplayer, session revocation, and restart persistence. It creates synthetic accounts and workplaces and removes only those exact test records afterward. The normal tests inject memory-only stores and never reset the configured database.


## Expressive characters and useful room objects

- Open **Edit your avatar** to choose one of six character presets, or customize six hairstyles, six clothing styles (crew shirt, hoodie, blazer, overalls, dress, jacket), accessories (glasses, round glasses, headphones, cap, beanie), fabric, skin, hair, bottoms, and footwear colors. Appearance is saved to your account and shared live with teammates when saved.
- The character builder previews every gesture. The **React** palette now has 16 named reactions. Body poses include waving, clapping, celebration, dancing, laughing, thinking, drinking coffee, appreciation, surprise, and resting. Contact shadows, connected arm joints, facial expressions, floating hearts, steam, and confetti keep the animation cohesive. Reduced motion keeps poses readable while suppressing oscillation and particles.
- Every interactive fixture has shared visual feedback in addition to its existing component-specific animation. Bookshelves lift a folder; brewing coffee triggers the character's coffee gesture. Plants, lamps, doors, boards, screens, seats, tables, the fountain and arcade retain their individual actions and effects.
- Interact with a **desk** to set a 15-, 25-, or 50-minute focus intention. The timer stays visible after closing the dialog and pauses proximity conversations through focus availability. End the session to reconnect, or let the timer restore the previous availability. Timers last for the current workplace session.

### Shared bookshelf library

Walk to a bookshelf and press **E**, or choose its resource-library action in the room toolbar. Each shelf organizes its own files and folders; **All campus shelves** and search help find resources across the same workplace.

- Create nested folders, upload individual files or a whole directory (when supported by the browser's folder picker), add HTTP/HTTPS resource links, move existing resources between folders, and download shared files.
- All members of the joined workplace can add, download, move, and remove resources. Removal requires confirmation in the UI; folders must be empty before removal.
- Limits: 20 MB per file, 100 total resources, 40 folders, and eight folder levels per workplace. Library resources have a separate quota from the eight presentation uploads. Empty files are rejected. A folder upload saves files sequentially, so completed files remain saved if a later file fails.
- PostgreSQL saves file bytes and library metadata in one transaction. Library updates broadcast only to participants in that workplace. Downloads require a current workplace session and library files use attachment headers. Files and folders survive server restarts.
- Apply migration `20261102010000_resource_library` with `pnpm db:migrate` and regenerate the client with `pnpm db:generate` when updating an existing checkout. Keep the database URL only in the ignored root `.env`.

New spatial modules live separately in `apps/desktop/src/world/components`: `AvatarOutfit`, `AvatarAccessories`, `AvatarReactionEffects`, `ReactionPicker`, `ComponentFeedback`, `ResourceLibrary`, and `FocusSession`. Shared avatar choices and reaction definitions live in `src/world/avatarOptions.ts` and `src/world/reactions.ts` and are validated by the server.


## Accounts and profiles

Registration and sign-in are required before browsing or joining workplaces. The two-step registration flow creates a permanent UUID profile ID and unique handle. Profiles include a display name, email, optional private date of birth, photo, role, company, bio, and persistent avatar. Open your account chip from the home page or workplace header to edit your profile, copy your ID, sign out, or change your password. The registered email is currently read-only. Birth dates and email addresses are never included in player broadcasts.

Passwords must be 15–128 characters and are stored as independently salted scrypt hashes (N=131072, r=8, p=1). Random session tokens live in HttpOnly, SameSite=Lax cookies; only SHA-256 token hashes are saved in PostgreSQL. Remembered sessions last 30 days; other sessions expire after eight hours. Sign-out revokes the current session and closes its sockets. Password changes require the current password and revoke all account sessions. Login attempts are rate limited. Mutation requests use a custom header and a strict origin allowlist; WebSocket connections require both an allowed origin and a valid session. An account can join a given workplace in one tab at a time.

Profile photos accept PNG, JPEG, or WebP up to 2 MB. The server validates and decodes images, strips metadata, and stores a normalized 256px WebP. Photo URLs require an authenticated session. No database credentials or session tokens are stored in browser storage.

Apply `20261102020000_user_auth` using `pnpm db:migrate`, then `pnpm db:generate`. Existing workplace data remains intact. Existing guest messages retain their historical guest IDs; new messages and ownership use account IDs. Users sign up for their own accounts; the application does not ship default credentials. Email verification, forgotten-password delivery, OAuth, and account deletion are not implemented. Sign-in and password changes work without an email provider.

### Cookie-compatible desktop and hosting

The production build is served by the Node server at `http://localhost:3001`; generated browser assets use `/ui-assets/`, separate from protected workplace uploads. Run `pnpm build`, `pnpm server`, then the desktop production command. Electron loads this HTTP origin so accounts use the same cookie flow as the browser. `NOVA_APP_URL` can point Electron to your deployed HTTPS app. The renderer retains sandboxing and context isolation.

Keep `DATABASE_URL` and all real secrets only in the ignored root `.env`. Add `CLIENT_ORIGIN` there as a comma-separated list of the exact frontend origins you use (for example, the development frontend and the production app origin). The default allowlist covers localhost development. For local HTTP, leave `AUTH_COOKIE_SECURE` unset. With `NODE_ENV=production`, cookies always use Secure and the app must be hosted behind HTTPS. Set `AUTH_COOKIE_SECURE=true` when enabling HTTPS outside production. Prefer serving frontend, API, and WebSocket on the same origin; unrelated cross-site frontend/API deployments are not supported by SameSite=Lax cookies. Reverse proxies must preserve Origin and WebSocket upgrade headers. The built Electron app must be launched with the intended public `NOVA_APP_URL`; secrets remain exclusively on the server.
