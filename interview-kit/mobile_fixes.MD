# Mobile Fixes Plan

## Issues to Fix

### 1. Add OrbitControls to Canvas3D
**Problem**: User can't drag to look around on mobile or desktop. Canvas has no orbit controls.
**Fix**: Add `<OrbitControls>` from drei to Canvas3D scene. 
- Only enable OrbitControls when `activeStation === null` (hub mode)
- Disable when viewing an overlay to prevent double-interaction
- Set `touch-action: 'none'` on the canvas to prevent browser scroll
- Configure with appropriate damping, pan sensitivity, and distance limits

```tsx
import { OrbitControls } from '@react-three/drei'
// In Scene component:
{!activeStation && (
  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={3}
    maxDistance={15}
    maxPolarAngle={Math.PI / 2 + 0.2}
    minPolarAngle={0.3}
    enablePan={false}
  />
)}
```

### 2. Fix Station Label Positioning
**Problem**: Labels float too close to objects, overlapping on mobile.
**Fix**: Increase the vertical position from `[0, 1.5, 0]` to `[0, 1.8, 0]` and add `transform: true` to the Html component so it scales with distance. Also reduce font size slightly and add a background pill to make labels readable against any background.

```tsx
<Html
  position={[0, 1.8, 0]} // increased from 1.5
  center
  distanceFactor={8}
  transform  // <-- ADD THIS
  style={{ pointerEvents: 'none' }}
>
  <div style={{
    color,
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'Inter, system-ui, sans-serif',
    textAlign: 'center',
    textShadow: `0 0 8px ${color}`,
    whiteSpace: 'nowrap',
    background: 'rgba(10,10,26,0.6)',  // <-- ADD background pill
    padding: '2px 8px',
    borderRadius: '4px',
  }}>
    {stationLabels[stationId]}
  </div>
</Html>
```

### 3. Fix Bloom Being Too Aggressive on Mobile
**Problem**: The bloom post-processing creates a huge glow that obscures content (seen as orange lens flare covering code).
**Fix**: Reduce bloom intensity from 0.8 to 0.4. Add luminanceThreshold of 0.4 to bloom less on low-contrast elements. On the overlay side, make sure overlays have solid backgrounds so bloom doesn't bleed through.

```tsx
<Bloom
  intensity={0.4}  // reduced from 0.8
  luminanceThreshold={0.4}  // increased from 0.2
  luminanceSmoothing={0.9}
  radius={0.5}  // reduced from 0.8
/>
```

### 4. Remove Monaco Editor Watermark
**Problem**: The RefactoringOverlay has an orange "Refactoring Garage" watermark/slanted text overlay on top of the code editor, making it hard to read.
**Fix**: Remove any watermark overlay from the Monaco editor area. If it's a CSS pseudo-element or absolute positioned div layered over the editor, delete it.

### 5. Fix Monaco Editor Language Mode
**Problem**: Monaco is set to `typescript` mode but the code samples are JavaScript. This causes red squiggly lint underlines on valid JS code.
**Fix**: Change the editor's `defaultLanguage` from `"typescript"` to `"javascript"` in all overlays that display JS code (LeetCode, Refactoring).

### 6. Fix Header Layout on Mobile (Overlays)
**Problem**: Back button, title, progress counter, and difficulty tag are all crammed together on mobile. The layout wraps badly.
**Fix**: Use responsive grid or flex-wrap with gap for the overlay header:
- Row 1: Back button (left) | Title (center) | Progress (right)
- Row 2: Difficulty tag (left) | Other info (right)
- Make it `flex-wrap` on mobile, proper spacing with `gap-2 md:gap-4`
- Reduce text sizes on mobile: `text-base md:text-lg` for titles

### 7. Fix Previous/Next Exercise Button Styling
**Problem**: Disabled buttons look visually identical to enabled buttons on mobile. User can't tell they're disabled without clicking.
**Fix**: Add clear disabled styling:
- `disabled:opacity-30 disabled:cursor-not-allowed` (already partially there but may not be sufficient)
- Add `cursor-not-allowed` class
- On mobile, use `pointer-events-none` when disabled
- Add visual indicator like strikethrough text or dimmed arrow icons

### 8. Fix Monaco Editor Height on Mobile
**Problem**: When the "Your Solution" tab is active on mobile, the editor container might not take full remaining height properly.
**Fix**: Ensure editor container uses flex-1 and min-h properly:
```tsx
<div className="flex-1 min-h-[200px] md:min-h-0 relative">
  <Editor height="100%" ... />
</div>
```

### 9. Add touch-action: none to Canvas
**Problem**: Mobile browser captures touch events for scrolling instead of orbiting.
**Fix**: Add CSS to make the canvas non-scrollable:
```tsx
<Canvas
  style={{ background: '#0a0a1a', touchAction: 'none' }}
  ...
>
```

### 10. Fix ScoreBoard Expandable Behavior
**Problem**: When expanded on mobile, ScoreBoard overlaps with content and can't be closed easily.
**Fix**: 
- Add a close button (X icon) inside the expanded panel
- Position the chip top-left with `top-3 left-3 md:left-auto md:right-4` to avoid blocking 3D scene on mobile
- Use framer-motion AnimatePresence for smooth expand/collapse with an outside click to close

## File Change Summary
- `src/components/Canvas3D.tsx` — Add OrbitControls, touch-action
- `src/components/stations/StationPortal.tsx` — Fix label position, add background pill
- `src/overlays/RefactoringOverlay.tsx` — Remove watermark, fix lang mode
- `src/overlays/LeetCodeOverlay.tsx` — Fix lang mode to javascript
- `src/overlays/SystemDesignOverlay.tsx` — Fix header layout
- `src/overlays/CultureFitOverlay.tsx` — Fix header layout
- `src/components/ui/ScoreBoard.tsx` — Fix positioning, add close button
- All overlay files: Fix header flex layout for mobile
