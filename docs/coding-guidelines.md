# Nova Coding Guidelines & Architectural Patterns

This guide outlines engineering standards, architectural patterns, and quality requirements for contributors to the Nova codebase.

---

## 1. General Principles

1. **Zero Unnecessary Dependencies**: Avoid adding bulky third-party libraries when clean, modern standard web APIs exist (e.g., native Canvas 2D over Pixi/Phaser, native WebRTC over heavy wrappers).
2. **Explicit Type Safety**: Strict TypeScript configurations (`strict: true`, `noImplicitAny: true`). Avoid using `any`; define explicit discriminated unions for all message types and entity models.
3. **Decoupled Engine & UI**: The Canvas world simulation (`world/`) operates independently from React's DOM rendering cycle. Communication happens through callbacks and refs.
4. **Security by Default**: All inputs from network websockets, file uploads, and Electron IPC are validated and sanitized before consumption.

---

## 2. Realtime WebSocket Patterns

### 2.1 Event Discrimination
All WebSocket events must implement a `{ type: string, ... }` discriminated union:

```typescript
// types.ts
export type ClientMessage =
  | { type: 'join'; roomId: string; profile: Avatar; ... }
  | { type: 'move'; x: number; y: number; direction: string; moving: boolean; seated: boolean }
  | { type: 'chat'; text: string; kind: 'message' | 'question' }
  | { type: 'stroke'; stroke: Stroke }
  | { type: 'signal'; target: string; data: unknown };
```

### 2.2 Server-Side Sanitization
Never trust client coordinates or text input. In `server.mjs`:
- Sanitize strings using `clean(value, maxLength)`.
- Clamp numerical coordinates to valid world extents:
  ```javascript
  p.x = Math.max(40, Math.min(1960, message.x));
  p.y = Math.max(40, Math.min(1240, message.y));
  ```
- Reject malformed vector points or out-of-range stroke widths.

---

## 3. WebRTC & Media Patterns

1. **Perfect Negotiation Compliance**: Always determine the polite/impolite role via ID comparison:
   ```typescript
   polite: current.current.id.localeCompare(id) > 0
   ```
2. **Transceiver Pre-Allocation**: Do not call `addTrack()` or `removeTrack()` arbitrarily; pre-allocate 3 transceivers and use `replaceTrack()` to avoid renegotiation glare.
3. **Hardware State Synchronization**: When toggling microphone, camera, or screen sharing, always notify the room server with `{ type: 'status', ... }` so nametag icons update for all participants.

---

## 4. Electron Security Standards

The desktop shell (`apps/desktop/electron/`) must strictly observe the principle of least privilege:

```javascript
// main.cjs
webPreferences: {
  preload: path.join(__dirname, "preload.cjs"),
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true
}
```

- **Trusted Frame Validation**: Every IPC handler must verify `trustedFrame(event.senderFrame)` to ensure requests originate exclusively from the legitimate application window and not an injected frame or external URL.
- **Context Bridge Exposure**: Only expose the minimal required API surface in `preload.cjs`. Never expose `ipcRenderer.send` or `ipcRenderer.on` directly.

---

## 5. Testing & Verification

1. **Fast Headless Tests**: Unit and integration tests must run in headless Node.js without requiring a browser window or display server.
2. **Pathfinding Invariants**: In `map.test.mjs`, ensure every zone entrance and interactive fixture has a verified obstacle-free path:
   ```typescript
   test('all six room entrances are reachable through furniture and walls', () => {
     for (const start of zones) {
       for (const end of zones) {
         if (start.id === end.id) continue;
         const path = findPath(start.entry, end.entry);
         assert.ok(path.length);
       }
     }
   });
   ```
3. **Multi-Client Concurrency Tests**: In `server.test.mjs`, use mock WebSocket clients to verify concurrent state updates, late joins, and disconnection cleanups.

---

## 6. Commit & Contribution Workflow

Before submitting a pull request or merging code changes:
1. `pnpm test` - Ensure all 7+ integration tests pass.
2. `pnpm lint` - Verify no ESLint or Node syntax errors exist.
3. `pnpm build` - Confirm TypeScript compilation succeeds with zero errors.
