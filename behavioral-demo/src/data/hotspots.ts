export interface Hotspot {
  id: string;
  /** Normalized x position (0-1, left to right) */
  x: number;
  /** Normalized y position (0-1, top to bottom) */
  y: number;
  /** Normalized width (0-1) */
  w: number;
  /** Normalized height (0-1) */
  h: number;
  /** Type of element */
  type: 'cta' | 'nav' | 'text' | 'image' | 'link' | 'dead-zone';
  /** Relative priority for targeting by personas (higher = more likely) */
  priority: number;
}

export const DEFAULT_HOTSPOTS: Hotspot[] = [
  // Top nav bar
  { id: 'nav-logo', x: 0.02, y: 0.01, w: 0.12, h: 0.05, type: 'nav', priority: 3 },
  { id: 'nav-boroughs', x: 0.15, y: 0.01, w: 0.1, h: 0.05, type: 'nav', priority: 5 },
  { id: 'nav-topics', x: 0.27, y: 0.01, w: 0.08, h: 0.05, type: 'nav', priority: 5 },

  // Borough filter pills / tabs
  { id: 'filter-manhattan', x: 0.05, y: 0.08, w: 0.12, h: 0.04, type: 'cta', priority: 8 },
  { id: 'filter-brooklyn', x: 0.19, y: 0.08, w: 0.11, h: 0.04, type: 'cta', priority: 7 },
  { id: 'filter-queens', x: 0.32, y: 0.08, w: 0.09, h: 0.04, type: 'cta', priority: 6 },
  { id: 'filter-bronx', x: 0.43, y: 0.08, w: 0.09, h: 0.04, type: 'cta', priority: 5 },
  { id: 'filter-staten', x: 0.54, y: 0.08, w: 0.12, h: 0.04, type: 'cta', priority: 4 },

  // Discovery cards - row 1
  { id: 'card-1', x: 0.03, y: 0.15, w: 0.3, h: 0.22, type: 'link', priority: 7 },
  { id: 'card-2', x: 0.35, y: 0.15, w: 0.3, h: 0.22, type: 'link', priority: 7 },
  { id: 'card-3', x: 0.67, y: 0.15, w: 0.3, h: 0.22, type: 'link', priority: 6 },

  // Discovery cards - row 2
  { id: 'card-4', x: 0.03, y: 0.4, w: 0.3, h: 0.22, type: 'link', priority: 6 },
  { id: 'card-5', x: 0.35, y: 0.4, w: 0.3, h: 0.22, type: 'link', priority: 5 },
  { id: 'card-6', x: 0.67, y: 0.4, w: 0.3, h: 0.22, type: 'link', priority: 5 },

  // Discovery cards - row 3
  { id: 'card-7', x: 0.03, y: 0.65, w: 0.3, h: 0.22, type: 'link', priority: 4 },
  { id: 'card-8', x: 0.35, y: 0.65, w: 0.3, h: 0.22, type: 'link', priority: 4 },
  { id: 'card-9', x: 0.67, y: 0.65, w: 0.3, h: 0.22, type: 'link', priority: 3 },

  // Scroll/dead zones
  { id: 'sidebar-dead', x: 0.0, y: 0.3, w: 0.03, h: 0.6, type: 'dead-zone', priority: 1 },
  { id: 'footer', x: 0.0, y: 0.92, w: 1.0, h: 0.08, type: 'dead-zone', priority: 1 },
];
