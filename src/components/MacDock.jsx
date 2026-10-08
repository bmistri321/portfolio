import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Palette,
  Shapes,
  Frame,
  Orbit,
  Bot,
  Sparkles,
  Clapperboard
} from 'lucide-react';

// macOS-style magnification, matching the reference: a strong cursor-driven
// wave (~1.7x peak). Icons push apart as they grow, like the real macOS dock,
// so magnified icons never overlap — the glass bar resizes to fit.
const MAGNIFY_PEAK = 1.7;    // max icon scale right under the cursor
const MAGNIFY_RANGE = 2.2;   // falloff range, measured in icon pitches
const MAGNIFY_LIFT = 6;      // px the icon rises at peak scale
const ICON_GAP = 14;          // px gap between icons at rest scale (desktop)
const ICON_GAP_SMALL = 8;    // px gap on small screens (icons render at 34px)
const SHELF_PAD_X = 10;      // px horizontal padding inside the glass bar

export default function MacDock() {
  const shelfRef = useRef(null);
  const iconRefs = useRef([]);
  const magRefs = useRef([]);
  const rafRef = useRef(0);
  const [failedIcons, setFailedIcons] = useState({});

  const dockApps = [
    {
      id: 'chrome',
      name: 'Chrome',
      iconUrl: '/images/dock-chrome.png',
      fallbackIcon: Globe
    },
    {
      id: 'figma',
      name: 'Figma',
      iconUrl: '/images/dock-figma.png',
      fallbackIcon: Palette
    },
    {
      id: 'rive',
      name: 'Rive',
      iconUrl: '/images/dock-rive.svg',
      fallbackIcon: Shapes
    },
    {
      id: 'framer',
      name: 'Framer',
      iconUrl: '/images/dock-framer.png',
      fallbackIcon: Frame
    },
    {
      id: 'antigravity',
      name: 'Antigravity',
      iconUrl: '/images/dock-antigravity.png',
      fallbackIcon: Orbit
    },
    {
      id: 'muse',
      name: 'Muse',
      iconUrl: '/images/dock-muse.png',
      fallbackIcon: Bot
    },
    {
      id: 'claude',
      name: 'Claude',
      iconUrl: '/images/dock-claude.png',
      fallbackIcon: Sparkles
    },
    {
      id: 'photoshop',
      name: 'Photoshop',
      iconUrl: '/images/dock-photoshop.svg',
      fallbackIcon: Palette
    },
    {
      id: 'premiere',
      name: 'Premiere',
      iconUrl: '/images/dock-premiere.svg',
      fallbackIcon: Clapperboard
    },
    {
      id: 'gemini',
      name: 'Gemini',
      iconUrl: '/images/dock-gemini.png',
      fallbackIcon: Sparkles
    }
  ];
  // Rendered icon size (40px desktop, 34px on small screens via CSS).
  const iconSize = () => iconRefs.current[0]?.offsetWidth || 40;
  // Tighter gap on small screens so all 10 icons still fit.
  const iconGap = (size) => (size >= 40 ? ICON_GAP : ICON_GAP_SMALL);

  // Lay out the dock for the given per-icon scales: each icon is centered on
  // its scaled slot, so icons push apart as they grow (like the real macOS
  // dock) and the glass bar resizes to fit. Positions are computed, never
  // measured from live transforms, so magnification can't feed back into them.
  const layoutDock = (scales) => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const size = iconSize();
    const gap = iconGap(size);
    const widths = scales.map((s) => size * s);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (scales.length - 1);
    shelf.style.width = `${total + SHELF_PAD_X * 2}px`;
    let x = SHELF_PAD_X;
    widths.forEach((w, i) => {
      const outer = iconRefs.current[i];
      // outer box is `size` wide; offset so the scaled artwork centers on its slot
      if (outer) outer.style.left = `${x + (w - size) / 2}px`;
      x += w + gap;
    });
  };

  const resetDock = () => {
    cancelAnimationFrame(rafRef.current);
    magRefs.current.forEach((el) => {
      if (el) el.style.transform = '';
    });
    layoutDock(dockApps.map(() => 1));
  };

  useEffect(() => {
    resetDock();
    const t = setTimeout(resetDock, 600); // re-layout after assets settle
    window.addEventListener('resize', resetDock);
    return () => {
      window.removeEventListener('resize', resetDock);
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyMagnification = (clientX) => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const size = iconSize();
    const gap = iconGap(size);
    const pitch = size + gap;
    const n = dockApps.length;
    // Measure the cursor against where the UNMAGNIFIED shelf sits (centered in
    // the stable wrapper) — the live shelf widens as icons grow, so measuring
    // from its live edge would make the wave trail the cursor.
    const wrapperRect = shelf.parentElement.getBoundingClientRect();
    const baseShelfW = n * size + gap * (n - 1) + SHELF_PAD_X * 2;
    const baseShelfLeft = wrapperRect.left + (wrapperRect.width - baseShelfW) / 2;
    const x = clientX - baseShelfLeft;
    const scales = dockApps.map((_, i) => {
      const center = SHELF_PAD_X + i * pitch + size / 2;
      const d = Math.abs(x - center) / pitch;
      if (d >= MAGNIFY_RANGE) return 1;
      return 1 + (MAGNIFY_PEAK - 1) * Math.pow(Math.cos((d / MAGNIFY_RANGE) * Math.PI / 2), 1.15);
    });
    magRefs.current.forEach((el, i) => {
      if (!el) return;
      const s = scales[i];
      el.style.transform =
        s <= 1.001
          ? ''
          : `translateY(${(-(s - 1) * MAGNIFY_LIFT).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
    layoutDock(scales);
  };

  const handleMouseMove = (e) => {
    const clientX = e.clientX;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyMagnification(clientX));
  };

  const handleMouseLeave = () => {
    resetDock();
  };

  return (
    <div className="mac-dock-shelf-wrapper">
      {/* Interactive macOS Dock Shelf */}
        <div
          ref={shelfRef}
          className="mac-dock-shelf"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {dockApps.map((app, index) => {
            const isFailed = failedIcons[app.id];
            const FallbackIcon = app.fallbackIcon;
            return (
              <div
                key={app.id}
                className="mac-dock-icon"
                ref={(el) => { iconRefs.current[index] = el; }}
              >
                <div
                  className="mac-dock-icon-mag"
                  ref={(el) => { magRefs.current[index] = el; }}
                >
                  {(!app.iconUrl || isFailed) ? (
                    <span className="mac-dock-icon-fallback">
                      <FallbackIcon size={28} />
                    </span>
                  ) : (
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      draggable={false}
                      onError={() => setFailedIcons((p) => ({ ...p, [app.id]: true }))}
                    />
                  )}
                </div>
                <span className="dock-tooltip">{app.name}</span>
              </div>
            );
          })}
        </div>
      </div>
  );
}
