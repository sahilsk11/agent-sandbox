import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { PerspectiveCamera as PerspectiveCameraType } from 'three';
import { useAppStore } from '../store/useAppStore';
import type { StationId } from '../store/useAppStore';

const hubPosition: [number, number, number] = [0, 2, 8];
const hubLookAt: [number, number, number] = [0, 0, 0];

const stationCameraPositions: Record<StationId, [number, number, number]> = {
  'leetcode': [-3, 1, 4],
  'system-design': [3, 1, 4],
  'refactoring': [-1, 1, 4],
  'culture-fit': [1, 1, 4],
};

const stationLookAts: Record<StationId, [number, number, number]> = {
  'leetcode': [-4, 1.5, 0],
  'system-design': [4, 1.5, 0],
  'refactoring': [-2.5, 1.5, -3.5],
  'culture-fit': [2.5, 1.5, -3.5],
};

export function HubCamera() {
  const cameraRef = useRef<PerspectiveCameraType>(null);
  const { activeStation } = useAppStore();

  const targetPosition = activeStation
    ? stationCameraPositions[activeStation]
    : hubPosition;
  const targetLookAt = activeStation
    ? stationLookAts[activeStation]
    : hubLookAt;

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    const currentPos = cameraRef.current.position;
    const lerpFactor = 1 - Math.pow(0.001, delta);

    currentPos.x += (targetPosition[0] - currentPos.x) * lerpFactor;
    currentPos.y += (targetPosition[1] - currentPos.y) * lerpFactor;
    currentPos.z += (targetPosition[2] - currentPos.z) * lerpFactor;

    const lookAtX = targetLookAt[0];
    const lookAtY = targetLookAt[1];
    const lookAtZ = targetLookAt[2];

    cameraRef.current.lookAt(lookAtX, lookAtY, lookAtZ);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={hubPosition}
      fov={50}
      near={0.1}
      far={100}
    />
  );
}