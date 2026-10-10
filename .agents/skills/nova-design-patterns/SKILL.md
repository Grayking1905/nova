---
name: nova-design-patterns
description: >-
  Design guidelines, aesthetic tokens, and procedural Canvas 2D UI patterns for the Nova spatial workplace.
  Use this skill when modifying or creating 2D campus zones, procedural avatars, interactive fixtures,
  animations, HUD components, or glassmorphic dialogs.
---

# Nova Design Patterns & Aesthetic Guidelines

This skill provides step-by-step instructions and reference patterns for maintaining and extending Nova's visual design system, procedural Canvas 2D engine, and modern glassmorphic interface.

---

## 1. Design Principles & Style Guide

- **Warm Architectural Aesthetic**: Nova avoids both sterile corporate UI and retro pixel art, choosing clean vector shapes, organic curves, and soft interior tints.
- **Procedural Canvas Rendering**: All campus geometry, rugs, furniture, avatars, and animations are rendered programmatically using standard Canvas 2D primitives (`roundRect`, `ellipse`, `drawImage`, `setTransform`).
- **Cohesive Dark Shell & Warm Interior**: Dark framing HUD (`#0b0f14`, `#142329`) highlights the warm ivory and pastel interior campus (`#e5e7dc`, `#f1f0e7`).

---

## 2. Color Palette & Token Reference

### 2.1 Zone Architecture Colors
```typescript
// map.ts
export const zones = [
  { id: 'stage',  name: 'The Forum',    color: '#d5ccef', accent: '#8a70bc' },
  { id: 'studio', name: 'Idea Studio',  color: '#e5c9ad', accent: '#b4845d' },
  { id: 'garden', name: 'Quiet Garden', color: '#a9cbb7', accent: '#5c8e75' },
  { id: 'work',   name: 'Focus Lab',    color: '#b5cdd6', accent: '#648d9f' },
  { id: 'hub',    name: 'Welcome Hub',  color: '#d9d3c7', accent: '#938873' },
  { id: 'lounge', name: 'The Commons',  color: '#d6b9b1', accent: '#a46c65' },
];
```

### 2.2 Avatar Swatches
- **Shirts**: `#8b7cf8` (violet), `#5b9f88` (green), `#d58186` (rose), `#6997c6` (blue), `#d4a550` (amber), `#3d485e` (navy)
- **Skin**: `#f1c9a6`, `#d8a17b`, `#b67a55`, `#845538`, `#563a31`
- **Hair**: `#302332` (espresso), `#70452e` (chestnut), `#bb864a` (honey), `#b8b5ca` (silver)

---

## 3. Workflows

### 3.1 Adding or Updating an Interactive Fixture

When introducing a new fixture (e.g., a phone booth, vending machine, or presentation podium):

1. **Register the Fixture in `apps/desktop/src/world/map.ts`**:
   - Define its bounding box `{ id, type, x, y, w, h, label }`.
   - If interactive, supply a descriptive `label` (e.g. `'Enter private booth'`).
   - If solid, it will automatically be included in `obstacles` (chairs remain walkable).
2. **Implement Drawing Logic in `apps/desktop/src/world/draw.ts`**:
   - Use `box(c, x, y, w, h, radius, fill, stroke)` with rounded corners.
   - Include a translucent drop shadow underneath:
     ```typescript
     box(c, x + 4, y + 10, w, h, 12, '#4d687840');
     ```
3. **Bind Interaction Handler in `apps/desktop/src/App.tsx`**:
   - Inside `interact(fixture: Fixture)`, add a branch for the new fixture type.
4. **Verify Reachability**:
   - Run `pnpm test` to ensure pathfinding can find a route to the fixture without obstruction.

---

### 3.2 Extending Avatar Styles & Animations

To add a new hairstyle, accessory, or animation:

1. **Update Avatar Type Definition in `apps/desktop/src/types.ts`**:
   - Add new styles to the `Avatar['style']` union (e.g., `'ponytail' | 'bun'`).
2. **Implement Procedural Rendering in `drawAvatar` (`apps/desktop/src/world/draw.ts`)**:
   - Leverage Canvas 2D transformations:
     ```typescript
     // Bobbing & Stride physics
     const step = moving ? Math.sin(tick / 75) * 5 : 0;
     const bob = moving ? Math.abs(Math.sin(tick / 75)) * 2 : Math.sin(tick / 500) * 0.8;
     ```
3. **Expose Selection in Avatar Builder (`apps/desktop/src/App.tsx`)**:
   - Add button options in the segmented controls of the join dialog.
4. **Validate Live Preview in `AvatarPreview.tsx`**.

---

### 3.3 Adding a Glassmorphic Modal Dialog

All in-app dialogs must follow the accessible, focus-trapped pattern established in `Dialog.tsx`:
- Backdrop: `rgba(6, 10, 16, 0.75)` with `backdrop-filter: blur(12px)`.
- Card Surface: Dark glassmorphic background with `border: 1px solid rgba(255, 255, 255, 0.08)`.
- Header: Title, subtle icon, and close button with `aria-label="Close dialog"`.
- Keyboard Accessibility: Pressing `Escape` invokes `onClose()`.
