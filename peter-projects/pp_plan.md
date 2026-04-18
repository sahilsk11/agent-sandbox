# Petey's EDC Projects — Interactive 3D Showcase

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a React + Vite web app where Petey can interactively visualize and configure selected EDC + Pi desk projects in 3D with animated parts, Leva GUI controls, and orbit/zoom interaction.

**Architecture:** Single-page React app with a 3D canvas (React Three Fiber). Each project is a separate 3D scene component loaded via a project selector. Leva panels provide per-project controls (color, animation toggles, exploded view, etc.). Routes for each project + a home/gallery page showing all previews in a grid.

**Tech Stack:**
- **Vite + React + TypeScript** — fast dev server, modern tooling
- **@react-three/fiber** — Three.js renderer for React
- **@react-three/drei** — helpers: OrbitControls, Environment, Text, RoundedBox, etc.
- **leva** — floating GUI control panels (sliders, color pickers, buttons)
- **@react-three/rapier** — optional physics (for flag drop, etc.)
- **zustand** — light state management for project selection/settings
- **framer-motion** — UI panel transitions between projects

---

## Project Structure

```
petey-edc-showcase/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Router + layout
│   ├── pages/
│   │   ├── HomePage.tsx           # Gallery grid of all projects
│   │   └── ProjectPage.tsx        # Single project viewer with 3D canvas + Leva
│   ├── components/
│   │   ├── Navigation.tsx         # Top nav with project selector tabs
│   │   ├── ProjectCard.tsx        # Gallery card with mini 3D preview
│   │   └── Canvas3D.tsx           # Reusable Canvas wrapper with controls
│   ├── scenes/
│   │   ├── AnalogClock.tsx        # 3D animated clock with gears + real-time hands
│   │   ├── NotificationFlag.tsx   # Flag box with interactive button controls
│   │   ├── AnodizedPen.tsx        # Pen with voltage→color anodization control
│   │   ├── KeyOrganizer.tsx       # Layered key holder with exploded view toggle
│   │   └── WeatherOrb.tsx         # Rotating orb with weather-driven color
│   ├── shared/
│   │   ├── Lighting.tsx           # Shared studio lighting setup
│   │   ├── GridFloor.tsx          # Optional grid floor helper
│   │   └── Materials.tsx          # Shared PBR material presets (Ti, Al, brass, etc.)
│   └── store.ts                   # Zustand store for project settings
├── public/
└── .gitignore
```

---

## Task 1: Bootstrap Vite + React + TypeScript Project

**Objective:** Scaffold the project with Vite, React, and TypeScript.

**Steps:**
1. Create project directory `petey-edc-showcase/`
2. Initialize with `npm create vite@latest . -- --template react-ts`
3. Install dependencies:
```bash
npm install three @types/three @react-three/fiber @react-three/drei leva zustand framer-motion
```
4. Verify: `npm run dev` should start the dev server
5. Replace default App.tsx with a minimal hello

**Files:**
- Create: full project via `npm create vite`
- Modify: `package.json` (dependencies added)
- Modify: `src/App.tsx` (minimal content)

**Verification:** `npm run dev` loads with no errors on default Vite port.

---

## Task 2: Set Up App Layout, Navigation, and Routing

**Objective:** Create the app shell with navigation and project switching.

**Steps:**
1. Create `src/App.tsx` with:
   - A top navigation bar showing project tabs (Gallery + 5 projects)
   - A main content area that renders either the HomePage or the active ProjectPage
   - No router needed — use a single-page state-driven approach for simplicity (switch projects via state)
2. Create `src/components/Navigation.tsx`:
   - Horizontal tab bar: "Gallery" | "Clock" | "Flag Box" | "Pen" | "Key Organizer" | "Weather Orb"
   - Active tab highlighted
   - Clicking a tab switches the active project
3. Create `src/store.ts` with Zustand:
```typescript
import { create } from 'zustand'

export type ProjectId = 'gallery' | 'clock' | 'flag' | 'pen' | 'organizer' | 'orb'

interface AppState {
  activeProject: ProjectId
  setActiveProject: (id: ProjectId) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeProject: 'gallery',
  setActiveProject: (id) => set({ activeProject: id }),
}))
```
4. Create `src/pages/HomePage.tsx` — just a placeholder with the project cards
5. Create `src/pages/ProjectPage.tsx` — a full-screen Canvas that renders the active scene

**Verification:** Navigation tabs work, switching between "Gallery" and placeholder project screens.

---

## Task 3: HomePage — Gallery Grid with Project Previews

**Objective:** Build the gallery page showing all projects as interactive 3D preview cards.

**Steps:**
1. Create `src/components/ProjectCard.tsx`:
   - Card with a mini 3D Canvas showing a simplified/rotating preview of the project
   - Project name and short description
   - Click navigating to the full project view
   - Hover effect (scale up slightly with framer-motion)
