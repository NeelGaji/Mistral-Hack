import { PersonaConfig } from '../data/personas';

/**
 * Raw cluster data shape from NVIDIA sandbox API.
 * Adjust field names to match your actual API response.
 */
export interface RawClusterData {
  cluster_id: number;
  cluster_label?: string;
  name?: string;
  user_share?: number;
  /** Behavioral metrics from the API */
  avg_click_latency_ms?: number;
  scroll_speed_px_s?: number;
  hesitation_frequency?: number;
  click_to_scroll_ratio?: number;
  task_completion_rate?: number;
  dead_click_rate?: number;
  /** Optional: pre-computed cursor params from API */
  move_speed?: number;
  click_frequency?: number;
  hover_duration_ms?: number;
  rage_click_chance?: number;
  path_style?: string;
}

/** Default colors for up to 10 clusters */
const CLUSTER_COLORS = [
  '#ff2244', '#4488ff', '#ffcc00', '#22cc66', '#ff8800',
  '#cc44ff', '#44ffcc', '#ff4488', '#88ff44', '#4444ff',
];

const CLUSTER_EMISSIVES = [
  '#ff0022', '#2266ff', '#ffaa00', '#11aa44', '#ff6600',
  '#aa22ff', '#22ffaa', '#ff2266', '#66ff22', '#2222ff',
];

/** Persona name templates based on behavioral patterns */
const NAME_TEMPLATES = [
  'Aggressive Speedster',
  'Cautious Explorer',
  'Scanner / Skimmer',
  'Methodical Navigator',
  'Frustrated Rager',
  'Power User',
  'Wandering Browser',
  'Focused Converter',
  'Bounce Risk',
  'Silent Observer',
];

/**
 * Derive cursorParams from raw behavioral metrics.
 * Maps raw numbers to simulation-friendly ranges.
 */
function deriveCursorParams(raw: RawClusterData): PersonaConfig['cursorParams'] {
  const latency = raw.avg_click_latency_ms ?? 1000;
  const scrollSpeed = raw.scroll_speed_px_s ?? 1500;
  const hesitation = raw.hesitation_frequency ?? 0.3;
  const deadClickRate = raw.dead_click_rate ?? 0.05;

  // Derive moveSpeed: fast clicks → fast cursor
  const moveSpeed = raw.move_speed ?? Math.max(0.2, Math.min(2.0, 2.0 - (latency / 3000)));

  // Derive clickFrequency: inverse of latency
  const clickFrequency = raw.click_frequency ?? Math.max(0.1, Math.min(4.0, 1000 / latency));

  // Derive hoverDuration from hesitation
  const hoverDuration = raw.hover_duration_ms ?? Math.max(80, latency * hesitation);

  // Derive rageClickChance from dead click rate
  const rageClickChance = raw.rage_click_chance ?? Math.min(0.7, deadClickRate * 2.5);

  // Derive path style from behavioral metrics
  let pathStyle: PersonaConfig['cursorParams']['pathStyle'] = 'curved';
  if (raw.path_style) {
    pathStyle = raw.path_style as any;
  } else if (latency < 200 && deadClickRate < 0.05) {
    pathStyle = 'direct';
  } else if (scrollSpeed > 4000) {
    pathStyle = 'vertical-sweep';
  } else if (hesitation < 0.15 && deadClickRate > 0.15) {
    pathStyle = 'erratic';
  } else if (hesitation > 0.6) {
    pathStyle = 'curved';
  } else {
    pathStyle = 'sequential';
  }

  // Trail intensity: slower/more cautious = more visible trail
  const trailIntensity = Math.max(0.1, Math.min(0.8, hesitation * 0.7 + 0.1));

  return {
    moveSpeed,
    clickFrequency,
    hoverDuration,
    hesitationChance: hesitation,
    rageClickChance,
    pathStyle,
    trailIntensity,
  };
}

/**
 * Map a single raw cluster to a PersonaConfig.
 */
export function mapClusterToPersona(raw: RawClusterData, index: number): PersonaConfig {
  return {
    id: raw.cluster_id ?? index,
    name: raw.name ?? NAME_TEMPLATES[index % NAME_TEMPLATES.length],
    color: CLUSTER_COLORS[index % CLUSTER_COLORS.length],
    emissive: CLUSTER_EMISSIVES[index % CLUSTER_EMISSIVES.length],
    description: `Behavioral cluster ${raw.cluster_label ?? index} from NVIDIA sandbox`,
    clusterLabel: raw.cluster_label ?? `Cluster ${index}`,
    userShare: raw.user_share ?? Math.round(100 / 5),
    metrics: {
      avgClickLatencyMs: raw.avg_click_latency_ms ?? 1000,
      scrollSpeedPxS: raw.scroll_speed_px_s ?? 1500,
      hesitationFrequency: raw.hesitation_frequency ?? 0.3,
      clickToScrollRatio: raw.click_to_scroll_ratio ?? 0.5,
      taskCompletionRate: raw.task_completion_rate ?? 0.7,
      deadClickRate: raw.dead_click_rate ?? 0.05,
    },
    cursorParams: deriveCursorParams(raw),
    sculptureParams: {
      shape: (['starburst', 'sphere', 'streak', 'grid', 'chaos'] as const)[index % 5],
      jitterIntensity: 0.05 + (raw.dead_click_rate ?? 0.05) * 0.5,
      animationSpeed: 0.5 + (raw.scroll_speed_px_s ?? 1500) / 2000,
      spread: 2.0 + (index % 3) * 0.3,
    },
  };
}

/**
 * Fetch personas from a REST API endpoint.
 * Expects response to be JSON with either:
 *   - An array of RawClusterData directly
 *   - An object with a `clusters` or `personas` or `data` array field
 */
export async function fetchPersonas(endpoint: string): Promise<PersonaConfig[]> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`API returned ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  // Try to find the array of clusters in common response shapes
  let rawClusters: RawClusterData[];
  if (Array.isArray(json)) {
    rawClusters = json;
  } else if (Array.isArray(json.clusters)) {
    rawClusters = json.clusters;
  } else if (Array.isArray(json.personas)) {
    rawClusters = json.personas;
  } else if (Array.isArray(json.data)) {
    rawClusters = json.data;
  } else {
    throw new Error('Unexpected API response shape — expected array or object with clusters/personas/data field');
  }

  if (rawClusters.length === 0) {
    throw new Error('API returned empty cluster array');
  }

  return rawClusters.map((raw, i) => mapClusterToPersona(raw, i));
}
