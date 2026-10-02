import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { Menu, X, Terminal, Code2, Sparkles, Send } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'terminal', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'terminal', label: 'Console' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleLinkClick = (id) => {
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#FFFFFF' }}
          aria-label="Bishal Mistri Homepage"
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1rem',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            BM
          </div>
          <div>
            <span style={{ fontWeight: '700', fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'block' }}>
              {portfolioData.personal.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
              Software Engineer
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Button & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-pill status-available" style={{ display: 'none' }} id="desktop-status-pill">
            <span className="status-dot" aria-hidden="true"></span>
            <span>Available</span>
          </div>

          <a 
            href="#contact" 
            onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }}
            className="btn btn-primary btn-sm"
            style={{ display: 'none' }}
            id="nav-contact-btn"
          >
            <Send size={14} />
            <span>Get in Touch</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '0.5rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            background: '#121216',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div className="status-pill status-available" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
            <span className="status-dot"></span>
            <span>{portfolioData.personal.status.text}</span>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }}
              style={{
                color: activeSection === link.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                textDecoration: 'none',
                fontSize: '1.05rem',
                fontWeight: '600',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {link.label}
            </a>
          ))}

          <a 
            href="#contact" 
            onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }}
            className="btn btn-primary"
            style={{ marginTop: '0.75rem', width: '100%' }}
          >
            <Send size={16} />
            <span>Connect with Bishal</span>
          </a>
        </div>
      )}

      {/* Responsive Inline CSS overrides for navbar helpers */}
      <style>{`
        @media (min-width: 900px) {
          #mobile-nav-toggle { display: none !important; }
          #desktop-status-pill { display: inline-flex !important; }
          #nav-contact-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
