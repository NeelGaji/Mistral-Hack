import { Canvas } from '@react-three/fiber';
import { PERSONAS } from '../data/personas';
import { useStore } from '../store/useStore';
import Arena from './Arena';
import ParticleSculpture from './ParticleSculpture';
import WebsiteSurface from './WebsiteSurface';
import AgentCursor from './AgentCursor';
import HeatmapOverlay from './HeatmapOverlay';

/** Positions for 5 sculptures in a row (race/split mode) */
const RACE_POSITIONS: [number, number, number][] = [
  [-8, 0, 0],
  [-4, 0, 0],
  [0, 0, 0],
  [4, 0, 0],
  [8, 0, 0],
];

/** Surface position in 3D space */
const SURFACE_POS: [number, number, number] = [0, 1, 0];

export default function SceneContainer() {
  const mode = useStore((s) => s.mode);
  const activePersona = useStore((s) => s.activePersona);
  const viewMode = useStore((s) => s.viewMode);

  if (viewMode === 'simulation') {
    return <SimulationView />;
  }

  if (viewMode === 'both') {
    return <BothView />;
  }

  // Particles-only mode
  if (mode === 'race') {
    return <RaceView />;
  }

  return <SoloView personaId={activePersona ?? 0} />;
}

function SimulationView() {
  const showAllCursors = useStore((s) => s.showAllCursors);
  const activePersona = useStore((s) => s.activePersona);
  const simulationRunning = useStore((s) => s.simulationRunning);
  const liveUrl = useStore((s) => s.liveUrl);
  const heatmapVisible = useStore((s) => s.heatmapVisible);

  const hasIframe = !!liveUrl;

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      style={{
        width: '100vw',
        height: '100vh',
        background: hasIframe ? 'transparent' : '#050510',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2,
        pointerEvents: simulationRunning ? 'auto' : 'none',
      }}
    >
      <SimulationArena />
      {!hasIframe && <WebsiteSurface position={SURFACE_POS} />}
      {hasIframe && (
        <IframeOverlaySurface heatmapVisible={heatmapVisible} />
      )}
      {showAllCursors
        ? PERSONAS.map((p) => (
            <AgentCursor key={p.id} persona={p} surfacePosition={hasIframe ? IFRAME_SURFACE_POS : SURFACE_POS} />
          ))
        : activePersona !== null && (
            <AgentCursor
              persona={PERSONAS[activePersona]}
              surfacePosition={hasIframe ? IFRAME_SURFACE_POS : SURFACE_POS}
              showLabel={true}
            />
          )}
    </Canvas>
  );
}

function BothView() {
  const showAllCursors = useStore((s) => s.showAllCursors);
  const activePersona = useStore((s) => s.activePersona);

  return (
    <Canvas
      camera={{ position: [0, 3, 18], fov: 50 }}
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh', background: '#050510' }}
    >
      <Arena />

      {/* Website surface in center */}
      <group position={[0, 2, -2]}>
        <WebsiteSurface position={[0, 0, 0]} />
        {showAllCursors
          ? PERSONAS.map((p) => (
              <AgentCursor key={p.id} persona={p} surfacePosition={[0, 0, 0]} />
            ))
          : activePersona !== null && (
              <AgentCursor
                persona={PERSONAS[activePersona]}
                surfacePosition={[0, 0, 0]}
                showLabel={true}
              />
            )}
      </group>

      {/* Small particle sculptures below */}
      {PERSONAS.map((p, i) => (
        <ParticleSculpture
          key={p.id}
          persona={p}
          position={[RACE_POSITIONS[i][0], -3.5, 2]}
          scale={0.35}
        />
      ))}
    </Canvas>
  );
}

function RaceView() {
  return (
    <Canvas
      camera={{ position: [0, 6, 18], fov: 55 }}
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh', background: '#050510' }}
    >
      <Arena />
      {PERSONAS.map((p, i) => (
        <ParticleSculpture
          key={p.id}
          persona={p}
          position={RACE_POSITIONS[i]}
          scale={0.7}
        />
      ))}
    </Canvas>
  );
}

function SoloView({ personaId }: { personaId: number }) {
  const persona = PERSONAS[personaId];
  return (
    <Canvas
      camera={{ position: [0, 3, 10], fov: 50 }}
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh', background: '#050510' }}
    >
      <Arena />
      <ParticleSculpture persona={persona} position={[0, 0, 0]} scale={1.2} />
    </Canvas>
  );
}

/** Surface position aligned with the iframe overlay (centered, orthographic-like) */
const IFRAME_SURFACE_POS: [number, number, number] = [0, 0, 0];

/** Transparent overlay surface for heatmap when iframe is active */
function IframeOverlaySurface({ heatmapVisible }: { heatmapVisible: boolean }) {
  const OVERLAY_WIDTH = 7.5;
  const OVERLAY_HEIGHT = 8;
  return (
    <group position={IFRAME_SURFACE_POS}>
      <HeatmapOverlay visible={heatmapVisible} width={OVERLAY_WIDTH} height={OVERLAY_HEIGHT} />
    </group>
  );
}

/** Minimal arena for simulation view — just lighting, no orbit controls (locked camera) */
function SimulationArena() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#8888ff" />
      <pointLight position={[0, 5, 5]} intensity={0.4} color="#ffffff" distance={25} />
    </>
  );
}
