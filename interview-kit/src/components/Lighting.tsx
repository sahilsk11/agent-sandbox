import { Environment } from '@react-three/drei';

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00d4ff" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#a855f7" />
      <Environment preset="studio" background={false} />
    </>
  );
}