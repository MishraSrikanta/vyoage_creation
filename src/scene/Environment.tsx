import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Distant mountain ring + a final ridge, all very dark, read mostly via fog. */
function Mountains() {
  const geoms = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [];
    const center = new THREE.Vector3(0, 0, -220);
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + rand(i) * 0.3;
      const radius = 230 + rand(i + 99) * 130;
      const h = 50 + rand(i + 7) * 90;
      const w = 60 + rand(i + 3) * 70;
      list.push({
        pos: [center.x + Math.sin(a) * radius, h / 2 - 6, center.z + Math.cos(a) * radius],
        scale: [w, h, w],
        rot: rand(i + 21) * Math.PI,
      });
    }
    return list;
  }, []);

  return (
    <group>
      {geoms.map((m, i) => (
        <mesh key={i} position={m.pos} scale={m.scale} rotation-y={m.rot}>
          <coneGeometry args={[0.6, 1, 5, 1]} />
          <meshStandardMaterial color="#070b14" roughness={1} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Sparse rocky islands along the lake. */
function Islands() {
  const rocks = useMemo(() => {
    const list: { pos: [number, number, number]; scale: number; rot: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const z = -20 - i * 30 - rand(i) * 12;
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (30 + rand(i + 5) * 45);
      list.push({ pos: [x, -1.2 - rand(i + 2) * 0.6, z], scale: 2 + rand(i + 9) * 5, rot: rand(i) * Math.PI });
    }
    return list;
  }, []);

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} scale={r.scale} rotation={[rand(i) * 0.4, r.rot, rand(i + 1) * 0.3]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#0c1018" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** A few birds drifting across the moonlit sky. */
function Birds() {
  const group = useRef<THREE.Group>(null!);
  const birds = useMemo(
    () => new Array(3).fill(0).map((_, i) => ({ phase: rand(i) * 10, z: -60 - i * 110, y: 34 + rand(i + 1) * 18, speed: 0.04 + rand(i + 2) * 0.03 })),
    []
  );
  const refs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    birds.forEach((b, i) => {
      const g = refs.current[i];
      if (!g) return;
      const x = ((t * b.speed * 60 + b.phase * 30) % 200) - 100;
      g.position.set(x, b.y + Math.sin(t * 0.5 + b.phase) * 2, b.z);
      const flap = Math.sin(t * 6 + b.phase) * 0.4;
      g.children.forEach((c, ci) => (c.rotation.z = ci === 0 ? flap : -flap));
      g.rotation.y = -Math.PI / 2;
    });
  });

  return (
    <group ref={group}>
      {birds.map((b, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el!)}>
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1, 0.04, 0.18]} />
            <meshBasicMaterial color="#0a0d14" />
          </mesh>
          <mesh position={[-0.5, 0, 0]}>
            <boxGeometry args={[1, 0.04, 0.18]} />
            <meshBasicMaterial color="#0a0d14" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The moon + starfield ride along with the camera so the sky stays endless. */
function Sky() {
  const ref = useRef<THREE.Group>(null!);
  const halo = useMemo(dotTexture, []);
  useFrame((state) => {
    const c = state.camera;
    ref.current.position.set(c.position.x, 0, c.position.z);
  });
  return (
    <group ref={ref}>
      <mesh position={[-90, 95, 110]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#dfe7f5" toneMapped={false} />
      </mesh>
      {/* moon halo */}
      <sprite position={[-90, 95, 110]} scale={[70, 70, 1]}>
        <spriteMaterial map={halo} color="#aebfe0" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Stars radius={320} depth={140} count={4500} factor={5} saturation={0} fade speed={0.4} />
    </group>
  );
}

/** Sparse, small glowing motes drifting over the water — warm with a few cool. */
function Fireflies() {
  const ref = useRef<THREE.Points>(null!);
  const tex = useMemo(dotTexture, []);
  const count = 70;

  const { positions, colors, seeds, base } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = 0.5 + Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90;
      c.set(Math.random() > 0.28 ? "#ffce8a" : "#9fe8f2");
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, seeds, base: Float32Array.from(colors) };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    ref.current.position.set(cam.position.x, 0, cam.position.z);
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const col = ref.current.geometry.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + dt * 0.06 + Math.sin(t * 0.4 + seeds[i]) * 0.004;
      if (y > 16) y = 0.5;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.3 + seeds[i]) * 0.003);
      // soft twinkle
      const tw = 0.18 + 0.82 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.8 + seeds[i] * 3.0), 2.0);
      col.setXYZ(i, base[i * 3] * tw, base[i * 3 + 1] * tw, base[i * 3 + 2] * tw);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={tex}
        size={0.45}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

export default function SceneEnvironment() {
  return (
    <group>
      {/* the moon casts only a very small, cool light */}
      <directionalLight position={[-60, 90, 80]} intensity={0.28} color="#aebfe0" />
      <ambientLight intensity={0.1} color="#22304a" />
      <hemisphereLight args={["#16243d", "#01030a", 0.25]} />

      <Sky />
      <Fireflies />
      <Mountains />
      <Islands />
      <Birds />
    </group>
  );
}
