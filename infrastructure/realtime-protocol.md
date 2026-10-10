# Nova Realtime Protocol Specification

The Nova Realtime Relay (`services/realtime/server.mjs`) provides a combined HTTP REST and WebSocket interface for multi-tenant room management, spatial presence, collaborative whiteboard drawing, presentation sharing, and WebRTC signaling.

---

## 1. HTTP REST Endpoints

The HTTP server shares port `3001` with the WebSocket server.

### 1.1 `GET /health`
Returns service status and active load metrics.
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "rooms": 3,
  "participants": 8
}
```

### 1.2 `GET /rooms`
Returns a list of all active public rooms. Private rooms are omitted.
- **Access**: Public
- **Response `200 OK`**:
```json
[
  { "id": "nova-campus", "name": "Nova Campus", "count": 4 },
  { "id": "a91b82e1", "name": "Design Sync", "count": 2 }
]
```

### 1.3 `POST /upload`
Uploads a presentation asset (PDF, image, or pre-parsed PPTX deck) into the room's ephemeral in-memory asset store.
- **Headers**:
  - `Authorization: Bearer <session-token>` (Required; token received during `welcome`)
  - `Content-Type`: One of:
    - `application/pdf`
    - `image/png`
    - `image/jpeg`
    - `image/webp`
    - `application/json` (pre-parsed JSON slide deck schema)
- **Constraints**:
  - Max file size: 20 MB (`20 * 1024 * 1024` bytes)
  - Max assets per room: 8
  - Active room session required (validated against active connected socket)
- **Responses**:
  - `201 Created`: `{ "url": "/assets/<uuid>" }`
  - `401 Unauthorized`: Invalid or expired bearer token
  - `413 Payload Too Large`: File exceeds 20 MB
  - `415 Unsupported Media Type`: Unsupported mime type
  - `409 Conflict`: Room file limit reached

### 1.4 `GET /assets/:id`
Retrieves an uploaded asset from memory.
- **Headers Returned**:
  - `Content-Type`: Asset mime type
  - `Cache-Control: no-store`
  - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`
- **Responses**:
  - `200 OK`: Binary stream
  - `404 Not Found`: `{ "error": "This presentation is no longer available." }`

---

## 2. WebSocket Protocol

- **Endpoint**: `ws://<host>:3001`
- **Max Frame Size**: 128 KB
- **Connection Timeout**: 15 seconds to receive initial `join` message; otherwise closed with code `1008`.
- **Rate Limiting**: Sliding 1,000ms window capped at 90 messages. Messages exceeding this threshold are discarded.

### 2.1 Client-to-Server Messages

#### `join`
Sent immediately upon WebSocket connection opening.
```json
{
  "type": "join",
  "roomId": "nova-campus",
  "password": "optional-password",
  "create": false,
  "roomName": "Team Room",
  "profile": {
    "name": "Jane",
    "skin": "#d8a17b",
    "hair": "#302332",
    "shirt": "#8b7cf8",
    "style": "short"
  }
}
```

#### `move`
Broadcasts player coordinate updates. Rate-limited client-side to 85ms intervals.
```json
{
  "type": "move",
  "x": 1045.5,
  "y": 920.0,
  "direction": "left",
  "moving": true,
  "seated": false
}
```
*Constraints*: `x` clamped between 40 and 1960; `y` clamped between 40 and 1240.

#### `status`
Updates hardware indicators, hand raising, or reactions.
```json
{
  "type": "status",
  "hand": true,
  "mic": false,
  "camera": true,
  "sharing": false,
  "reaction": "👏"
}
```
*Valid reactions*: `'👏' | '💜' | '🎉' | '👍' | '💡'`

#### `chat`
Sends a public message or question in room chat.
```json
{
  "type": "chat",
  "text": "What are our targets for Q3?",
  "kind": "question"
}
```
*Constraints*: Cleaned string up to 1,200 characters. Minimum interval between chats: 300ms.

#### `stroke`
Broadcasts a drawn stroke to the shared whiteboard.
```json
{
  "type": "stroke",
  "stroke": {
    "color": "#7d64e8",
    "width": 4,
    "points": [[0.12, 0.45], [0.13, 0.46], [0.15, 0.49]]
  }
}
```
*Constraints*: Points array between 2 and 600 points; normalized [0, 1] range; maximum 1,500 strokes stored per room.

#### `clear-board`
Clears all whiteboard strokes for the active room.
```json
{ "type": "clear-board" }
```

#### `presentation`
Starts, updates, or stops a shared presentation.
```json
{
  "type": "presentation",
  "source": {
    "kind": "pdf",
    "name": "SprintDeck.pdf",
    "url": "/assets/e5e297a7-1907-4e65-8cb1-80a5e8fe5c56",
    "page": 1
  }
}
```
*To stop presenting*: Send `{ "type": "presentation", "source": null }`. Only the current presenter may modify or stop the presentation.

#### `slide`
Updates the active page/slide number. Only accepted from the presentation owner.
```json
{
  "type": "slide",
  "page": 3
}
```

#### `signal`
Direct WebRTC signaling relay between peers.
```json
{
  "type": "signal",
  "target": "f62b21cf-71d5-451e-b816-5bcbfdc87123",
  "data": {
    "description": { "type": "offer", "sdp": "..." }
  }
}
```

---

### 2.2 Server-to-Client Messages

#### `welcome`
Sent exclusively to the connecting client upon successful room join.
```json
{
  "type": "welcome",
  "id": "c8699144-b257-418a-9a99-923cb877bb65",
  "token": "7a3f81e3...",
  "room": { "id": "nova-campus", "name": "Nova Campus", "private": false },
  "players": [ ... ],
  "messages": [ ... ],
  "strokes": [ ... ],
  "presentation": null
}
```

#### `player`
Broadcast when any player's position, status, or avatar details change.
```json
{
  "type": "player",
  "player": {
    "id": "c8699144-b257-418a-9a99-923cb877bb65",
    "name": "Jane",
    "skin": "#d8a17b",
    "hair": "#302332",
    "shirt": "#8b7cf8",
    "style": "short",
    "x": 1045.5,
    "y": 920.0,
    "direction": "down",
    "moving": false,
    "seated": false,
    "hand": false,
    "mic": false,
    "camera": false,
    "sharing": false,
    "reaction": "👏",
    "reactionAt": 1728562300000
  }
}
```

#### `left`
Broadcast when a player disconnects or leaves.
```json
{
  "type": "left",
  "id": "c8699144-b257-418a-9a99-923cb877bb65"
}
```

#### `error`
Sent when an action is rejected or invalid.
```json
{
  "type": "error",
  "message": "That room password is incorrect."
}
```

---

## 3. Room Lifecycle & Cleanup Rules

1. **Default Room (`nova-campus`)**:
   - Always persists in memory.
   - Clears uploaded assets when empty, but the room itself is never deleted.
2. **Custom / Private Rooms**:
   - Created with random 4-byte hex identifiers.
   - Private rooms hash passwords with `scrypt` and a unique 16-byte salt.
   - When `room.players.size === 0`, all assets are cleared and the room is deleted from the `rooms` Map.
3. **Presenter Departure**:
   - When the client currently owning `room.presentation` disconnects, the server automatically resets `room.presentation = null` and broadcasts `{ type: 'presentation', source: null }` to prevent stalled presentations.
