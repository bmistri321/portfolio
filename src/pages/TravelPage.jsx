import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TravelGallery from '../components/TravelGallery';

export default function TravelPage({ onNavigate }) {
  return (
    <div className="animate-fade-in">
      <header className="cs-header">
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="cs-title">Photographs (scroll to view)</h1>
        <p className="cs-summary-text">
          Visual travel log capturing architecture, misty mountain summits, and quiet urban corners. Click on any photo to inspect in full resolution.
        </p>
      </header>

      <TravelGallery />

      <footer className="site-footer" style={{ marginTop: '48px' }}>
        <div>
          Captured on <span className="footer-stamp">Sony Alpha &amp; iPhone 15 Pro</span>
        </div>
        <div className="footer-stamp">Bishal</div>
      </footer>
    </div>
  );
}
