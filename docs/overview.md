# Nova Platform Overview

Nova is an original 2D virtual office and collaborative workspace engineered with React 19, TypeScript, Electron, and pure Canvas 2D graphics. It provides remote and distributed teams with the casual presence, spontaneous interactions, and spatial intuition of working in a shared physical studio.

---

## 1. Vision & Core Philosophy

Distributed work often suffers from schedule fragmentation and isolating video calls. Nova bridges this gap through **spatial presence**:
- **Ambient Awareness**: See who is focused in the Focus Lab, brainstorming in the Idea Studio, or hanging out in The Commons.
- **Natural Proximity**: Audio and video activate automatically as colleagues walk up to one another, eliminating awkward invite links.
- **Room-Based Contexts**: Different areas of the campus naturally afford different modes of collaboration—from silent coworking to broadcast auditorium presentations.
- **Lightweight & Fast**: Pure Canvas 2D procedural rendering without heavy 3D engines, large sprite sheets, or WebGL overhead.

---

## 2. Key Architecture Pillars

```
+-----------------------------------------------------------------+
|                       Nova Workspace Platform                   |
+--------------------------------+--------------------------------+
| Client Experience              | Backend Services               |
| - React 19 UI & Modals         | - Node.js Realtime Relay       |
| - Procedural Canvas 2D Engine  | - In-Memory Ephemeral State    |
| - WebRTC P2P Spatial Audio     | - Fast WebRTC Signaling Relay  |
| - Interactive Whiteboard       | - Temporary Presentation Store |
| - Native Electron Desktop Shell| - FastAPI Foundation           |
+--------------------------------+--------------------------------+
```

1. **Zero External Asset Dependencies**: All avatars, furniture, fixtures, campus maps, rugs, and decorative details are drawn programmatically using Canvas 2D vector primitives.
2. **Decentralized Media Transmission**: Media streams flow directly peer-to-peer over DTLS/SRTP WebRTC connections without intermediate media server transcoding.
3. **Low Latency Synchronization**: Position and presence are synchronized over a minimal WebSocket protocol with client-side interpolation (LERP) and rate limiting.
4. **Desktop & Web Parity**: Runs smoothly in standard web browsers and as a native desktop application with enhanced window and screen capture.

---

## 3. Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8+, Vite 6 |
| **Styling & Design** | Modern Vanilla CSS, CSS Variables, Glassmorphism, Google Fonts (`Inter`, `Segoe UI`) |
| **Icons & Visuals** | Lucide React |
| **2D Graphics & Animation** | HTML5 Canvas 2D Context, double-buffered offscreen rendering, `requestAnimationFrame` |
| **Realtime Networking** | WebSocket (`ws`), Node.js `http`, custom JSON event bus |
| **Voice & Video** | WebRTC (W3C Perfect Negotiation, multi-transceiver `replaceTrack`) |
| **Document Collaboration** | `pdfjs-dist` (PDF rendering via Web Worker), `fflate` (PPTX zip decompression + OpenXML parser) |
| **Desktop Shell** | Electron 35 (Context Isolation, Sandbox, `desktopCapturer` IPC) |
| **Future REST API** | FastAPI (Python 3.12+), Pydantic |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert/strict`) |
| **Package Manager** | `pnpm` 10 with pnpm workspaces |

---

## 4. Repository Structure

```text
nova/
├── apps/
│   └── desktop/               # Main client application (React + Vite + Electron)
│       ├── electron/          # Electron main and preload scripts
│       ├── src/
│       │   ├── components/    # Whiteboard, Presentation, Media, Dialogs
│       │   ├── hooks/         # useRoom, useMedia state hooks
│       │   ├── presentation/  # PPTX and document parsers
│       │   ├── world/         # Map geometry, pathfinding, canvas draw routines
│       │   ├── App.tsx        # Main application layout and routing
│       │   └── index.css      # Design tokens and styles
│       └── vite.config.ts     # Vite build and dev configuration
├── services/
│   ├── realtime/              # In-memory WebSocket room server and asset relay
│   │   ├── server.mjs         # Room lifecycle, signaling, asset upload
│   │   └── server.test.mjs    # Multi-client synchronization test suite
│   └── api/                   # Python FastAPI service foundation
│       └── app/main.py        # Health and future persistent APIs
├── infrastructure/            # System architecture, protocol & engine specs
├── docs/                      # Developer and user documentation
├── agents/                    # Workspace agent skills & patterns
├── scripts/                   # Development launchers and smoke fixtures
├── package.json               # Root workspace scripts
└── pnpm-workspace.yaml        # Workspace configuration
```

---

## 5. Next Steps

- Consult [Getting Started](./getting-started.md) to set up the project locally.
- Read [Features](./features.md) for detailed descriptions of built-in capabilities.
- Check [Architecture Specification](../infrastructure/architecture.md) for deep technical implementation details.
