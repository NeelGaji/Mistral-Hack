import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Expanding ring on click */
export function ClickRipple({
  position,
  color,
  startTime,
}: {
  position: [number, number, number];
  color: string;
  startTime: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const duration = 0.6;

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const age = state.clock.elapsedTime - startTime;
    if (age > duration) {
      ref.current.visible = false;
      return;
    }
    const t = age / duration;
    const scale = 0.05 + t * 0.4;
    ref.current.scale.set(scale, scale, 1);
    matRef.current.opacity = (1 - t) * 0.8;
    ref.current.visible = true;
  });

  return (
    <mesh ref={ref} position={position} visible={false}>
      <ringGeometry args={[0.8, 1.0, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Pulsing circle during hover */
export function HoverHalo({
  position,
  color,
  active,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  active: boolean;
  intensity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    ref.current.visible = active;
    if (!active) return;
    const pulse = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.03;
    const scale = pulse * intensity;
    ref.current.scale.set(scale, scale, 1);
    matRef.current.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
  });

  return (
    <mesh ref={ref} position={position} visible={false}>
      <circleGeometry args={[1, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Rage-click particle burst */
export function RageParticles({
  position,
  color,
  startTime,
}: {
  position: [number, number, number];
  color: string;
  startTime: number;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 20;
  const duration = 0.8;

  const { geometry, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      const angle = (Math.random() * Math.PI * 2);
      const speed = 0.5 + Math.random() * 2;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.sin(angle) * speed;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, velocities: vel };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const age = state.clock.elapsedTime - startTime;
    if (age > duration || age < 0) {
      pointsRef.current.visible = false;
      return;
    }
    pointsRef.current.visible = true;

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = age / duration;

    for (let i = 0; i < count; i++) {
      arr[i * 3] = velocities[i * 3] * age;
      arr[i * 3 + 1] = velocities[i * 3 + 1] * age - 0.5 * age * age;
      arr[i * 3 + 2] = velocities[i * 3 + 2] * age;
    }
    posAttr.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = (1 - t) * 0.9;
  });

  return (
    <points ref={pointsRef} position={position} geometry={geometry} visible={false}>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/** Fading trail of recent cursor positions */
export function CursorTrail({
  positions,
  color,
  opacity,
}: {
  positions: [number, number, number][];
  color: string;
  opacity: number;
}) {
  const lineRef = useRef<THREE.Line>(null!);

  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const maxPoints = 60;
    const posArr = new Float32Array(maxPoints * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    return new THREE.Line(geo, mat);
  }, []);

  useFrame(() => {
    if (!lineRef.current) return;
    const geo = lineRef.current.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const count = Math.min(positions.length, 60);

    for (let i = 0; i < count; i++) {
      const p = positions[positions.length - count + i];
      arr[i * 3] = p[0];
      arr[i * 3 + 1] = p[1];
      arr[i * 3 + 2] = p[2];
    }
    posAttr.needsUpdate = true;
    geo.setDrawRange(0, count);

    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = opacity;
  });

  return (
    <primitive ref={lineRef} object={lineObj} />
  );
}
