import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { useVoyage } from "./store";
import Experience from "./scene/Experience";
import Intro from "./ui/Intro";
import Hud from "./ui/Hud";
import ProjectPanel from "./ui/ProjectPanel";
import FinalScene from "./ui/FinalScene";

const SCROLL_SPACER_HEIGHT = "7200vh";

export default function App() {
  const started = useVoyage((s) => s.started);
  const setLowPower = useVoyage((s) => s.setLowPower);
  const driverRef = useRef<HTMLDivElement>(null);

  // detect a low-power device once
  const lowPower = useMemo(() => {
    const cores = (navigator as any).hardwareConcurrency || 8;
    const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    return mobile || small || cores <= 4;
  }, []);

  useEffect(() => setLowPower(lowPower), [lowPower, setLowPower]);

  const dpr: [number, number] = lowPower ? [1, 1.3] : [1, 1.8];

  const onScroll = () => {
    const el = driverRef.current;
    if (!el || !useVoyage.getState().started) return;
    const max = el.scrollHeight - el.clientHeight;
    useVoyage.getState().setTarget(max > 0 ? el.scrollTop / max : 0);
  };

  return (
    <>
      <div className="canvas-layer">
        <Canvas
          dpr={dpr}
          shadows={!lowPower}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          camera={{ fov: 50, near: 0.1, far: 1200, position: [1.2, 4.6, 9.5] }}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      {/* invisible scroll driver: scrolling translates into journey progress */}
      <div
        id="scroll-driver"
        ref={driverRef}
        className={`scroll-driver ${started ? "" : "locked"}`}
        onScroll={onScroll}
      >
        <div className="scroll-spacer" style={{ height: SCROLL_SPACER_HEIGHT }} />
      </div>

      <div className="ui-layer">
        <Hud />
        <ProjectPanel />
        <FinalScene />
      </div>

      <AnimatePresence>{!started && <Intro key="intro" />}</AnimatePresence>
    </>
  );
}
