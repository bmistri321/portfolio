import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { playUiSound } from '../utils/sound';

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
  const sheetRef = useRef(null);

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

  // 2. Prevent background body scrolling while modal sheet is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // 3. Active Section Detection via IntersectionObserver
  useEffect(() => {
    if (!sections.length || !sheetRef.current) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: sheetRef.current,
      rootMargin: '-10% 0px -65% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // 4. Scroll Reveal Animation for Content & Visuals
  useEffect(() => {
    if (!sheetRef.current) return;

    const revealCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      root: sheetRef.current,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.05
    });

    const elements = sheetRef.current.querySelectorAll('.dev-reveal');
    elements.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, [sections]);

  const handleClose = () => {
    playUiSound('close');
    setIsClosing(true);
    setTimeout(() => {
      onNavigate('/');
    }, 240);
  };

  const scrollToSection = (id) => {
    playUiSound('tab');
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`dev-sheet-backdrop ${isClosing ? 'dev-backdrop-exit' : 'dev-backdrop-enter'}`}
      onClick={handleBackdropClick}
    >
      {/* Top-Right Floating Close Button */}
      <button
        className="dev-sheet-close-btn"
        onClick={handleClose}
        aria-label="Close case study and return to home"
        title="Close (Esc)"
      >
        <X size={16} />
      </button>

      {/* Slide-Up Sheet Panel with Rounded Top Corners */}
      <div
        ref={sheetRef}
        className={`dev-sheet-panel ${isClosing ? 'dev-sheet-exit' : 'dev-sheet-enter'}`}
      >
        <div className="dev-sheet-inner">
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

          {/* Main Content Column */}
          <article className="dev-detail-content">
            <header className="dev-reveal" style={{ marginBottom: '32px' }}>
              <h1 className="dev-detail-title">{title}</h1>
              {meta && <div className="dev-detail-meta">{meta}</div>}
              {lead}
            </header>

            {/* Hero Visual Mockup */}
            {heroVisual && (
              <div className="dev-hero-clean-wrap dev-reveal">
                <img
                  src={heroVisual.image}
                  alt={heroVisual.alt || title}
                  className="dev-hero-clean-img"
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
            <footer className="cs-pagination dev-reveal" style={{ marginTop: '64px' }}>
              {prevProject ? (
                <button
                  className="cs-nav-link"
                  onClick={() => {
                    playUiSound('open');
                    onNavigate(prevProject.link);
                  }}
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
                  onClick={() => {
                    playUiSound('open');
                    onNavigate(nextProject.link);
                  }}
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
    </div>
  );
}
