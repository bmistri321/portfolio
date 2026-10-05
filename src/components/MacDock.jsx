import React, { useState, useRef } from 'react';
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

export default function MacDock() {
  const dockRef = useRef(null);
  const [mouseX, setMouseX] = useState(null);
  const [bouncingIndex, setBouncingIndex] = useState(null);

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

  const handleIconClick = (idx) => {
    setBouncingIndex(idx);
    setTimeout(() => setBouncingIndex(null), 1000);
  };

  const calculateScale = (index) => {
    if (mouseX === null || !dockRef.current) return 1;
    const icons = dockRef.current.children;
    if (!icons[index]) return 1;

    const rect = icons[index].getBoundingClientRect();
    const iconCenter = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - iconCenter);
    const maxDistance = 140;

    if (distance > maxDistance) return 1;
    const scale = 1 + 0.35 * Math.cos((distance / maxDistance) * (Math.PI / 2));
    return Math.max(1, scale);
  };

  return (
    <div>
      {/* Interactive macOS Dock Shelf */}
      <div className="mac-dock-shelf-wrapper">
        <div
          ref={dockRef}
          className="mac-dock-shelf"
          onMouseMove={(e) => setMouseX(e.clientX)}
          onMouseLeave={() => setMouseX(null)}
        >
          {dockApps.map((app, index) => {
            const scale = calculateScale(index);
            const isBouncing = bouncingIndex === index;

            return (
              <div
                key={app.id}
                className="mac-dock-icon"
                style={{
                  transform: `scale(${scale}) ${isBouncing ? 'translateY(-16px)' : ''}`,
                  transition: isBouncing 
                    ? 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                    : 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={() => handleIconClick(index)}
              >
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
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
          <div key={cat.title} className="gear-card" style={{ flexDirection: 'column' }}>
            <h3 className="gear-info-title" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {cat.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {cat.items.map((item) => (
                <div key={item.name} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '2px' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
