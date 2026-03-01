import { create } from 'zustand';
import * as THREE from 'three';

interface AppState {
  /** 'race' = all 5 side-by-side, 'solo' = one at a time */
  mode: 'race' | 'solo';
  /** Which persona is focused in solo mode (null = all in race) */
  activePersona: number | null;
  /** Is the particle animation playing */
  isAnimating: boolean;
  /** Playback speed multiplier */
  speed: number;
  /** Auto-rotate through personas */
  autoRotate: boolean;

  /** View mode: particles, simulation, or both */
  viewMode: 'particles' | 'simulation' | 'both';
  /** Show all 5 cursors or only the active persona */
  showAllCursors: boolean;
  /** Is the cursor simulation running */
  simulationRunning: boolean;
  /** 0-1 progress through behavior scripts */
  simulationProgress: number;
  /** Website texture for the 3D surface */
  websiteTexture: THREE.Texture | null;
  /** Current URL being displayed */
  websiteUrl: string;
  /** Whether URL capture is in progress */
  isCapturing: boolean;

  /** Live URL for iframe-based website surface */
  liveUrl: string;
  /** Whether the heatmap overlay is visible */
  heatmapVisible: boolean;

  // Actions
  setMode: (mode: 'race' | 'solo') => void;
  setActivePersona: (id: number | null) => void;
  toggleAnimation: () => void;
  setSpeed: (speed: number) => void;
  setAutoRotate: (val: boolean) => void;
  selectPersona: (id: number) => void;
  setViewMode: (viewMode: 'particles' | 'simulation' | 'both') => void;
  setShowAllCursors: (val: boolean) => void;
  toggleSimulation: () => void;
  setSimulationProgress: (progress: number) => void;
  setWebsiteTexture: (texture: THREE.Texture | null) => void;
  setWebsiteUrl: (url: string) => void;
  setIsCapturing: (val: boolean) => void;
  setLiveUrl: (url: string) => void;
  setHeatmapVisible: (val: boolean) => void;
  toggleHeatmap: () => void;
}

export const useStore = create<AppState>()((set) => ({
  mode: 'race',
  activePersona: null,
  isAnimating: true,
  speed: 1,
  autoRotate: false,

  viewMode: 'simulation',
  showAllCursors: true,
  simulationRunning: false,
  simulationProgress: 0,
  websiteTexture: null,
  websiteUrl: 'https://fun-city-xi.vercel.app/',
  isCapturing: false,
  liveUrl: 'https://fun-city-xi.vercel.app/',
  heatmapVisible: true,

  setMode: (mode) => set({ mode, activePersona: mode === 'race' ? null : 0 }),
  setActivePersona: (id) => set({ activePersona: id }),
  toggleAnimation: () => set((s) => ({ isAnimating: !s.isAnimating })),
  setSpeed: (speed) => set({ speed }),
  setAutoRotate: (val) => set({ autoRotate: val }),
  selectPersona: (id) => set({ mode: 'solo', activePersona: id }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowAllCursors: (val) => set({ showAllCursors: val }),
  toggleSimulation: () => set((s) => ({ simulationRunning: !s.simulationRunning })),
  setSimulationProgress: (progress) => set({ simulationProgress: progress }),
  setWebsiteTexture: (texture) => set({ websiteTexture: texture }),
  setWebsiteUrl: (url) => set({ websiteUrl: url }),
  setIsCapturing: (val) => set({ isCapturing: val }),
  setLiveUrl: (url) => set({ liveUrl: url }),
  setHeatmapVisible: (val) => set({ heatmapVisible: val }),
  toggleHeatmap: () => set((s) => ({ heatmapVisible: !s.heatmapVisible })),
}));
