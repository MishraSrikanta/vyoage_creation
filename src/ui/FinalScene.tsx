import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoyage } from "../store";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.8 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

export default function FinalScene() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = useVoyage.getState().progress;
      setVisible((v) => (v ? p > 0.965 : p > 0.99));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const exploreAgain = () => {
    const el = document.getElementById("scroll-driver");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    useVoyage.getState().setTarget(0);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="final interactive"
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <motion.div className="eyebrow" variants={item}>
            The Creative Spectrum
          </motion.div>
          <motion.h1 variants={item}>
            The Journey <em>Never Ends.</em>
          </motion.h1>
          <motion.p variants={item}>
            Every destination becomes the beginning of a new adventure.
          </motion.p>
          <motion.div className="actions" variants={item}>
            <button className="btn primary" onClick={exploreAgain}>
              Explore Again
              <span className="arrow">↻</span>
            </button>
            <a className="btn" href="#" download>
              Download Resume
            </a>
            <a className="btn" href="mailto:srikantamishra@evawinoptimize.com">
              Let’s Work Together
            </a>
            <a className="btn" href="mailto:srikantamishra@evawinoptimize.com">
              Contact Me
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
