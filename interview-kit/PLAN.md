# Interview Kit - 3D Technical Interview Prep App

## Vision
A visually stunning, immersive 3D web experience that helps candidates prepare for technical software engineering interviews. The app presents a "Mission Control" interface with 4 interactive stations, each representing a different interview round.

---

## User Flow

1. **Landing/Hub View**: User sees a 3D space with 4 floating holographic stations
2. **Click a Station**: Camera swoops into that station with smooth transition
3. **Station Overlay**: Glassmorphic UI overlay appears with the challenge
4. **Complete Challenge**: User interacts with the challenge content
5. **Return to Hub**: User can navigate back to choose another station
6. **Overall Score**: Dashboard tracks completed challenges and performance

---

## Tech Stack
- **React 18 + TypeScript + Vite**
- **@react-three/fiber** — Three.js rendering for React
- **@react-three/drei** — 3D helpers (Environment, Text, Html, Float, MeshDistortMaterial, etc.)
- **@react-three/postprocessing** — Bloom, glitch, depth-of-field FX
- **framer-motion** — 2D overlay transitions and animations
- **@monaco-editor/react** — Code editor for LeetCode challenge
- **Tailwind CSS** — Component styling
- **zustand** — Global state management
- **leva** — Settings panel

---

## Component Architecture

### Layout
- `App.tsx` — Root with Zustand store, theme, and main router logic
- `components/Canvas3D.tsx` — Three.js Canvas with post-processing effects
- `components/Overlays.tsx` — framer-motion overlay panels for each station

### 3D Scene
- `components/Scene.tsx` — Main scene container with lighting, grid, particles
- `components/GridFloor.tsx` — Infinite grid floor
- `components/ParticleSystem.tsx` — Floating particles/stars background
- `components/Lighting.tsx` — Studio lighting setup

### Hub Stations
- `components/stations/StationPortal.tsx` — Clickable station with unique 3D object + label
- `components/stations/Station1_LeetCodeArena.tsx` — Glowing crystal/gem
- `components/stations/Station2_SystemDesignLab.tsx` — Rotating blueprint hologram
- `components/stations/Station3_RefactoringGarage.tsx` — Mechanical gears
- `components/stations/Station4_CultureFitLounge.tsx` — Particle orb

### Station Overlays (2D)
- `overlays/LeetCodeOverlay.tsx` — Code problem + Monaco editor + timer
- `overlays/SystemDesignOverlay.tsx` — Architecture challenge + drag components
- `overlays/RefactoringOverlay.tsx` — Split-pane code refactoring
- `overlays/CultureFitOverlay.tsx` — Behavioral question rotator + text input

### Shared UI
- `components/ui/GlassPanel.tsx` — Glassmorphic panel component
- `components/ui/StationCard.tsx` — Station info card on hover
- `components/ui/ScoreBoard.tsx` — Overall performance dashboard
- `components/ui/BackButton.tsx` — Return to hub button

### State
- `store/useAppStore.ts` — Zustand store for active station, scores, completed challenges
- `data/challenges.ts` — Challenge questions/content for each station

---

## Visual Design

### Color Scheme
- Dark theme with deep navy/black background (#0a0a1a)
- Neon accent colors per station:
  - LeetCode: Electric blue (#00d4ff)
  - System Design: Purple (#a855f7)
  - Refactoring: Orange-red (#ea580c)
  - Culture Fit: Emerald green (#10b981)

### Effects
- Bloom post-processing on all station objects
- Floating particles (500+ small dots) in background
- Glassmorphic panels (backdrop-blur + transparency)
- Smooth camera transitions using useFrame interpolation
- Hover glow effects on stations
- Animated text with drei's `<Text>` + glow

### Interactions
- Hover over station → highlight + scale up + show info tooltip
- Click station → camera flies to position + overlay slides in
- Close overlay → camera returns to hub position
- Clickable 3D objects with raycasting
- Leva panel for toggling effects, adjusting scene settings

---

## Project Structure
```
~/projects/agent-sandbox-interview kit/interview-kit/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── store/
│   │   └── useAppStore.ts
│   ├── data/
│   │   └── challenges.ts
│   ├── components/
│   │   ├── Canvas3D.tsx
│   │   ├── Scene.tsx
│   │   ├── GridFloor.tsx
│   │   ├── Lighting.tsx
│   │   ├── ParticleSystem.tsx
│   │   ├── HubCamera.tsx
│   │   ├── stations/
│   │   │   ├── StationPortal.tsx
│   │   │   ├── Station1_LeetCodeArena.tsx
│   │   │   ├── Station2_SystemDesignLab.tsx
│   │   │   ├── Station3_RefactoringGarage.tsx
│   │   │   └── Station4_CultureFitLounge.tsx
│   │   └── ui/
│   │       ├── GlassPanel.tsx
│   │       ├── StationCard.tsx
│   │       ├── ScoreBoard.tsx
│   │       └── BackButton.tsx
│   ├── overlays/
│   │   ├── LeetCodeOverlay.tsx
│   │   ├── SystemDesignOverlay.tsx
│   │   ├── RefactoringOverlay.tsx
│   │   └── CultureFitOverlay.tsx
│   └── styles/
│       └── tailwind.css
```

---

## Implementation Order

1. Bootstrap Vite + React + TypeScript project
2. Install all dependencies
3. Set up Tailwind CSS
4. Create Zustand store
5. Build base 3D canvas with lighting, grid, particles
6. Create 4 station 3D objects with hover/click interactions
7. Implement camera transitions between hub and stations
8. Build overlay components (4 total)
9. Connect overlays to station clicks
10. Add post-processing effects and polish
11. Add Leva settings panel
12. Test, deploy on port 3002

---

## Deployment
- Run on port 3002
- `npm run dev` with `server.host: true` and `server.allowedHosts: true`
- Ensure Vite config allows external tunnel access

---

## Key Gotchas
- Use `import type` for all type imports (verbatimModuleSyntax)
- Leva button callbacks must be wrapped in useCallback
- Vite `allowedHosts: true` required for tunnel URLs
- Three.js objects look smaller than expected — scale up 1.5-2x
- Three.js Vector3 needs strict `[number, number, number]` tuples