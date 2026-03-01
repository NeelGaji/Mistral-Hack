import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import Arena from './Arena';
import ParticleSculpture from './ParticleSculpture';
import WebsiteSurface from './WebsiteSurface';
import AgentCursor from './AgentCursor';

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
  const personas = useStore((s) => s.personas);

  return (
    <Canvas
      camera={{ position: [0, 1, 12], fov: 45 }}
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh', background: '#050510' }}
    >
      <SimulationArena />
      <WebsiteSurface position={SURFACE_POS} />
      {showAllCursors
        ? personas.map((p) => (
            <AgentCursor key={p.id} persona={p} surfacePosition={SURFACE_POS} />
          ))
        : activePersona !== null && personas[activePersona] && (
            <AgentCursor
              persona={personas[activePersona]}
              surfacePosition={SURFACE_POS}
              showLabel={true}
            />
          )}
    </Canvas>
  );
}

function BothView() {
  const showAllCursors = useStore((s) => s.showAllCursors);
  const activePersona = useStore((s) => s.activePersona);
  const personas = useStore((s) => s.personas);

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
          ? personas.map((p) => (
              <AgentCursor key={p.id} persona={p} surfacePosition={[0, 0, 0]} />
            ))
          : activePersona !== null && personas[activePersona] && (
              <AgentCursor
                persona={personas[activePersona]}
                surfacePosition={[0, 0, 0]}
                showLabel={true}
              />
            )}
      </group>

      {/* Small particle sculptures below */}
      {personas.map((p, i) => (
        <ParticleSculpture
          key={p.id}
          persona={p}
          position={[(RACE_POSITIONS[i] || RACE_POSITIONS[0])[0], -3.5, 2]}
          scale={0.35}
        />
      ))}
    </Canvas>
  );
}

function RaceView() {
  const personas = useStore((s) => s.personas);
  return (
    <Canvas
      camera={{ position: [0, 6, 18], fov: 55 }}
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh', background: '#050510' }}
    >
      <Arena />
      {personas.map((p, i) => (
        <ParticleSculpture
          key={p.id}
          persona={p}
          position={RACE_POSITIONS[i] || [i * 4 - 8, 0, 0]}
          scale={0.7}
        />
      ))}
    </Canvas>
  );
}

function SoloView({ personaId }: { personaId: number }) {
  const personas = useStore((s) => s.personas);
  const persona = personas[personaId] || personas[0];
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

/** Minimal arena for simulation view — just lighting and controls */
function SimulationArena() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} color="#8888ff" />
      <pointLight position={[0, 5, 5]} intensity={0.4} color="#ffffff" distance={25} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2}
        enablePan
      />
    </>
  );
}
