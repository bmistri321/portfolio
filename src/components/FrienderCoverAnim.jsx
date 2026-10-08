import { useEffect, useRef, useState } from 'react';
import './FrienderCoverAnim.css';

const GENERATED = '🚴 Your Next Ride Starts Here! 🚴\n\nLooking for a new cycle to explore, commute, or simply enjoy the ride? We’ve got you covered! 🔥\n\nRide More. Explore More. Live More. 🚴‍♂️';

// Gentle pacing (ms). Total loop ≈ 13s.
const WAIT = {
  idle: 800,
  approach: 2400,
  click: 700,
  working: 2000,
  skeleton: 3200,
  typing: 4600,
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
    const x = ((b.left + b.width / 2 - s.left) / s.width) * 100 - 1.78;
    const y = ((b.top + b.height / 2 - s.top) / s.height) * 100 - 1.69;
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
    }, 22);
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
          <svg className="fri-cursor-arrow" viewBox="0 0 12 19">
            <g clipPath="url(#fri-arrow-clip)">
              <path d="M0 16.015V0L11.591 11.619H4.81L4.399 11.743L0 16.015Z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              <path d="M9.0845 16.6893L5.4795 18.2243L0.797501 7.13531L4.4835 5.58231L9.0845 16.6893Z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              <path d="M7.75101 16.0086L5.90701 16.7826L2.80701 9.40861L4.64801 8.63361L7.75101 16.0086Z" fillRule="evenodd" clipRule="evenodd" fill="black" />
              <path d="M1 2.4071V13.5951L3.969 10.7291L4.397 10.5901H9.165L1 2.4071Z" fillRule="evenodd" clipRule="evenodd" fill="black" />
            </g>
            <defs>
              <clipPath id="fri-arrow-clip">
                <rect width="12" height="19" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <svg className="fri-cursor-hand" viewBox="0 0 16 17">
            <g clipPath="url(#fri-hand-clip)">
              <path d="M3.3315 12.3799C3.0475 12.0209 2.7025 11.2869 2.0885 10.3959C1.7405 9.89189 0.877496 8.94289 0.620496 8.46089C0.397496 8.03489 0.421496 7.84389 0.474496 7.49089C0.568496 6.86289 1.2125 6.37389 1.8995 6.43989C2.4185 6.48889 2.8585 6.83189 3.2545 7.15589C3.4935 7.35089 3.7875 7.72989 3.9645 7.94389C4.1275 8.13989 4.1675 8.22089 4.3415 8.45289C4.5715 8.75989 4.6435 8.91189 4.5555 8.57389C4.4845 8.07789 4.3685 7.23089 4.2005 6.48189C4.0725 5.91389 4.0415 5.82489 3.9195 5.38889C3.7905 4.92489 3.7245 4.59989 3.6035 4.10789C3.5195 3.75989 3.3685 3.04889 3.3275 2.64889C3.2705 2.10189 3.2405 1.20989 3.5915 0.799888C3.8665 0.478888 4.4975 0.381888 4.8885 0.579888C5.4005 0.838888 5.6915 1.58289 5.8245 1.87989C6.0635 2.41389 6.2115 3.03089 6.3405 3.84089C6.5045 4.87189 6.8065 6.30289 6.8165 6.60389C6.8405 6.23489 6.7485 5.45789 6.8125 5.10389C6.8705 4.78289 7.1405 4.40989 7.4785 4.30889C7.7645 4.22389 8.0995 4.19289 8.3945 4.25389C8.7075 4.31789 9.03749 4.54189 9.16049 4.75289C9.5225 5.37689 9.5295 6.65189 9.5445 6.58389C9.6305 6.20789 9.61549 5.35489 9.8285 4.99989C9.9685 4.76589 10.3255 4.55489 10.5155 4.52089C10.8095 4.46889 11.1705 4.45289 11.4795 4.51289C11.7285 4.56189 12.0655 4.85789 12.1565 4.99989C12.3745 5.34389 12.4985 6.31689 12.5355 6.65789C12.5505 6.79889 12.6095 6.26589 12.8285 5.92189C13.2345 5.28289 14.6715 5.15889 14.7265 6.56089C14.7515 7.21489 14.7465 7.18489 14.7465 7.62489C14.7465 8.14189 14.7345 8.45289 14.7065 8.82689C14.6755 9.22689 14.5895 10.1309 14.4645 10.5689C14.3785 10.8699 14.0935 11.5469 13.8125 11.9529C13.8125 11.9529 12.7385 13.2029 12.6215 13.7659C12.5035 14.3279 12.5425 14.3319 12.5195 14.7309C12.4965 15.1289 12.6405 15.6529 12.6405 15.6529C12.6405 15.6529 11.8385 15.7569 11.4065 15.6879C11.0155 15.6249 10.5315 14.8469 10.4065 14.6089C10.2345 14.2809 9.86749 14.3439 9.72449 14.5859C9.49949 14.9689 9.0155 15.6559 8.6735 15.6989C8.0055 15.7829 6.6195 15.7299 5.5345 15.7189C5.5345 15.7189 5.7195 14.7079 5.3075 14.3609C5.0025 14.1019 4.4775 13.5769 4.1635 13.3009L3.3315 12.3799Z" fillRule="evenodd" clipRule="evenodd" fill="white" />
              <path d="M3.3315 12.3799C3.0475 12.0209 2.7025 11.2869 2.0885 10.3959C1.7405 9.89189 0.877496 8.94289 0.620496 8.46089C0.397496 8.03489 0.421496 7.84389 0.474496 7.49089C0.568496 6.86289 1.2125 6.37389 1.8995 6.43989C2.4185 6.48889 2.8585 6.83189 3.2545 7.15589C3.4935 7.35089 3.7875 7.72989 3.9645 7.94389C4.1275 8.13989 4.1675 8.22089 4.3415 8.45289C4.5715 8.75989 4.6435 8.91189 4.5555 8.57389C4.4845 8.07789 4.3685 7.23089 4.2005 6.48189C4.0725 5.91389 4.0415 5.82489 3.9195 5.38889C3.7905 4.92489 3.7245 4.59989 3.6035 4.10789C3.5195 3.75989 3.3685 3.04889 3.3275 2.64889C3.2705 2.10189 3.2405 1.20989 3.5915 0.799888C3.8665 0.478888 4.4975 0.381888 4.8885 0.579888C5.4005 0.838888 5.6915 1.58289 5.8245 1.87989C6.0635 2.41389 6.2115 3.03089 6.3405 3.84089C6.5045 4.87189 6.8065 6.30289 6.8165 6.60389C6.8405 6.23489 6.7485 5.45789 6.8125 5.10389C6.8705 4.78289 7.1405 4.40989 7.4785 4.30889C7.7645 4.22389 8.0995 4.19289 8.3945 4.25389C8.7075 4.31789 9.03749 4.54189 9.16049 4.75289C9.52249 5.37689 9.5295 6.65189 9.5445 6.58389C9.6305 6.20789 9.6155 5.35489 9.8285 4.99989C9.9685 4.76589 10.3255 4.55489 10.5155 4.52089C10.8095 4.46889 11.1705 4.45289 11.4795 4.51289C11.7285 4.56189 12.0655 4.85789 12.1565 4.99989C12.3745 5.34389 12.4985 6.31689 12.5355 6.65789C12.5505 6.79889 12.6095 6.26589 12.8285 5.92189C13.2345 5.28289 14.6715 5.15889 14.7265 6.56089C14.7515 7.21489 14.7465 7.18489 14.7465 7.62489C14.7465 8.14189 14.7345 8.45289 14.7065 8.82689C14.6755 9.22689 14.5895 10.1309 14.4645 10.5689C14.3785 10.8699 14.0935 11.5469 13.8125 11.9529C13.8125 11.9529 12.7385 13.2029 12.6215 13.7659C12.5035 14.3279 12.5425 14.3319 12.5195 14.7309C12.4965 15.1289 12.6405 15.6529 12.6405 15.6529C12.6405 15.6529 11.8385 15.7569 11.4065 15.6879C11.0155 15.6249 10.5315 14.8469 10.4065 14.6089C10.2345 14.2809 9.86749 14.3439 9.72449 14.5859C9.49949 14.9689 9.0155 15.6559 8.6735 15.6989C8.0055 15.7829 6.6195 15.7299 5.5345 15.7189C5.5345 15.7189 5.7195 14.7079 5.3075 14.3609C5.0025 14.1019 4.4775 13.5769 4.1635 13.3009L3.3315 12.3799Z" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" stroke="black" />
              <path d="M11.5664 12.7344V9.27539" strokeWidth="0.75" strokeLinecap="round" stroke="black" />
              <path d="M9.55079 12.7461L9.53479 9.2731" strokeWidth="0.75" strokeLinecap="round" stroke="black" />
              <path d="M7.55469 9.30469L7.57569 12.7307" strokeWidth="0.75" strokeLinecap="round" stroke="black" />
            </g>
            <defs>
              <clipPath id="fri-hand-clip">
                <rect width="16" height="17" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
}
