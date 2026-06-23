import { create } from "zustand";

interface VoyageState {
  /** Eased journey progress 0..1 (smoothed for inertia). */
  progress: number;
  /** Raw scroll target 0..1. */
  target: number;
  /** Whether the user has begun the journey (post intro). */
  started: boolean;
  /** Ambient audio enabled. */
  sound: boolean;
  /** Index of the project the camera is currently focusing (-1 = none). */
  activeProject: number;
  /** 0..1 blend of how strongly the camera is focusing the active billboard. */
  focus: number;
  /** Quality tier derived from device. */
  lowPower: boolean;

  setProgress: (p: number) => void;
  setTarget: (t: number) => void;
  begin: () => void;
  toggleSound: () => void;
  setActive: (i: number, focus: number) => void;
  setLowPower: (v: boolean) => void;
}

export const useVoyage = create<VoyageState>((set) => ({
  progress: 0,
  target: 0,
  started: false,
  sound: false,
  activeProject: -1,
  focus: 0,
  lowPower: false,

  setProgress: (p) => set({ progress: p }),
  setTarget: (t) => set({ target: Math.min(1, Math.max(0, t)) }),
  begin: () => set({ started: true }),
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setActive: (i, focus) => set({ activeProject: i, focus }),
  setLowPower: (v) => set({ lowPower: v }),
}));
