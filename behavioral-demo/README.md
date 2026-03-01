# ◆ AGENTIC WORLD — Behavioral Demographics Visualizer

A real-time 3D visualization tool that simulates and visualizes how **5 distinct behavioral user personas** interact with a website. Built with **React**, **Three.js** (via React Three Fiber), and **Zustand** for state management.

Each persona represents a cluster of users with unique browsing behaviors — from aggressive speedsters who blaze through pages to frustrated ragers who spam-click dead zones. Watch them navigate a live website simultaneously, see heatmaps form in real time, and explore per-persona particle sculptures that artistically encode their behavioral metrics.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [View Modes](#view-modes)
- [Personas](#personas)
- [File Reference](#file-reference)
- [Tech Stack](#tech-stack)
- [Scripts](#scripts)

---

## Features

- **5 AI-Driven Agent Cursors** — Each persona moves, clicks, hovers, scrolls, and rage-clicks on the website surface according to unique behavioral parameters.
- **Live Website Testing** — Paste any URL to load it in an iframe; agent cursors simulate interactions on top of it.
- **Real-Time Heatmap** — A canvas-based heatmap overlay accumulates click, hover, scroll, and movement data as the simulation runs.
- **3D Particle Sculptures** — Each persona is represented by a unique animated particle shape (starburst, sphere, streak, grid, chaos) reflecting their behavioral profile.
- **Multiple View Modes** — Switch between Particles, Simulation, and Both views.
- **HUD Dashboard** — Full control panel with persona selectors, speed control, play/pause, heatmap toggle, and detailed behavioral metric bars.
- **Cursor Visual Effects** — Click ripples, hover halos, rage-click particle bursts, and color-coded cursor trails.
- **Screenshot Capture** — Capture website screenshots via Google PageSpeed API or upload screenshots manually.

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 16
- **npm** (or yarn/pnpm)

### Install & Run

```bash
# 1. Navigate to the project directory
cd behavioral-demo

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Production Build

```bash
npm run build     # Type-check + Vite build
npm run preview   # Preview the production build locally
```

---

## Project Structure

```
behavioral-demo/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tsconfig.node.json          # TS config for Node/Vite tooling
│
├── public/                     # Static assets (served as-is)
│
└── src/
    ├── main.tsx                # React entry point — renders <App />
    ├── App.tsx                 # Root component: WebsiteIframe + SceneContainer + HUD
    ├── App.css                 # Global styles (reset, body, scrollbar)
    ├── index.css               # Additional CSS resets
    ├── vite-env.d.ts           # Vite type declarations
    │
    ├── store/
    │   └── useStore.ts         # Zustand global state (mode, personas, speed, URLs, etc.)
    │
    ├── data/
    │   ├── personas.ts         # 5 persona definitions with behavioral metrics & params
    │   └── hotspots.ts         # Website hotspot regions (nav, CTAs, cards, dead-zones)
    │
    ├── engine/
    │   ├── behaviorScripts.ts  # Procedural behavior script generator & sampler
    │   └── shapeGenerators.ts  # 3D particle shape generators (starburst, sphere, etc.)
    │
    └── components/
        ├── SceneContainer.tsx  # Main 3D scene — orchestrates all Three.js canvases
        ├── Arena.tsx           # 3D environment (grid floor, starfield, lighting, orbit controls)
        ├── AgentCursor.tsx     # Per-persona animated cursor with effects & heatmap logging
        ├── CursorEffects.tsx   # Click ripples, hover halos, rage bursts, cursor trails
        ├── ParticleSculpture.tsx  # Per-persona animated 3D particle cloud
        ├── WebsiteSurface.tsx  # 3D plane showing the website (screenshot or fallback wireframe)
        ├── WebsiteIframe.tsx   # Live iframe overlay for real website rendering
        ├── HeatmapOverlay.tsx  # Canvas-texture heatmap rendered on a 3D plane
        ├── HUD.tsx             # Full heads-up-display control panel
        └── HUD.css             # HUD styling (glassmorphism, metric bars, cards)
```

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                        App                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ WebsiteIframe│ │SceneContainer│ │     HUD      │ │
│  │  (z-index 1) │ │  (z-index 2) │ │  (z-index 10)│ │
│  └──────────────┘ └──────┬───────┘ └──────────────┘ │
│                          │                           │
│            ┌─────────────┼──────────────┐            │
│            │             │              │            │
│      SimulationView  BothView      RaceView/Solo     │
│            │             │              │            │
│   ┌────────┴──────┐     ...      ParticleSculpture   │
│   │               │                                  │
│   AgentCursor  HeatmapOverlay                        │
│   │                                                  │
│   └→ CursorEffects (Ripples, Halos, Bursts, Trails)  │
│                                                      │
│   State: Zustand (useStore)                          │
│   Data:  personas.ts + hotspots.ts                   │
│   Engine: behaviorScripts.ts + shapeGenerators.ts    │
└──────────────────────────────────────────────────────┘
```

**Data flow:** The `behaviorScripts.ts` engine generates a procedural 20-second behavior script for each persona based on their `cursorParams` and the website's `hotspots`. Each frame, `AgentCursor` samples the script at the current time to get a position and action, then renders visual effects and pushes data points to the shared `heatmapBuffer`.

---

## View Modes

| Mode           | Description                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **Particles**  | 3D particle sculptures only. **Split View** shows all 5 side by side; **Solo** zooms into one.         |
| **Simulation** | Agent cursors move over the website surface (live iframe or captured screenshot) with heatmap overlay. |
| **Both**       | Combined view — website surface with cursors in the center, small particle sculptures below.           |

---

## Personas

The app ships with **5 pre-defined behavioral personas**, each representing a user cluster:

| #   | Name                     | Color        | User Share | Behavior                                            | Particle Shape |
| --- | ------------------------ | ------------ | ---------- | --------------------------------------------------- | -------------- |
| 0   | **Aggressive Speedster** | 🔴 `#ff2244` | 18%        | Blazing fast, direct paths, zero hesitation         | Starburst      |
| 1   | **Cautious Explorer**    | 🔵 `#4488ff` | 27%        | Slow orbits, long hovers, reads everything          | Sphere         |
| 2   | **Scanner / Skimmer**    | 🟡 `#ffcc00` | 22%        | Ultra-fast scroll, barely clicks                    | Streak         |
| 3   | **Methodical Navigator** | 🟢 `#22cc66` | 20%        | Sequential, structured, visits in order             | Grid           |
| 4   | **Frustrated Rager**     | 🟠 `#ff8800` | 13%        | Rage clicks, erratic movement, high dead-click rate | Chaos          |

Each persona has detailed behavioral metrics (click latency, scroll speed, hesitation frequency, task completion rate, dead click rate) and cursor simulation parameters (move speed, click frequency, hover duration, path interpolation style, and more).

---

## File Reference

### `src/store/useStore.ts`

Global state managed with **Zustand**. Tracks:

- View mode (`particles` / `simulation` / `both`)
- Active persona & display mode (`race` / `solo`)
- Animation state, playback speed
- Website URL, live URL, captured texture
- Heatmap visibility, simulation progress

### `src/data/personas.ts`

Defines the `PersonaConfig` interface and the 5 persona objects. Each persona includes:

- **Metrics** — `avgClickLatencyMs`, `scrollSpeedPxS`, `hesitationFrequency`, `clickToScrollRatio`, `taskCompletionRate`, `deadClickRate`
- **Cursor Params** — `moveSpeed`, `clickFrequency`, `hoverDuration`, `hesitationChance`, `rageClickChance`, `pathStyle`, `trailIntensity`
- **Sculpture Params** — `shape`, `jitterIntensity`, `animationSpeed`, `spread`, `spikeLength`

### `src/data/hotspots.ts`

Defines interactive regions on the website surface in normalized (0–1) coordinates. Types include `cta`, `nav`, `text`, `image`, `link`, and `dead-zone`. Each hotspot has a `priority` value that personas use for probabilistic targeting.

### `src/engine/behaviorScripts.ts`

- `generateScript(persona)` — Procedurally generates a looping 20-second behavior script (array of `BehaviorStep`s) by visiting weighted hotspots with persona-specific timing.
- `sampleScript(steps, time)` — Samples the script at any point in time, smoothly interpolating movement with Hermite smoothstep.
- Supports action types: `move`, `click`, `hover`, `scroll`, `rage-click`, `idle`.

### `src/engine/shapeGenerators.ts`

- `generatePositions(persona)` — Creates target positions for 800 particles in one of 5 shapes: **starburst** (sharp spikes + core), **sphere** (uniform volume), **streak** (flat horizontal band), **grid** (3D lattice), **chaos** (erratic cloud).
- `generateSizes(persona)` — Per-particle sizing tuned to each shape type.

### `src/components/SceneContainer.tsx`

Top-level scene orchestrator. Renders different Three.js `<Canvas>` setups depending on the current view mode:

- `SimulationView` — Camera locked, cursors over website surface, heatmap overlay
- `BothView` — Orbitable scene with website + cursors + particle sculptures
- `RaceView` — 5 particle sculptures side by side
- `SoloView` — Single enlarged particle sculpture

### `src/components/AgentCursor.tsx`

Animated cursor for each persona. Each frame:

1. Samples the persona's behavior script
2. Moves the cursor to the interpolated world position
3. Triggers visual effects (ripples, halos, rage bursts) on action transitions
4. Pushes position data to the heatmap buffer
5. Applies camera shake on rage-click events

### `src/components/CursorEffects.tsx`

Reusable Three.js visual effects:

- `ClickRipple` — Expanding ring that fades on click
- `HoverHalo` — Rotating glowing ring during hover
- `RageBurst` — Particle explosion on rage-clicks
- `CursorTrail` — Line trail following cursor movement

### `src/components/ParticleSculpture.tsx`

Renders 800 particles per persona. Particles:

- Start at random positions and lerp toward their target shape
- Apply per-frame jitter based on persona's `jitterIntensity`
- Slowly rotate for visual flair
- Display persona name and cluster label as floating text

### `src/components/WebsiteSurface.tsx`

3D plane in the Three.js scene that displays:

- A captured screenshot texture, OR
- A fallback wireframe with labeled hotspot regions

Includes `normalizedToWorld()` and `hotspotToWorld()` coordinate conversion utilities used throughout the system.

### `src/components/WebsiteIframe.tsx`

Renders the live website inside an iframe (75vw × 80vh) when a URL is set. Pointer events are disabled during simulation so cursors aren't blocked.

### `src/components/HeatmapOverlay.tsx`

Canvas-based heatmap rendered to a Three.js texture. Draws radial gradients at cursor positions with type-specific colors and sizes (clicks, hovers, scrolls, rage-clicks). Uses a shared `heatmapBuffer` array that `AgentCursor` pushes to.

### `src/components/HUD.tsx`

Heads-Up Display with:

- **Top bar** — Logo, view mode toggles (Particles / Simulation / Both), play/pause, cursor mode, heatmap controls, speed slider
- **URL input bar** — Live embed, screenshot capture (Google PageSpeed API / thum.io), file upload, reset
- **Persona cards** — Bottom-center selectable cards showing name, cluster, and user share
- **Persona detail panel** — Metric bars (click latency, scroll speed, hesitation, completion rate, dead clicks)

### `src/components/Arena.tsx`

3D environment setup: ambient & directional lighting, cyberpunk grid floor, starfield background, night environment for reflections, and orbit camera controls.

---

## Tech Stack

| Technology              | Purpose                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| **React 18**            | UI framework                                                      |
| **TypeScript**          | Type safety                                                       |
| **Vite**                | Build tool & dev server                                           |
| **Three.js**            | 3D rendering engine                                               |
| **@react-three/fiber**  | React renderer for Three.js                                       |
| **@react-three/drei**   | Useful Three.js helpers (Text, Stars, Grid, Float, OrbitControls) |
| **@react-spring/three** | Spring animations for Three.js objects                            |
| **Zustand**             | Lightweight global state management                               |
| **ESLint**              | Code linting                                                      |

---

## Scripts

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR                  |
| `npm run build`   | Type-check with `tsc` then build for production |
| `npm run lint`    | Run ESLint across all `.ts` / `.tsx` files      |
| `npm run preview` | Preview the production build locally            |

---

## Usage Guide

1. **Start the app** — Run `npm run dev` and open `http://localhost:5173`.
2. **Choose a view mode** — Click **SIMULATION** in the top bar to see agent cursors on a website.
3. **Enter a URL** — Paste a website URL and click **🌐 LIVE** to embed it, or **📷 CAPTURE** for a static screenshot.
4. **Hit Play** — Click **▶ PLAY** to start the simulation. All 5 agent cursors begin navigating.
5. **Toggle heatmap** — Click **🔥 HEATMAP** to show/hide the interaction heatmap overlay.
6. **Focus a persona** — Click any persona card at the bottom to isolate a single agent.
7. **Explore particles** — Switch to **PARTICLES** mode and use **SPLIT VIEW** or **SOLO** to admire the 3D sculptures.
8. **Adjust speed** — Use the speed slider (0.2x – 3.0x) to slow down or speed up the simulation.

---

## License

This project is part of the **Mistral Hackathon** and is provided as-is for demonstration purposes.
