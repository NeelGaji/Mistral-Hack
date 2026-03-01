/** 
 * Hotspot regions on the website surface.
 * Coordinates are normalized 0-1 (top-left origin).
 * These represent interactive UI elements cursors can target.
 */
export interface Hotspot {
  id: string;
  label: string;
  /** Normalized x (0 = left, 1 = right) */
  x: number;
  /** Normalized y (0 = top, 1 = bottom) */
  y: number;
  /** Normalized width */
  w: number;
  /** Normalized height */
  h: number;
  /** Element type affects cursor behavior */
  type: 'nav' | 'cta' | 'text' | 'image' | 'card' | 'input' | 'link';
  /** Priority weight — higher = more likely to be visited */
  priority: number;
}

export const DEFAULT_HOTSPOTS: Hotspot[] = [
  // Navigation bar
  { id: 'nav-logo', label: 'Logo', x: 0.03, y: 0.02, w: 0.1, h: 0.05, type: 'nav', priority: 2 },
  { id: 'nav-features', label: 'Features', x: 0.35, y: 0.02, w: 0.08, h: 0.04, type: 'nav', priority: 5 },
  { id: 'nav-pricing', label: 'Pricing', x: 0.45, y: 0.02, w: 0.08, h: 0.04, type: 'nav', priority: 7 },
  { id: 'nav-docs', label: 'Docs', x: 0.55, y: 0.02, w: 0.06, h: 0.04, type: 'nav', priority: 3 },
  { id: 'nav-login', label: 'Login', x: 0.82, y: 0.02, w: 0.07, h: 0.04, type: 'link', priority: 4 },
  { id: 'nav-signup', label: 'Sign Up', x: 0.91, y: 0.02, w: 0.07, h: 0.04, type: 'cta', priority: 8 },

  // Hero section
  { id: 'hero-title', label: 'Hero Title', x: 0.15, y: 0.12, w: 0.7, h: 0.08, type: 'text', priority: 3 },
  { id: 'hero-subtitle', label: 'Hero Subtitle', x: 0.2, y: 0.22, w: 0.6, h: 0.05, type: 'text', priority: 2 },
  { id: 'hero-cta', label: 'Get Started', x: 0.35, y: 0.3, w: 0.14, h: 0.05, type: 'cta', priority: 10 },
  { id: 'hero-secondary', label: 'Learn More', x: 0.52, y: 0.3, w: 0.12, h: 0.05, type: 'link', priority: 5 },
  { id: 'hero-image', label: 'Hero Image', x: 0.1, y: 0.38, w: 0.8, h: 0.2, type: 'image', priority: 1 },

  // Feature cards
  { id: 'card-1', label: 'Feature 1', x: 0.05, y: 0.62, w: 0.27, h: 0.15, type: 'card', priority: 6 },
  { id: 'card-2', label: 'Feature 2', x: 0.37, y: 0.62, w: 0.27, h: 0.15, type: 'card', priority: 6 },
  { id: 'card-3', label: 'Feature 3', x: 0.68, y: 0.62, w: 0.27, h: 0.15, type: 'card', priority: 6 },

  // Bottom CTA
  { id: 'bottom-cta', label: 'Start Free Trial', x: 0.3, y: 0.84, w: 0.4, h: 0.06, type: 'cta', priority: 9 },

  // Footer links
  { id: 'footer-1', label: 'Terms', x: 0.1, y: 0.94, w: 0.08, h: 0.03, type: 'link', priority: 1 },
  { id: 'footer-2', label: 'Privacy', x: 0.2, y: 0.94, w: 0.08, h: 0.03, type: 'link', priority: 1 },
  { id: 'footer-3', label: 'Contact', x: 0.3, y: 0.94, w: 0.08, h: 0.03, type: 'link', priority: 2 },
];
