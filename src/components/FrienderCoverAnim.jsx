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
    c.style.left = `${((b.left + b.width / 2 - s.left) / s.width) * 100}%`;
    c.style.top = `${((b.top + b.height / 2 - s.top) / s.height) * 100}%`;
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
        {/* top mini bar */}
        <div className="fri-topbar">
          <span className="fri-cmd">⌘K</span>
          <span className="fri-top-spark">
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
              <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
              <path d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" opacity=".7" />
            </svg>
          </span>
        </div>

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
              <p className="fri-doc-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua enim ad minim.
              </p>
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

          {/* post settings — minimal grey boxes */}
          <div className="fri-side">
            <p className="fri-side-title">Post settings</p>
            <div className="fri-side-box">
              <span>Choose Post Type</span>
              <div className="fri-chips">
                <i className="chip-blue">Suggestion</i>
                <i>Offer Post</i>
              </div>
            </div>
            <div className="fri-side-box">
              <span>Tag this Post</span>
              <div className="fri-chips">
                <i className="chip-lav">dashboard</i>
                <i className="chip-peach">form</i>
              </div>
            </div>
            <div className="fri-side-box">
              <span>Schedule Post Time</span>
              <div className="fri-bar" />
            </div>
          </div>
        </div>

        {/* cursor */}
        <svg ref={cursorRef} className="fri-cursor" viewBox="0 0 24 24">
          <path
            d="M6 3.5v15.2l4.5-4.3 2.4 5.9 2.6-1.1-2.4-5.8 5.9-.3L6 3.5z"
            fill="#1f2937"
            stroke="#fff"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    </div>
  );
}
