import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVoyage } from "../store";
import Water from "./Water";
import Boat from "./Boat";
import Billboards from "./Billboards";
import Pillars from "./Pillars";
import SceneEnvironment from "./Environment";
import CameraRig from "./CameraRig";
import Effects from "./Effects";

const _fogClear = new THREE.Color("#0a1626");
const _fogNight = new THREE.Color("#05080f");
const _bgNight = new THREE.Color("#02040a");
const _bgDawn = new THREE.Color("#0c1830");

/** Drives scroll inertia + the calming of the world at the journey's end. */
function Controller() {
  const { scene } = useThree();

  useFrame((_, dt) => {
    const s = useVoyage.getState();
    // inertia: ease progress toward the scroll target (gentle, slow drift)
    const next = THREE.MathUtils.damp(s.progress, s.target, 1.6, dt);
    s.setProgress(next);

    const end = THREE.MathUtils.smoothstep(next, 0.92, 1.0);
    if (scene.fog && (scene.fog as THREE.FogExp2).density !== undefined) {
      const fog = scene.fog as THREE.FogExp2;
      fog.density = THREE.MathUtils.lerp(0.0125, 0.0045, end);
      fog.color.copy(_fogNight).lerp(_fogClear, end);
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(_bgNight).lerp(_bgDawn, end);
    }
  });

  return null;
}

export default function Experience() {
  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <fogExp2 attach="fog" args={["#05080f", 0.0125]} />

      <Controller />
      <CameraRig />

      <SceneEnvironment />
      <Water />
      <Boat />
      <Billboards />
      <Pillars />

      <Effects />
    </>
  );
}
