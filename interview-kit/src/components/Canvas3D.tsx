import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAppStore } from '../store/useAppStore';
import type { StationId } from '../store/useAppStore';
import { GridFloor } from './GridFloor';
import { Lighting } from './Lighting';
import { ParticleSystem } from './ParticleSystem';
import { HubCamera } from './HubCamera';
import { StationPortal } from './stations/StationPortal';
import { Station1_LeetCodeArena } from './stations/Station1_LeetCodeArena';
import { Station2_SystemDesignLab } from './stations/Station2_SystemDesignLab';
import { Station3_RefactoringGarage } from './stations/Station3_RefactoringGarage';
import { Station4_CultureFitLounge } from './stations/Station4_CultureFitLounge';

const stationPositions: Record<StationId, [number, number, number]> = {
  'leetcode': [-4, 1.5, 0],
  'system-design': [4, 1.5, 0],
  'refactoring': [-2.5, 1.5, -3.5],
  'culture-fit': [2.5, 1.5, -3.5],
};

const stationTargets: Record<StationId, [number, number, number]> = {
  'leetcode': [-2, 0.5, 3],
  'system-design': [2, 0.5, 3],
  'refactoring': [0, 0.5, 3],
  'culture-fit': [0, 0.5, 3],
};

function Scene() {
  const { setActiveStation, activeStation } = useAppStore();
  const [hoveredStation, setHoveredStation] = useState<StationId | null>(null);

  const stationColors: Record<StationId, string> = {
    'leetcode': '#00d4ff',
    'system-design': '#a855f7',
    'refactoring': '#ea580c',
    'culture-fit': '#10b981',
  };

  return (
    <>
      <HubCamera />
      <Lighting />
      <GridFloor />
      <ParticleSystem count={600} />

      {(Object.keys(stationPositions) as StationId[]).map((stationId) => (
        <StationPortal
          key={stationId}
          stationId={stationId}
          position={stationPositions[stationId]}
          color={stationColors[stationId]}
          isHovered={hoveredStation === stationId}
          onHover={() => setHoveredStation(stationId)}
          onUnhover={() => setHoveredStation(null)}
          onClick={() => setActiveStation(stationId)}
          targetPosition={stationTargets[stationId]}
        >
          {stationId === 'leetcode' && <Station1_LeetCodeArena />}
          {stationId === 'system-design' && <Station2_SystemDesignLab />}
          {stationId === 'refactoring' && <Station3_RefactoringGarage />}
          {stationId === 'culture-fit' && <Station4_CultureFitLounge />}
        </StationPortal>
      ))}

      {!activeStation && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={15}
          enablePan={false}
        />
      )}

      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          radius={0.5}
        />
      </EffectComposer>
    </>
  );
}

export function Canvas3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 8], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a1a', touchAction: 'none' }}
    >
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a1a', 10, 30]} />
      <Scene />
    </Canvas>
  );
}