2. Create the gallery layout grid in `src/pages/HomePage.tsx`:
   - CSS Grid: 2-3 columns responsive
   - Each card uses ProjectCard with the project's scene component
   - Card data array: id, name, description, preview component, icon emoji
3. Add project descriptions that match the EDC project details

**Project Card Data:**
```typescript
const projects = [
  { id: 'clock', name: 'Analog Desktop Clock', description: 'Stepper-driven analog clock with real-time hand movement and gear trains.', icon: '🕐' },
  { id: 'flag', name: 'Notification Flag Box', description: 'Mechanical mailbox flag that rises when you get new emails.', icon: '📬' },
  { id: 'pen', name: 'Anodized Titanium Pen', description: 'Voltage-controlled interference color anodizer sim. Twist and configure.', icon: '🖊️' },
  { id: 'organizer', name: 'CNC Titanium Key Organizer', description: 'Slim layered key holder with exploded view and material configs.', icon: '🔑' },
  { id: 'orb', name: 'Weather Orb', description: 'Ambient rotating sphere that glows based on real-time weather.', icon: '🌍' },
]
```

**Verification:** Gallery renders with 5 cards, clicking a card switches to its project page.

---

## Task 4: Shared 3D Components — Lighting, Grid, Materials

**Objective:** Create reusable 3D scene setup components.

**Steps:**
1. Create `src/shared/Lighting.tsx`:
   - Studio-quality 3-point lighting setup (key, fill, rim)
   - Ambient light for base illumination
   - Environment map via drei `<Environment preset="studio" />`
2. Create `src/shared/GridFloor.tsx`:
   - Subtle grid ground plane (optional toggle)
   - Uses drei `<Grid>` helper
3. Create `src/shared/Materials.tsx`:
   - PBR material presets as functions/configs:
     - `titaniumMaterial`: brushed metal look (high roughness, slight cool tint)
     - `aluminumMaterial`: matte aluminum
     - `brassMaterial`: warm brass/gold
     - `steelMaterial`: dark steel
     - `g10Material`: dark green composite
4. Create `src/components/Canvas3D.tsx`:
   - Wrapper around `<Canvas>` with:
     - Shadows enabled
     - OrbitControls from drei
     - Default camera position
     - Lighting + optional grid
     - Children render inside

**Verification:** All shared components render consistently across scenes. Canvas supports orbiting, panning, zooming.

---

## Task 5: Scene — Analog Desktop Clock

**Objective:** Build the 3D animated clock scene with real-time hand movement.

**Steps:**
1. Create `src/scenes/AnalogClock.tsx`:
   - Clock face: circular geometry with hour markers (12 raised lines around the perimeter)
   - Three hands: hour, minute, second — box geometries with different lengths/thicknesses
   - useFrame hook to read current time and rotate hands to correct angles
   - Center pivot with a decorative pin
   - Gear train visible on the back or as a cross-section option
2. Add Leva controls:
   - Toggle: sweep vs tick mode (smooth continuous vs discrete jumps)
   - Slider: clock size (scale 0.5 - 2.0)
   - Color picker: face color
   - Color picker: hand colors
   - Toggle: show gear train (behind the clock)
   - Color picker: material finish (brushed, polished, dark)
3. Animate the hands using `useFrame((state) => { const now = new Date(); ... })` to set rotation.y on each hand mesh

**Clock Math:**
- Hour hand: `(hours % 12) / 12 * 2π` + minute fraction
- Minute hand: `minutes / 60 * 2π`
- Second hand: `seconds / 60 * 2π` (or continuous for sweep mode)
- Hands point UP at 12 o'clock, rotation.y is clockwise

**Verification:** Clock renders, hands move in real-time, Leva controls work. Orbit/zoom works.

---

## Task 6: Scene — Notification Flag Box

**Objective:** Build the interactive mailbox with animated flag mechanism.

**Steps:**
1. Create `src/scenes/NotificationFlag.tsx`:
   - Mailbox body: rounded box with curved top (drei `<RoundedBox>` or lathe geometry)
   - Flag arm: thin box attached to a pivot point (hinge on the side)
   - Flag paddle: rectangle on the end of the arm (red)
   - Hinge visual detail (cylinder through the flag arm)
   - Post/base pillar underneath
2. Animation:
   - useFrame lerps the flag angle between 0° (down) and 90° (up) based on a state flag
   - Smooth spring-like transition (not instant)
   - When flag goes up, a subtle sound effect or screen flash
3. Add Leva controls:
   - Toggle button: Raise/Lower flag (the main interaction)
   - Slider: animation speed
   - Toggle: auto-cycle mode (flag bounces up/down every 3 seconds)
   - Color picker: mailbox body color
   - Color picker: flag color
   - Toggle: LED glow inside mailbox
4. Add a "Check Mail" button in the Leva panel that randomly toggles the flag to simulate checking notifications

**Verification:** Flag animates smoothly up and down, controls work, mailbox looks good.

---

## Task 7: Scene — Anodized Titanium Pen

