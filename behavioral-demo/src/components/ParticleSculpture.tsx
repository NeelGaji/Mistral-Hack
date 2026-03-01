import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PersonaConfig, PARTICLE_COUNT } from '../data/personas';
import { generatePositions, generateSizes } from '../engine/shapeGenerators';
import { useStore } from '../store/useStore';

interface ParticleSculptureProps {
  persona: PersonaConfig;
  position?: [number, number, number];
  scale?: number;
}

// Reusable vector for per-frame math
const _tempVec = new THREE.Vector3();

export default function ParticleSculpture({
  persona,
  position = [0, 0, 0],
  scale = 1,
}: ParticleSculptureProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const isAnimating = useStore((s) => s.isAnimating);
  const speed = useStore((s) => s.speed);

  // Current positions (what we're animating toward)
  const targetPositions = useMemo(() => generatePositions(persona), [persona]);
  const sizes = useMemo(() => generateSizes(persona), [persona]);

  // Initialize geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Start from random positions (they'll animate to target)
    const initial = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      initial[i] = (Math.random() - 0.5) * 8;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(initial, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  // When persona changes, update target positions
  useEffect(() => {
    // Sizes also update
    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;
    const newSizes = generateSizes(persona);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sizeAttr.array[i] = newSizes[i];
    }
    sizeAttr.needsUpdate = true;
  }, [persona, geometry]);

  // Animation loop — lerp particles toward target + apply jitter
  useFrame((state, delta) => {
    if (!pointsRef.current || !isAnimating) return;

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const elapsed = state.clock.elapsedTime;
    const { jitterIntensity, animationSpeed } = persona.sculptureParams;

    const lerpFactor = Math.min(1, delta * 2.5 * speed);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Lerp toward target
      posArr[i3] += (targetPositions[i3] - posArr[i3]) * lerpFactor;
      posArr[i3 + 1] += (targetPositions[i3 + 1] - posArr[i3 + 1]) * lerpFactor;
      posArr[i3 + 2] += (targetPositions[i3 + 2] - posArr[i3 + 2]) * lerpFactor;

      // Jitter: persona-specific noise
      const phase = elapsed * animationSpeed + i * 0.1;
      posArr[i3] += Math.sin(phase * 1.3 + i) * jitterIntensity * delta * 8;
      posArr[i3 + 1] += Math.cos(phase * 0.9 + i * 0.7) * jitterIntensity * delta * 8;
      posArr[i3 + 2] += Math.sin(phase * 1.1 + i * 0.3) * jitterIntensity * delta * 8;
    }

    posAttr.needsUpdate = true;

    // Slow rotation for visual flair
    pointsRef.current.rotation.y += delta * 0.1 * animationSpeed;
  });

  return (
    <group position={position} scale={scale}>
      {/* Label */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          position={[0, 3.2, 0]}
          fontSize={0.35}
          color={persona.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {persona.name}
        </Text>
        <Text
          position={[0, 2.75, 0]}
          fontSize={0.18}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          {persona.clusterLabel} · {persona.userShare}% of users
        </Text>
      </Float>

      {/* Particle cloud */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          size={0.06}
          color={persona.color}
          emissive={persona.emissive}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Ground glow ring */}
      <mesh position={[0, -2.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.2, 64]} />
        <meshBasicMaterial
          color={persona.color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
