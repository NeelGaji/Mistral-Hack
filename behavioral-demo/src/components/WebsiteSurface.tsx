import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { DEFAULT_HOTSPOTS, Hotspot } from '../data/hotspots';
import HeatmapOverlay from './HeatmapOverlay';

/** Website surface dimensions in 3D world units */
export const SURFACE_WIDTH = 12;
export const SURFACE_HEIGHT = 8;

/** Iframe overlay dimensions — matched to the CSS 75vw x 80vh iframe at camera z=10, fov=45 */
export const IFRAME_WIDTH = 6.2;
export const IFRAME_HEIGHT = 6.6;

/** Convert normalized 0-1 hotspot coords to 3D world position on the surface */
export function hotspotToWorld(
  hotspot: Hotspot,
  surfacePos: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  const cx = hotspot.x + hotspot.w / 2;
  const cy = hotspot.y + hotspot.h / 2;
  return [
    surfacePos[0] + (cx - 0.5) * SURFACE_WIDTH,
    surfacePos[1] + (0.5 - cy) * SURFACE_HEIGHT,
    surfacePos[2] + 0.01,
  ];
}

/** Convert normalized 0-1 coords to world position */
export function normalizedToWorld(
  nx: number,
  ny: number,
  surfacePos: [number, number, number] = [0, 0, 0],
  iframeMode = false
): [number, number, number] {
  const w = iframeMode ? IFRAME_WIDTH : SURFACE_WIDTH;
  const h = iframeMode ? IFRAME_HEIGHT : SURFACE_HEIGHT;
  return [
    surfacePos[0] + (nx - 0.5) * w,
    surfacePos[1] + (0.5 - ny) * h,
    surfacePos[2] + 0.01,
  ];
}

/** Fallback wireframe surface */
export function FallbackSurface() {
  return (
    <group>
      <mesh>
        <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT]} />
        <meshBasicMaterial color="#0a0a2a" transparent opacity={0.7} />
      </mesh>
      <mesh>
        <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT, 24, 16]} />
        <meshBasicMaterial color="#222266" wireframe transparent opacity={0.2} />
      </mesh>
      <Text position={[0, 2.5, 0.01]} fontSize={0.5} color="#4444aa" anchorX="center">
        WEBSITE SURFACE
      </Text>
      <Text position={[0, 1.8, 0.01]} fontSize={0.2} color="#555577" anchorX="center">
        Paste a URL above or agents will use the default layout
      </Text>
      {/* Render hotspot regions for reference */}
      {DEFAULT_HOTSPOTS.filter(h => h.type === 'cta').map((h) => {
        const cx = (h.x + h.w / 2 - 0.5) * SURFACE_WIDTH;
        const cy = (0.5 - h.y - h.h / 2) * SURFACE_HEIGHT;
        return (
          <mesh key={h.id} position={[cx, cy, 0.005]}>
            <planeGeometry args={[h.w * SURFACE_WIDTH, h.h * SURFACE_HEIGHT]} />
            <meshBasicMaterial color="#4444ff" transparent opacity={0.15} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Surface showing a captured screenshot texture */
function TexturedSurface({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh>
      <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT]} />
      <meshBasicMaterial map={texture} transparent opacity={0.95} />
    </mesh>
  );
}

/** Hotspot overlay — visualises clickable regions */
function HotspotOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <group position={[0, 0, 0.005]}>
      {DEFAULT_HOTSPOTS.map((h) => {
        const cx = (h.x + h.w / 2 - 0.5) * SURFACE_WIDTH;
        const cy = (0.5 - h.y - h.h / 2) * SURFACE_HEIGHT;
        const colors: Record<string, string> = {
          cta: '#ff4466', nav: '#44aaff', text: '#aaaaaa',
          image: '#88cc44', link: '#ffaa22', 'dead-zone': '#444444',
        };
        return (
          <mesh key={h.id} position={[cx, cy, 0]}>
            <planeGeometry args={[h.w * SURFACE_WIDTH, h.h * SURFACE_HEIGHT]} />
            <meshBasicMaterial
              color={colors[h.type] || '#666'}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function WebsiteSurface({
  position = [0, 0, 0] as [number, number, number],
  showHotspots = false,
}: {
  position?: [number, number, number];
  showHotspots?: boolean;
}) {
  const websiteTexture = useStore((s) => s.websiteTexture);
  const heatmapVisible = useStore((s) => s.heatmapVisible);

  return (
    <group position={position}>
      {websiteTexture ? (
        <TexturedSurface texture={websiteTexture} />
      ) : (
        <FallbackSurface />
      )}
      <HotspotOverlay show={showHotspots} />
      <HeatmapOverlay visible={heatmapVisible} width={SURFACE_WIDTH} height={SURFACE_HEIGHT} />
    </group>
  );
}
