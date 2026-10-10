# Getting Started with Nova

This guide walks you through setting up, running, configuring, and testing Nova in your local development environment.

---

## 1. Prerequisites

Before running the project, verify that your machine has the required runtimes installed:
- **Node.js**: Version `22.18+` (`24+` recommended)
- **pnpm**: Version `10.0+`
- **Python** *(Optional)*: `3.12+` (only required if developing the FastAPI service in `services/api`)

Verify versions:
```sh
node --version
pnpm --version
```

---

## 2. Installation

Clone the repository and install workspace dependencies:
```sh
git clone https://github.com/Grayking1905/nova.git
cd nova
pnpm install
```

---

## 3. Running Locally

Nova provides two execution modes:

### 3.1 Full Desktop + Web + Realtime Mode
Starts the Node.js realtime server, Vite development server, and Electron desktop application simultaneously:
```sh
pnpm dev
```
- **Realtime Server**: `http://localhost:3001` (WebSocket at `ws://localhost:3001`)
- **Vite Web Client**: `http://localhost:5173`
- **Electron Window**: Launches automatically once the Vite server is ready.

### 3.2 Web-Only Development Mode
If you prefer developing in standard browser tabs without opening Electron:
```sh
pnpm dev:web
```
Open `http://localhost:5173` in two different browser windows or incognito sessions, choose distinct avatar names, and join **Nova Campus** to test shared movement, chat, whiteboard, and WebRTC audio/video.

---

## 4. Configuration & Environment Variables

Nova works out of the box with default localhost settings. For custom deployments or NAT traversal, configure the following environment variables:

### 4.1 Client (`apps/desktop/.env.local`)
Create `apps/desktop/.env.local` to override frontend configuration:

```env
# URL of the realtime WebSocket/HTTP server
VITE_ROOM_SERVER=http://localhost:3001

# STUN / TURN server array for WebRTC NAT traversal (JSON string)
VITE_ICE_SERVERS=[{"urls":"stun:stun.l.google.com:19302"}]
```

### 4.2 Realtime Server Environment Variables
The realtime server (`services/realtime/server.mjs`) reads the following environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Port for HTTP and WebSocket server. |
| `HOST` | `127.0.0.1` | Network interface to bind to (`0.0.0.0` for LAN/WAN). |
| `CLIENT_ORIGIN` | `*` | Allowed CORS origin header for upload and health checks. |

---

## 5. Running Verification Checks & Tests

Execute the automated test suite and linters before committing code:

### 5.1 Unit & Integration Tests
```sh
pnpm test
```
Runs:
- `services/realtime/server.test.mjs`: Tests WebSocket join, synchronization, private room passwords, uploads, presentations, whiteboard, and error handling.
- `apps/desktop/src/world/map.test.mjs`: Tests room entrance reachability, screen/whiteboard reachability, collision detection, and proximity boundaries.

### 5.2 Linting
```sh
pnpm lint
```
Runs ESLint across `apps/desktop` and syntax checks on `services/realtime`.

### 5.3 Production Build
```sh
pnpm build
```
Executes TypeScript typechecking and bundles the client with Vite.

---

## 6. Controls & Shortcuts

| Input | Action |
| :--- | :--- |
| **W, A, S, D** / **Arrow Keys** | Move your avatar |
| **Click on Floor or Minimap** | Compute pathfinding route and walk automatically |
| **E** | Interact with nearest screen, whiteboard, chair, desk, or coffee machine |
| **Enter** | Focus room chat input |
| **Escape** | Unfocus chat or dismiss active modal dialog |
| **Space** | Alternate movement / interaction trigger |
