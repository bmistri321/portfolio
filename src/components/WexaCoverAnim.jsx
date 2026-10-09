import { useEffect, useRef, useState } from 'react';
import './WexaCoverAnim.css';

const ROUNDS = [
  { bars: [38, 55, 46], pick: 1 },
  { bars: [52, 40, 58], pick: 2 },
  { bars: [44, 60, 36], pick: 0 },
];

const PHASES = [
  ['enter', 1000],
  ['select', 1100],
  ['ready', 700],
  ['press', 450],
  ['exit', 700],
  ['rest', 400],
];

export default function WexaCoverAnim() {
  const rootRef = useRef(null);
  const timers = useRef([]);
  const runId = useRef(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('enter');

  const clearTimers = () => {
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
    timers.current = [];
  };

  const run = () => {
    const id = ++runId.current;
    clearTimers();
    setRound(0);
    setPhase('enter');
    let r = 0;
    let p = 0;
    const tick = () => {
      if (id !== runId.current) return;
      p += 1;
      if (p >= PHASES.length) {
        p = 0;
        r = (r + 1) % ROUNDS.length;
        setRound(r);
      }
      setPhase(PHASES[p][0]);
      timers.current.push(setTimeout(tick, PHASES[p][1]));
    };
    timers.current.push(setTimeout(tick, PHASES[0][1]));
  };

  const stop = () => {
    runId.current += 1;
    clearTimers();
    setRound(0);
    setPhase('enter');
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('ready');
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) run(); else stop(); },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, []);

  const bars = ROUNDS[round].bars;
  const pick = ROUNDS[round].pick;
  const showSel = phase === 'select' || phase === 'ready' || phase === 'press';
  const exiting = phase === 'exit' || phase === 'rest';
  const nextReady = phase === 'ready' || phase === 'press' || phase === 'exit';

  return (
    <div ref={rootRef} className="wexa-root" data-phase={phase} aria-hidden="true">
      <div className="wexa-stage">
        <div className="wexa-label">Step {round + 1} of 3</div>
        <div className="wexa-options">
          {bars.map((w, i) => (
            <div
              key={round + '-' + i}
              className={'wexa-opt' + (showSel && i === pick ? ' sel' : '') + (exiting ? ' out' : '')}
              style={{ '--i': i, '--w': w + '%' }}
            >
              <span className="wexa-bar" />
              <span className="wexa-check">✓</span>
            </div>
          ))}
        </div>
        <div className={'wexa-next' + (nextReady ? ' ready' : '') + (phase === 'press' ? ' press' : '')}>
          Next
        </div>
      </div>
    </div>
  );
}
