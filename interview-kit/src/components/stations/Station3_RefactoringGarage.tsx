import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function Station3_RefactoringGarage() {
  const gear1Ref = useRef<Mesh>(null);
  const gear2Ref = useRef<Mesh>(null);

  useFrame(() => {
    if (gear1Ref.current) {
      gear1Ref.current.rotation.z += 0.02;
    }
    if (gear2Ref.current) {
      gear2Ref.current.rotation.z -= 0.015;
    }
  });

  return (
    <group>
      <mesh ref={gear1Ref} position={[-0.2, 0, 0]}>
        <torusGeometry args={[0.35, 0.1, 8, 24]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#ea580c"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={gear2Ref} position={[0.25, 0, 0]}>
        <torusGeometry args={[0.25, 0.08, 8, 20]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#ea580c"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.45,
              0,
              Math.sin(angle) * 0.45,
            ]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <boxGeometry args={[0.08, 0.08, 0.15]} />
            <meshStandardMaterial color="#ea580c" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}