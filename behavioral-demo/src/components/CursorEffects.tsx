import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Ripple ── */
export interface RippleData {
  position: [number, number, number];
  startTime: number;
}

export function ClickRipple({ position, startTime }: RippleData) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    const age = state.clock.elapsedTime - startTime;
    const scale = 1 + age * 4;
    const opacity = Math.max(0, 1 - age * 2.5);
    ref.current.scale.set(scale, scale, 1);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    if (opacity <= 0) ref.current.visible = false;
  });

  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.08, 0.12, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ── Hover Halo ── */
export function HoverHalo({
  color,
  visible,
  position,
}: {
  color: string;
  visible: boolean;
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = visible ? 0.35 : 0;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity += (target - mat.opacity) * Math.min(1, delta * 8);
    ref.current.rotation.z += delta * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.15, 0.22, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ── Rage Burst ── */
export interface RageBurstData {
  position: [number, number, number];
  startTime: number;
}

export function RageBurst({ position, startTime }: RageBurstData) {
  const ref = useRef<THREE.Points>(null!);
  const COUNT = 12;

  const { geometry, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel: THREE.Vector3[] = [];
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, Math.random() * 0.5));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, velocities: vel };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const age = state.clock.elapsedTime - startTime;
    if (age > 1) { ref.current.visible = false; return; }
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = velocities[i].x * age;
      arr[i * 3 + 1] = velocities[i].y * age;
      arr[i * 3 + 2] = velocities[i].z * age;
    }
    posAttr.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - age);
  });

  return (
    <points ref={ref} position={position} geometry={geometry}>
      <pointsMaterial color="#ff2200" size={0.04} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Cursor Trail ── */
const TRAIL_MAX = 60;

export function CursorTrail({
  color,
  intensity,
}: {
  color: string;
  intensity: number;
}) {
  const lineRef = useRef<THREE.Line>(null!);

  const { line } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_MAX * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: intensity * 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const l = new THREE.Line(geo, mat);
    return { geometry: geo, line: l };
  }, [color, intensity]);

  return <primitive ref={lineRef} object={line} />;
}

export function updateTrail(
  trailPoints: THREE.Vector3[],
  lineRef: THREE.Line | null,
  newPos: THREE.Vector3
) {
  trailPoints.push(newPos.clone());
  if (trailPoints.length > TRAIL_MAX) trailPoints.shift();
  if (!lineRef) return;
  const posAttr = lineRef.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  for (let i = 0; i < trailPoints.length; i++) {
    arr[i * 3] = trailPoints[i].x;
    arr[i * 3 + 1] = trailPoints[i].y;
    arr[i * 3 + 2] = trailPoints[i].z;
  }
  posAttr.needsUpdate = true;
  lineRef.geometry.setDrawRange(0, trailPoints.length);
}
