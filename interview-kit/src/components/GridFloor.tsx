import { Grid } from '@react-three/drei';

export function GridFloor() {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#1e3a5f"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#0f172a"
      fadeDistance={25}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
    />
  );
}