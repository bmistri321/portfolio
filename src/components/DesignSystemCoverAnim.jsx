import { useEffect, useRef, useState } from 'react';
import './DesignSystemCoverAnim.css';

// Loop phases with pacing (ms).
const PHASES = [
  ['enter', 900],     // swatches + components slide in
  ['interact', 1400], // button presses, toggle flips, swatch highlights
  ['settle', 800],    // everything rests in final state
  ['exit', 600],      // fade/slide out
  ['rest', 400],      // blank beat before looping
];

const SWATCHES = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

export default function DesignSystemCoverAnim() {
  const rootRef = useRef(null);
  const timers = useRef([]);
  const runId = useRef(0);
  const [phase, setPhase] = useState('enter');

  const clearTimers = () => {
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
    timers.current = [];
  };

  const run = () => {
    const id = ++runId.current;
    clearTimers();
    setPhase('enter');
    let p = 0;
    const tick = () => {
      if (id !== runId.current) return;
      p = (p + 1) % PHASES.length;
      setPhase(PHASES[p][0]);
      timers.current.push(setTimeout(tick, PHASES[p][1]));
    };
    timers.current.push(setTimeout(tick, PHASES[0][1]));
  };

  const stop = () => {
    runId.current += 1;
    clearTimers();
    setPhase('enter');
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setPhase('settle');
      return;
    }

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) run();
            else stop();
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
    } else {
      run();
    }

    return () => {
      stop();
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={`ds-cover phase-${phase}`} aria-hidden="true">
      <div className="ds-sheet">
        {/* Color tokens */}
        <div className="ds-row ds-swatches">
          {SWATCHES.map((color, i) => (
            <span
              key={color}
              className="ds-swatch"
              style={{ '--swatch': color, '--i': i }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="ds-row ds-buttons">
          <span className="ds-btn ds-btn-primary">Button</span>
          <span className="ds-btn ds-btn-outline">Button</span>
        </div>

        {/* Toggle + slider */}
        <div className="ds-row ds-controls">
          <span className="ds-toggle">
            <span className="ds-toggle-knob" />
          </span>
          <span className="ds-slider">
            <span className="ds-slider-fill" />
            <span className="ds-slider-thumb" />
          </span>
        </div>

        {/* Type scale */}
        <div className="ds-row ds-type">
          <span className="ds-type-line ds-type-lg" />
          <span className="ds-type-line ds-type-md" />
          <span className="ds-type-line ds-type-sm" />
        </div>
      </div>
    </div>
  );
}
