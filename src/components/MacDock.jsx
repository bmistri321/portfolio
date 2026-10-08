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

// macOS-style magnification tuning
const MAGNIFY_PEAK = 1.8;   // max icon scale right under the cursor
const MAGNIFY_RANGE = 2.6;  // falloff range, measured in icon pitches
const MAGNIFY_LIFT = 12;    // px the icon rises at peak scale

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

  const gearCategories = [
    {
      title: 'Design & Prototyping',
      items: [
        { name: 'Figma', desc: 'Design tokens, auto-layout, interactive component prototypes.' },
        { name: 'Framer', desc: 'React-based production landing pages and micro-interactions.' },
        { name: 'Principle & Rive', desc: 'State-machine vector animation and physics prototyping.' },
        { name: 'CleanShot X', desc: 'Pixel-perfect annotation, scrolling screen capture & screen recordings.' }
      ]
    },
    {
      title: 'Engineering & Code',
      items: [
        { name: 'Cursor & VS Code', desc: 'TypeScript, React 19, Tailwind CSS, Node.js, and Python.' },
        { name: 'Ghostty & Zsh', desc: 'Pure Zsh shell, fast git workflows, homebrew, and docker CLI.' },
        { name: 'Chrome Canary & Arc', desc: 'DevTools, performance profiling, responsive viewport testing.' },
        { name: 'Postman & Insomnia', desc: 'API testing, schema validation, WebSocket debugging.' }
      ]
    },
    {
      title: 'AI & Copilots',
      items: [
        { name: 'Claude 3.7 Sonnet', desc: 'Deep technical reasoning, design critique, and code generation.' },
        { name: 'Gemini 2.5 / 3.0', desc: 'Multimodal vision, large context document parsing & summaries.' },
        { name: 'Midjourney & SDXL', desc: 'Visual moodboards, asset concepting, and texture generation.' }
      ]
    },
    {
      title: 'Hardware & Desk Setup',
      items: [
        { name: 'MacBook Pro 16" (M3 Max)', desc: '64GB Unified Memory, Space Black — my primary portable powerhouse.' },
        { name: 'Apple Studio Display 27"', desc: '5K Retina display for sub-pixel design verification and color calibration.' },
        { name: 'Keychron Q1 Pro Mechanical', desc: 'Custom tactile switches with custom PBT keycaps.' },
        { name: 'Logitech MX Master 3S', desc: 'Ergonomic precision mouse with infinite electromagnetic scroll.' },
        { name: 'Sony WH-1000XM5', desc: 'Industry-leading noise cancellation for deep focus sessions.' }
      ]
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
    <div>
      {/* Interactive macOS Dock Shelf */}
      <div className="mac-dock-shelf-wrapper">
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
                <span className="mac-dock-indicator" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorized Gear & Stack */}
      <h2 className="dev-section-heading">Workspace &amp; Toolkit</h2>

      <div className="gear-category-grid">
        {gearCategories.map((cat) => (
          <div key={cat.title} className="gear-card">
            <h3 className="gear-info-title">{cat.title}</h3>
            <div className="gear-items">
              {cat.items.map((item) => (
                <div key={item.name} className="gear-item">
                  <div className="gear-item-name">{item.name}</div>
                  <div className="gear-item-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
