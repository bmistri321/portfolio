// Web Audio API Synthesizer for tactile UI clicks and interaction sounds

let audioCtx = null;

function createContext() {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  try {
    return new AudioContext();
  } catch (e) {
    return null;
  }
}

function getAudioContext() {
  // The browser can kill the context (state 'closed') — recreate it.
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = createContext();
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
  window.addEventListener('pointerdown', warmUp);
  window.addEventListener('keydown', warmUp);
  // Re-warm when returning to the tab — browsers suspend audio in background tabs.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) warmUp();
  });
}

// Browsers can suspend the AudioContext (background tab, power saving).
// resume() is async — we must await it before scheduling, otherwise the
// sound is scheduled on a frozen timeline and plays silently.
// Never wait forever: race resume against a timeout so a stuck promise
// can't swallow the sound.
async function ensureRunning() {
  let ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
    try {
      await Promise.race([
        ctx.resume(),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);
    } catch (e) {
      /* resume blocked — fall through and retry below */
    }
    // If resume didn't take, the context may be wedged — rebuild it fresh
    // inside this user gesture and try once more.
    if (ctx.state !== 'running') {
      try { ctx.close().catch(() => {}); } catch (e) {}
      audioCtx = createContext();
      ctx = audioCtx;
      if (ctx && ctx.state === 'suspended') {
        try {
          await Promise.race([
            ctx.resume(),
            new Promise((resolve) => setTimeout(resolve, 300)),
          ]);
        } catch (e) {}
      }
    }
  }
  return ctx && ctx.state === 'running' ? ctx : null;
}

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  try {
    const saved = localStorage.getItem('dev_sound_enabled');
    return saved === null ? true : saved === 'true';
  } catch (e) {
    return true;
  }
};

export const setSoundEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dev_sound_enabled', enabled ? 'true' : 'false');
  } catch (e) {}
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
