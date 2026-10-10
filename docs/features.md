# Nova Features & Capabilities

Nova provides a comprehensive suite of spatial, collaborative, and audiovisual features designed for natural remote teamwork.

---

## 1. Avatar Customization & Persistence

When entering Nova, each participant configures a personalized digital avatar:
- **Attributes**: Name, skin tone, hair color, shirt/outfit color, and hairstyle (`short`, `long`, `curly`).
- **Procedural Canvas Rendering**: Avatars are drawn dynamically via Canvas 2D primitives. No heavy sprite sheets or external images are required.
- **Local Persistence**: Preferences are saved to `localStorage('nova-avatar')` and restored automatically on subsequent visits.
- **Micro-Animations**:
  - Walking bob and stride cycles synchronized with movement speed.
  - Directional orientation (facing left, right, up, down).
  - Floating nametags, reaction emojis, microphone indicators, and hand-raise icons.
  - Seated pose adjustments when resting on chairs.

---

## 2. Six Campus Spaces

The campus is divided into 6 distinct zones designed for specific collaboration styles:

```
+--------------------+---------------------+--------------------+
|    The Forum       |     Idea Studio     |    Quiet Garden    |
| (Present & Talk)   |  (Draw & Brainstorm)|   (Take a Break)   |
+--------------------+---------------------+--------------------+
|                     Central Walkway                           |
+--------------------+---------------------+--------------------+
|    Focus Lab       |     Welcome Hub     |    The Commons     |
| (Individual Desks) |   (Spawn & Greet)   |  (Coffee & Chat)   |
+--------------------+---------------------+--------------------+
```

1. **The Forum (`stage`)**:
   - The auditorium and presentation hall.
   - Features room-wide broadcast audio: anyone inside can hear and speak with everyone else in The Forum.
   - Interactive presentation screen at `(246, 120)` supporting slides, PDFs, and screen sharing.
2. **Idea Studio (`studio`)**:
   - Brainstorming lab equipped with an interactive collaborative whiteboard at `(911, 122)`.
   - Meeting table and chairs for small group discussions.
3. **Quiet Garden (`garden`)**:
   - Calming zone with green acoustics, outdoor bench seating, and landscaped foliage.
4. **Focus Lab (`work`)**:
   - Coworking space featuring 4 individual workstations and desks.
   - Allows teammates to sit side-by-side with localized proximity audio.
5. **Welcome Hub (`hub`)**:
   - Central entrance where new arrivals spawn.
   - Information desk, bookshelf, and directory signage.
6. **The Commons (`lounge`)**:
   - Social space featuring a coffee counter, comfortable sofas, and coffee tables.
   - Pressing `E` at the coffee machine triggers an interactive reaction.

---

## 3. Spatial Audio & Video Mesh

- **Natural Proximity**: Microphone and webcam streams are connected only when avatars stand near one another (within 310 units) in the same room.
- **Auditorium Exception**: Participants inside The Forum hear all other participants regardless of distance.
- **Proximity Ring**: A visual dashed indicator circles your avatar, showing the exact boundary of your vocal reach.
- **Deafen / Independent Mute**: Mute all incoming audio with a single click without disabling your own microphone.
- **Privacy First**: Microphone and camera are disabled by default upon entry.

---

## 4. Collaborative Shared Whiteboard

Located in the Idea Studio:
- **Real-Time Vector Synchronization**: Pen strokes are captured as normalized `[0, 1]` coordinates and broadcast across WebSocket.
- **Stroke Chunking**: Long strokes are automatically batched every 590 points to ensure smooth network delivery.
- **Pen Customization**: 6 curated colors and 3 stroke widths (Fine, Medium, Bold).
- **Export & Clear**: One-click PNG image export and confirmed board clear for all participants.
- **Room Persistence**: Strokes persist in room memory throughout the session for late-joining teammates.

---

## 5. Rich Presentations (PDF, PPTX, Image & Screen)

Located in The Forum or triggered from meeting controls:
- **PowerPoint (.pptx) Parsing**: Client-side ZIP decompression via `fflate` and OpenXML DOM parsing extract slide dimensions, text runs, solid shapes, and embedded images into a lightweight `Deck` JSON structure.
- **Vector PDF Rendering**: High-fidelity PDF rendering via `pdfjs-dist` in an offscreen worker with proper cancellation and viewport scaling.
- **High-Res Images**: PNG, JPEG, and WebP support with responsive aspect-ratio fitting.
- **Presenter Controls**: The presentation owner controls synchronized page turns for all attendees.
- **Native Screen Sharing**:
  - Electron: Custom window/screen selection modal with real-time thumbnail previews powered by `desktopCapturer`.
  - Browser: Standard WebRTC `getDisplayMedia` picker.
- **Audience Interactions**: Attendees can raise hands, ask formatted presentation questions in chat, or navigate in/out of the presentation zone.

---

## 6. Room Chat & Speech Bubbles

- **Dual-Mode Chat**: Send general messages or mark questions with a distinct tag (`kind: 'question'`).
- **Temporary Speech Bubbles**: Chat messages appear floating above the player's avatar in the 2D world for 4.5 seconds before fading.
- **Reactions**: Quick emoji reactions (`👏`, `💜`, `🎉`, `👍`, `💡`) render as floating animated emojis above your avatar for 3.5 seconds.
- **Hand Raising**: Raise your hand to alert speakers and presenters; status synchronizes instantly across the people panel and avatar nametags.

---

## 7. Multi-Room Management & Privacy

- **Public Campus**: Default `nova-campus` space accessible to all users.
- **Custom Rooms**: Create temporary custom team rooms with custom names.
- **Private Password Protection**: Secure rooms using salted `scrypt` hashing. Private rooms are hidden from the public room directory and enforce password verification.
- **Automatic Lifecycle**: Empty custom rooms and associated presentation uploads are automatically purged to prevent server memory bloat.
