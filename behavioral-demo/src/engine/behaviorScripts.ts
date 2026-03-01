import { PersonaConfig } from '../data/personas';
import { DEFAULT_HOTSPOTS, Hotspot } from '../data/hotspots';

export type ActionType = 'move' | 'click' | 'hover' | 'scroll' | 'rage-click' | 'idle';

export interface BehaviorStep {
  /** Normalized 0-1 position on the website surface */
  x: number;
  y: number;
  /** Action to perform at this position */
  action: ActionType;
  /** Duration of this step in seconds */
  duration: number;
  /** Target hotspot if any */
  hotspotId?: string;
}

/** Total simulation loop duration in seconds */
export const SCRIPT_DURATION = 20;

/** Seeded pseudo-random for deterministic scripts */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Pick a random hotspot weighted by priority and persona preference */
function pickHotspot(
  hotspots: Hotspot[],
  persona: PersonaConfig,
  rand: () => number,
  visited: Set<string>
): Hotspot {
  const { pathStyle } = persona.cursorParams;

  // Weight adjustment per persona path style
  const weighted = hotspots.map((h) => {
    let weight = h.priority;

    // Aggressive users prefer CTAs and nav
    if (pathStyle === 'direct') {
      if (h.type === 'cta') weight *= 3;
      if (h.type === 'text') weight *= 0.3;
    }
    // Cautious explorers read text, hover on everything
    if (pathStyle === 'curved') {
      if (h.type === 'text') weight *= 2.5;
      if (h.type === 'image') weight *= 2;
      if (h.type === 'cta') weight *= 0.8;
    }
    // Scanners mostly scroll, rarely click
    if (pathStyle === 'vertical-sweep') {
      if (h.type === 'text') weight *= 2;
      if (h.type === 'image') weight *= 1.5;
      if (h.type === 'cta') weight *= 0.3;
    }
    // Methodical visits everything in order — prefer unvisited
    if (pathStyle === 'sequential') {
      if (!visited.has(h.id)) weight *= 3;
      else weight *= 0.2;
    }
    // Frustrated rager clicks everywhere including dead zones
    if (pathStyle === 'erratic') {
      weight = 1 + rand() * 3;
    }

    return { hotspot: h, weight };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = rand() * totalWeight;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) return w.hotspot;
  }
  return weighted[weighted.length - 1].hotspot;
}

/** Add slight curve offset for non-direct paths */
function curveOffset(rand: () => number, intensity: number): { dx: number; dy: number } {
  return {
    dx: (rand() - 0.5) * intensity,
    dy: (rand() - 0.5) * intensity,
  };
}

/** Generate a dead-click position (not on any hotspot) */
function deadClickPosition(rand: () => number): { x: number; y: number } {
  // Target empty areas
  const zones = [
    { x: 0.05, y: 0.45 },  // left of hero image
    { x: 0.95, y: 0.45 },  // right of hero image
    { x: 0.5, y: 0.55 },   // between hero and cards
    { x: 0.15, y: 0.82 },  // left of bottom cta
    { x: 0.85, y: 0.82 },  // right of bottom cta
  ];
  const zone = zones[Math.floor(rand() * zones.length)];
  return {
    x: zone.x + (rand() - 0.5) * 0.08,
    y: zone.y + (rand() - 0.5) * 0.06,
  };
}

/**
 * Generate a complete behavior script for a persona.
 * Returns an array of BehaviorSteps that loop over SCRIPT_DURATION seconds.
 */
