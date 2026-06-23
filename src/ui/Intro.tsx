import { motion } from "framer-motion";
import { useVoyage } from "../store";
import { ensureAudio, setEnabled } from "../audio/ambience";

export default function Intro() {
  const begin = useVoyage((s) => s.begin);
  const toggleSound = useVoyage((s) => s.toggleSound);

  const startWithSound = () => {
    ensureAudio();
    setEnabled(true);
    useVoyage.setState({ sound: true });
    begin();
  };
  const startSilent = () => {
    begin();
  };

  return (
    <motion.div
      className="intro interactive"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
    >
      <motion.div
        className="eyebrow"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        A Cinematic Portfolio
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
      >
        Voyage Through
        <br />
        My <em>Creations</em>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1.2 }}
      >
        Drift across a moonlit lake and discover each project as an island of light.
        Scroll to travel forward — there is no hurry here.
      </motion.p>
      <motion.div
        className="actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <button className="btn primary" onClick={startWithSound}>
          Begin Journey
          <span className="arrow">→</span>
        </button>
        <button className="btn" onClick={startSilent}>
          Enter Silently
        </button>
      </motion.div>
    </motion.div>
  );
}
