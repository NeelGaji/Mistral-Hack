import { Stars, Grid, OrbitControls, Environment } from '@react-three/drei';

export default function Arena() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 15, 10]} intensity={0.4} color="#8888ff" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" distance={30} />

      {/* Cyberpunk grid floor */}
      <Grid
        position={[0, -3, 0]}
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a1a3e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3333aa"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Starfield background */}
      <Stars
        radius={100}
        depth={60}
        count={3000}
        factor={4}
        saturation={0.1}
        fade
        speed={0.5}
      />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
        enablePan={false}
        autoRotate={false}
        autoRotateSpeed={0.3}
      />
    </>
  );
}
