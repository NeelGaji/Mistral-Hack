import { useRef } from 'react';
import { Html } from '@react-three/drei';
import InteractiveWebsite, { InteractiveWebsiteHandle } from './InteractiveWebsite';
import { SURFACE_WIDTH, SURFACE_HEIGHT } from './WebsiteSurface';

/**
 * Pixel dimensions for the HTML content.
 * Scaled down to fit SURFACE_WIDTH x SURFACE_HEIGHT in 3D.
 */
const HTML_WIDTH = 960;
const HTML_HEIGHT = 640;

/** Scale factor to map HTML px → 3D world units */
const SCALE_X = SURFACE_WIDTH / HTML_WIDTH;
const SCALE_Y = SURFACE_HEIGHT / HTML_HEIGHT;

export { SCALE_X, SCALE_Y, HTML_WIDTH, HTML_HEIGHT };

export interface HtmlSurfaceProps {
  position?: [number, number, number];
  onReady?: (handle: InteractiveWebsiteHandle) => void;
}

export default function HtmlSurface({
  position = [0, 0, 0],
  onReady,
}: HtmlSurfaceProps) {
  const websiteRef = useRef<InteractiveWebsiteHandle>(null!);
  const readyFiredRef = useRef(false);

  const handleRef = (node: InteractiveWebsiteHandle | null) => {
    if (node && !readyFiredRef.current) {
      websiteRef.current = node;
      readyFiredRef.current = true;
      onReady?.(node);
    }
  };

  return (
    <group position={position}>
      {/* Invisible backing plane for visual reference / click raycasting */}
      <mesh>
        <planeGeometry args={[SURFACE_WIDTH, SURFACE_HEIGHT]} />
        <meshBasicMaterial color="#0a0a1a" transparent opacity={0.5} />
      </mesh>

      {/* HTML content embedded in the 3D scene */}
      <Html
        transform
        occlude={false}
        position={[0, 0, 0.01]}
        scale={[SCALE_X, SCALE_Y, 1]}
        style={{
          width: `${HTML_WIDTH}px`,
          height: `${HTML_HEIGHT}px`,
          overflow: 'hidden',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      >
        <InteractiveWebsite
          ref={handleRef}
          width={HTML_WIDTH}
          height={HTML_HEIGHT}
        />
      </Html>
    </group>
  );
}
