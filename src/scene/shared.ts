import * as THREE from "three";

/** Depth-of-field focus target, mutated by the camera rig each frame and read
 *  by the post-processing DepthOfField effect without triggering re-renders. */
export const dofTarget = new THREE.Vector3(0, 1, -10);
