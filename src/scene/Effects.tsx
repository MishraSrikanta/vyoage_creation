import { EffectComposer, Bloom, DepthOfField, Vignette, SMAA } from "@react-three/postprocessing";
import { useVoyage } from "../store";
import { dofTarget } from "./shared";

export default function Effects() {
  const lowPower = useVoyage((s) => s.lowPower);

  if (lowPower) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette darkness={0.62} offset={0.28} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField target={dofTarget} focalLength={0.025} bokehScale={3.2} height={480} />
      <Bloom intensity={0.95} luminanceThreshold={0.2} luminanceSmoothing={0.35} mipmapBlur radius={0.7} />
      <Vignette darkness={0.65} offset={0.3} />
      <SMAA />
    </EffectComposer>
  );
}
