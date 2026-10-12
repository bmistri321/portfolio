// Web Audio API Synthesizer for tactile UI clicks and interaction sounds

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  return audioCtx;
}

// Warm up the AudioContext on the very first user interaction, so it is
// created and resumed inside a real gesture before any sound is requested.
function warmUp() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', warmUp, { once: true });
  window.addEventListener('keydown', warmUp, { once: true });
}

// Browsers can suspend the AudioContext (background tab, power saving).
// resume() is async — we must await it before scheduling, otherwise the
// sound is scheduled on a frozen timeline and plays silently.
async function ensureRunning() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      /* resume blocked — stay silent */
    }
  }
  return ctx.state === 'running' ? ctx : null;
}

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('dev_sound_enabled');
  return saved === null ? true : saved === 'true';
};

export const setSoundEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dev_sound_enabled', enabled ? 'true' : 'false');
};

/**
 * Play a tactile, modern click sound
 * @param {'click' | 'tab' | 'open' | 'close' | 'toggle'} type 
 */
export const playUiSound = async (type = 'click') => {
  if (!isSoundEnabled()) return;

  const ctx = await ensureRunning();
  if (!ctx) return;

  const now = ctx.currentTime + 0.01;

  if (type === 'click') {
    // Tactile mechanical key click (Linear/Mechanical feel)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } else if (type === 'tab') {
    // Subtle pop for pill tabs
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.035);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } else if (type === 'open') {
    // Elegant rising chirp for opening a project
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'close') {
    // Soft descending tone for closing
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } else if (type === 'toggle') {
    // Crisp tick for theme / audio toggle
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.02);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }
};
