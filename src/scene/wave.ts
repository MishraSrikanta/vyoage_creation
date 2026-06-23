/**
 * CPU mirror of the GLSL wave height field, used to float the boat, lantern and
 * wake on the same surface the water shader renders. Kept intentionally close to
 * the shader's `waveHeight` so the boat sits convincingly in the water.
 */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}

const AMP = 1.0;

export function waveHeight(x: number, z: number, t: number) {
  let h = 0;
  h += Math.sin(x * 0.12 + z * 0.06 + t * 0.8) * 0.55;
  h += Math.sin(x * -0.07 + z * 0.15 + t * 0.65) * 0.45;
  h += Math.sin(x * 0.2 + z * -0.13 + t * 1.1) * 0.22;
  h += (noise(x * 0.25 + t * 0.1, z * 0.25) - 0.5) * 0.55;
  h += (noise(x * 0.6 - t * 0.15, z * 0.6) - 0.5) * 0.18;
  return h * AMP;
}
