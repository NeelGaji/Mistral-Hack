import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HEATMAP_RES = 512;

export interface HeatmapPoint {
  nx: number;
  ny: number;
  type: string;
  color: string;
  intensity: number;
}

/** Shared buffer — AgentCursor pushes to this every frame */
export const heatmapBuffer: HeatmapPoint[] = [];

export function pushHeatmapPoint(point: HeatmapPoint) {
  heatmapBuffer.push(point);
  if (heatmapBuffer.length > 8000) heatmapBuffer.splice(0, 1000);
}

export function clearHeatmap() {
  heatmapBuffer.length = 0;
}

export default function HeatmapOverlay({
  visible = true,
  opacity = 0.5,
  width = 12,
  height = 8,
}: {
  visible?: boolean;
  opacity?: number;
  width?: number;
  height?: number;
}) {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const processedRef = useRef(0);

  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = HEATMAP_RES;
    c.height = HEATMAP_RES;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, HEATMAP_RES, HEATMAP_RES);
    ctxRef.current = ctx;
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    textureRef.current = tex;
    return tex;
  }, []);

  useFrame(() => {
    if (!visible || !ctxRef.current || !textureRef.current) return;
    const ctx = ctxRef.current;
    const len = heatmapBuffer.length;
    if (processedRef.current >= len) return;

    for (let i = processedRef.current; i < len; i++) {
      const p = heatmapBuffer[i];
      const px = p.nx * HEATMAP_RES;
      const py = p.ny * HEATMAP_RES;

      let radius: number;
      let color: string;
      let alpha: number;

      switch (p.type) {
        case 'click':
          radius = 18 + p.intensity * 12;
          color = p.color || '#ff4444';
          alpha = 0.12 + p.intensity * 0.08;
          break;
        case 'rage-click':
          radius = 25 + p.intensity * 15;
          color = '#ff2200';
          alpha = 0.2 + p.intensity * 0.1;
          break;
        case 'hover':
          radius = 22 + p.intensity * 10;
          color = p.color || '#ffaa44';
          alpha = 0.06 + p.intensity * 0.04;
          break;
        case 'scroll':
          radius = 30;
          color = p.color || '#4488ff';
          alpha = 0.04;
          break;
        case 'move':
          radius = 10 + p.intensity * 6;
          color = p.color || '#aaaaff';
          alpha = 0.02 + p.intensity * 0.015;
          break;
        default:
          radius = 12;
          color = p.color || '#888888';
          alpha = 0.03;
      }

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, colorWithAlpha(color, alpha));
      grad.addColorStop(0.5, colorWithAlpha(color, alpha * 0.5));
      grad.addColorStop(1, colorWithAlpha(color, 0));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    processedRef.current = len;
    textureRef.current.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <mesh position={[0, 0, 0.008]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function colorWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16) || 128;
  const g = parseInt(hex.slice(3, 5), 16) || 128;
  const b = parseInt(hex.slice(5, 7), 16) || 128;
  return `rgba(${r},${g},${b},${alpha})`;
}
