import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVoyage } from "../store";
import { pointAt, PILLARS_Z } from "./path";

/**
 * GPU procedural ocean. Waves are a world-space height field summed from a few
 * directional swells plus value-noise chop, so the surface keeps moving even
 * when idle. Normals are derived by finite differences in the vertex shader.
 * The fragment stage fakes reflections via fresnel + moon/lantern/pillar
 * speculars and folds in exponential distance fog toward the horizon.
 */

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vWave;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float waveHeight(vec2 p, float t){
    float h = 0.0;
    h += sin(dot(p, vec2(0.12, 0.06)) + t*0.80) * 0.55;
    h += sin(dot(p, vec2(-0.07,0.15)) + t*0.65) * 0.45;
    h += sin(dot(p, vec2(0.20,-0.13)) + t*1.10) * 0.22;
    h += (noise(p*0.25 + t*0.10) - 0.5) * 0.55;
    h += (noise(p*0.60 - t*0.15) - 0.5) * 0.18;
    return h * uAmp;
  }

  void main(){
    vec4 world = modelMatrix * vec4(position, 1.0);
    float e = 1.25;
    float h  = waveHeight(world.xz, uTime);
    float hx = waveHeight(world.xz + vec2(e, 0.0), uTime);
    float hz = waveHeight(world.xz + vec2(0.0, e), uTime);
    world.y += h;
    vec3 tx = vec3(e, hx - h, 0.0);
    vec3 tz = vec3(0.0, hz - h, e);
    vNormal = normalize(cross(tz, tx));
    vWorld = world.xyz;
    vWave = h / max(uAmp, 0.001);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uSky;
  uniform vec3 uMoonDir;
  uniform vec3 uMoonColor;
  uniform vec3 uLanternPos;
  uniform vec3 uLanternColor;
  uniform float uLanternRange;
  uniform float uLanternFlicker;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform vec3 uPillarPos[3];
  uniform vec3 uPillarColor[3];
  uniform float uPillarStrength;

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vWave;

  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    fres = clamp(0.02 + fres * 0.98, 0.0, 1.0);

    vec3 col = mix(uDeep, uSky, fres * 0.6);

    // Moonlight: a sharp glint plus the classic broad moon path on the water
    vec3 H = normalize(uMoonDir + V);
    float mAlign = max(dot(N, H), 0.0);
    col += uMoonColor * pow(mAlign, 220.0) * 1.8;   // sharp sparkles
    col += uMoonColor * pow(mAlign, 14.0) * 0.55;   // long shimmering reflection path

    // Warm lantern reflection — a glowing column of light cast onto the water
    vec3 Ld = uLanternPos - vWorld;
    float dist = length(Ld);
    vec3 Ldn = Ld / max(dist, 0.001);
    float atten = clamp(1.0 - dist / uLanternRange, 0.0, 1.0);
    atten *= atten * uLanternFlicker;
    vec3 Hl = normalize(Ldn + V);
    float lAlign = max(dot(N, Hl), 0.0);
    float lStreak = pow(lAlign, 18.0);   // broad warm smear
    float lCore = pow(lAlign, 110.0);    // bright reflected core
    col += uLanternColor * (max(dot(N, Ldn), 0.0) * 0.3 + lStreak * 1.8 + lCore * 3.2) * atten;

    // RGB destination pillar reflections — long vertical streaks across the lake
    for (int i = 0; i < 3; i++){
      vec3 Pd = uPillarPos[i] - vWorld;
      float pdist = length(Pd);
      vec3 Pn = Pd / max(pdist, 0.001);
      float pa = clamp(1.0 - pdist / 360.0, 0.0, 1.0);
      pa *= pa;
      vec3 Hp = normalize(Pn + V);
      float streak = pow(max(dot(N, Hp), 0.0), 22.0);      // broad smear
      float core   = pow(max(dot(N, Hp), 0.0), 90.0);      // bright core
      col += uPillarColor[i] * (streak * 3.0 + core * 4.5) * uPillarStrength * pa;
    }

    // Crest foam
    col += vec3(0.72, 0.80, 0.88) * smoothstep(0.45, 0.85, vWave) * 0.4;

    // Distance fog
    float camDist = length(cameraPosition - vWorld);
    float fog = 1.0 - exp(-uFogDensity * camDist);
    col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Water() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const lowPower = useVoyage((s) => s.lowPower);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 1.0 },
      uDeep: { value: new THREE.Color("#020608") },
      uSky: { value: new THREE.Color("#0a1626") },
      uMoonDir: { value: new THREE.Vector3(-0.4, 0.65, 0.6).normalize() },
      uMoonColor: { value: new THREE.Color("#9fb4d6") },
      uLanternPos: { value: new THREE.Vector3(0, 2, 0) },
      uLanternColor: { value: new THREE.Color("#ffb74d") },
      uLanternRange: { value: 26 },
      uLanternFlicker: { value: 1 },
      uFogColor: { value: new THREE.Color("#05080f") },
      uFogDensity: { value: 0.0125 },
      uPillarPos: {
        value: [
          new THREE.Vector3(-9, 40, PILLARS_Z),
          new THREE.Vector3(0, 40, PILLARS_Z),
          new THREE.Vector3(9, 40, PILLARS_Z),
        ],
      },
      uPillarColor: {
        value: [
          new THREE.Color("#ff2d55"),
          new THREE.Color("#34d058"),
          new THREE.Color("#2d7dff"),
        ],
      },
      uPillarStrength: { value: 0 },
    }),
    []
  );

  const segments = lowPower ? 140 : 240;
  const _boat = useRef(new THREE.Vector3());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    // follow the boat so the wave field is effectively endless
    const p = useVoyage.getState().progress;
    const boat = pointAt(p, _boat.current);
    if (meshRef.current) meshRef.current.position.set(boat.x, 0, boat.z);

    // lantern flicker + pillar ramp near the end
    const flicker = 0.85 + Math.sin(t * 13.0) * 0.05 + Math.sin(t * 7.3) * 0.05;
    uniforms.uLanternFlicker.value = flicker;
    uniforms.uLanternPos.value.set(boat.x, 2.2, boat.z - 2.5);
    // pillar reflections fade in earlier so they're clearly visible on approach
    uniforms.uPillarStrength.value = 0.25 + 1.05 * THREE.MathUtils.smoothstep(p, 0.55, 1.0);

    // the lake grows calm as the journey ends
    uniforms.uAmp.value = 1 - 0.7 * THREE.MathUtils.smoothstep(p, 0.93, 1.0);
  });

  return (
    <mesh
      ref={meshRef}
      rotation-x={-Math.PI / 2}
      frustumCulled={false}
    >
      <planeGeometry args={[760, 760, segments, segments]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
