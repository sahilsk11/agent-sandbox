# Interview Kit - Mobile Responsive Plan

## Current Problems
1. **All overlay panels** use `h-[90vh]` and side-by-side layouts (`w-1/2`, `w-1/3`) — no responsive stacking
2. **Monaco editor** renders at tiny width on mobile, unusable
3. **ScoreBoard** floats fixed top-right, overlaps overlay content on mobile
4. **Canvas** takes full viewport but particles and stations get cramped
5. **Zero responsive breakpoints** — no `md:`, `lg:`, `sm:` prefixes anywhere
6. **Overlays** use `h-[90vh]` which doesn't account for mobile browser chrome (address bar, nav bar)
7. **Textarea in Culture Fit** overlay is cramped

## Mobile Design Approach

### General Overlay Behavior (all 4 stations)
- **Mobile (<768px)**: Full-screen single-column layout, full height with `h-[100dvh]` (dynamic viewport height)
  - Header/title bar at top with back button
  - Scrollable content area below
  - **Tab/switch toggle** between "Instructions" and "Code Editor" instead of side-by-side split
  - Action buttons stick to bottom
- **Tablet/Desktop (≥768px)**: Keep the current side-by-side split layout

### LeetCode Arena Overlay
- Mobile: Stack vertically with tabs or accordion — "Problem Description" panel first, tap to expand "Code Editor" panel
- On mobile, the Monaco editor should be larger: min-h-64 or fill remaining space
- Timer should be a floating chip, not in header taking space
- Bottom action buttons (Run/Submit) should be a fixed sticky bottom bar

### System Design Lab Overlay
- Mobile: Stack the challenge description + checklist below the canvas/diagram area
- Checklist items should be full-width tap targets with clear toggle state
- Notes textarea should take full width

### Refactoring Garage Overlay
- Mobile: Tab switch at top — "Instructions" (original code + goals) vs "Your Solution" (Monaco editor)
- This is the hardest one on mobile because users need to see original code while writing
- Could also do a bottom-sheet style: original code slides up when you tap "View Original"
- Principles tags should wrap with smaller text on mobile

### Culture Fit Lounge Overlay
- Already uses single-column-ish layout, but `h-[90vh]` is wrong for mobile
- Mobile: Use `h-[100dvh]`, make textarea full width with minimum comfortable height
- Rubric checklist items should be full-width with clear visual feedback

### Canvas/3D Scene on Mobile
- Canvas height should be `100dvh` (dynamic viewport height)
- Station spacing might work as-is, the objects are floating so they scale somewhat
- Hide hints text ("Click on a station...") on very small screens
- OrbitControls should be default (already is)
- On mobile, stations should be slightly closer to camera or camera should be further back

### ScoreBoard
- Mobile: Move to a collapsible bottom bar or make it slide out from the side
- Could use a floating "?" or menu icon in top-right instead of always-showing panel
- Or collapse it to just show "0/4 completed" as a small chip

### Touch Targets
- All clickable elements (buttons, nav links, checklist items) should be min 44x44px
- Monaco editor needs touch-friendly scroll — set `readOnly` or proper touch handling
- Exercise navigation (Previous/Next) should be large buttons, not small text links
- The Monaco editor keyboard trigger icon (shown on mobile) needs adequate touch space

## CSS Changes Required
1. Replace all `w-1/2`, `w-1/3`, `w-2/3` with responsive: `w-full md:w-1/2`, `w-full md:w-2/3`
2. Replace `h-[90vh]` with `h-full md:h-[90vh]`
3. Add flex-col on mobile, flex-row on desktop: `flex flex-col md:flex-row`
4. Add proper overflow handling: `overflow-y-auto` on scrollable sections
5. Use `min-h-[100dvh]` for the root overlay container on mobile
6. Add `md:p-6`, `md:gap-4` etc for spacing that increases on desktop
7. Adjust font sizes: `text-xs md:text-sm`, `text-sm md:text-base`
8. Monaco editor: use `options={{ fontSize: 12, lineNumbers: 'on' }}` and add dynamic height
9. Add `@media` queries in App.css for mobile-specific overrides if needed
10. ScoreBoard: responsive positioning and collapsible state

## Implementation Details

### New Component: TabSwitcher
A simple tab component for toggling between panels on mobile:
```tsx
// TabSwitcher.tsx
interface Tab { label: string; value: string }
// Renders two tabs on mobile, hidden on desktop (side-by-side handles it)
```

### Layout Pattern for Each Overlay
```tsx
<div className="fixed inset-0 z-40 h-full md:h-[100dvh]">
  {/* Back button + header */}
  
  {/* Mobile tab switcher */}
  <div className="flex md:hidden sticky top-0 z-10 bg-black/80 backdrop-blur-xl">
    <button onClick={() => setActiveTab('instructions')}>Instructions</button>
    <button onClick={() => setActiveTab('editor')}>Code Editor</button>
  </div>
  
  {/* Desktop side-by-side or mobile full-width panels */}
  <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
    {/* Instructions panel: hidden on mobile when editor tab active */}
    <div className="w-full md:w-1/3 overflow-y-auto">
      {/* content */}
    </div>
    
    {/* Editor panel: hidden on mobile when instructions tab active */}
    <div className="w-full md:w-2/3 flex flex-col">
      <Editor />
    </div>
  </div>
  
  {/* Sticky bottom action bar on mobile */}
  <div className="md:hidden fixed bottom-0 left-0 right-0">
    {/* Run, Submit buttons */}
  </div>
</div>
```

## Testing Checklist
1. iPhone SE (375x667) — smallest target
2. iPhone 14 Pro (393x852)
3. Samsung Galaxy S21 (360x800)
4. iPad Mini (768x1024) — breakpoint threshold
5. Touch targets ≥ 44px
6. Monaco editor scrollable and usable
7. All overlays open/close correctly
8. ScoreBoard doesn't overlay on mobile when not needed
9. 3D canvas responsive to viewport changes
10. No horizontal overflow on any screen size
