export interface Project {
  title: string;
  category: string;
  year: string;
  description: string;
  tech: string[];
  cta: { label: string; href: string };
  /** Accent color used for the billboard glow + hero gradient. */
  accent: string;
  /** Secondary gradient stop. */
  accent2: string;
}

/**
 * The projects discovered along the voyage. Replace these with your real work.
 * Order matters — index 0 is encountered first, the last one last.
 */
export const projects: Project[] = [
  {
    title: "Aurora Analytics",
    category: "Data Visualization",
    year: "2024",
    description:
      "A real-time analytics platform turning raw event streams into living, breathing dashboards. Built for scale, designed for calm.",
    tech: ["React", "D3.js", "WebGL", "Node", "ClickHouse"],
    cta: { label: "View Project", href: "#" },
    accent: "#FFB74D",
    accent2: "#7a4b12",
  },
  {
    title: "Nimbus OS",
    category: "Product Design",
    year: "2023",
    description:
      "A cloud workspace reimagined as a single fluid surface. Every interaction tuned to feel weightless and intentional.",
    tech: ["TypeScript", "Rust", "WASM", "Tauri"],
    cta: { label: "Open Demo", href: "#" },
    accent: "#4DD0E1",
    accent2: "#0e4a52",
  },
  {
    title: "Lumen Engine",
    category: "Graphics / R&D",
    year: "2024",
    description:
      "A GPU-driven rendering engine experimenting with volumetric light, procedural water, and cinematic post-processing.",
    tech: ["Three.js", "GLSL", "WebGPU", "C++"],
    cta: { label: "Read Case Study", href: "#" },
    accent: "#81C784",
    accent2: "#1f4d23",
  },
  {
    title: "Solace",
    category: "Mobile App",
    year: "2022",
    description:
      "A meditation companion that adapts to your breath and the time of day. Quiet technology in service of stillness.",
    tech: ["React Native", "Swift", "TensorFlow Lite"],
    cta: { label: "View Project", href: "#" },
    accent: "#BA68C8",
    accent2: "#3d1f47",
  },
  {
    title: "Cartographer",
    category: "AI / Tooling",
    year: "2025",
    description:
      "An autonomous research agent that maps unfamiliar codebases into navigable knowledge graphs in seconds.",
    tech: ["Python", "LLMs", "Neo4j", "FastAPI"],
    cta: { label: "Open Demo", href: "#" },
    accent: "#E57373",
    accent2: "#4d1f1f",
  },
  {
    title: "Meridian",
    category: "Brand / Web",
    year: "2023",
    description:
      "An award-winning immersive site for a sustainable architecture studio — scroll-driven storytelling at its core.",
    tech: ["Next.js", "GSAP", "Three.js", "Sanity"],
    cta: { label: "Read Case Study", href: "#" },
    accent: "#FFD54F",
    accent2: "#5c4710",
  },
];
