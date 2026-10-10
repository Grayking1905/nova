---
name: nova-memory-patterns
description: >-
  Memory management, resource lifecycle, and leak prevention procedures for Nova.
  Use this skill when dealing with Canvas double-buffering, WebRTC MediaStream/track teardown,
  PDF.js worker cancellation, React state-ref bridges in animation loops, or server-side memory cleanup.
---

# Nova Memory Management & Resource Lifecycle Patterns

This skill provides step-by-step procedures and rules for ensuring zero memory leaks and clean resource teardown across Nova's Canvas, WebRTC, React, and server-side subsystems.

---

## 1. Quick Reference: Resource Teardown Checklist

Always follow these rules when adding or modifying asynchronous, hardware, or graphic components:

| Subsystem | Potential Leak | Correct Cleanup Procedure |
| :--- | :--- | :--- |
| **Canvas 2D** | Uncancelled render loop or ResizeObserver | Call `cancelAnimationFrame(id)` and `observer.disconnect()`. |
| **Canvas 2D** | Static map redraw churn | Pre-render onto an offscreen canvas once at mount, then `drawImage()` it. |
| **WebRTC** | Active microphone / webcam hardware | Call `.stop()` on every `MediaStreamTrack`; nullify stream references. |
| **WebRTC** | Orphaned `RTCPeerConnection` | Call `peer.pc.close()` and remove from `peers.current` Map. |
| **PDF.js** | Worker threads & render tasks | Set `cancelled = true`, call `render.cancel()`, and `void task.destroy()`. |
| **React Hooks** | Stale closures in animation loop | Use `useRef(props)` bridge pattern instead of putting props in dependency array. |
| **Node.js Server** | Unbounded room history & assets | Evict empty rooms, slice chat history (`.slice(-100)`), cap whiteboard strokes. |

---

## 2. Workflows & Procedures

### 2.1 Implementing a Leak-Free Canvas Loop

When building or updating a Canvas component (like `World.tsx` or `Whiteboard.tsx`):

1. **Pre-render Static Backgrounds Once**:
   ```typescript
   // Run once on mount
   const backdrop = document.createElement('canvas');
   backdrop.width = WORLD.width;
   backdrop.height = WORLD.height;
   drawMap(backdrop.getContext('2d')!);
   ```
2. **Setup ResizeObserver with Disconnect in Cleanup**:
   ```typescript
   const observer = new ResizeObserver(resize);
   observer.observe(canvas);
   ```
3. **Store RequestAnimationFrame ID and Cancel on Unmount**:
   ```typescript
   let animation = 0;
   const frame = (now: number) => {
     // Render frame...
     animation = requestAnimationFrame(frame);
   };
   animation = requestAnimationFrame(frame);

   return () => {
     cancelAnimationFrame(animation);
     observer.disconnect();
   };
   ```

---

### 2.2 Managing WebRTC Streams with Race Condition Guard

When requesting media devices (`getUserMedia` or `getDisplayMedia`):

1. **Track Invocation Generation**:
   A user might click "Turn Off" while device permissions are pending. Guard using `generation.current`:
   ```typescript
   const generation = useRef(0);
   const busy = useRef(new Set<string>());

   const toggleCamera = async () => {
     if (busy.current.has('camera')) return;
     busy.current.add('camera');
     const request = generation.current;

     try {
       if (videoStream.current) {
         // Stop and release
         videoStream.current.getTracks().forEach(t => t.stop());
         videoStream.current = null;
         setCamera(false);
         send({ type: 'status', camera: false });
       } else {
         const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } });
         // Verify state didn't change while waiting for user/OS permission
         if (request !== generation.current || !connected) {
           stream.getTracks().forEach(t => t.stop());
           return;
         }
         videoStream.current = stream;
         setCamera(true);
         send({ type: 'status', camera: true });
       }
       updateTracks();
     } finally {
       busy.current.delete('camera');
     }
   };
   ```
2. **Stop All Hardware on Disconnect**:
   ```typescript
   const stopAll = () => {
     generation.current++;
     [audioStream, videoStream, shareStream].forEach(ref => {
       ref.current?.getTracks().forEach(t => t.stop());
       ref.current = null;
     });
     for (const p of peers.current.values()) p.pc.close();
     peers.current.clear();
   };
   ```

---

### 2.3 Handling Third-Party Worker Renders (PDF.js)

To prevent worker thread starvation and canvas render collision:

```typescript
useEffect(() => {
  let cancelled = false;
  let render: RenderTask | undefined;
  const task = getDocument({ url });

  void task.promise.then(async doc => {
    if (cancelled) return;
    const pageObj = await doc.getPage(page);
    if (cancelled || !canvas.current) return;

    render = pageObj.render({ canvas: canvas.current, viewport });
    await render.promise;
  });

  return () => {
    cancelled = true;
    render?.cancel();      // Stops in-flight rasterization
    void task.destroy();   // Releases worker thread resources
  };
}, [url, page]);
```

---

### 2.4 Server-Side Memory Reclamation Audit

When adding state to `services/realtime/server.mjs`:
1. Always bound arrays:
   - Chat: `room.messages = room.messages.slice(-100)`
   - Strokes: `if (room.strokes.length >= 1500) reject()`
2. Free memory on client departure:
   ```javascript
   socket.on('close', () => {
     clients.delete(socket);
     room.players.delete(id);
     if (!room.players.size) {
       room.assets.clear(); // Free uploaded binary buffers
       if (room.id !== 'nova-campus') rooms.delete(room.id); // Free custom room
     }
   });
   ```
