import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { useAppStore } from '../../store/useAppStore';
import type { StationId } from '../../store/useAppStore';

interface StationPortalProps {
  stationId: StationId;
  position: [number, number, number];
  color: string;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onClick: () => void;
  targetPosition: [number, number, number];
  children: ReactNode;
}

const stationLabels: Record<StationId, string> = {
  'leetcode': 'LeetCode Arena',
  'system-design': 'System Design Lab',
  'refactoring': 'Refactoring Garage',
  'culture-fit': 'Culture Lounge',
};

export function StationPortal({
  stationId,
  position,
  color,
  isHovered,
  onHover,
  onUnhover,
  onClick,
  children,
}: StationPortalProps) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const { activeStation } = useAppStore();
  const isActive = activeStation === stationId;

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const scale = isHovered || isActive ? 1.2 : 1;

  return (
    <group ref={groupRef} position={position}>
      <group scale={[scale, scale, scale]}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover();
          }}
          onPointerOut={() => {
            onUnhover();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {children}
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.02, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>

        <Html
          position={[0, 1.8, 0]}
          center
          distanceFactor={8}
          transform
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            color,
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
            textShadow: `0 0 8px ${color}`,
            whiteSpace: 'nowrap',
            background: 'rgba(10,10,26,0.6)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {stationLabels[stationId]}
          </div>
        </Html>
      </group>

      <pointLight color={color} intensity={isHovered ? 2 : 0.5} distance={3} />
    </group>
  );
}