import React from 'react';
import { ArrowLeft } from 'lucide-react';
import MacDock from '../components/MacDock';

export default function DockPage({ onNavigate }) {
  return (
    <div className="animate-fade-in">
      <header className="dock-page-header">
        <button
          className="dock-back-link"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <h1 className="dock-page-title">My Dock</h1>
        <p className="dock-page-subtitle">
          Apps and daily workflows exported directly from my macOS workstation. Click on any dock icon to trigger a bounce, or explore the curated stack below.
        </p>
      </header>

      <MacDock />

      <footer className="site-footer" style={{ marginTop: '48px' }}>
        <div>
          Built with <span className="footer-stamp">React</span> &amp; <span className="footer-stamp">Vite</span>
        </div>
        <div className="footer-stamp">Bishal</div>
      </footer>
    </div>
  );
}
