import { useEffect, useRef, useState } from 'react';
import './FrienderCoverAnim.css';

const GENERATED = 'Meet the new dashboard ✨\nPlan, schedule and publish — all in one calm place.';

// Gentle pacing (ms). Total loop ≈ 13s.
const WAIT = {
  idle: 800,
  approach: 2400,
  click: 700,
  working: 2000,
  skeleton: 3200,
  typing: 3800,
  hold: 2600,
  reset: 900,
};
const ORDER = ['approach', 'click', 'working', 'skeleton', 'typing', 'hold', 'reset', 'idle'];

export default function FrienderCoverAnim() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const btnRef = useRef(null);
  const cursorRef = useRef(null);
  const timers = useRef([]);
  const runId = useRef(0);
  const [phase, setPhase] = useState('idle');
  const [typed, setTyped] = useState('');

  const clearTimers = () => {
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
    timers.current = [];
  };

  // Place the cursor instantly (no glide) — used on start/stop/reset.
  const snapCursor = (left, top, opacity) => {
    const c = cursorRef.current;
    if (!c) return;
    c.style.transition = 'none';
    c.style.left = left;
    c.style.top = top;
    c.style.opacity = opacity;
    c.style.transform = 'scale(1)';
    void c.offsetWidth; // reflow so the next transition animates
    c.style.transition = '';
  };

  // Aim the cursor at the AI button's live center (precise, no guessing).
  const aimAtButton = () => {
    const stage = stageRef.current;
    const btn = btnRef.current;
    const c = cursorRef.current;
    if (!stage || !btn || !c) return;
    const s = stage.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    // Offset so the cursor's TIP (not its box corner) lands on the button center:
    // tip sits ~25% x / ~15% y inside the 7.5cqw-wide cursor box.
    const x = ((b.left + b.width / 2 - s.left) / s.width) * 100 - 1.9;
    const y = ((b.top + b.height / 2 - s.top) / s.height) * 100 - 1.1;
    c.style.left = `${x}%`;
    c.style.top = `${y}%`;
    c.style.opacity = '1';
  };

  const stop = () => {
    runId.current += 1;
    clearTimers();
    setTyped('');
    setPhase('idle');
    snapCursor('6%', '84%', '0');
  };

  const run = () => {
    const id = ++runId.current;
    clearTimers();
    setTyped('');
    setPhase('idle');
    snapCursor('6%', '84%', '0');

    let i = 0;
    const step = () => {
      if (id !== runId.current) return;
      const next = ORDER[i % ORDER.length];
      const wait = WAIT[next];
      if (next === 'approach') aimAtButton();
      if (next === 'hold' && cursorRef.current) {
        // drift away gently while the result rests
        cursorRef.current.style.left = '88%';
        cursorRef.current.style.top = '78%';
      }
      if (next === 'idle') snapCursor('6%', '84%', '0');
      setPhase(next);
      i += 1;
      timers.current.push(setTimeout(step, wait));
    };
    timers.current.push(setTimeout(step, WAIT.idle));
  };

  // Typewriter for the generated text.
  useEffect(() => {
    if (phase !== 'typing') return;
    setTyped('');
    let n = 0;
    const iv = setInterval(() => {
      n += 1;
      setTyped(GENERATED.slice(0, n));
      if (n >= GENERATED.length) clearInterval(iv);
    }, 30);
    timers.current.push(iv);
    return () => clearInterval(iv);
  }, [phase]);

  // Only animate while the card is actually visible on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('static');
      setTyped(GENERATED);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) run(); else stop(); },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => { io.disconnect(); stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="fri-root" data-phase={phase} aria-hidden="true">
      <div ref={stageRef} className="fri-stage">
        <div className="fri-main">
          {/* editor */}
          <div className="fri-editor">
            <div className="fri-editor-head">
              <span className="fri-doc-name">Untitled post</span>
              <button ref={btnRef} className="fri-ai-btn" tabIndex={-1}>
                <svg viewBox="0 0 24 24" className="fri-spark" fill="currentColor">
                  <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
                  <path d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" opacity=".7" />
                </svg>
                <span>AI Writing</span>
                <span className="fri-ripple" />
              </button>
            </div>
            <div className="fri-doc">
              <span className="fri-doc-idle-caret" />
              <div className="fri-doc-skel">
                <span style={{ width: '96%' }} />
                <span style={{ width: '89%' }} />
                <span style={{ width: '93%' }} />
                <span style={{ width: '58%' }} />
              </div>
              <p className="fri-doc-typed">
                {typed}
                <span className="fri-caret" />
              </p>
            </div>
          </div>

        </div>

        {/* cursor */}
        <span ref={cursorRef} className="fri-cursor">
          <svg className="fri-cursor-arrow" viewBox="0 0 24 24">
            <path
              d="M5.5 3.8 L5.5 17.4 L10.1 13.2 L12.9 19.2 L15.3 18.1 L12.6 12.3 L18.2 12.3 Z"
              fill="#000"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          <svg className="fri-cursor-hand" viewBox="0 0 24 24">
            <g fill="#fff" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round">
              <rect x="5.4" y="2.6" width="3.6" height="9.2" rx="1.8" />
              <rect x="9.4" y="6.2" width="3.4" height="6.4" rx="1.7" />
              <rect x="13.1" y="7.4" width="3.2" height="5.6" rx="1.6" />
              <rect x="16.5" y="8.8" width="2.9" height="4.6" rx="1.45" />
              <rect x="5.4" y="10.8" width="14.2" height="9" rx="4" />
              <rect x="1.8" y="10.9" width="5.6" height="3.1" rx="1.55" transform="rotate(-28 4.6 12.45)" />
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
}
