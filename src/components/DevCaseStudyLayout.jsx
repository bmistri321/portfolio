import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowUp } from 'lucide-react';
import { playUiSound } from '../utils/sound';

export default function DevCaseStudyLayout({
  title,
  heroVisual,
  sections = [],
  onNavigate
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'introduction');
  const [isClosing, setIsClosing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  // 3. Scroll Up / Pull Down at top to Close
  useEffect(() => {
    const sheetEl = sheetRef.current;
    if (!sheetEl) return;

    let wheelAccum = 0;
    let wheelTimeout = null;
    let touchStartY = 0;
    let isAtTopOnTouch = false;
    let isReady = false;

    // Grace period so opening gesture doesn't instantly close
    const readyTimer = setTimeout(() => {
      isReady = true;
    }, 400);

    const handleWheel = (e) => {
      if (!isReady || isClosing) return;

      if (sheetEl.scrollTop <= 0) {
        if (e.deltaY < 0) {
          wheelAccum += Math.abs(e.deltaY);
          clearTimeout(wheelTimeout);
          wheelTimeout = setTimeout(() => {
            wheelAccum = 0;
          }, 350);

          if (wheelAccum >= 60) {
            wheelAccum = 0;
            handleClose();
          }
        } else {
          wheelAccum = 0;
        }
      } else {
        wheelAccum = 0;
      }
    };

    const handleTouchStart = (e) => {
      if (!isReady || isClosing) return;
      if (sheetEl.scrollTop <= 0) {
        isAtTopOnTouch = true;
        touchStartY = e.touches[0].clientY;
      } else {
        isAtTopOnTouch = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!isReady || isClosing || !isAtTopOnTouch) return;
      if (sheetEl.scrollTop <= 0) {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - touchStartY;
        if (diffY > 75) {
          isAtTopOnTouch = false;
          handleClose();
        }
      }
    };

    const handleScroll = () => {
      setShowScrollTop(sheetEl.scrollTop > 450);
    };

    sheetEl.addEventListener('wheel', handleWheel, { passive: true });
    sheetEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    sheetEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    sheetEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(wheelTimeout);
      sheetEl.removeEventListener('wheel', handleWheel);
      sheetEl.removeEventListener('touchstart', handleTouchStart);
      sheetEl.removeEventListener('touchmove', handleTouchMove);
      sheetEl.removeEventListener('scroll', handleScroll);
    };
  }, [isClosing]);

  // 4. Active Section Detection via IntersectionObserver
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

  // 5. Scroll Reveal Animation for Content & Visuals
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

  const scrollToTop = () => {
    playUiSound('tab');
    if (sheetRef.current) {
      sheetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
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
      {/* Top-Right Floating Controls */}
      <div className="dev-sheet-floating-controls">
        {showScrollTop && (
          <button
            className="dev-sheet-top-btn"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            <ArrowUp size={15} />
            <span className="dev-top-btn-label">Top</span>
          </button>
        )}
        <button
          className="dev-sheet-close-btn"
          onClick={handleClose}
          aria-label="Close case study and return to home"
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>

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
          </article>
        </div>
      </div>
    </div>
  );
}
