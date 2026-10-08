import React, { useState, useRef, useEffect, useCallback } from 'react';
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

// macOS-style magnification tuning — kept subtle like the reference:
// a gentle nudge with the tooltip as the main hover feedback.
const MAGNIFY_PEAK = 1.12;   // max icon scale right under the cursor
const MAGNIFY_RANGE = 2.2;   // falloff range, measured in icon pitches
const MAGNIFY_LIFT = 3;      // px the icon rises at peak scale

export default function MacDock() {
  const shelfRef = useRef(null);
  const magRefs = useRef([]);
  const rafRef = useRef(0);
  const centersRef = useRef([]);
  const [bouncingIndex, setBouncingIndex] = useState(null);
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

  // Icon centers are measured from layout (offsetLeft), so the live
  // magnification transforms can never feed back into the measurement.
  const measureCenters = useCallback(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const icons = shelf.querySelectorAll('.mac-dock-icon');
    centersRef.current = Array.from(icons).map(
      (el) => el.offsetLeft + el.offsetWidth / 2
    );
  }, []);

  useEffect(() => {
    measureCenters();
    const t = setTimeout(measureCenters, 600); // re-measure after assets settle
    window.addEventListener('resize', measureCenters);
    return () => {
      window.removeEventListener('resize', measureCenters);
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [measureCenters]);

  const applyMagnification = (clientX) => {
    const shelf = shelfRef.current;
    if (!shelf || centersRef.current.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = clientX - shelf.getBoundingClientRect().left;
    const pitch =
      centersRef.current.length > 1
        ? centersRef.current[1] - centersRef.current[0]
        : 58;
    magRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(x - centersRef.current[i]) / pitch;
      let s = 1;
      if (d < MAGNIFY_RANGE) {
        s = 1 + (MAGNIFY_PEAK - 1) * Math.pow(Math.cos((d / MAGNIFY_RANGE) * Math.PI / 2), 1.15);
      }
      el.style.transform =
        s <= 1.001
          ? ''
          : `translateY(${(-(s - 1) * MAGNIFY_LIFT).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
  };

  const handleMouseMove = (e) => {
    const clientX = e.clientX;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => applyMagnification(clientX));
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current);
    magRefs.current.forEach((el) => {
      if (el) el.style.transform = '';
    });
  };

  const handleIconClick = (idx) => {
    setBouncingIndex(idx);
    setTimeout(() => setBouncingIndex(null), 900);
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
            const isBouncing = bouncingIndex === index;
            const isFailed = failedIcons[app.id];
            const FallbackIcon = app.fallbackIcon;
            return (
              <div
                key={app.id}
                className="mac-dock-icon"
                onClick={() => handleIconClick(index)}
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
                      className={isBouncing ? 'mac-dock-bouncing' : ''}
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
