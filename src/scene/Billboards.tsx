import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects, Project } from "../data/projects";
import { placements, BillboardPlacement } from "./path";
import { useVoyage } from "../store";

const W = 12;
const H = 7;

function makeHero(project: Project) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 614;
  const ctx = c.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, 1024, 614);
  g.addColorStop(0, project.accent2);
  g.addColorStop(0.55, "#05070c");
  g.addColorStop(1, "#020306");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 614);

  // faint grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 614);
    ctx.stroke();
  }
  for (let y = 0; y < 614; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // accent glow blob
  const rg = ctx.createRadialGradient(760, 180, 0, 760, 180, 380);
  rg.addColorStop(0, project.accent + "aa");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, 1024, 614);

  ctx.fillStyle = project.accent;
  ctx.font = "600 26px Georgia, serif";
  ctx.fillText(project.category.toUpperCase() + "  ·  " + project.year, 64, 360);

  ctx.fillStyle = "#f2f5fb";
  ctx.font = "700 92px Georgia, serif";
  ctx.fillText(project.title, 60, 470);

  ctx.fillStyle = "rgba(232,237,245,0.7)";
  ctx.font = "300 30px Georgia, serif";
  const words = project.description.split(" ").slice(0, 9).join(" ");
  ctx.fillText(words + " …", 64, 530);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function Billboard({ placement, project }: { placement: BillboardPlacement; project: Project }) {
  const group = useRef<THREE.Group>(null!);
  const screen = useRef<THREE.MeshStandardMaterial>(null!);
  const border = useRef<THREE.MeshBasicMaterial>(null!);
  const light = useRef<THREE.PointLight>(null!);
  const hero = useMemo(() => makeHero(project), [project]);
  const accent = useMemo(() => new THREE.Color(project.accent), [project]);
  const activation = useRef(0);

  useFrame((state, dt) => {
    const p = useVoyage.getState().progress;
    const dist = Math.abs(p - placement.t);
    const target = 1 - THREE.MathUtils.smoothstep(dist, 0.0, 0.09);
    activation.current = THREE.MathUtils.damp(activation.current, target, 3.2, dt);
    const a = activation.current;

    if (screen.current) {
      // dark/matte by default → fully lit & crisp when active
      screen.current.emissiveIntensity = a * 1.9;
      screen.current.color.setRGB(a, a, a);
    }
    if (border.current) {
      // border is essentially off until the billboard wakes
      border.current.opacity = a * 0.95;
      border.current.color.copy(accent).multiplyScalar(0.6 + a * 2.2);
    }
    if (light.current) light.current.intensity = a * 11;

    // gentle idle float
    const t = state.clock.elapsedTime;
    group.current.position.y = placement.position.y + Math.sin(t * 0.6 + placement.index) * 0.12;
    group.current.rotation.z = Math.sin(t * 0.4 + placement.index) * 0.01;
  });

  return (
    <group
      ref={group}
      position={placement.position.toArray()}
      rotation={[-0.06, placement.rotationY, 0]}
    >
      {/* emissive border / frame glow */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[W + 0.4, H + 0.4]} />
        <meshBasicMaterial ref={border} color={accent} transparent opacity={0} toneMapped={false} />
      </mesh>
      {/* metallic frame */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[W + 0.22, H + 0.22]} />
        <meshStandardMaterial color="#1a1d24" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* the screen */}
      <mesh>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          ref={screen}
          map={hero}
          emissive={accent}
          emissiveMap={hero}
          emissiveIntensity={0}
          color="#000000"
          roughness={0.4}
          metalness={0.2}
          toneMapped={false}
        />
      </mesh>
      {/* support post down toward the water */}
      <mesh position={[0, -H / 2 - 3.5, -0.1]}>
        <cylinderGeometry args={[0.14, 0.22, 9, 8]} />
        <meshStandardMaterial color="#14171e" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* accent light cast onto the scene when active */}
      <pointLight ref={light} color={accent} intensity={0} distance={34} decay={1.7} position={[0, 0, 4]} />
    </group>
  );
}

export default function Billboards() {
  return (
    <group>
      {placements.map((pl) => (
        <Billboard key={pl.index} placement={pl} project={projects[pl.index]} />
      ))}
    </group>
  );
}
