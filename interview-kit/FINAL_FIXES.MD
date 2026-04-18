# Interview Kit — Final Mobile Fixes Plan

## Issues Found

### 1. No OrbitControls on canvas
**Problem**: User can't drag to rotate the 3D scene at all. The canvas has no OrbitControls, so on mobile there's zero way to look around.
**Fix**: Add `<OrbitControls>` from `@react-three/drei`. Enable only when `activeStation === null` (hub view). With `enableDamping`, `dampingFactor={0.05}`, `minDistance={3}`, `maxDistance={15}`, `enablePan={false}`.

### 2. Bloom intensity too high
**Problem**: Bloom at intensity 0.8 with 0.2 luminanceThreshold creates large glowing halos. On the refactoring overlay screenshot, a huge orange glow/flare covers the code block.
**Fix**: Reduce intensity to 0.4, luminanceThreshold to 0.4, radius to 0.5.

### 3. Monaco editor in typescript mode causing red squiggles  
**Problem**: Editor shows `defaultLanguage="typescript"` but the code samples are JS with callbacks. This causes red underlines everywhere.
**Fix**: Change to `defaultLanguage="javascript"` in LeetCodeOverlay and RefactoringOverlay.

### 4. Orange "Refactoring Garage" watermark overlay
**Problem**: Large semi-transparent orange text overlay on top of the Monaco editor, making code hard to read.
**Fix**: Remove any absolute-positioned watermark text overlay from the editor area.

### 5. Station label text overlaps 3D objects
**Problem**: Labels at `[0, 1.5, 0]` position float directly over the station objects on mobile where the viewport is narrower.
**Fix**: Move label to `[0, 1.8, 0]`, add `transform` prop on `<Html>`, add `background: 'rgba(10,10,26,0.6)'` pill behind text with padding and borderRadius.

### 6. Overlay header layout broken on mobile
**Problem**: Back button + title + progress + difficulty tag all crammed in one row on mobile.
**Fix**: Use `flex-wrap` with `gap-2 md:gap-4`. Reduce title to `text-base md:text-xl`. Split into two lines on mobile if needed.

### 7. Disabled button states unclear
**Problem**: Previous/Next exercise buttons at bottom look same whether disabled or enabled on mobile.
**Fix**: Add `disabled:opacity-30 disabled:cursor-not-allowed` styling. Make arrows/icons gray out too.

### 8. ScoreBoard chip positioning
**Problem**: "0/4 completed" chip blocks the 3D scene at top-right edge.
**Fix**: Reposition chip to top-left on mobile. Add X close button inside expanded panel.

### 9. Canvas doesn't prevent touch scrolling
**Problem**: When user tries to drag to orbit, browser scrolls the page instead.
**Fix**: Add `touchAction: 'none'` to Canvas style.

## Implementation Order

1. Fix Canvas3D.tsx — OrbitControls + bloom + touchAction
2. Fix StationPortal.tsx — label position + transform + background
3. Fix ALL overlays — editor language + header layout + watermark removal + button states
4. Fix ScoreBoard — chip reposition + X close button
5. Verify build passes
