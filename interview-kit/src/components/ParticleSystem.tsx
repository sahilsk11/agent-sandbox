import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Points } from 'three';

interface ParticleSystemProps {
  count?: number;
}

export function ParticleSystem({ count = 500 }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = Math.random() * 15;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        colors[i3] = 0;
        colors[i3 + 1] = 0.83;
        colors[i3 + 2] = 1;
      } else if (colorChoice < 0.5) {
        colors[i3] = 0.66;
        colors[i3 + 1] = 0.33;
        colors[i3 + 2] = 0.97;
      } else if (colorChoice < 0.75) {
        colors[i3] = 0.92;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 0.07;
      } else {
        colors[i3] = 0.06;
        colors[i3 + 1] = 0.73;
        colors[i3 + 2] = 0.51;
      }
    }

    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.002;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </Float>
  );
}