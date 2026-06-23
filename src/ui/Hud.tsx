import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoyage } from "../store";
import { ensureAudio, setEnabled } from "../audio/ambience";

export default function Hud() {
  const started = useVoyage((s) => s.started);
  const sound = useVoyage((s) => s.sound);
  const toggleSound = useVoyage((s) => s.toggleSound);
  const fillRef = useRef<HTMLDivElement>(null);
  const [hintVisible, setHintVisible] = useState(true);

  // progress rail driven by rAF (no per-frame React renders)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = useVoyage.getState().progress;
      if (fillRef.current) fillRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      if (p > 0.02) setHintVisible(false);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onToggle = () => {
    ensureAudio();
    setEnabled(!sound);
    toggleSound();
  };

  if (!started) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}>
      <div className="wordmark">
        <div className="mark">Voyage</div>
        <div className="sub">Through My Creations</div>
      </div>

      <button className="sound-toggle btn interactive" onClick={onToggle} style={{ padding: "0.6rem 1rem" }}>
        <span className="bars">
          {[6, 11, 8, 13, 7].map((h, i) => (
            <motion.span
              key={i}
              style={{ height: h }}
              animate={{ opacity: sound ? [0.35, 1, 0.35] : 0.25, scaleY: sound ? [0.6, 1, 0.6] : 0.5 }}
              transition={{ duration: 0.9 + i * 0.12, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </span>
        {sound ? "Sound On" : "Sound Off"}
      </button>

      <div className="progress-rail">
        <div className="fill" ref={fillRef} />
      </div>

      <AnimatePresence>
        {hintVisible && (
          <motion.div
            className="scroll-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Scroll to drift forward
            <div className="mouse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
