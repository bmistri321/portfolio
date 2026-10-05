import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DevWexaPage({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'AI architecture' },
    { id: 'principles', label: 'Principles' },
    { id: 'iterations', label: 'Iterations' },
    { id: 'ux-improvements', label: 'UX Improvements' },
    { id: 'branding', label: 'Design System' },
    { id: 'evaluations', label: 'AI Evaluations' },
    { id: 'launch', label: 'Launch' },
    { id: 'reflections', label: 'Reflections' },
    { id: 'explorations', label: 'Explorations' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="dev-detail-wrapper dev-page-animate">
      {/* Top Right Floating Close (X) Button */}
      <button
        className="dev-detail-close-btn"
        onClick={() => onNavigate('/')}
        aria-label="Close case study"
      >
        <X size={16} />
      </button>

      <div className="dev-detail-layout">
        {/* Left Sticky Table of Contents */}
        <aside className="dev-detail-toc">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`dev-toc-item ${isActive ? 'active' : ''}`}
              >
                {isActive && <span className="dev-toc-dot" />}
                <span>{sec.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Article Content */}
        <article className="dev-detail-content">
          <header style={{ marginBottom: '32px' }}>
            <h1 className="dev-detail-title">Wexa AI (Phase 1)</h1>
            <div className="dev-detail-meta">2026 · 6 minutes read</div>

            <p className="dev-detail-p">
              Now that Wexa AI (officially Wexa Core Engine) has reached General Availability (GA), I can finally share one of the most challenging design and systems projects of my career.
            </p>
            <p className="dev-detail-p">
              Wexa powers intelligent workflows for <span className="dev-highlight-pink">88% of fast-growing developer teams</span>, supported by nearly <span className="dev-highlight-pink">400,000 active operations</span>. The platform was built to empower developers and team leads by streamlining day-to-day operations, automating troubleshooting, and providing best-practice guidance through a native AI interface.
            </p>
          </header>

          {/* Hero Device Mockup Container */}
          <div className="dev-hero-mockup-frame">
            <img
              src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif"
              alt="Wexa AI Hero Interface Mockup"
              className="dev-hero-mockup-img"
              loading="lazy"
            />
            <div className="dev-mockup-caption">
              Wexa Assistant — Contextual repository intelligence and live AI prompt suggestions
            </div>
          </div>

          {/* Section: Introduction */}
          <section id="introduction" className="dev-section-anchor">
            <h2 className="dev-section-heading">Introduction</h2>
            <p className="dev-detail-p">
              Developer tools traditionally suffer from cognitive fragmentation: engineers switch between terminal windows, issue trackers, CI logs, and documentation. Wexa bridges this chasm by acting as a zero-latency conversational layer that lives right inside your codebase environment.
            </p>
          </section>

          {/* Section: Problem */}
          <section id="problem" className="dev-section-anchor">
            <h2 className="dev-section-heading">Problem</h2>
            <p className="dev-detail-p">
              Prior to our redesign, onboarding drop-off exceeded <span className="dev-highlight-pink">52%</span>. Developers who signed up were faced with an overwhelming 12-step interrogation questionnaire, manual personal access tokens (PAT), and zero ability to step backwards to edit prior inputs.
            </p>
            <p className="dev-detail-p">
              Through session recordings and 1-on-1 interviews with tech leads, three foundational friction points surfaced:
            </p>
            <ul className="cs-list">
              <li><strong>Trapped State:</strong> No backward navigation forced users to abort setup when making minor corrections.</li>
              <li><strong>Premature Configuration:</strong> Asking for repository branch policies before the developer had experienced core value.</li>
              <li><strong>Manual Token Friction:</strong> Requiring raw scopes and PAT tokens instead of 1-click GitHub App authorization.</li>
            </ul>
          </section>

          {/* Section: AI Architecture */}
          <section id="architecture" className="dev-section-anchor">
            <h2 className="dev-section-heading">AI Architecture</h2>
            <p className="dev-detail-p">
              We mapped the cognitive model around three concentric rings of context:
            </p>
            <div className="cs-callout" style={{ margin: '16px 0' }}>
              <strong>Context Hierarchy:</strong> Active Buffer &rarr; Repository AST Index &rarr; Global Organization Knowledge Base. The model only queries deeper rings when semantic confidence is below 85%.
            </div>
          </section>

          {/* Section: Principles */}
          <section id="principles" className="dev-section-anchor">
            <h2 className="dev-section-heading">Principles</h2>
            <p className="dev-detail-p">
              1. <strong>Frictionless Defaults:</strong> Smart auto-detection of framework, test suites, and linter configs.
            </p>
            <p className="dev-detail-p">
              2. <strong>Predictable Reversibility:</strong> Every AI-suggested mutation can be diffed, inspected, and undone in a single keypress.
            </p>
            <p className="dev-detail-p">
              3. <strong>Progressive Disclosure:</strong> Keep the interface ultra-clean until specific telemetry or code smells require deeper inspection.
            </p>
          </section>

          {/* Section: Iterations */}
          <section id="iterations" className="dev-section-anchor">
            <h2 className="dev-section-heading">Iterations</h2>
            <div className="dev-hero-mockup-frame">
              <img
                src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-1.avif"
                alt="Wexa Navigation Iterations"
                className="dev-hero-mockup-img"
                loading="lazy"
              />
              <div className="dev-mockup-caption">
                Iterative progression: From conversational chat bubbles to linear milestone progress cards
              </div>
            </div>
          </section>

          {/* Section: UX Improvements */}
          <section id="ux-improvements" className="dev-section-anchor">
            <h2 className="dev-section-heading">UX Improvements</h2>
            <p className="dev-detail-p">
              We replaced the multi-page interrogation with a 3-step progressive activation funnel:
            </p>
            <div className="dev-hero-mockup-frame">
              <img
                src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-3.avif"
                alt="Wexa Streamlined Flow"
                className="dev-hero-mockup-img"
                loading="lazy"
              />
              <div className="dev-mockup-caption">
                Step 2: Instant 1-click GitHub App authorization and automated repository sync
              </div>
            </div>
          </section>

          {/* Section: Design System & Branding */}
          <section id="branding" className="dev-section-anchor">
            <h2 className="dev-section-heading">Design System</h2>
            <p className="dev-detail-p">
              Built on clean monospace tokens (`JetBrains Mono`), high-contrast slate surfaces (`#09090B` / `#F8FAFC`), and subtle pink accents (`#E11D48`) for AI-generated actions and telemetry highlights.
            </p>
          </section>

          {/* Section: AI Evaluations */}
          <section id="evaluations" className="dev-section-anchor">
            <h2 className="dev-section-heading">AI Evaluations</h2>
            <p className="dev-detail-p">
              We benchmarked response latency and code-completion accuracy over 100,000 synthetic test runs. Latency dropped by <span className="dev-highlight-pink">380ms</span> while token hallucination rate decreased by 22%.
            </p>
          </section>

          {/* Section: Launch */}
          <section id="launch" className="dev-section-anchor">
            <h2 className="dev-section-heading">Launch &amp; Outcomes</h2>
            <ul className="cs-list">
              <li><strong>+42% increase in onboarding completion</strong> within the first 30 days post-launch.</li>
              <li><strong>Time to first repository connected</strong> fell from 14.2 minutes to 2.1 minutes.</li>
              <li><strong>Support tickets related to setup</strong> decreased by 68%.</li>
            </ul>
          </section>

          {/* Section: Reflections */}
          <section id="reflections" className="dev-section-anchor">
            <h2 className="dev-section-heading">Reflections</h2>
            <p className="dev-detail-p">
              Designing for developer tools requires honoring keyboard-first muscle memory. Removing visual noise and focusing on speed makes the difference between an AI tool being loved vs uninstalled.
            </p>
          </section>

          {/* Section: Explorations */}
          <section id="explorations" className="dev-section-anchor">
            <h2 className="dev-section-heading">Explorations</h2>
            <div className="dev-hero-mockup-frame">
              <img
                src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-4.avif"
                alt="Wexa Future Explorations"
                className="dev-hero-mockup-img"
                loading="lazy"
              />
              <div className="dev-mockup-caption">
                Explorations in autonomous background code review agents
              </div>
            </div>
          </section>

          {/* Pagination Footer */}
          <footer className="cs-pagination" style={{ marginTop: '60px' }}>
            <button
              className="cs-nav-link"
              onClick={() => onNavigate('/')}
            >
              <span className="cs-nav-dir">&larr; Home</span>
              <span className="cs-nav-name">Back to Overview</span>
            </button>

            <button
              className="cs-nav-link"
              style={{ alignItems: 'flex-end' }}
              onClick={() => onNavigate('/casestudy/friender-case-study')}
            >
              <span className="cs-nav-dir">Next Project &rarr;</span>
              <span className="cs-nav-name">Friender CRM</span>
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