export function generateScript(persona: PersonaConfig): BehaviorStep[] {
  const steps: BehaviorStep[] = [];
  const rand = seededRandom(persona.id * 7919 + 42);
  const { moveSpeed, clickFrequency, hoverDuration, hesitationChance, rageClickChance, pathStyle } =
    persona.cursorParams;

  const hotspots = [...DEFAULT_HOTSPOTS];
  const visited = new Set<string>();

  // For sequential: sort hotspots top-to-bottom, left-to-right
  if (pathStyle === 'sequential') {
    hotspots.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  let elapsed = 0;
  let currentX = 0.5;
  let currentY = 0.1; // Start near top

  // For vertical-sweep: start at top and sweep down
  if (pathStyle === 'vertical-sweep') {
    currentX = 0.3 + rand() * 0.4;
    currentY = 0.02;
  }

  let hotspotIndex = 0; // For sequential traversal

  while (elapsed < SCRIPT_DURATION) {
    // Pick next target
    let targetHotspot: Hotspot;
    if (pathStyle === 'sequential') {
      targetHotspot = hotspots[hotspotIndex % hotspots.length];
      hotspotIndex++;
    } else {
      targetHotspot = pickHotspot(hotspots, persona, rand, visited);
    }
    visited.add(targetHotspot.id);

    const targetX = targetHotspot.x + targetHotspot.w / 2 + (rand() - 0.5) * targetHotspot.w * 0.6;
    const targetY = targetHotspot.y + targetHotspot.h / 2 + (rand() - 0.5) * targetHotspot.h * 0.6;

    // For vertical-sweep: override to sweep down the page
    let finalX = targetX;
    let finalY = targetY;
    if (pathStyle === 'vertical-sweep') {
      finalX = currentX + (rand() - 0.5) * 0.15;
      finalY = Math.min(0.98, currentY + 0.04 + rand() * 0.08);
    }

    // Calculate travel distance & duration
    const dx = finalX - currentX;
    const dy = finalY - currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const travelTime = Math.max(0.1, dist / (moveSpeed * 0.5));

    // Optional hesitation before moving
    if (rand() < hesitationChance && elapsed > 0) {
      const hesitateTime = 0.3 + rand() * 1.5;
      steps.push({
        x: currentX,
        y: currentY,
        action: 'idle',
        duration: hesitateTime,
      });
      elapsed += hesitateTime;
    }

    // Add intermediate curve points for curved paths
    if (pathStyle === 'curved' && dist > 0.1) {
      const mid = curveOffset(rand, 0.15);
      const midX = (currentX + finalX) / 2 + mid.dx;
      const midY = (currentY + finalY) / 2 + mid.dy;
      steps.push({
        x: Math.max(0.01, Math.min(0.99, midX)),
        y: Math.max(0.01, Math.min(0.99, midY)),
        action: 'move',
        duration: travelTime / 2,
      });
      elapsed += travelTime / 2;
    }

    // Add erratic jitter points for erratic paths
    if (pathStyle === 'erratic' && dist > 0.05) {
      const jitterCount = 1 + Math.floor(rand() * 3);
      for (let j = 0; j < jitterCount; j++) {
        const t = (j + 1) / (jitterCount + 1);
        const jx = currentX + dx * t + (rand() - 0.5) * 0.12;
        const jy = currentY + dy * t + (rand() - 0.5) * 0.1;
        steps.push({
          x: Math.max(0.01, Math.min(0.99, jx)),
          y: Math.max(0.01, Math.min(0.99, jy)),
          action: 'move',
          duration: travelTime / (jitterCount + 1) * 0.6,
        });
        elapsed += travelTime / (jitterCount + 1) * 0.6;
      }
    }

    // Move to target
    steps.push({
      x: Math.max(0.01, Math.min(0.99, finalX)),
      y: Math.max(0.01, Math.min(0.99, finalY)),
      action: 'move',
      duration: pathStyle === 'curved' && dist > 0.1 ? travelTime / 2 : travelTime,
      hotspotId: targetHotspot.id,
    });
    elapsed += pathStyle === 'curved' && dist > 0.1 ? travelTime / 2 : travelTime;

    currentX = finalX;
    currentY = finalY;

    // Decide action at destination
    if (pathStyle === 'vertical-sweep') {
      // Scanners: frequent scroll, occasional hover, rare click
      const scrollTime = 0.3 + rand() * 0.5;
      steps.push({ x: currentX, y: currentY, action: 'scroll', duration: scrollTime });
      elapsed += scrollTime;
      if (rand() < 0.15) {
        const hoverTime = hoverDuration / 1000;
        steps.push({ x: currentX, y: currentY, action: 'hover', duration: hoverTime, hotspotId: targetHotspot.id });
        elapsed += hoverTime;
      }
      if (rand() < clickFrequency * 0.1) {
        steps.push({ x: currentX, y: currentY, action: 'click', duration: 0.1, hotspotId: targetHotspot.id });
        elapsed += 0.1;
      }
    } else if (rand() < rageClickChance) {
      // Rage click burst: 3-5 rapid clicks
      const burstCount = 3 + Math.floor(rand() * 3);
      for (let c = 0; c < burstCount; c++) {
        const offset = (rand() - 0.5) * 0.02;
        steps.push({
          x: Math.max(0.01, Math.min(0.99, currentX + offset)),
          y: Math.max(0.01, Math.min(0.99, currentY + (rand() - 0.5) * 0.02)),
          action: 'rage-click',
          duration: 0.05 + rand() * 0.08,
          hotspotId: targetHotspot.id,
        });
        elapsed += 0.05 + rand() * 0.08;
      }
      // Maybe also a dead click nearby
      if (rand() < 0.5) {
        const dead = deadClickPosition(rand);
        steps.push({ x: dead.x, y: dead.y, action: 'move', duration: 0.2 });
        steps.push({ x: dead.x, y: dead.y, action: 'click', duration: 0.1 });
        elapsed += 0.3;
      }
    } else {
      // Normal interaction: hover then maybe click
      if (targetHotspot.type === 'text' || targetHotspot.type === 'image' || rand() < hesitationChance) {
        const hoverTime = hoverDuration / 1000 * (0.5 + rand());
        steps.push({ x: currentX, y: currentY, action: 'hover', duration: hoverTime, hotspotId: targetHotspot.id });
        elapsed += hoverTime;
      }

      // Click probability based on element type and persona
      let clickChance = clickFrequency * 0.3;
      if (targetHotspot.type === 'cta') clickChance = Math.min(1, clickFrequency * 0.6);
      if (targetHotspot.type === 'nav' || targetHotspot.type === 'link') clickChance = Math.min(1, clickFrequency * 0.4);
      if (targetHotspot.type === 'text') clickChance *= 0.1;
      if (targetHotspot.type === 'image') clickChance *= 0.15;

      if (rand() < clickChance) {
        steps.push({ x: currentX, y: currentY, action: 'click', duration: 0.1, hotspotId: targetHotspot.id });
        elapsed += 0.1;
      }

      // Occasional scroll between interactions
      const scrollChance = pathStyle === 'curved' ? 0.3 : pathStyle === 'sequential' ? 0.4 : pathStyle === 'erratic' ? 0.25 : 0.15;
      if (rand() < scrollChance) {
        const scrollDur = pathStyle === 'curved' ? 0.8 + rand() * 1.2 : pathStyle === 'sequential' ? 0.4 + rand() * 0.4 : 0.2 + rand() * 0.4;
        steps.push({ x: currentX, y: currentY, action: 'scroll', duration: scrollDur });
        elapsed += scrollDur;
      }
    }
  }

  return steps;
}

/**
 * Given a time T (in seconds), find the interpolated position and current action.
 * Scripts loop after SCRIPT_DURATION.
 */
export function sampleScript(
  steps: BehaviorStep[],
  time: number
): { x: number; y: number; action: ActionType; progress: number; hotspotId?: string } {
  const loopedTime = time % SCRIPT_DURATION;

  let elapsed = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepEnd = elapsed + step.duration;

    if (loopedTime < stepEnd || i === steps.length - 1) {
      // We're in this step — interpolate between previous position and this one
      const prevStep = i > 0 ? steps[i - 1] : { x: 0.5, y: 0.1 };
      const t = step.duration > 0 ? Math.min(1, (loopedTime - elapsed) / step.duration) : 1;

      // Smooth interpolation
      const smooth = t * t * (3 - 2 * t); // smoothstep

      if (step.action === 'move') {
        return {
          x: prevStep.x + (step.x - prevStep.x) * smooth,
          y: prevStep.y + (step.y - prevStep.y) * smooth,
          action: 'move',
          progress: loopedTime / SCRIPT_DURATION,
          hotspotId: step.hotspotId,
        };
      }

      // For non-move actions, stay at the step position
      return {
        x: step.x,
        y: step.y,
        action: step.action,
        progress: loopedTime / SCRIPT_DURATION,
        hotspotId: step.hotspotId,
      };
    }

    elapsed = stepEnd;
  }

  // Fallback
  const last = steps[steps.length - 1];
  return { x: last?.x ?? 0.5, y: last?.y ?? 0.5, action: 'idle', progress: 1 };
}
