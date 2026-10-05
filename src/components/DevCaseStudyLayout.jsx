import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DevCaseStudyLayout({
  title,
  meta,
  lead,
  heroVisual,
  sections = [],
  onNavigate,
  prevProject,
  nextProject
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'introduction');
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef(null);

  // 1. Keyboard Navigation: Escape key closes project
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Active Section Detection via IntersectionObserver
  useEffect(() => {
    if (!sections.length) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // 3. Scroll Reveal Animation for Content & Visuals
  useEffect(() => {
    const revealCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Trigger once
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    const elements = containerRef.current?.querySelectorAll('.dev-reveal');
    elements?.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, [sections]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onNavigate('/');
    }, 200);
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: isReduced ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`dev-detail-wrapper ${isClosing ? 'dev-exit-animate' : 'dev-enter-animate'}`}
    >
      {/* Top-Right Floating Close Button */}
      <button
        className="dev-detail-close-btn"
        onClick={handleClose}
        aria-label="Close case study and return to home"
        title="Close (Esc)"
      >
        <X size={16} />
      </button>

      <div className="dev-detail-layout">
        {/* Left Sticky Table of Contents */}
        <aside className="dev-detail-toc" aria-label="Case study navigation">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`dev-toc-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && <span className="dev-toc-dot" aria-hidden="true" />}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Article Content */}
        <article className="dev-detail-content">
          <header className="dev-reveal" style={{ marginBottom: '36px' }}>
            <h1 className="dev-detail-title">{title}</h1>
            {meta && <div className="dev-detail-meta">{meta}</div>}
            {lead}
          </header>

          {/* Hero Device Mockup Frame */}
          {heroVisual && (
            <div className="dev-hero-mockup-frame dev-reveal">
              <img
                src={heroVisual.image}
                alt={heroVisual.alt || title}
                className="dev-hero-mockup-img"
                loading="eager"
                decoding="async"
              />
              {heroVisual.caption && (
                <div className="dev-mockup-caption">{heroVisual.caption}</div>
              )}
            </div>
          )}

          {/* Structured Sections */}
          {sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="dev-section-anchor dev-reveal"
            >
              {sec.heading && <h2 className="dev-section-heading">{sec.heading}</h2>}
              {sec.content}
            </section>
          ))}

          {/* Pagination Footer */}
          <footer className="cs-pagination dev-reveal" style={{ marginTop: '72px' }}>
            {prevProject ? (
              <button
                className="cs-nav-link"
                onClick={() => onNavigate(prevProject.link)}
              >
                <span className="cs-nav-dir">&larr; Previous</span>
                <span className="cs-nav-name">{prevProject.name}</span>
              </button>
            ) : (
              <button className="cs-nav-link" onClick={handleClose}>
                <span className="cs-nav-dir">&larr; Home</span>
                <span className="cs-nav-name">Overview</span>
              </button>
            )}

            {nextProject ? (
              <button
                className="cs-nav-link"
                style={{ alignItems: 'flex-end' }}
                onClick={() => onNavigate(nextProject.link)}
              >
                <span className="cs-nav-dir">Next Project &rarr;</span>
                <span className="cs-nav-name">{nextProject.name}</span>
              </button>
            ) : (
              <button
                className="cs-nav-link"
                style={{ alignItems: 'flex-end' }}
                onClick={handleClose}
              >
                <span className="cs-nav-dir">Close</span>
                <span className="cs-nav-name">Back to Home &rarr;</span>
              </button>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
