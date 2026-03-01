import { PersonaConfig } from '../data/personas';
import { DEFAULT_HOTSPOTS, Hotspot } from '../data/hotspots';

export type ActionType = 'move' | 'click' | 'hover' | 'scroll' | 'rage-click' | 'idle';

export interface BehaviorStep {
  x: number;
  y: number;
  action: ActionType;
  duration: number;
  hotspotId?: string;
}

export const SCRIPT_DURATION = 20;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickHotspot(
  hotspots: Hotspot[],
  rand: () => number,
  persona: PersonaConfig
): Hotspot {
  const weights = hotspots.map((h) => {
    let w = h.priority;
    if (h.type === 'cta' && persona.cursorParams.clickFrequency > 1) w *= 2;
    if (h.type === 'text' && persona.cursorParams.hoverDuration > 1000) w *= 2;
    if (h.type === 'dead-zone' && persona.cursorParams.rageClickChance > 0.3) w *= 3;
    if (h.type === 'nav' && persona.cursorParams.pathStyle === 'sequential') w *= 1.5;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < hotspots.length; i++) {
    r -= weights[i];
    if (r <= 0) return hotspots[i];
  }
  return hotspots[0];
}

function interpolatePath(
  ax: number, ay: number,
  bx: number, by: number,
  style: string,
  rand: () => number
): { cx: number; cy: number } {
  switch (style) {
    case 'curved': {
      const mx = (ax + bx) / 2 + (rand() - 0.5) * 0.3;
      const my = (ay + by) / 2 + (rand() - 0.5) * 0.3;
      return { cx: mx, cy: my };
    }
    case 'erratic': {
      return { cx: rand(), cy: rand() };
    }
    default:
      return { cx: (ax + bx) / 2, cy: (ay + by) / 2 };
  }
}

export function generateScript(persona: PersonaConfig): BehaviorStep[] {
  const rand = seededRandom(persona.id * 1337 + 42);
  const steps: BehaviorStep[] = [];
  const { cursorParams } = persona;
  const hotspots = DEFAULT_HOTSPOTS;

  let totalDuration = 0;
  let lastX = 0.5;
  let lastY = 0.1;

  const addStep = (s: BehaviorStep) => {
    steps.push(s);
    totalDuration += s.duration;
    lastX = s.x;
    lastY = s.y;
  };

  // Initial idle
  addStep({ x: 0.5, y: 0.05, action: 'idle', duration: 0.3 });

  while (totalDuration < SCRIPT_DURATION) {
    const hotspot = pickHotspot(hotspots, rand, persona);
    const targetX = hotspot.x + rand() * hotspot.w;
    const targetY = hotspot.y + rand() * hotspot.h;

    // Movement
    const dist = Math.hypot(targetX - lastX, targetY - lastY);
    const moveDur = Math.max(0.2, dist / Math.max(0.1, cursorParams.moveSpeed));

    if (cursorParams.pathStyle === 'curved' || cursorParams.pathStyle === 'erratic') {
      const mid = interpolatePath(lastX, lastY, targetX, targetY, cursorParams.pathStyle, rand);
      addStep({ x: mid.cx, y: mid.cy, action: 'move', duration: moveDur * 0.5 });
      addStep({ x: targetX, y: targetY, action: 'move', duration: moveDur * 0.5, hotspotId: hotspot.id });
    } else if (cursorParams.pathStyle === 'vertical-sweep') {
      addStep({ x: lastX, y: targetY, action: 'move', duration: moveDur * 0.4 });
      addStep({ x: targetX, y: targetY, action: 'move', duration: moveDur * 0.6, hotspotId: hotspot.id });
      // Skimmers scroll a lot
      if (rand() < 0.6) {
        addStep({ x: targetX, y: Math.min(1, targetY + 0.15), action: 'scroll', duration: 0.3, hotspotId: hotspot.id });
      }
    } else {
      addStep({ x: targetX, y: targetY, action: 'move', duration: moveDur, hotspotId: hotspot.id });
    }

    // Hesitation
    if (rand() < cursorParams.hesitationChance) {
      addStep({ x: targetX, y: targetY, action: 'idle', duration: 0.3 + rand() * 0.8 });
    }

    // Hover
    if (hotspot.type !== 'dead-zone' && rand() < 0.6) {
      const hoverDur = cursorParams.hoverDuration / 1000;
      addStep({ x: targetX, y: targetY, action: 'hover', duration: hoverDur, hotspotId: hotspot.id });
    }

    // Click or rage-click
    if (rand() < cursorParams.rageClickChance) {
      const burstCount = 2 + Math.floor(rand() * 4);
      for (let c = 0; c < burstCount; c++) {
        addStep({
          x: targetX + (rand() - 0.5) * 0.02,
          y: targetY + (rand() - 0.5) * 0.02,
          action: 'rage-click',
          duration: 0.06 + rand() * 0.06,
          hotspotId: hotspot.id,
        });
      }
    } else if (hotspot.type === 'cta' || hotspot.type === 'link' || hotspot.type === 'nav') {
      if (rand() < cursorParams.clickFrequency / 3) {
        addStep({ x: targetX, y: targetY, action: 'click', duration: 0.1, hotspotId: hotspot.id });
      }
    }

    // Scroll
    if (rand() < 0.25) {
      const scrollY = Math.min(1, targetY + (rand() * 0.1 + 0.05));
      addStep({ x: targetX, y: scrollY, action: 'scroll', duration: 0.2 + rand() * 0.3, hotspotId: hotspot.id });
    }
  }

  return steps;
}

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
      const prevStep = i > 0 ? steps[i - 1] : { x: 0.5, y: 0.1 };
      const t = step.duration > 0 ? Math.min(1, (loopedTime - elapsed) / step.duration) : 1;
      const smooth = t * t * (3 - 2 * t);

      if (step.action === 'move') {
        return {
          x: prevStep.x + (step.x - prevStep.x) * smooth,
          y: prevStep.y + (step.y - prevStep.y) * smooth,
          action: 'move',
          progress: loopedTime / SCRIPT_DURATION,
          hotspotId: step.hotspotId,
        };
      }

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

  const last = steps[steps.length - 1];
  return { x: last?.x ?? 0.5, y: last?.y ?? 0.5, action: 'idle', progress: 1 };
}
