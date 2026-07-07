import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVoyage } from "../store";
import { pointAt, tangentAt, placements } from "./path";
import { waveHeight } from "./wave";
import { dofTarget } from "./shared";

const FOCUS_RANGE = 0.05;

const _boat = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

const _defaultPos = new THREE.Vector3();
const _defaultLook = new THREE.Vector3();
const _focusPos = new THREE.Vector3();
const _focusLook = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentLook = new THREE.Vector3(0, 1, -10);

export default function CameraRig() {
  const lastActive = useRef(-2);

  useFrame((state, dt) => {
    const { camera, clock } = state;
    const t = clock.elapsedTime;
    const p = useVoyage.getState().progress;

    const boat = pointAt(p, _boat);
    const boatY = waveHeight(boat.x, boat.z, t) + 0.15;
    boat.y = boatY;
    const tan = tangentAt(p, _tan).normalize();
    _right.crossVectors(_up, tan).normalize();

    // ---- default cinematic follow: behind & above the boat ----
    _defaultPos
      .copy(boat)
      .addScaledVector(tan, -12.5)
      .addScaledVector(_up, 6.8)
      .addScaledVector(_right, 1.4);
    _defaultLook.copy(boat).addScaledVector(tan, 14).addScaledVector(_up, 1.4);

    // ---- find the nearest billboard and compute focus blend ----
    let nearest = -1;
    let nearDist = Infinity;
    for (const pl of placements) {
      const d = Math.abs(p - pl.t);
      if (d < nearDist) {
        nearDist = d;
        nearest = pl.index;
      }
    }
    let focus = 0;
    if (nearest >= 0 && nearDist < FOCUS_RANGE) {
      focus = 1 - THREE.MathUtils.smoothstep(nearDist, 0.0, FOCUS_RANGE);
      // ease so the dwell at the billboard feels held
      focus = focus * focus * (3 - 2 * focus);
      const bb = placements[nearest].position;
      // sit between boat and billboard, pulled back & up so the boat stays in frame
      _focusPos
        .copy(boat)
        .addScaledVector(tan, -6)
        .addScaledVector(_up, 3.4);
      _focusPos.lerp(bb, 0.5);
      _focusPos.y = Math.max(_focusPos.y, 3.6);
      _focusLook.copy(bb);
    } else {
      _focusPos.copy(_defaultPos);
      _focusLook.copy(_defaultLook);
    }

    // active-project store write (only on change → no per-frame re-renders)
    const activeNow = nearDist < FOCUS_RANGE * 0.9 ? nearest : -1;
    if (activeNow !== lastActive.current) {
      lastActive.current = activeNow;
      useVoyage.getState().setActive(activeNow, focus);
    }

    // ---- blend default <-> focus, then damp ----
    _targetPos.copy(_defaultPos).lerp(_focusPos, focus);
    _targetLook.copy(_defaultLook).lerp(_focusLook, focus);

    const k = 1 - Math.pow(0.0015, dt); // smooth damping
    camera.position.lerp(_targetPos, k);
    _currentLook.lerp(_targetLook, k);
    camera.lookAt(_currentLook);

    // depth-of-field focus point follows what we're looking at
    dofTarget.lerp(_currentLook, k);
  });

  return null;
}
