import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PersonaConfig } from '../data/personas';
import { generateScript, sampleScript, ActionType } from '../engine/behaviorScripts';
import { normalizedToWorld } from './WebsiteSurface';
import { ClickRipple, HoverHalo, RageParticles, CursorTrail } from './CursorEffects';
import { useStore } from '../store/useStore';
import { useWebsite } from '../context/WebsiteContext';

const MAX_RIPPLES = 12;
const MAX_RAGE_BURSTS = 6;
const TRAIL_MAX = 60;

interface RippleData {
  id: number;
  position: [number, number, number];
  startTime: number;
  color: string;
}

interface RageBurstData {
  id: number;
  position: [number, number, number];
  startTime: number;
  color: string;
}

/** 3D cursor arrow shape */
function CursorMesh({ color, shake }: { color: string; shake: number }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!ref.current) return;
    if (shake > 0) {
      ref.current.position.x = (Math.random() - 0.5) * shake * 0.1;
      ref.current.position.y = (Math.random() - 0.5) * shake * 0.1;
    } else {
      ref.current.position.x = 0;
      ref.current.position.y = 0;
    }
  });

  const arrowShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Cursor arrow pointing up-left
    shape.moveTo(0, 0);
    shape.lineTo(0, -0.28);
    shape.lineTo(0.07, -0.21);
    shape.lineTo(0.14, -0.32);
    shape.lineTo(0.18, -0.3);
    shape.lineTo(0.11, -0.19);
    shape.lineTo(0.19, -0.19);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, 0]}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {/* Outline */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, -0.001]}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function AgentCursor({
  persona,
  surfacePosition = [0, 0, 0],
  showLabel = true,
}: {
  persona: PersonaConfig;
  surfacePosition?: [number, number, number];
  showLabel?: boolean;
}) {
  const simulationRunning = useStore((s) => s.simulationRunning);
  const speed = useStore((s) => s.speed);
  const { dispatchClick, dispatchHover, dispatchScroll } = useWebsite();

  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(0);
  const lastHoveredHotspotRef = useRef<string | null>(null);

  // Generate behavior script once per persona
  const script = useMemo(() => generateScript(persona), [persona]);

  // Effect state
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [rageBursts, setRageBursts] = useState<RageBurstData[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const trailRef = useRef<[number, number, number][]>([]);
  const rippleIdRef = useRef(0);
  const rageIdRef = useRef(0);
  const lastActionRef = useRef<ActionType>('idle');
  const frameCountRef = useRef(0);

  const addRipple = useCallback(
    (pos: [number, number, number], time: number) => {
      const id = rippleIdRef.current++;
      setRipples((prev) => {
        const next = [...prev, { id, position: pos, startTime: time, color: persona.color }];
        return next.length > MAX_RIPPLES ? next.slice(-MAX_RIPPLES) : next;
      });
    },
    [persona.color]
  );

  const addRageBurst = useCallback(
    (pos: [number, number, number], time: number) => {
      const id = rageIdRef.current++;
      setRageBursts((prev) => {
        const next = [...prev, { id, position: pos, startTime: time, color: persona.color }];
        return next.length > MAX_RAGE_BURSTS ? next.slice(-MAX_RAGE_BURSTS) : next;
      });
    },
    [persona.color]
  );

  useFrame((state, delta) => {
    if (!groupRef.current || !simulationRunning) return;

    timeRef.current += delta * speed;
    frameCountRef.current++;

    const sample = sampleScript(script, timeRef.current);
    const worldPos = normalizedToWorld(sample.x, sample.y, surfacePosition);

    // Update cursor position
    groupRef.current.position.set(worldPos[0], worldPos[1], worldPos[2] + 0.02);

    // Track trail positions (every 3rd frame to avoid memory bloat)
    if (frameCountRef.current % 3 === 0) {
      trailRef.current.push([worldPos[0], worldPos[1], worldPos[2] + 0.01]);
      if (trailRef.current.length > TRAIL_MAX) {
        trailRef.current = trailRef.current.slice(-TRAIL_MAX);
      }
    }

    // Handle action changes
    if (sample.action !== lastActionRef.current) {
      // Clear previous hover on the HTML surface
      if (lastHoveredHotspotRef.current) {
        dispatchHover(lastHoveredHotspotRef.current, false);
        lastHoveredHotspotRef.current = null;
      }

      lastActionRef.current = sample.action;

      if (sample.action === 'click') {
        addRipple([worldPos[0], worldPos[1], worldPos[2] + 0.015], state.clock.elapsedTime);
        setShakeIntensity(0);
        if (sample.hotspotId) dispatchClick(sample.hotspotId);
      } else if (sample.action === 'rage-click') {
        addRipple([worldPos[0], worldPos[1], worldPos[2] + 0.015], state.clock.elapsedTime);
        addRageBurst([worldPos[0], worldPos[1], worldPos[2] + 0.02], state.clock.elapsedTime);
        setShakeIntensity(1);
        if (sample.hotspotId) dispatchClick(sample.hotspotId);
      } else if (sample.action === 'hover') {
        setIsHovering(true);
        setShakeIntensity(0);
        if (sample.hotspotId) {
          dispatchHover(sample.hotspotId, true);
          lastHoveredHotspotRef.current = sample.hotspotId;
        }
      } else if (sample.action === 'scroll') {
        setIsHovering(false);
        setShakeIntensity(0);
        dispatchScroll(persona.cursorParams.moveSpeed * 30);
      } else {
        setIsHovering(false);
        setShakeIntensity(0);
      }
    }

    // Keep spawning ripples during rage-click action
    if (sample.action === 'rage-click' && frameCountRef.current % 4 === 0) {
      addRipple(
        [worldPos[0] + (Math.random() - 0.5) * 0.15, worldPos[1] + (Math.random() - 0.5) * 0.15, worldPos[2] + 0.015],
        state.clock.elapsedTime
      );
      if (sample.hotspotId) dispatchClick(sample.hotspotId);
    }

    // Update simulation progress
    useStore.getState().setSimulationProgress(sample.progress);
  });

  const haloPos: [number, number, number] = [0, 0, -0.01];

  return (
    <group>
      {/* Trail */}
      <CursorTrail
        positions={trailRef.current}
        color={persona.color}
        opacity={persona.cursorParams.trailIntensity}
      />

      {/* Cursor group */}
      <group ref={groupRef}>
        {/* Hover halo */}
        <HoverHalo
          position={haloPos}
          color={persona.color}
          active={isHovering}
          intensity={persona.cursorParams.hoverDuration / 1000}
        />

        {/* Cursor arrow */}
        <CursorMesh color={persona.color} shake={shakeIntensity} />

        {/* Label */}
        {showLabel && (
          <Text
            position={[0.3, 0.15, 0]}
            fontSize={0.12}
            color={persona.color}
            anchorX="left"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {persona.name}
          </Text>
        )}
      </group>

      {/* Click ripples */}
      {ripples.map((r) => (
        <ClickRipple key={r.id} position={r.position} color={r.color} startTime={r.startTime} />
      ))}

      {/* Rage particle bursts */}
      {rageBursts.map((r) => (
        <RageParticles key={r.id} position={r.position} color={r.color} startTime={r.startTime} />
      ))}
    </group>
  );
}
