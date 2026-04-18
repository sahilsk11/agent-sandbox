import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import type { Mesh, Points } from 'three';

export function Station4_CultureFitLounge() {
  const sphereRef = useRef<Mesh>(null);
  const haloRef = useRef<Points>(null);

  const haloPositions = useMemo(() => {
    const arr = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.7 + Math.random() * 0.3;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
    }
    if (haloRef.current) {
      haloRef.current.rotation.y += 0.003;
      haloRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <MeshDistortMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.4}
          distort={0.2}
          speed={1.5}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>

      <points ref={haloRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[haloPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#10b981"
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
}