**Objective:** Build the pen with voltage-driven anodization color simulation.

**Steps:**
1. Create `src/scenes/AnodizedPen.tsx`:
   - Pen body: cylinder geometry with caps (lathe for a more realistic pen profile)
   - Pen tip: cone geometry (brass/gold)
   - Click mechanism on top (cylinder)
   - Pocket clip: thin curved shape on the side
   - Pen refill visible through transparent section (optional)
2. Key feature: Anodization color simulation
   - A voltage slider (0V - 110V) maps to color via the Ti anodization curve:
     - 0-10V: clear/natural Ti (silver-gray)
     - 11-19V: bronze/gold
     - 20-29V: purple
     - 30-39V: deep blue
     - 40-49V: light blue
     - 50-59V: green
     - 60-69V: yellow
     - 70-79V: pink/magenta
     - 80-89V: deep purple
     - 90-99V: blue
     - 100-110V: green/gold
   - Color change affects ONLY the pen body (not clips, tip, or mechanism)
3. Add Leva controls:
   - Slider: voltage (0-110V) with live color update
   - Display: current color name
   - Toggle: show voltage-to-color reference chart as an overlay
   - Color picker: clip material
   - Color picker: tip material
   - Slider: pen length (short EDC vs full size)
   - Toggle: explode view (separates pen into components)

**Verification:** Pen rotates on display, voltage slider smoothly changes color, explode view separates parts.

---

## Task 8: Scene — CNC Key Organizer

**Objective:** Build the layered key organizer with material and exploded view controls.

**Steps:**
1. Create `src/scenes/KeyOrganizer.tsx`:
   - Two main plates: rounded rectangles with key-shaped cutouts (can use extruded shapes or simple boxes for MVP)
   - Bolts/standoffs: cylinders at corners
   - Keys between plates: simple key shapes (extruded silhouettes) for visual reference
   - Center bolt: single bolt to hold plates together
2. Add Leva controls:
   - Toggle: exploded view (separates plates vertically, spreading bolts and keys)
   - Color picker: plate material (Ti = silver, Al = gunmetal, raw brass)
   - Color picker: bolt color
   - Slider: plate thickness
   - Slider: gap between plates (how far apart the keys are)
   - Slider: rotation speed (auto-spin on display)
3. Material switching:
   - Titanium: light blue-gray, high reflectivity
   - 7075 Aluminum: dark gray, matte
   - 6061 Aluminum: lighter gray
   - Each material changes body color, bolt color, and reflectivity

**Verification:** Organizer renders, explode view works, material switching looks distinct.

---

## Task 9: Scene — Weather Orb

**Objective:** Build the rotating globe with ambient color mapping based on weather data.

**Steps:**
1. Create `src/scenes/WeatherOrb.tsx`:
   - Sphere geometry as the orb
   - Inner glow sphere (slightly smaller, emissive)
   - Orbital ring: torus around the sphere
   - Small marker "planets" on the orbit (spheres following the ring path)
   - Base/stand for the orb to sit on
   - Optional: 3D printed-texture look on the orb surface
2. Animation:
   - Slowly rotating sphere (useFrame, very slow rotation.y)
   - Color changes based on a temperature slider
   - Pulsing intensity based on a "wind" parameter
   - Ring markers orbit around the sphere
3. Add Leva controls:
   - Slider: temperature (-20°C to 50°C) → maps to color (blue=cold, green=mild, red=hot)
   - Slider: wind speed (0-100 km/h) → pulse speed
   - Toggle: orbit animation on/off
   - Color picker: base/stand color
   - Toggle: show inner glow
   - Slider: rotation speed
4. Color mapping:
   - Cold (blue, #4A90D9) at -20°C
   - Green (#4CAF50) at 20°C
   - Orange (#FF9800) at 35°C
   - Red (#F44336) at 50°C
   - Interpolate between these for smooth transitions

**Verification:** Orb renders and rotates smoothly, temperature slider changes color, pulse animation works.

---

## Task 10: Polish — Loading States, Responsiveness, and Cleanup

**Objective:** Final polishing pass for a production-quality feel.

**Steps:**
1. Add loading state:
   - A simple spinner or animated skeleton while 3D scenes load
   - Canvas `<Suspense>` with a React fallback component
2. Make it responsive:
   - Canvas adapts to viewport size
   - Navigation collapses or scrolls on mobile
   - Gallery grid goes to single column on narrow screens
3. Add a subtle background:
   - Dark gradient background for the app (dark mode first)
   - Canvas background matches the app theme
4. Add keyboard shortcuts:
   - 1-5 for projects, G for gallery
5. Add a "Reset View" button on each project that resets camera
6. Verify all scenes work together — switching between projects doesn't leak state

**Files:**
- Modify: `src/App.tsx` (add loading states, keyboard handler)
- Modify: `src/index.css` (global dark theme, responsive styles)
- Modify: each scene component (reset view integration)

**Verification:** Smooth transitions between projects, responsive on all viewports, no console errors.
