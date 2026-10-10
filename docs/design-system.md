# Nova Design System & Aesthetics Guide

Nova couples a warm, modern architectural aesthetic with high-performance Canvas 2D graphics. The user interface blends minimalist glassmorphism, curated earthy and pastel palettes, and subtle micro-interactions to create a welcoming, professional virtual environment.

---

## 1. Visual Philosophy

- **Human & Warm**: Steers away from clinical corporate videoconferencing and noisy retro pixel art. Nova uses clean vector shapes, organic curves, and soft ambient lighting.
- **Spatial Clarity**: Every room has an instantly recognizable color theme, architectural identity, and functional zone.
- **Restraint & Depth**: Dark-themed HUD controls (`#0b0f14`, `#142329`) frame a soft, welcoming campus interior (`#e5e7dc`, `#f1f0e7`).

---

## 2. Color Palette & Tokens

### 2.1 Interface & Shell Colors
```css
/* Backgrounds & Canvas Frames */
--bg-void: #0b0f14;
--bg-canvas: #142329;
--bg-surface: #1e293b;
--bg-panel: rgba(18, 26, 36, 0.85);

/* Accent & Interaction */
--accent-primary: #8b7cf8;
--accent-hover: #7862c9;
--accent-soft: rgba(139, 124, 248, 0.15);
--status-online: #52dca6;
--status-danger: #e66b72;
```

### 2.2 Zone Architectural Palettes
Each zone on the Nova campus uses a primary tint and an accent tone for walls, rugs, and signage:

| Zone | Name | Primary Floor Tint | Accent & Border |
| :--- | :--- | :--- | :--- |
| `stage` | The Forum | `#d5ccef` (Lavender) | `#8a70bc` (Deep Violet) |
| `studio` | Idea Studio | `#e5c9ad` (Warm Sand) | `#b4845d` (Terracotta) |
| `garden` | Quiet Garden | `#a9cbb7` (Sage Green) | `#5c8e75` (Forest Green) |
| `work` | Focus Lab | `#b5cdd6` (Slate Blue) | `#648d9f` (Muted Steel) |
| `hub` | Welcome Hub | `#d9d3c7` (Limestone) | `#938873` (Warm Taupe) |
| `lounge` | The Commons | `#d6b9b1` (Dusty Rose) | `#a46c65` (Clay Brown) |

### 2.3 Avatar Customization Swatches
- **Shirts/Outfits**: `#8b7cf8`, `#5b9f88`, `#d58186`, `#6997c6`, `#d4a550`, `#3d485e`
- **Skin Tones**: `#f1c9a6`, `#d8a17b`, `#b67a55`, `#845538`, `#563a31`
- **Hair Colors**: `#302332`, `#70452e`, `#bb864a`, `#b8b5ca`

---

## 3. Typography Hierarchy

Nova uses system and modern sans-serif fonts:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
```

- **Display Headers**: Font size `28px` - `36px`, weight `700` - `800`, letter-spacing `-0.02em`.
- **Eyebrow Badges**: Font size `11px`, weight `600`, text-transform `uppercase`, letter-spacing `0.08em`.
- **Campus Signage (Canvas)**: Font size `22px` for room titles, `9px` for subtitles, weight `700`.
- **Avatar Nametags (Canvas)**: Font size `13px`, weight `600`, pill padding with rounded corners.
- **Body & Chat Text**: Font size `14px`, weight `400` - `500`, line-height `1.5`.

---

## 4. UI Component Anatomy

### 4.1 Activity Rail
Positioned on the left edge:
- Compact vertical navigation bar with icon buttons (`Spaces`, `Chat`, `People`, `Whiteboard`, `Present`).
- Active state highlighted with violet pill glow and subtle inset shadow.

### 4.2 Floating HUD & Minimap
- **Minimap**: Bottom-right interactive preview showing all 6 zones with accurate relative proportions.
  - Teammate dots render in real time.
  - Clicking any zone initiates automated pathfinding to the room entry.
- **Zoom Cluster**: Floating glassmorphism pill with `+`, `-`, and fit-to-campus buttons.
- **Interaction Prompt**: Floating pill with keyboard key indicator `<kbd>E</kbd>` that appears when approaching interactive fixtures.

### 4.3 Meeting Controls Bar
Positioned along the bottom edge:
- Left: User profile avatar summary and seated status.
- Center: Microphone toggle, Camera toggle, Sound/Deafen toggle, Hand raise, Reaction picker, and Present button.
- Right: Red-accented Leave button.

---

## 5. Procedural Canvas 2D Drawing Guidelines

When extending or adding fixtures in [draw.ts](file:///c:/Users/shriv/Desktop/new-projects/nova/apps/desktop/src/world/draw.ts):
1. **Rounded Corners (`roundRect`)**: Use soft corner radiuses (e.g., `4px` to `16px`) for all physical fixtures. Avoid sharp rectangles.
2. **Shadow Underlays**: Add a subtle dark translucent underlay (`#263b4539` or `#47536030`) offset by `(4, 10)` to give furniture physical depth.
3. **Layer Ordering**: Draw rugs first, followed by tables/desks, chairs, and upright electronics (screens/boards).
4. **Subtle Texture**: Grid circulation paths and room floorings include faint dashed grid lines (`#b9c8c53b`) spaced at 40-unit intervals.
