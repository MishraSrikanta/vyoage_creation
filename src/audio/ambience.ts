/**
 * Asset-free ambient soundscape generated with the Web Audio API:
 * a low-passed brown-noise "water" bed, an LFO-modulated "wind" layer, and
 * gentle chimes when a project billboard activates. No audio files required.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let started = false;

function brownNoiseBuffer(ac: AudioContext, seconds = 3) {
  const len = ac.sampleRate * seconds;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

export function ensureAudio() {
  if (ctx) return;
  const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const noise = brownNoiseBuffer(ctx);

  // --- water bed ---
  const water = ctx.createBufferSource();
  water.buffer = noise;
  water.loop = true;
  const waterLP = ctx.createBiquadFilter();
  waterLP.type = "lowpass";
  waterLP.frequency.value = 520;
  const waterGain = ctx.createGain();
  waterGain.gain.value = 0.9;
  water.connect(waterLP).connect(waterGain).connect(master);
  water.start();

  // --- wind layer (slowly sweeping bandpass) ---
  const wind = ctx.createBufferSource();
  wind.buffer = noise;
  wind.loop = true;
  const windBP = ctx.createBiquadFilter();
  windBP.type = "bandpass";
  windBP.frequency.value = 700;
  windBP.Q.value = 0.7;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.18;
  wind.connect(windBP).connect(windGain).connect(master);
  wind.start();

  // LFO sweeping the wind filter + amplitude
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 350;
  lfo.connect(lfoGain).connect(windBP.frequency);
  const lfo2 = ctx.createOscillator();
  lfo2.frequency.value = 0.09;
  const lfo2Gain = ctx.createGain();
  lfo2Gain.gain.value = 0.1;
  lfo2.connect(lfo2Gain).connect(windGain.gain);
  lfo.start();
  lfo2.start();
}

export function setEnabled(on: boolean) {
  if (!ctx || !master) return;
  if (ctx.state === "suspended") ctx.resume();
  started = true;
  master.gain.setTargetAtTime(on ? 0.5 : 0.0, ctx.currentTime, 0.6);
}

/** A soft two-note chime, optionally tinted by a project's accent hue. */
export function playChime(base = 528) {
  if (!ctx || !master || !started) return;
  const now = ctx.currentTime;
  const freqs = [base, base * 1.5];
  freqs.forEach((f, i) => {
    const osc = ctx!.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const g = ctx!.createGain();
    const t0 = now + i * 0.08;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    osc.connect(g).connect(master!);
    osc.start(t0);
    osc.stop(t0 + 1.7);
  });
}
