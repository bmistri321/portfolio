import React from 'react';
import { Home, FolderGit2, Monitor, Compass } from 'lucide-react';
import { Github, Linkedin } from './Icons';
import ThemeToggle from './ThemeToggle';

export default function NavigationDock({ currentPath, onNavigate }) {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Work', path: '/casestudy', icon: FolderGit2 },
    { name: 'My Dock', path: '/dock', icon: Monitor },
    { name: 'Travel', path: '/travel', icon: Compass },
  ];

  return (
    <nav className="floating-dock-container" aria-label="Quick navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
        return (
          <button
            key={item.path}
            className={`floating-dock-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.path)}
            aria-label={item.name}
          >
            <Icon size={18} />
            <span className="dock-tooltip">{item.name}</span>
          </button>
        );
      })}

      <div className="floating-dock-divider" />

      <a
        href="https://github.com/bishalmistri"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-dock-item"
        aria-label="GitHub Profile"
      >
        <Github size={18} />
        <span className="dock-tooltip">GitHub</span>
      </a>

      <a
        href="https://linkedin.com/in/bishalmistri"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-dock-item"
        aria-label="LinkedIn Profile"
      >
        <Linkedin size={18} />
        <span className="dock-tooltip">LinkedIn</span>
      </a>

      <div className="floating-dock-divider" />

      <ThemeToggle />
    </nav>
  );
}
