import React, { useState, useEffect, useRef } from 'react';
import { enhanceVideos } from './videoPlayer';
import { X, ArrowUp, ArrowLeft } from 'lucide-react';
import { playUiSound } from '../utils/sound';

export default function DevCaseStudyLayout({
  title,
  meta,
  heroVisual,
  sections = [],
  onNavigate,
  sourceLink = null
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'introduction');
  const [isClosing, setIsClosing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sheetRef = useRef(null);
  const articleRef = useRef(null);
  // While a TOC click is smooth-scrolling, the clicked item is the ground
  // truth — the scroll-spy holds it until the sheet stops scrolling, then
  // re-derives the active section from the settled geometry.
  const pendingClickRef = useRef(false);
  const settleTimerRef = useRef(null);
  // Which TOC item was clicked (ground truth for where a click-scroll ends).
  const clickedIdRef = useRef(null);
  // The clicked item stays highlighted until the user scrolls on their own.
  // Late layout shifts (lazy images finishing) must not hand the highlight
  // to another section after the click settled.
  const stickyClickRef = useRef(null);

  const clearSettleTimer = () => {
    if (settleTimerRef.current) {
      clearInterval(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  // Geometric scroll-spy: the active item is the last section whose top has
  // reached near the top of the viewport. Includes a bottom guard so the
  // final (often short) section stays active at max scroll.
  const computeActiveSection = () => {
    const rootEl = sheetRef.current;
    if (!rootEl || !sections.length) return null;
    if (rootEl.scrollTop + rootEl.clientHeight >= rootEl.scrollHeight - 2) {
      return sections[sections.length - 1].id;
    }
    const line = rootEl.getBoundingClientRect().top + 120;
    let current = sections[0].id;
    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el && el.getBoundingClientRect().top <= line) {
        current = sec.id;
      }
    });
    return current;
  };

  // Swap native video controls for the designed player on article videos.
  useEffect(() => {
    if (!articleRef.current) return;
    const cleanup = enhanceVideos(articleRef.current);
    return cleanup;
  }, [sections]);

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

  // 4. Active Section Detection via IntersectionObserver.
  // The observer only decides *when* to re-evaluate; the geometric
  // computation decides *which* section is active. While a TOC click is
  // scrolling, the clicked item is held.
  useEffect(() => {
    if (!sections.length || !sheetRef.current) return;

    const observerCallback = () => {
      if (pendingClickRef.current) return;
      const sheetEl = sheetRef.current;
      const stickyId = stickyClickRef.current;
      if (stickyId && sheetEl) {
        const el = document.getElementById(stickyId);
        const pr = sheetEl.getBoundingClientRect();
        const r = el ? el.getBoundingClientRect() : null;
        // Hold the clicked highlight while its section is around the
        // viewport. If the user moved far away by other means (e.g.
        // dragging the scrollbar), release it to the scroll-spy.
        if (r && r.bottom >= pr.top - pr.height && r.top <= pr.bottom + pr.height) {
          setActiveSection(stickyId);
          return;
        }
        stickyClickRef.current = null;
      }
      const id = computeActiveSection();
      if (id) setActiveSection(id);
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

  // Clear any pending settle timer on unmount.
  useEffect(() => () => clearSettleTimer(), []);

  // A real user scroll releases the clicked highlight (and cancels an
  // in-flight click smooth-scroll) so the scroll-spy follows them again.
  // Wheel / touch / scroll-keys are genuine user intent; the programmatic
  // click-scroll never produces them.
  useEffect(() => {
    const sheetEl = sheetRef.current;
    if (!sheetEl) return;
    const handleUserScrollIntent = () => {
      if (pendingClickRef.current) {
        clearSettleTimer();
        pendingClickRef.current = false;
        clickedIdRef.current = null;
      }
      stickyClickRef.current = null;
    };
    const handleKey = (e) => {
      if (
        ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)
      ) {
        handleUserScrollIntent();
      }
    };
    sheetEl.addEventListener('wheel', handleUserScrollIntent, { passive: true });
    sheetEl.addEventListener('touchstart', handleUserScrollIntent, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      sheetEl.removeEventListener('wheel', handleUserScrollIntent);
      sheetEl.removeEventListener('touchstart', handleUserScrollIntent);
      document.removeEventListener('keydown', handleKey);
    };
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
    // Hold the clicked item until the sheet stops scrolling: the scroll-spy
    // ignores everything while pending, then the settled geometry decides.
    pendingClickRef.current = true;
    clickedIdRef.current = id;
    stickyClickRef.current = null;
    clearSettleTimer();
    const sheet = sheetRef.current;
    const el = document.getElementById(id);
    if (el) {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({
        behavior: isReduced ? 'auto' : 'smooth',
        block: 'start'
      });
    }
    let lastTop = sheet ? sheet.scrollTop : -1;
    let stableTicks = 0;
    settleTimerRef.current = setInterval(() => {
      const top = sheet ? sheet.scrollTop : -1;
      if (top === lastTop) stableTicks += 1;
      else {
        stableTicks = 0;
        lastTop = top;
      }
      if (stableTicks >= 2) {
        clearSettleTimer();
        pendingClickRef.current = false;
        const clickedId = clickedIdRef.current;
        clickedIdRef.current = null;
        let finalId = null;
        if (clickedId && sheet) {
          const el = document.getElementById(clickedId);
          const sheetRect = sheet.getBoundingClientRect();
          if (el) {
            const r = el.getBoundingClientRect();
            // The click is ground truth when its heading is on screen: keep
            // it even if the sheet sits at max scroll (short final section
            // below it) — the bottom guard must not steal it.
            if (r.top <= sheetRect.bottom && r.bottom >= sheetRect.top) {
              finalId = clickedId;
            }
          }
        }
        if (!finalId) finalId = computeActiveSection();
        if (finalId) {
          setActiveSection(finalId);
          // The click sticks: keep this highlight until the user scrolls
          // on their own, so late layout shifts can't steal it.
          if (clickedId && finalId === clickedId) {
            stickyClickRef.current = clickedId;
          }
        }
      }
    }, 120);
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
                  <span className="dev-toc-dot" aria-hidden="true" style={{ visibility: isActive ? 'visible' : 'hidden' }} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Content Column */}
          <article className="dev-detail-content" ref={articleRef}>
            <header className="dev-reveal" style={{ marginBottom: '32px' }}>
              <button
                className="dev-article-back-btn"
                onClick={handleClose}
                aria-label="Back to home"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <h1 className="dev-detail-title">{title}</h1>
              {meta && <div className="dev-detail-meta">{meta}</div>}
              {sourceLink?.url && (
                <div className="dev-detail-source">
                  Originally published on{' '}
                  <a href={sourceLink.url} target="_blank" rel="noopener">
                    {sourceLink.label || 'Medium'}
                  </a>
                </div>
              )}
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
