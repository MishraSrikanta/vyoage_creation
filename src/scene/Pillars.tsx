import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVoyage } from "../store";
import { PILLARS_Z } from "./path";

const COLORS = ["#ff2d55", "#34d058", "#2d7dff"];
const XS = [-9, 0, 9];

export default function Pillars() {
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const lights = useRef<THREE.PointLight[]>([]);
  const beam = useRef<THREE.Mesh>(null!);
  const beamMat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame((state) => {
    const p = useVoyage.getState().progress;
    const ramp = THREE.MathUtils.smoothstep(p, 0.8, 1.0);
    const t = state.clock.elapsedTime;

    mats.current.forEach((m, i) => {
      if (m) m.opacity = 0.45 + ramp * 0.55 * (0.85 + Math.sin(t * 1.5 + i) * 0.15);
    });
    lights.current.forEach((l, i) => {
      if (l) l.intensity = (3 + ramp * 22) * (0.9 + Math.sin(t * 2 + i) * 0.1);
    });

    // final merge: a brilliant white beam at the very end
    const merge = THREE.MathUtils.smoothstep(p, 0.95, 1.0);
    if (beam.current && beamMat.current) {
      beam.current.scale.set(1 + merge * 2, 1, 1 + merge * 2);
      beamMat.current.opacity = merge;
    }
  });

  return (
    <group position={[0, 0, PILLARS_Z]}>
      {XS.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 45, 0]}>
            <boxGeometry args={[3.2, 95, 3.2]} />
            <meshBasicMaterial
              ref={(el) => (mats.current[i] = el!)}
              color={COLORS[i]}
              transparent
              opacity={0.25}
              toneMapped={false}
            />
          </mesh>
          {/* soft halo */}
          <mesh position={[0, 45, 0]}>
            <boxGeometry args={[5, 96, 5]} />
            <meshBasicMaterial color={COLORS[i]} transparent opacity={0.06} toneMapped={false} depthWrite={false} />
          </mesh>
          <pointLight
            ref={(el) => (lights.current[i] = el!)}
            color={COLORS[i]}
            intensity={0}
            distance={200}
            decay={1.2}
            position={[0, 26, 10]}
          />
        </group>
      ))}

      {/* the merged white beam reaching into the sky */}
      <mesh ref={beam} position={[0, 80, 0]}>
        <cylinderGeometry args={[2.5, 4, 220, 24, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
