import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ArrowUp, Mail, Heart, Globe } from 'lucide-react';
import { Github, Linkedin, Twitter } from './Icons';

export default function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#experience', label: 'Experience' },
    { href: '#terminal', label: 'CLI Console' },
    { href: '#contact', label: 'Contact' }
  ];

  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      background: '#09090C',
      padding: '4rem 0 2.5rem 0',
      position: 'relative'
    }}>
      <div className="container">
        
        {/* Main Footer Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.85rem',
                color: '#FFFFFF'
              }}>
                BM
              </div>
              <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#FFFFFF' }}>
                {portfolioData.personal.name}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Full Stack Software Engineer specializing in resilient systems, modern web engineering, and cloud architecture.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#6EE7B7' }}>
              <Globe size={14} />
              <span>Local Time: {time || 'Loading...'}</span>
            </div>
          </div>

          {/* Internal Navigation Links (SEO structure & crawling) */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Site Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SEO & Meta Verification column */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SEO &amp; Infrastructure
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>
              <div>Domain: <span style={{ color: '#93C5FD' }}>bishalmistri.com</span></div>
              <div>Protocol: <span style={{ color: '#34D399' }}>HTTPS Enforced</span></div>
              <div>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                  XML Sitemap
                </a>
                {' • '}
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                  Robots.txt
                </a>
              </div>
              <div style={{ marginTop: '0.25rem' }}>Structured Data: JSON-LD Person &amp; WebSite</div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)' }}>
            &copy; {new Date().getFullYear()} Bishal Mistri. All rights reserved. Designed for extreme performance &amp; high accessibility.
          </p>

          <button
            onClick={scrollToTop}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)' }}
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}
