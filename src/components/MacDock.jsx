import React, { useState, useRef, useEffect } from 'react';
import {
  Laptop,
  Terminal,
  Sparkles,
  Code,
  Palette,
  Search,
  CheckSquare,
  FileText,
  Music
} from 'lucide-react';

// macOS-style magnification, matching the reference: a strong cursor-driven
// wave (~1.7x peak). Icons push apart as they grow, like the real macOS dock,
// so magnified icons never overlap — the glass bar resizes to fit.
const MAGNIFY_PEAK = 1.7;    // max icon scale right under the cursor
const MAGNIFY_RANGE = 2.2;   // falloff range, measured in icon pitches
const MAGNIFY_LIFT = 6;      // px the icon rises at peak scale
const ICON_GAP = 8;          // px gap between icons at rest scale
const SHELF_PAD_X = 10;      // px horizontal padding inside the glass bar

export default function MacDock() {
  const shelfRef = useRef(null);
  const iconRefs = useRef([]);
  const magRefs = useRef([]);
  const rafRef = useRef(0);
  const [failedIcons, setFailedIcons] = useState({});

  const dockApps = [
    {
      id: 'finder',
      name: 'Finder',
      category: 'System',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/finder.svg',
      fallbackIcon: Laptop,
      desc: 'macOS file manager & workspace organizer'
    },
    {
      id: 'figma',
      name: 'Figma',
      category: 'Design',
      iconUrl: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-figma.svg',
      fallbackIcon: Palette,
      desc: 'Primary UI/UX design tool, prototyping & design systems'
    },
    {
      id: 'cursor',
      name: 'Cursor',
      category: 'Development',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/cursor.svg',
      fallbackIcon: Code,
      desc: 'AI-first code editor for rapid prototyping and full stack shipping'
    },
    {
      id: 'ghostty',
      name: 'Ghostty',
      category: 'Terminal',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/terminal.svg',
      fallbackIcon: Terminal,
      desc: 'Blazing fast GPU-accelerated terminal emulator'
    },
    {
      id: 'claude',
      name: 'Claude',
      category: 'AI',
      iconUrl: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-claude.svg',
      fallbackIcon: Sparkles,
      desc: 'Reasoning model for architecture planning and design crit'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      category: 'AI',
      iconUrl: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-gemini.svg',
      fallbackIcon: Sparkles,
      desc: 'Multimodal research and rapid concept iteration'
    },
    {
      id: 'raycast',
      name: 'Raycast',
      category: 'Productivity',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/raycast.svg',
      fallbackIcon: Search,
      desc: 'Keyboard launcher, clipboard history, snippets & window management'
    },
    {
      id: 'linear',
      name: 'Linear',
      category: 'Management',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/linear.svg',
      fallbackIcon: CheckSquare,
      desc: 'Issue tracking, roadmaps, and sprint execution'
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'Notes',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/notion.svg',
      fallbackIcon: FileText,
      desc: 'Product specs, design documentation & knowledge base'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      category: 'Media',
      iconUrl: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/spotify.svg',
      fallbackIcon: Music,
      desc: 'Lo-fi beats, ambient synthwave and focus playlists'
    }
  ];

  // Rendered icon size (40px desktop, 34px on small screens via CSS).
  const iconSize = () => iconRefs.current[0]?.offsetWidth || 40;

  // Lay out the dock for the given per-icon scales: each icon is centered on
  // its scaled slot, so icons push apart as they grow (like the real macOS
  // dock) and the glass bar resizes to fit. Positions are computed, never
  // measured from live transforms, so magnification can't feed back into them.
  const layoutDock = (scales) => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const size = iconSize();
    const widths = scales.map((s) => size * s);
    const total = widths.reduce((a, b) => a + b, 0) + ICON_GAP * (scales.length - 1);
    shelf.style.width = `${total + SHELF_PAD_X * 2}px`;
    let x = SHELF_PAD_X;
    widths.forEach((w, i) => {
      const outer = iconRefs.current[i];
      // outer box is `size` wide; offset so the scaled artwork centers on its slot
      if (outer) outer.style.left = `${x + (w - size) / 2}px`;
      x += w + ICON_GAP;
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
    const pitch = size + ICON_GAP;
    const n = dockApps.length;
    // Measure the cursor against where the UNMAGNIFIED shelf sits (centered in
    // the stable wrapper) — the live shelf widens as icons grow, so measuring
    // from its live edge would make the wave trail the cursor.
    const wrapperRect = shelf.parentElement.getBoundingClientRect();
    const baseShelfW = n * size + ICON_GAP * (n - 1) + SHELF_PAD_X * 2;
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
                  {isFailed ? (
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
