import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ui/ErrorBoundary';

function createSeededRandom(initialSeed = 12345) {
  let s = initialSeed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Geometry for concentric sacred circles & triangles (Sri Yantra / Mandala inspired)
function SacredWireframe({ color }) {
  const groupRef = useRef();

  const lines = useMemo(() => {
    const geometries = [];

    // Concentric rings
    const ringRadii = [1.2, 2.0, 2.8, 3.6];
    ringRadii.forEach((r) => {
      const pts = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
      }
      geometries.push(new THREE.BufferGeometry().setFromPoints(pts));
    });

    // 9 Intersecting Triangles (Sri Yantra structure)
    const triangles = [
      // 4 upward triangles
      { apexY: 2.6, baseY: -1.4, halfBase: 2.4 },
      { apexY: 2.1, baseY: -0.9, halfBase: 2.0 },
      { apexY: 1.6, baseY: -0.4, halfBase: 1.6 },
      { apexY: 1.1, baseY: 0.1, halfBase: 1.2 },
      // 5 downward triangles
      { apexY: -2.6, baseY: 1.4, halfBase: 2.4 },
      { apexY: -2.2, baseY: 1.0, halfBase: 2.1 },
      { apexY: -1.7, baseY: 0.6, halfBase: 1.7 },
      { apexY: -1.2, baseY: 0.2, halfBase: 1.3 },
      { apexY: -0.8, baseY: -0.1, halfBase: 0.9 },
    ];

    triangles.forEach((t) => {
      const pts = [
        new THREE.Vector3(0, t.apexY, 0),
        new THREE.Vector3(t.halfBase, t.baseY, 0),
        new THREE.Vector3(-t.halfBase, t.baseY, 0),
        new THREE.Vector3(0, t.apexY, 0),
      ];
      geometries.push(new THREE.BufferGeometry().setFromPoints(pts));
    });

    return geometries;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.05;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.15;
      groupRef.current.rotation.y = Math.cos(Date.now() * 0.0003) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {lines.map((geom, idx) => (
        <lineLoop key={idx} geometry={geom}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={idx < 4 ? 0.22 : 0.14}
            blending={THREE.AdditiveBlending}
            linewidth={1}
          />
        </lineLoop>
      ))}
    </group>
  );
}

// 1500 Instanced GPU Embers rising vertically
function RisingEmbers({ count = 1200, color }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const rng = createSeededRandom(42);
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: (rng() - 0.5) * 16,
        y: (rng() - 0.5) * 14,
        z: (rng() - 0.5) * 8 - 1,
        speedY: 0.3 + rng() * 0.7,
        speedX: (rng() - 0.5) * 0.15,
        scale: 0.02 + rng() * 0.045,
        pulseSpeed: 1 + rng() * 2,
        phase: rng() * Math.PI * 2,
      });
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const time = Date.now() * 0.001;

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.y += p.speedY * delta;
      p.x += Math.sin(time * p.pulseSpeed + p.phase) * delta * 0.2;

      // Wrap around top to bottom
      if (p.y > 7) {
        p.y = -7;
        p.x = ((i * 17) % 16) - 8;
      }

      dummy.position.set(p.x, p.y, p.z);
      const s = p.scale * (1 + 0.3 * Math.sin(time * 3 + p.phase));
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

// Camera parallax with dampened mouse tracking
function CameraController() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    if (!camera || !pointer) return;
    const px = typeof pointer.x === 'number' && Number.isFinite(pointer.x) ? pointer.x : 0;
    const py = typeof pointer.y === 'number' && Number.isFinite(pointer.y) ? pointer.y : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x || 0, px * 0.8, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y || 0, py * 0.6, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Route-aware mood manager
const ROUTE_MOODS = {
  '/dashboard': { color: new THREE.Color('#FFE259'), bg: '#0A0A12' },
  '/campaign': { color: new THREE.Color('#FF7B00'), bg: '#100B0E' },
  '/quiz': { color: new THREE.Color('#00F0FF'), bg: '#060E18' },
  '/library': { color: new THREE.Color('#D4AF37'), bg: '#0E0C12' },
  '/chat': { color: new THREE.Color('#63B3ED'), bg: '#090D18' },
  '/rankings': { color: new THREE.Color('#F6AD55'), bg: '#0C0A14' },
  '/settings': { color: new THREE.Color('#4FD1C5'), bg: '#080F12' }
};

function checkWebGLSupport() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return Boolean(gl && (!navigator.hardwareConcurrency || navigator.hardwareConcurrency >= 2));
  } catch {
    return false;
  }
}

export const SacredScene = () => {
  const location = useLocation();
  const [currentColor, setCurrentColor] = useState(new THREE.Color('#D8AE6A'));
  const [supportsWebGL] = useState(checkWebGLSupport);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(media.matches);

      const listener = (e) => setPrefersReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  const targetMood = useMemo(() => {
    for (const [path, mood] of Object.entries(ROUTE_MOODS)) {
      if (location.pathname.startsWith(path)) return mood;
    }
    return ROUTE_MOODS['/dashboard'];
  }, [location.pathname]);

  useEffect(() => {
    setCurrentColor(targetMood.color);
  }, [targetMood]);

  const fallbackGradient = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 30%, rgba(197, 154, 86, 0.06) 0%, rgba(22, 23, 21, 0.98) 75%)'
      }}
    />
  );

  // If WebGL is unsupported OR user requests reduced motion, immediately render the dignified static mineral backdrop
  if (!supportsWebGL || prefersReducedMotion) {
    return fallbackGradient;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <ErrorBoundary fallback={fallbackGradient}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7], fov: 55 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <CameraController />
          <ambientLight intensity={0.4} />
          <SacredWireframe color={currentColor} />
          <RisingEmbers count={1200} color={currentColor} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default SacredScene;
