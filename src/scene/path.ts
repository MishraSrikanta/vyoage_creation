import * as THREE from "three";
import { projects } from "../data/projects";

/**
 * The voyage spline. The boat travels along this curve from t=0 (start, alone in
 * the dark) to t=1 (the RGB pillars). It gently curves through the lake with no
 * sharp turns — control points only drift in X while marching steadily in -Z.
 */
const CONTROL_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(7, 0, -60),
  new THREE.Vector3(-6, 0, -130),
  new THREE.Vector3(9, 0, -205),
  new THREE.Vector3(-8, 0, -290),
  new THREE.Vector3(6, 0, -380),
  new THREE.Vector3(-5, 0, -475),
  new THREE.Vector3(0, 0, -560),
  new THREE.Vector3(0, 0, -640),
];

export const path = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, "catmullrom", 0.5);

/** A reusable tmp so we don't allocate every frame. */
const _p = new THREE.Vector3();
const _t = new THREE.Vector3();

export function pointAt(t: number, out = _p) {
  return path.getPointAt(THREE.MathUtils.clamp(t, 0, 1), out);
}
export function tangentAt(t: number, out = _t) {
  return path.getTangentAt(THREE.MathUtils.clamp(t, 0, 1), out).normalize();
}

/**
 * Where each project's billboard lives along the path. Projects are spaced
 * between t=0.08 and t=0.9, alternating left/right, with deterministic
 * per-index variation in distance, height and rotation so the journey feels
 * natural and hand-placed rather than gridded.
 */
export interface BillboardPlacement {
  index: number;
  t: number; // param along the path where the camera focuses
  position: THREE.Vector3;
  rotationY: number;
  side: 1 | -1;
}

function pseudo(i: number, seed: number) {
  // deterministic 0..1 hash-ish value
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const placements: BillboardPlacement[] = projects.map((_, i) => {
  const t = THREE.MathUtils.lerp(0.08, 0.9, i / Math.max(1, projects.length - 1));
  const side: 1 | -1 = i % 2 === 0 ? 1 : -1;

  const center = pointAt(t, new THREE.Vector3());
  const tan = tangentAt(t, new THREE.Vector3());
  // perpendicular in the XZ plane
  const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

  const distance = 13 + pseudo(i, 1) * 5; // 13..18 from the path — close enough to read clearly
  const height = 6.5 + pseudo(i, 2) * 2.5; // billboard centre height
  const pos = center
    .clone()
    .addScaledVector(normal, distance * side)
    .setY(height);

  // face roughly toward the boat path, with a slight imperfect tilt
  const toPath = center.clone().sub(pos);
  const baseRot = Math.atan2(toPath.x, toPath.z);
  const jitter = (pseudo(i, 3) - 0.5) * 0.35;

  return { index: i, t, position: pos, rotationY: baseRot + jitter, side };
});

/** World-space position of the three RGB destination pillars (end of journey). */
export const PILLARS_Z = -648;
