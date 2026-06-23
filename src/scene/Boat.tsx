import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVoyage } from "../store";
import { pointAt, tangentAt } from "./path";
import { waveHeight } from "./wave";

/** Top-view hull outline (bow at -Y so that after rotateX the bow points to -Z). */
function makeHullGeometry() {
  const s = new THREE.Shape();
  // march from stern (+Y) around to the bow (-Y) and back
  s.moveTo(0, 2.4); // stern centre
  s.lineTo(0.95, 2.1);
  s.bezierCurveTo(1.25, 1.2, 1.25, -0.4, 1.05, -1.4);
  s.bezierCurveTo(0.85, -2.1, 0.45, -2.7, 0, -3.0); // bow tip
  s.bezierCurveTo(-0.45, -2.7, -0.85, -2.1, -1.05, -1.4);
  s.bezierCurveTo(-1.25, -0.4, -1.25, 1.2, -0.95, 2.1);
  s.lineTo(0, 2.4);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 1.15,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.18,
    bevelSegments: 2,
    steps: 1,
  });
  geo.rotateX(-Math.PI / 2); // length -> Z, height -> Y
  geo.translate(0, -0.55, 0); // straddle the waterline
  geo.computeVertexNormals();
  return geo;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,200,120,1)");
  g.addColorStop(0.25, "rgba(255,170,80,0.7)");
  g.addColorStop(1, "rgba(255,150,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _z = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _m = new THREE.Matrix4();
const _qHeading = new THREE.Quaternion();
const _qpr = new THREE.Quaternion();
const _euler = new THREE.Euler();

export default function Boat() {
  const group = useRef<THREE.Group>(null!);
  const lantern = useRef<THREE.PointLight>(null!);
  const flame = useRef<THREE.Mesh>(null!);
  const hull = useMemo(makeHullGeometry, []);
  const glow = useMemo(glowTexture, []);
  const lowPower = useVoyage((s) => s.lowPower);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = useVoyage.getState().progress;

    const pos = pointAt(p, _pos);
    const tan = tangentAt(p, _tan).normalize();

    // floating height at the boat centre
    const baseH = waveHeight(pos.x, pos.z, t);
    group.current.position.set(pos.x, baseH + 0.15, pos.z);

    // heading: align local -Z (bow) to travel direction
    _z.copy(tan).multiplyScalar(-1); // local +Z -> -forward
    _x.crossVectors(_up, _z).normalize();
    _y.crossVectors(_z, _x).normalize();
    _m.makeBasis(_x, _y, _z);
    _qHeading.setFromRotationMatrix(_m);

    // pitch & roll from sampling the wave field around the hull
    const fwd = tan;
    const right = _x; // already perpendicular, horizontal
    const dF = 2.2;
    const dS = 1.2;
    const hFore = waveHeight(pos.x + fwd.x * dF, pos.z + fwd.z * dF, t);
    const hAft = waveHeight(pos.x - fwd.x * dF, pos.z - fwd.z * dF, t);
    const hStar = waveHeight(pos.x + right.x * dS, pos.z + right.z * dS, t);
    const hPort = waveHeight(pos.x - right.x * dS, pos.z - right.z * dS, t);
    const pitch = Math.atan2(hAft - hFore, dF * 2) + Math.sin(t * 0.7) * 0.02;
    const roll = Math.atan2(hStar - hPort, dS * 2) + Math.sin(t * 0.9 + 1.3) * 0.025;
    _euler.set(pitch, 0, roll);
    _qpr.setFromEuler(_euler);

    const target = _qHeading.multiply(_qpr);
    group.current.quaternion.slerp(target, 1 - Math.pow(0.001, dt));

    // lantern flicker
    const fl = 2.6 + Math.sin(t * 13) * 0.25 + Math.sin(t * 7.3) * 0.2 + Math.sin(t * 23) * 0.1;
    if (lantern.current) lantern.current.intensity = fl;
    if (flame.current) {
      const sc = 1 + Math.sin(t * 17) * 0.08;
      flame.current.scale.setScalar(sc);
    }
  });

  return (
    <group ref={group}>
      {/* hull */}
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial color="#5a3d22" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* inner deck (darker, inset) */}
      <mesh position={[0, 0.05, -0.1]} scale={[0.82, 1, 0.86]} geometry={hull}>
        <meshStandardMaterial color="#2c1d10" roughness={0.95} />
      </mesh>
      {/* stern seat plank */}
      <mesh position={[0, 0.35, 1.4]} castShadow>
        <boxGeometry args={[1.7, 0.12, 0.5]} />
        <meshStandardMaterial color="#6b4a2b" roughness={0.8} />
      </mesh>
      {/* mid plank */}
      <mesh position={[0, 0.32, -0.2]} castShadow>
        <boxGeometry args={[1.9, 0.12, 0.5]} />
        <meshStandardMaterial color="#6b4a2b" roughness={0.8} />
      </mesh>

      {/* lantern pole at the bow */}
      <mesh position={[0, 1.0, -2.4]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.0, 8]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.95, -2.4]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#2a1d10" />
      </mesh>

      {/* lantern housing + flame */}
      <group position={[0, 1.7, -2.4]}>
        <mesh>
          <boxGeometry args={[0.34, 0.5, 0.34]} />
          <meshStandardMaterial
            color="#241a10"
            emissive="#ffb74d"
            emissiveIntensity={0.4}
            roughness={0.6}
            metalness={0.4}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh ref={flame}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
        </mesh>
        <sprite scale={[3.2, 3.2, 1]}>
          <spriteMaterial
            map={glow}
            color="#ffb74d"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <pointLight
          ref={lantern}
          color="#ffb060"
          intensity={2.6}
          distance={34}
          decay={1.6}
          castShadow={!lowPower}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0008}
        />
      </group>
    </group>
  );
}
