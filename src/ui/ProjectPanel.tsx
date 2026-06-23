import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoyage } from "../store";
import { projects } from "../data/projects";
import { placements } from "../scene/path";
import { playChime } from "../audio/ambience";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
  exit: { opacity: 0, transition: { duration: 0.5 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function ProjectPanel() {
  const active = useVoyage((s) => s.activeProject);

  // chime when a new project wakes up
  useEffect(() => {
    if (active >= 0) playChime(440 + active * 36);
  }, [active]);

  const project = active >= 0 ? projects[active] : null;
  const side = active >= 0 ? placements[active].side : 1;
  // billboard on the right (side 1) → panel on the left, and vice-versa
  const sideClass = side === 1 ? "side-left" : "side-right";

  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.aside
          key={active}
          className={`project-panel interactive ${sideClass}`}
          variants={container}
          initial="hidden"
          animate="show"
          exit="exit"
          style={{ ["--accent-stop" as any]: project.accent }}
        >
          <motion.div className="index" variants={item}>
            {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </motion.div>
          <motion.div className="eyebrow" variants={item} style={{ color: project.accent }}>
            {project.category} · {project.year}
          </motion.div>
          <motion.h2 variants={item}>{project.title}</motion.h2>
          <motion.p className="desc" variants={item}>
            {project.description}
          </motion.p>
          <motion.div className="tags" variants={item}>
            {project.tech.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </motion.div>
          <motion.div className="cta" variants={item}>
            <a
              className="btn primary"
              href={project.cta.href}
              target="_blank"
              rel="noreferrer"
              style={{
                background: `linear-gradient(180deg, ${project.accent}, ${project.accent2})`,
              }}
            >
              {project.cta.label}
              <span className="arrow">→</span>
            </a>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
