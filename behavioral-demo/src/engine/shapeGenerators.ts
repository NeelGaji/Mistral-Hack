import * as THREE from 'three';
import { PersonaConfig, PARTICLE_COUNT } from '../data/personas';

const _v = new THREE.Vector3();

/**
 * Generate target positions for particles based on persona sculpture shape.
 * Returns a Float32Array of [x,y,z, x,y,z, ...] for PARTICLE_COUNT particles.
 */
export function generatePositions(persona: PersonaConfig): Float32Array {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const { shape, spread, spikeLength } = persona.sculptureParams;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    switch (shape) {
      case 'starburst': {
        // Sharp spikes radiating from center
        const spike = spikeLength ?? 3.0;
        const isSpike = Math.random() < 0.35;
        if (isSpike) {
          // Create spike along a random axis
          _v.randomDirection();
          const len = (Math.random() * 0.5 + 0.5) * spike;
          _v.multiplyScalar(len);
        } else {
          // Core particles in a tight cluster
          _v.randomDirection().multiplyScalar(Math.random() * spread * 0.3);
        }
        positions[i3] = _v.x;
        positions[i3 + 1] = _v.y;
        positions[i3 + 2] = _v.z;
        break;
      }

      case 'sphere': {
        // Smooth evenly-distributed sphere
        _v.randomDirection();
        const r = Math.cbrt(Math.random()) * spread; // uniform volume distribution
        _v.multiplyScalar(r);
        positions[i3] = _v.x;
        positions[i3 + 1] = _v.y;
        positions[i3 + 2] = _v.z;
        break;
      }

      case 'streak': {
        // Flat horizontal streak — wide on X, thin on Y/Z
        positions[i3] = (Math.random() - 0.5) * spread * 2.5; // wide X
        positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.15; // thin Y
        positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.3; // thin Z
        break;
      }

      case 'grid': {
        // Ordered 3D grid lattice
        const gridSize = Math.ceil(Math.cbrt(PARTICLE_COUNT));
        const ix = i % gridSize;
        const iy = Math.floor(i / gridSize) % gridSize;
        const iz = Math.floor(i / (gridSize * gridSize));
        const step = (spread * 2) / gridSize;
        positions[i3] = (ix - gridSize / 2) * step;
        positions[i3 + 1] = (iy - gridSize / 2) * step;
        positions[i3 + 2] = (iz - gridSize / 2) * step;
        break;
      }

      case 'chaos': {
        // Erratic random cloud with random bursts
        _v.randomDirection();
        const dist = Math.random() * spread * (Math.random() < 0.2 ? 2.5 : 1.0);
        _v.multiplyScalar(dist);
        // Add random "jolt" offset
        positions[i3] = _v.x + (Math.random() - 0.5) * 1.5;
        positions[i3 + 1] = _v.y + (Math.random() - 0.5) * 1.5;
        positions[i3 + 2] = _v.z + (Math.random() - 0.5) * 1.5;
        break;
      }
    }
  }

  return positions;
}

/**
 * Generate sizes for particles based on persona.
 */
export function generateSizes(persona: PersonaConfig): Float32Array {
  const sizes = new Float32Array(PARTICLE_COUNT);
  const { shape } = persona.sculptureParams;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    switch (shape) {
      case 'starburst':
        sizes[i] = Math.random() < 0.35 ? 0.03 + Math.random() * 0.04 : 0.05 + Math.random() * 0.06;
        break;
      case 'sphere':
        sizes[i] = 0.04 + Math.random() * 0.03;
        break;
      case 'streak':
        sizes[i] = 0.03 + Math.random() * 0.03;
        break;
      case 'grid':
        sizes[i] = 0.045; // uniform
        break;
      case 'chaos':
        sizes[i] = 0.02 + Math.random() * 0.08;
        break;
    }
  }

  return sizes;
}
