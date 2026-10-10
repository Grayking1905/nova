# Nova WebRTC Spatial Mesh Architecture

Nova implements a decentralized peer-to-peer (P2P) WebRTC mesh for direct real-time communication. Audio, webcam video, and screen shares travel directly between peers without media server transcoding, maximizing privacy and minimizing latency.

---

## 1. Peer-to-Peer Mesh Topology

In Nova, each connected client establishes direct `RTCPeerConnection` links to other participants in the same room.

```
       [Peer A]
       /      \
      /        \
  [Peer B]----[Peer C]
```

### Limits and Scalability
- **Capacity**: P2P full mesh scales up to **12 concurrent participants** per room. Beyond 12, network upload and decoding CPU scale quadratically ($N \times (N - 1)$ connections).
- **Proximity Filtering**: To preserve network and CPU bandwidth, media tracks are dynamically attached and detached based on proximity rules, even though signaling remains established.
- **Future Scale**: For rooms with > 12 users, a Selective Forwarding Unit (SFU) architecture (such as LiveKit or mediasoup) should be introduced.

---

## 2. Perfect Negotiation Pattern

Nova implements the standard W3C **Perfect Negotiation** pattern in [useMedia.ts](file:///c:/Users/shriv/Desktop/new-projects/nova/apps/desktop/src/hooks/useMedia.ts) to eliminate offer/answer glare and state machine collisions.

### 2.1 Role Determination
Each client deterministically determines whether it is the "polite" peer or "impolite" peer using lexicographical comparison of client UUIDs:

```typescript
const polite = current.current.id.localeCompare(id) > 0;
```

### 2.2 Glare Resolution Matrix
When both peers generate an offer simultaneously:
- **Polite Peer**: Yields gracefully, rolls back its local offer, and accepts the incoming remote offer.
- **Impolite Peer**: Ignores the incoming remote offer, maintaining its own offer until the polite peer responds with an answer.

```typescript
const ready = !peer.makingOffer && (pc.signalingState === 'stable' || peer.settingAnswer);
const collision = signal.description.type === 'offer' && !ready;
peer.ignoreOffer = !peer.polite && collision;
if (peer.ignoreOffer) return;
```

---

## 3. Fixed 3-Slot Transceiver Architecture

A critical architectural pattern in Nova is the **fixed 3-slot transceiver model**. Rather than dynamically creating and destroying transceivers (which triggers complex renegotiation cycles), each peer allocates exactly 3 transceivers:

| Slot Index | Kind | Purpose | Initial Direction |
| :--- | :--- | :--- | :--- |
| **0** | `audio` | Microphone Stream | `sendrecv` |
| **1** | `video` | Webcam Video Stream | `sendrecv` |
| **2** | `video` | Desktop / Screen Share | `sendrecv` |

### Avoiding Duplicate Transceivers
Exactly one side (the impolite peer) creates the transceivers before negotiation starts:

```typescript
if (!peer.polite) {
  ['audio', 'video', 'video'].forEach((kind, i) =>
    pc.addTransceiver(kind, { direction: 'sendrecv', streams: [streams[i]] })
  );
}
```

When tracks change or proximity updates occur, Nova uses `replaceTrack()`:

```typescript
peer.pc.getTransceivers().slice(0, 3).forEach((t, i) => {
  t.direction = 'sendrecv';
  const track = tracks[i] || null;
  if (t.sender.track !== track) {
    t.sender.replaceTrack(track).catch(() => {});
  }
});
```
`replaceTrack` swaps tracks seamlessly at the RTP layer **without triggering SDP renegotiation**.

---

## 4. Spatial Proximity & Audio Rules

Nova's spatial audio engine simulates real-world acoustics based on 2D coordinates and room boundaries.

### 4.1 Proximity Calculation (`audible()`)
Located in [map.ts](file:///c:/Users/shriv/Desktop/new-projects/nova/apps/desktop/src/world/map.ts):

```typescript
export function audible(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  const za = zoneAt(a.x, a.y);
  const zb = zoneAt(b.x, b.y);
  return za?.id === zb?.id && (za?.id === 'stage' || Math.hypot(a.x - b.x, a.y - b.y) < 310);
}
```

### 4.2 Acoustic Rules
1. **Room Boundaries**: Participants must be inside the **same zone** to hear each other. Sound does not leak across room walls.
2. **Proximity Radius**: In normal rooms (Idea Studio, Quiet Garden, Focus Lab, Welcome Hub, The Commons), audio connects only within **310 coordinate units** (Euclidean distance).
3. **The Forum (Stage) Broadcast Exception**: In `The Forum` (`zone.id === 'stage'`), audio has no distance limit. Any participant standing anywhere inside The Forum can hear any other participant inside The Forum.
4. **Screen Share Routing**: Screen share tracks are enabled for peers when the presenter is in `The Forum` or sharing at designated workstations.

---

## 5. Network Traversal (STUN / TURN)

- **Default Configuration**: Google Public STUN (`stun:stun.l.google.com:19302`) handles direct hole punching across full cone / restricted cone NATs.
- **Enterprise / Symmetric NAT**: Clients behind symmetric NAT or corporate firewalls require a TURN server. Configured via the `VITE_ICE_SERVERS` environment variable:

```json
[
  { "urls": "stun:stun.l.google.com:19302" },
  {
    "urls": "turn:turn.example.com:3478",
    "username": "nova-user",
    "credential": "secure-password"
  }
]
```

---

## 6. Lifecycle & Teardown Protocol

To prevent memory leaks and zombie peer connections:
1. **Player Departure**: When a participant leaves, their `RTCPeerConnection` is closed and removed from `peers.current`:
   ```typescript
   peer.pc.close();
   peers.current.delete(id);
   ```
2. **Room Disconnect**: When leaving a room, `stopAll()` halts all media streams and destroys all peer connections:
   ```typescript
   generation.current++;
   [audioStream, videoStream, shareStream].forEach(ref => {
     ref.current?.getTracks().forEach(t => t.stop());
     ref.current = null;
   });
   for (const p of peers.current.values()) p.pc.close();
   peers.current.clear();
   ```
3. **Race Condition Guard**: The `generation` counter invalidates in-flight `getUserMedia()` requests if the user toggled off or disconnected while hardware permissions were pending.
