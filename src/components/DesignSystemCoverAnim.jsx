import { useEffect, useRef } from 'react';
import './DesignSystemCoverAnim.css';

// Minimalist: four small tokens breathing in a slow sequence.
const SWATCHES = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981'];

export default function DesignSystemCoverAnim() {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('ds-static');
    }
  }, []);

  return (
    <div ref={rootRef} className="ds-cover" aria-hidden="true">
      <div className="ds-tokens">
        {SWATCHES.map((color, i) => (
          <span
            key={color}
            className="ds-token"
            style={{ '--token': color, '--i': i }}
          />
        ))}
      </div>
    </div>
  );
}
