import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function Station2_SystemDesignLab() {
  const outerRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  useFrame(() => {
    if (outerRef.current) {
      outerRef.current.rotation.x += 0.005;
      outerRef.current.rotation.y += 0.01;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= 0.008;
      innerRef.current.rotation.z += 0.012;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh ref={innerRef}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial
          color="#a855f7"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.5,
              0,
              Math.sin(angle) * 0.5,
            ]}
          >
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
        );
      })}
    </group>
  );
}