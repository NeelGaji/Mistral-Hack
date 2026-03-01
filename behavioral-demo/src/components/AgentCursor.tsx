import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PersonaConfig } from '../data/personas';
import { generateScript, sampleScript } from '../engine/behaviorScripts';
import { normalizedToWorld } from './WebsiteSurface';
import { useStore } from '../store/useStore';
import {
  ClickRipple,
  RippleData,
  HoverHalo,
  RageBurst,
  RageBurstData,
  CursorTrail,
} from './CursorEffects';
import { pushHeatmapPoint } from './HeatmapOverlay';

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

  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastActionRef = useRef('');

  const script = useMemo(() => generateScript(persona), [persona]);

  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [rageBursts, setRageBursts] = useState<RageBurstData[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  const addRipple = (pos: [number, number, number], time: number) => {
    setRipples((prev) => [...prev.slice(-8), { position: pos, startTime: time }]);
  };

  const addRageBurst = (pos: [number, number, number], time: number) => {
    setRageBursts((prev) => [...prev.slice(-4), { position: pos, startTime: time }]);
  };

  useFrame((state, delta) => {
    if (!simulationRunning || !groupRef.current) return;

    frameCountRef.current++;
    timeRef.current += delta * speed;
    const sample = sampleScript(script, timeRef.current);
    const worldPos = normalizedToWorld(sample.x, sample.y, surfacePosition);

    // Update group position
    groupRef.current.position.set(worldPos[0], worldPos[1], worldPos[2]);

    // Apply shake for rage clicks
    if (shakeIntensity > 0) {
      groupRef.current.position.x += (Math.random() - 0.5) * 0.08 * shakeIntensity;
      groupRef.current.position.y += (Math.random() - 0.5) * 0.08 * shakeIntensity;
      setShakeIntensity((v) => Math.max(0, v - delta * 3));
    }

    // Push EVERY position to heatmap for continuous cursor tracing
    if (frameCountRef.current % 3 === 0) {
      pushHeatmapPoint({
        nx: sample.x,
        ny: sample.y,
        type: sample.action === 'move' ? 'move' : sample.action,
        color: persona.color,
        intensity: sample.action === 'move' ? 0.3 : 0.8,
      });
    }

    // Detect action transitions
    if (sample.action !== lastActionRef.current) {
      lastActionRef.current = sample.action;

      if (sample.action === 'click') {
        addRipple([worldPos[0], worldPos[1], worldPos[2] + 0.015], state.clock.elapsedTime);
        setShakeIntensity(0);
        pushHeatmapPoint({ nx: sample.x, ny: sample.y, type: 'click', color: persona.color, intensity: 0.9 });
      } else if (sample.action === 'rage-click') {
        addRipple([worldPos[0], worldPos[1], worldPos[2] + 0.015], state.clock.elapsedTime);
        addRageBurst([worldPos[0], worldPos[1], worldPos[2] + 0.02], state.clock.elapsedTime);
        setShakeIntensity(1);
        pushHeatmapPoint({ nx: sample.x, ny: sample.y, type: 'rage-click', color: '#ff2200', intensity: 1.0 });
      } else if (sample.action === 'hover') {
        setIsHovering(true);
        setShakeIntensity(0);
        pushHeatmapPoint({ nx: sample.x, ny: sample.y, type: 'hover', color: persona.color, intensity: 0.6 });
      } else if (sample.action === 'scroll') {
        setIsHovering(false);
        setShakeIntensity(0);
        pushHeatmapPoint({ nx: sample.x, ny: sample.y, type: 'scroll', color: persona.color, intensity: 0.4 });
      } else {
        setIsHovering(false);
        setShakeIntensity(0);
      }
    }

    // Keep spawning effects during rage-click
    if (sample.action === 'rage-click' && frameCountRef.current % 4 === 0) {
      addRipple(
        [worldPos[0] + (Math.random() - 0.5) * 0.15, worldPos[1] + (Math.random() - 0.5) * 0.15, worldPos[2] + 0.015],
        state.clock.elapsedTime
      );
      pushHeatmapPoint({
        nx: sample.x + (Math.random() - 0.5) * 0.02,
        ny: sample.y + (Math.random() - 0.5) * 0.02,
        type: 'rage-click',
        color: '#ff2200',
        intensity: 1.0,
      });
    }

    useStore.getState().setSimulationProgress(sample.progress);
  });

  const haloPos: [number, number, number] = [0, 0, -0.01];

  return (
    <group>
      <group ref={groupRef}>
        {/* Cursor body */}
        <mesh>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color={persona.color} transparent opacity={0.9} depthWrite={false} />
        </mesh>
        {/* Cursor ring */}
        <mesh>
          <ringGeometry args={[0.1, 0.13, 24]} />
          <meshBasicMaterial
            color={persona.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Label */}
        {showLabel && (
          <Text
            position={[0.2, 0.2, 0]}
            fontSize={0.12}
            color={persona.color}
            anchorX="left"
            anchorY="bottom"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {persona.name}
          </Text>
        )}
        {/* Hover halo */}
        <HoverHalo color={persona.color} visible={isHovering} position={haloPos} />
      </group>

      {/* Cursor trail */}
      <CursorTrail color={persona.color} intensity={persona.cursorParams.trailIntensity} />

      {/* Click ripples */}
      {ripples.map((r, i) => (
        <ClickRipple key={`ripple-${i}`} {...r} />
      ))}

      {/* Rage burst particles */}
      {rageBursts.map((r, i) => (
        <RageBurst key={`rage-${i}`} {...r} />
      ))}
    </group>
  );
}
