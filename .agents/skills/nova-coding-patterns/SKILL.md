---
name: nova-coding-patterns
description: >-
  Core software engineering guidelines, architecture patterns, and testing procedures for Nova.
  Use this skill when implementing WebSocket events, WebRTC Perfect Negotiation, BFS pathfinding,
  Electron IPC security boundaries, or adding tests.
---

# Nova Coding Patterns & Architecture Standards

This skill details core engineering procedures and implementation patterns for developing features, services, and tests in Nova.

---

## 1. Quick Reference: Engineering Patterns

| Pattern | Where Used | Purpose |
| :--- | :--- | :--- |
| **Discriminated Union Messages** | WebSocket & UI State | Guarantees strict type safety across network boundaries. |
| **Perfect Negotiation (W3C)** | `useMedia.ts` | Eliminates SDP offer/answer glare in WebRTC peer mesh. |
| **Fixed 3-Slot Transceivers** | `useMedia.ts` | Uses `replaceTrack()` without triggering SDP renegotiation storms. |
| **Breadcrumb BFS Pathfinding** | `map.ts` | 80x51 grid search with nearest-walkable fallback. |
| **Depth Sorting (Y-Sort)** | `World.tsx` | Simulates 2.5D visual occlusion for top-down canvas. |
| **Electron Trusted Frame IPC** | `main.cjs` | Enforces context isolation and prevents external frame exploitation. |
| **Headless Node Test Harness** | `*.test.mjs` | Multi-client concurrency tests without browser overhead. |

---

## 2. Workflows & Procedures

### 2.1 Adding a New Realtime Event

When adding a new WebSocket event (e.g., `'ping'`, `'doorbell'`, or `'screen-pointer'`):

1. **Update Frontend Types in `apps/desktop/src/types.ts`**:
   - Define the payload type.
2. **Update Server Event Handler in `services/realtime/server.mjs`**:
   - Add a case inside `switch (message.type)`:
     ```javascript
     case 'doorbell': {
       const zoneId = clean(message.zoneId, 20);
       if (!zoneId) return;
       broadcast(room, { type: 'doorbell', zoneId, fromId: id });
       break;
     }
     ```
   - Always sanitize string parameters using `clean(str, maxLen)` and validate numbers with `Number.isFinite`.
3. **Handle Incoming Message in `apps/desktop/src/hooks/useRoom.ts`**:
   - Add a case inside `ws.onmessage`:
     ```typescript
     case 'doorbell':
       // Dispatch state update or notification
       break;
     ```
4. **Write Integration Test in `services/realtime/server.test.mjs`**:
   - Use the mock client harness to verify sending and receiving the message.

---

### 2.2 Adding an Interactive Fixture to the Spatial World

To add a new navigable interactive item:

1. **Define in `apps/desktop/src/world/map.ts`**:
   ```typescript
   export const fixtures: Fixture[] = [
     // ...
     { id: 'pod-1', type: 'desk', x: 800, y: 700, w: 100, h: 80, label: 'Enter Focus Pod' }
   ];
   ```
2. **Add Procedural Drawing in `apps/desktop/src/world/draw.ts`**:
   ```typescript
   } else if (type === 'pod') {
     box(c, x, y, w, h, 8, '#3a4454', '#60728c');
   }
   ```
3. **Handle Player Interaction in `apps/desktop/src/App.tsx`**:
   - Add branch inside `interact(fixture)`:
     ```typescript
     if (fixture.id === 'pod-1') {
       setNotice('Entering quiet focus pod...');
     }
     ```
4. **Verify Pathfinding Reachability**:
   - Run `pnpm test` to ensure `findPath` reaches the new fixture without obstacle collision.

---

### 2.3 WebRTC Transceiver Swapping

Never create dynamic transceivers on the fly. Swap tracks into existing slots:

```typescript
// Slot 0: Audio | Slot 1: Camera | Slot 2: Screen
peer.pc.getTransceivers().slice(0, 3).forEach((t, i) => {
  t.direction = 'sendrecv';
  const track = tracks[i] || null;
  if (t.sender.track !== track) {
    t.sender.replaceTrack(track).catch(() => {});
  }
});
```

---

### 2.4 Writing Concurrency Integration Tests

Use Node.js test runner (`node:test`, `node:assert/strict`) with mock WebSocket clients:

```javascript
test('two clients exchange custom messages', async t => {
  const { address } = await setup(t);
  const a = await client(address, { profile: { name: 'Alice' } });
  const aw = await a.wait('welcome');
  const b = await client(address, { profile: { name: 'Bob' } });
  const bw = await b.wait('welcome');

  a.send({ type: 'doorbell', zoneId: 'studio' });
  const event = await b.wait('doorbell');
  assert.equal(event.zoneId, 'studio');
  assert.equal(event.fromId, aw.id);
});
```

Run tests with `pnpm test`.
