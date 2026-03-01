import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { DEFAULT_HOTSPOTS, Hotspot } from '../data/hotspots';
import HtmlSurface from './HtmlSurface';
import { useWebsite } from '../context/WebsiteContext';

/** Website surface dimensions in 3D world units */
export const SURFACE_WIDTH = 12;
export const SURFACE_HEIGHT = 8;

/** Convert normalized 0-1 hotspot coords to 3D world position on the surface */
export function hotspotToWorld(
  hotspot: Hotspot,
  surfacePos: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  const cx = hotspot.x + hotspot.w / 2;
  const cy = hotspot.y + hotspot.h / 2;
  const worldX = (cx - 0.5) * SURFACE_WIDTH + surfacePos[0];
  const worldY = (0.5 - cy) * SURFACE_HEIGHT + surfacePos[1];
  const worldZ = surfacePos[2] + 0.01;
  return [worldX, worldY, worldZ];
}

/** Convert normalized 0-1 coords to world position */
export function normalizedToWorld(
  nx: number,
  ny: number,
  surfacePos: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  const worldX = (nx - 0.5) * SURFACE_WIDTH + surfacePos[0];
  const worldY = (0.5 - ny) * SURFACE_HEIGHT + surfacePos[1];
  const worldZ = surfacePos[2] + 0.01;
  return [worldX, worldY, worldZ];
}

export function FallbackSurface() {
  return (
    <group>
      {/* Dark background plane */}
      <mesh>
        <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>

      {/* Grid lines to simulate a website wireframe */}
      {/* Navbar */}
      <mesh position={[0, SURFACE_HEIGHT / 2 - 0.3, 0.001]}>
        <planeGeometry args={[SURFACE_WIDTH - 0.2, 0.5]} />
        <meshBasicMaterial color="#111128" />
      </mesh>
      <Text position={[-4.5, SURFACE_HEIGHT / 2 - 0.3, 0.002]} fontSize={0.2} color="#4444aa">
        ◆ SaaS App
      </Text>
      <Text position={[1, SURFACE_HEIGHT / 2 - 0.3, 0.002]} fontSize={0.12} color="#666">
        Features    Pricing    Docs
      </Text>
      <mesh position={[4.8, SURFACE_HEIGHT / 2 - 0.3, 0.002]}>
        <planeGeometry args={[1.0, 0.3]} />
        <meshBasicMaterial color="#4444cc" />
      </mesh>
      <Text position={[4.8, SURFACE_HEIGHT / 2 - 0.3, 0.003]} fontSize={0.11} color="#fff">
        Sign Up
      </Text>

      {/* Hero section */}
      <Text position={[0, 1.8, 0.002]} fontSize={0.35} color="#e0e0ff" maxWidth={10} textAlign="center">
        Build Better Products
      </Text>
      <Text position={[0, 1.2, 0.002]} fontSize={0.15} color="#888" maxWidth={8} textAlign="center">
        AI-powered behavioral analytics for modern teams
      </Text>

      {/* CTA buttons */}
      <mesh position={[-1.0, 0.5, 0.002]}>
        <planeGeometry args={[2.0, 0.45]} />
        <meshBasicMaterial color="#3344dd" />
      </mesh>
      <Text position={[-1.0, 0.5, 0.003]} fontSize={0.14} color="#fff">
        Get Started Free
      </Text>
      <mesh position={[1.3, 0.5, 0.002]}>
        <planeGeometry args={[1.6, 0.45]} />
        <meshBasicMaterial color="transparent" transparent opacity={0} />
      </mesh>
      <Text position={[1.3, 0.5, 0.003]} fontSize={0.14} color="#6666ff">
        Learn More →
      </Text>

      {/* Hero image placeholder */}
      <mesh position={[0, -0.7, 0.002]}>
        <planeGeometry args={[9.0, 2.0]} />
        <meshBasicMaterial color="#0d0d25" />
      </mesh>
      <Text position={[0, -0.7, 0.003]} fontSize={0.15} color="#333">
        [ Dashboard Preview ]
      </Text>

      {/* Feature cards */}
      {[-3.2, 0, 3.2].map((xPos, i) => (
        <group key={i} position={[xPos, -2.5, 0.002]}>
          <mesh>
            <planeGeometry args={[3.0, 1.5]} />
            <meshBasicMaterial color="#0e0e28" />
          </mesh>
          <Text position={[0, 0.35, 0.001]} fontSize={0.14} color="#aaa">
            {['Analytics', 'Automation', 'Insights'][i]}
          </Text>
          <Text position={[0, -0.05, 0.001]} fontSize={0.09} color="#555" maxWidth={2.5} textAlign="center">
            Feature description goes here with key details
          </Text>
        </group>
      ))}

      {/* Bottom CTA */}
      <mesh position={[0, -3.6, 0.002]}>
        <planeGeometry args={[4.5, 0.5]} />
        <meshBasicMaterial color="#2233bb" />
      </mesh>
      <Text position={[0, -3.6, 0.003]} fontSize={0.14} color="#fff">
        Start Your Free Trial
      </Text>

      {/* Subtle border around the whole surface */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(SURFACE_WIDTH, SURFACE_HEIGHT)]} />
        <lineBasicMaterial color="#333366" />
      </lineSegments>
    </group>
  );
}

function TexturedSurface({ texture }: { texture: THREE.Texture }) {
  return (
    <mesh>
      <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** Renders small debug outlines for each hotspot (optional, for dev) */
function HotspotOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <group position={[0, 0, 0.005]}>
      {DEFAULT_HOTSPOTS.map((h) => {
        const cx = (h.x + h.w / 2 - 0.5) * SURFACE_WIDTH;
        const cy = (0.5 - h.y - h.h / 2) * SURFACE_HEIGHT;
        const w = h.w * SURFACE_WIDTH;
        const hh = h.h * SURFACE_HEIGHT;
        return (
          <lineSegments key={h.id} position={[cx, cy, 0]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(w, hh)]} />
            <lineBasicMaterial
              color={h.type === 'cta' ? '#ff4488' : h.type === 'nav' ? '#44ff88' : '#4488ff'}
              transparent
              opacity={0.4}
            />
          </lineSegments>
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
  const { registerHandle } = useWebsite();

  return (
    <group position={position}>
      {websiteTexture ? (
        <TexturedSurface texture={websiteTexture} />
      ) : (
        <HtmlSurface position={[0, 0, 0]} onReady={registerHandle} />
      )}
      <HotspotOverlay show={showHotspots} />
    </group>
  );
}
