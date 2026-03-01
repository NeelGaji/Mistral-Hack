export interface PersonaConfig {
  id: number;
  name: string;
  color: string;
  emissive: string;
  description: string;
  clusterLabel: string;
  /** Percentage of users in this cluster */
  userShare: number;
  /** Behavioral metrics */
  metrics: {
    avgClickLatencyMs: number;
    scrollSpeedPxS: number;
    hesitationFrequency: number;
    clickToScrollRatio: number;
    taskCompletionRate: number;
    deadClickRate: number;
  };
  /** Cursor simulation behavior params */
  cursorParams: {
    /** Movement speed in normalized units per second */
    moveSpeed: number;
    /** Average clicks per second */
    clickFrequency: number;
    /** Average hover duration in ms */
    hoverDuration: number;
    /** Probability 0-1 of pausing before an action */
    hesitationChance: number;
    /** Probability 0-1 of a rage-click burst */
    rageClickChance: number;
    /** Path interpolation style */
    pathStyle:
      | "direct"
      | "curved"
      | "erratic"
      | "sequential"
      | "vertical-sweep";
    /** Trail opacity 0-1 */
    trailIntensity: number;
  };
  /** Shape generation params for particle sculpture */
  sculptureParams: {
    /** 'starburst' | 'sphere' | 'streak' | 'grid' | 'chaos' */
    shape: "starburst" | "sphere" | "streak" | "grid" | "chaos";
    /** How much the particles jitter each frame */
    jitterIntensity: number;
    /** Speed of ambient animation */
    animationSpeed: number;
    /** Radius/spread of the shape */
    spread: number;
    /** Spike length for starburst */
    spikeLength?: number;
  };
}

export const PERSONAS: PersonaConfig[] = [
  {
    id: 0,
    name: "Aggressive Speedster",
    color: "#ff2244",
    emissive: "#ff0022",
    description: "Blazing fast clicks, straight-line paths, zero hesitation",
    clusterLabel: "Cluster 0",
    userShare: 18,
    metrics: {
      avgClickLatencyMs: 120,
      scrollSpeedPxS: 4200,
      hesitationFrequency: 0.05,
      clickToScrollRatio: 0.8,
      taskCompletionRate: 0.92,
      deadClickRate: 0.02,
    },
    cursorParams: {
      moveSpeed: 1.8,
      clickFrequency: 2.5,
      hoverDuration: 80,
      hesitationChance: 0.02,
      rageClickChance: 0.0,
      pathStyle: "direct",
      trailIntensity: 0.3,
    },
    sculptureParams: {
      shape: "starburst",
      jitterIntensity: 0.15,
      animationSpeed: 3.0,
      spread: 2.5,
      spikeLength: 3.5,
    },
  },
  {
    id: 1,
    name: "Cautious Explorer",
    color: "#4488ff",
    emissive: "#2266ff",
    description:
      "Long hesitation, slow orbits, reads everything before clicking",
    clusterLabel: "Cluster 1",
    userShare: 27,
    metrics: {
      avgClickLatencyMs: 3800,
      scrollSpeedPxS: 520,
      hesitationFrequency: 0.85,
      clickToScrollRatio: 0.35,
      taskCompletionRate: 0.78,
      deadClickRate: 0.04,
    },
    cursorParams: {
      moveSpeed: 0.3,
      clickFrequency: 0.3,
      hoverDuration: 3200,
      hesitationChance: 0.8,
      rageClickChance: 0.0,
      pathStyle: "curved",
      trailIntensity: 0.6,
    },
    sculptureParams: {
      shape: "sphere",
      jitterIntensity: 0.02,
      animationSpeed: 0.4,
      spread: 2.0,
    },
  },
  {
    id: 2,
    name: "Scanner / Skimmer",
    color: "#ffcc00",
    emissive: "#ffaa00",
    description: "Ultra-fast scroll, barely clicks, skims surfaces",
    clusterLabel: "Cluster 2",
    userShare: 22,
    metrics: {
      avgClickLatencyMs: 800,
      scrollSpeedPxS: 4800,
      hesitationFrequency: 0.1,
      clickToScrollRatio: 0.04,
      taskCompletionRate: 0.45,
      deadClickRate: 0.01,
    },
    cursorParams: {
      moveSpeed: 1.4,
      clickFrequency: 0.15,
      hoverDuration: 200,
      hesitationChance: 0.05,
      rageClickChance: 0.0,
      pathStyle: "vertical-sweep",
      trailIntensity: 0.2,
    },
    sculptureParams: {
      shape: "streak",
      jitterIntensity: 0.08,
      animationSpeed: 2.5,
      spread: 4.0,
    },
  },
  {
    id: 3,
    name: "Methodical Navigator",
    color: "#22cc66",
    emissive: "#11aa44",
    description: "Sequential, structured, visits everything in order",
    clusterLabel: "Cluster 3",
    userShare: 20,
    metrics: {
      avgClickLatencyMs: 1200,
      scrollSpeedPxS: 1500,
      hesitationFrequency: 0.3,
      clickToScrollRatio: 0.55,
      taskCompletionRate: 0.95,
      deadClickRate: 0.01,
    },
    cursorParams: {
      moveSpeed: 0.6,
      clickFrequency: 0.8,
      hoverDuration: 600,
      hesitationChance: 0.25,
      rageClickChance: 0.0,
      pathStyle: "sequential",
      trailIntensity: 0.4,
    },
    sculptureParams: {
      shape: "grid",
      jitterIntensity: 0.01,
      animationSpeed: 0.8,
      spread: 2.2,
    },
  },
  {
    id: 4,
    name: "Frustrated Rager",
    color: "#ff8800",
    emissive: "#ff6600",
    description: "Rage clicks, erratic movement, high dead-click rate",
    clusterLabel: "Cluster 4",
    userShare: 13,
    metrics: {
      avgClickLatencyMs: 180,
      scrollSpeedPxS: 2800,
      hesitationFrequency: 0.15,
      clickToScrollRatio: 0.9,
      taskCompletionRate: 0.35,
      deadClickRate: 0.28,
    },
    cursorParams: {
      moveSpeed: 1.2,
      clickFrequency: 4.0,
      hoverDuration: 100,
      hesitationChance: 0.1,
      rageClickChance: 0.6,
      pathStyle: "erratic",
      trailIntensity: 0.15,
    },
    sculptureParams: {
      shape: "chaos",
      jitterIntensity: 0.35,
      animationSpeed: 4.0,
      spread: 2.8,
    },
  },
];

export const PARTICLE_COUNT = 800;
