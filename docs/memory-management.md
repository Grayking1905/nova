# Nova Memory Management & Lifecycle Guidelines

Long-running collaborative applications frequently suffer from gradual memory accumulation, canvas surface leaks, orphaned WebRTC peer connections, and uncollected event listeners. This document details Nova's strict memory management rules and resource disposal patterns.

---

## 1. Canvas 2D Lifecycle & Double-Buffering

### 1.1 The Static Backdrop Pattern
Redrawing static campus architecture, walls, rugs, textures, and fixtures 60 times per second causes heavy CPU load and memory churn.

```typescript
// World.tsx - Mount Effect
const backdrop = document.createElement('canvas');
backdrop.width = WORLD.width;
backdrop.height = WORLD.height;
drawMap(backdrop.getContext('2d')!);
```

- **Allocation**: The offscreen `backdrop` canvas is allocated **once** on component mount.
- **Rendering**: Every animation frame calls `context.drawImage(backdrop, 0, 0)`, which executes as a fast GPU texture blit.
- **Garbage Collection**: When `World` unmounts, the offscreen canvas reference goes out of scope and is reclaimed by the browser engine.

### 1.2 Animation Frame & Observer Cleanup
Uncancelled `requestAnimationFrame` loops or lingering `ResizeObserver` instances leak memory and run forever in the background.

```typescript
useEffect(() => {
  let animation = 0;
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const frame = (now: number) => {
    // render logic...
    animation = requestAnimationFrame(frame);
  };
  animation = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(animation);
    observer.disconnect();
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('blur', blur);
    canvas.removeEventListener('click', click);
  };
}, []);
```

---

## 2. WebRTC MediaStream & PeerConnection Disposal

WebRTC objects (`MediaStream`, `MediaStreamTrack`, `RTCPeerConnection`) are managed in native browser C++ layers and will **not** be garbage-collected if tracks remain active.

### 2.1 Track Halting Pattern
Simply dropping a reference to a `MediaStream` leaves the microphone or webcam hardware running. Every track must be explicitly stopped:

```typescript
// Correct Track Teardown
[audioStream, videoStream, shareStream].forEach(ref => {
  ref.current?.getTracks().forEach(track => track.stop());
  ref.current = null;
});
```

### 2.2 Peer Connection Closure
When remote players disconnect or when leaving a room, each `RTCPeerConnection` must be closed:

```typescript
for (const peer of peers.current.values()) {
  peer.pc.close();
}
peers.current.clear();
```

### 2.3 Generation Counter Race Guard
A user may toggle their camera or disconnect while `navigator.mediaDevices.getUserMedia()` is asynchronously awaiting user permission:

```typescript
const generation = useRef(0);

const toggleCamera = async () => {
  const request = generation.current;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });

  // If the component state changed while awaiting permission, stop immediately
  if (request !== generation.current || !current.current.connected) {
    stream.getTracks().forEach(t => t.stop());
    return;
  }
  // Safe to attach stream...
};
```

---

## 3. PDF.js Worker & Task Teardown

`pdfjs-dist` instantiates Web Workers and compiles binary font tables and render tasks. Unfinished render tasks or unreleased documents cause massive memory leaks.

```typescript
// PdfPage.tsx
useEffect(() => {
  let cancelled = false;
  let render: RenderTask | undefined;
  const task = getDocument({ url });

  void task.promise.then(async document => {
    if (cancelled) return;
    const sheet = await document.getPage(page);
    if (cancelled || !canvas.current) return;
    
    render = sheet.render({ canvas: canvas.current, viewport });
    await render.promise;
  });

  return () => {
    cancelled = true;
    render?.cancel();      // Cancels in-flight render task
    void task.destroy();   // Destroys worker document cache
  };
}, [url, page]);
```

---

## 4. React State Bridge Pattern (`useRef`)

In high-frequency rendering loops (such as Canvas 2D `requestAnimationFrame`), reading React state directly from closures either captures stale values or forces the `useEffect` hook to tear down and recreate the canvas every frame.

### The Bridge Pattern
```typescript
const state = useRef(props);
useEffect(() => {
  state.current = props;
}, [props]);

useEffect(() => {
  // Animation loop runs once on mount
  const frame = () => {
    const s = state.current; // Always accesses freshest props without re-binding!
    requestAnimationFrame(frame);
  };
}, []);
```
**Benefits**:
- Zero re-render cycles for the Canvas DOM element.
- No stale closure bugs when accessing `props.players` or `props.messages`.
- No event listener thrashing.

---

## 5. Server-Side Memory Reclamation

In `services/realtime/server.mjs`:
1. **Empty Room Eviction**: Non-default rooms are deleted from the `rooms` Map as soon as `room.players.size === 0`.
2. **Ephemeral Asset Clearing**: When a room is emptied, `room.assets.clear()` purges all binary buffers from RAM.
3. **Message History Bounds**: Room chat history is capped with `.slice(-100)` to ensure unbounded growth does not occur.
4. **Stroke Bounds**: Whiteboard strokes are capped at 1,500 entries per room.
5. **Rate Limiting Windows**: Rate limiting timestamps roll over every 1,000ms, preventing Map growth.
