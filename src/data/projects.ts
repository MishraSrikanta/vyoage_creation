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
    title: "...About Me...",
    category: "01",
    year: "2024",
    description:
      "Know more about my journey, values, and what drives me beyond the resume. Skills and story in one engaging experience",
    tech: ["React", "TypeScript", "AI UX"],
    cta: { label: "View Project", href: "https://about-me-black-ten.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "EvA - Enterprise App",
    category: "02",
    year: "2024",
    description:
      "Make enterprise software development more efficient and user-friendly. Make financial reasoning and market exploration faster for everyday decision-making.",
    tech: ["React", "TypeScript", "AI UX"],
    cta: { label: "View Project", href: "https://enterprise-software.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "FinanceGPT",
    category: "03",
    year: "2024",
    description:
      "Make financial reasoning and market exploration faster for everyday decision-making. AI-assisted interface for faster analysis loops",
    tech: ["React", "TypeScript", "AI UX"],
    cta: { label: "View Project", href: "https://finance-gpt-nu.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "3D Portfolio",
    category: "04",
    year: "2024",
    description:
      "Turn personal storytelling into a spatial, memorable interactive experience. High-retention visual identity and immersive navigation",
    tech: ["Three.js", "Framer Motion", "Web Interactions"],
    cta: { label: "View Project", href: "https://3-d-portfolio-y8uy.vercel.app/" },
    accent: "#B066D9",
    accent2: "#4a1f5c",
  },
  {
    title: "Nike Product Page",
    category: "05",
    year: "2024",
    description:
      "Explore Nike's brand and product ethos through a dynamic, scroll-driven narrative. Reusable visual experiments for future interfaces of any product",
    tech: ["Three.js", "Shaders", "Performance Tuning"],
    cta: { label: "View Project", href: "https://produt-page-nike.vercel.app/" },
    accent: "#00D9FF",
    accent2: "#004455",
  },
  {
    title: "Kawasaki Project",
    category: "06",
    year: "2024",
    description:
      "Blend bold branding and conversion-focused UI in a modern launch page. Story-led layout optimized for engagement",
    tech: ["React", "Responsive UI", "Motion Design"],
    cta: { label: "View Project", href: "https://kawasaki-project-8ry6.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "CV Generator",
    category: "07",
    year: "2024",
    description:
      "Automate resume creation and manage professional documents dynamically. Streamlined career document management",
    tech: ["React", "TypeScript", "PDF Generation"],
    cta: { label: "View Project", href: "https://cv-generator-orpin-omega.vercel.app/" },
    accent: "#B066D9",
    accent2: "#4a1f5c",
  },
  {
    title: "Shader Generator",
    category: "08",
    year: "2024",
    description:
      "Create and visualize custom GLSL shaders with real-time preview capabilities. Interactive visual effects prototyping tool",
    tech: ["Three.js", "WebGL", "Shader Development"],
    cta: { label: "View Project", href: "https://shader-generator-lyart.vercel.app/" },
    accent: "#00D9FF",
    accent2: "#004455",
  },
  {
    title: "Aurora",
    category: "09",
    year: "2024",
    description:
      "Build a responsive web application showcasing dynamic visual experiences. Modern and aesthetic user interface design",
    tech: ["React", "CSS Animations", "Web Design"],
    cta: { label: "View Project", href: "https://aurora-seven-bay.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "Aetheria",
    category: "10",
    year: "2024",
    description:
      "Create an immersive exploration experience through interactive 3D environments. Cutting-edge spatial web experiences",
    tech: ["Three.js", "WebGL", "Advanced Interactions"],
    cta: { label: "View Project", href: "https://aetheria-g1hf.vercel.app/" },
    accent: "#B066D9",
    accent2: "#4a1f5c",
  },
  {
    title: "Modern Animation",
    category: "11",
    year: "2024",
    description:
      "Demonstrate advanced animation principles and motion design techniques. Fluid and engaging user interactions",
    tech: ["Framer Motion", "React", "Motion Design"],
    cta: { label: "View Project", href: "https://animated-site-liard.vercel.app/" },
    accent: "#00D9FF",
    accent2: "#004455",
  },
  {
    title: "Open World Portfolio",
    category: "12",
    year: "2024",
    description:
      "Showcase work through an expansive, open-ended interactive portfolio. Immersive portfolio presentation",
    tech: ["React", "Three.js", "Web Performance"],
    cta: { label: "View Project", href: "https://open-world-portfolio.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "Three Realms",
    category: "13",
    year: "2024",
    description:
      "Build an engaging multi-dimensional experience across three distinct worlds. Complex 3D storytelling interface",
    tech: ["Three.js", "WebGL", "Interactive Design"],
    cta: { label: "View Project", href: "https://three-realms.vercel.app/" },
    accent: "#B066D9",
    accent2: "#4a1f5c",
  },
  {
    title: "World Time 3D",
    category: "14",
    year: "2024",
    description:
      "Visualize global time zones with immersive 3D globe and real-time updates. Dynamic 3D data visualization",
    tech: ["Three.js", "WebGL", "Real-time Data"],
    cta: { label: "View Project", href: "https://world-time-3-d.vercel.app/" },
    accent: "#00D9FF",
    accent2: "#004455",
  },
  {
    title: "Voyage Creation",
    category: "15",
    year: "2024",
    description:
      "Create immersive travel experiences and explore creative journeys worldwide. Engaging voyage storytelling interface",
    tech: ["React", "TypeScript", "Interactive Design"],
    cta: { label: "View Project", href: "https://vyoage-creation.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
  {
    title: "3D Builder",
    category: "16",
    year: "2024",
    description:
      "Enable intuitive 3D model creation and visualization with real-time rendering. Accessible 3D creation platform",
    tech: ["Three.js", "WebGL", "3D Modeling"],
    cta: { label: "View Project", href: "https://builder3-d.vercel.app/" },
    accent: "#B066D9",
    accent2: "#4a1f5c",
  },
  {
    title: "Develop Site",
    category: "17",
    year: "2025",
    description:
      "Showcase development tools and resources with dynamic, neon-inspired design. Modern developer resource hub",
    tech: ["React", "Tailwind CSS", "Performance"],
    cta: { label: "View Project", href: "https://develop-site-neon.vercel.app/" },
    accent: "#00D9FF",
    accent2: "#004455",
  },
  {
    title: "Restaurant Management",
    category: "18",
    year: "2025",
    description:
      "Streamline restaurant operations with intuitive ordering and inventory management. Efficient restaurant workflow system",
    tech: ["React", "TypeScript", "Business Logic"],
    cta: { label: "View Project", href: "https://resturant-management.vercel.app/" },
    accent: "#00FF99",
    accent2: "#003d2e",
  },
];
