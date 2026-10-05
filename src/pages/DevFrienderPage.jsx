import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

export default function DevFrienderPage({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'problem', label: 'Problem' },
    { id: 'insights', label: 'User Insights' },
    { id: 'architecture', label: 'CRM Architecture' },
    { id: 'workflow', label: 'Workflow UX' },
    { id: 'outcomes', label: 'Results & Impact' },
    { id: 'reflections', label: 'Reflections' }
  ];

  const solutionImages = [
    {
      url: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-4.avif',
      caption: 'Dynamic Toolbar Overlay — Floating context panel with 1-click lead status toggles'
    },
    {
      url: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-5.avif',
      caption: 'Automated Outreach Pipeline — Custom drip sequences and response sentiment tagging'
    },
    {
      url: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-6.avif',
      caption: 'Smart Filter & Segment Builder — Multi-criteria lead segmenting across active chats'
    },
    {
      url: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-7.avif',
      caption: 'Analytics Dashboard — Campaign conversion rates, response velocity, and team pipeline'
    }
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
            <h1 className="dev-detail-title">Friender Toolbar &amp; CRM</h1>
            <div className="dev-detail-meta">2025 · 5 minutes read</div>

            <p className="dev-detail-p">
              Friender is a high-velocity social CRM and lead generation system designed to automate outreach for <span className="dev-highlight-pink">50,000+ active enterprise sales reps</span> and agency owners.
            </p>
            <p className="dev-detail-p">
              By engineering a zero-latency browser overlay, sales reps manage their entire prospect pipeline without leaving their native communications flow, saving over <span className="dev-highlight-pink">3.5 hours per rep every week</span>.
            </p>
          </header>

          {/* Hero Device Mockup Container */}
          <div className="dev-hero-mockup-frame">
            <img
              src="https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif"
              alt="Friender CRM Hero Mockup"
              className="dev-hero-mockup-img"
              loading="lazy"
            />
            <div className="dev-mockup-caption">
              Friender 2.0 — Contextual browser toolbar and omnichannel pipeline manager
            </div>
          </div>

          {/* Section: Introduction */}
          <section id="introduction" className="dev-section-anchor">
            <h2 className="dev-section-heading">Introduction</h2>
            <p className="dev-detail-p">
              Modern outbound sales requires navigating disparate social ecosystems. Reps were burdened with manually copying conversation transcripts, switching between dozens of browser tabs, and losing valuable context on prospective buyers.
            </p>
          </section>

          {/* Section: Problem */}
          <section id="problem" className="dev-section-anchor">
            <h2 className="dev-section-heading">Problem</h2>
            <p className="dev-detail-p">
              Enterprise reps spent up to <span className="dev-highlight-pink">40% of their workday</span> on mundane administrative tasks rather than engaging with high-intent prospects. Previous software iterations felt intrusive, slowing down web pages and cluttering primary chat interfaces.
            </p>
          </section>

          {/* Section: User Insights */}
          <section id="insights" className="dev-section-anchor">
            <h2 className="dev-section-heading">User Insights</h2>
            <div className="cs-callout" style={{ margin: '16px 0' }}>
              <strong>Key Design Insight:</strong> Power users do not want another standalone dashboard. They demand lightweight, floating micro-interactions with rapid keyboard shortcut bindings.
            </div>
          </section>

          {/* Section: Architecture */}
          <section id="architecture" className="dev-section-anchor">
            <h2 className="dev-section-heading">CRM Architecture</h2>
            <p className="dev-detail-p">
              We engineered a modular docked sidebar that dynamically collapses into a discreet micro-pill when inactive, expanding instantly upon detecting profile URLs or inbound message activity.
            </p>
          </section>

          {/* Section: Workflow UX */}
          <section id="workflow" className="dev-section-anchor">
            <h2 className="dev-section-heading">Workflow UX &amp; Iterations</h2>
            {solutionImages.map((img, idx) => (
              <div key={idx} className="dev-hero-mockup-frame">
                <img src={img.url} alt={img.caption} className="dev-hero-mockup-img" loading="lazy" />
                <div className="dev-mockup-caption">
                  {img.caption}
                </div>
              </div>
            ))}
          </section>

          {/* Section: Outcomes */}
          <section id="outcomes" className="dev-section-anchor">
            <h2 className="dev-section-heading">Results &amp; Impact</h2>
            <ul className="cs-list">
              <li><strong>50k+ active weekly sales reps</strong> onboarded across North America and Europe.</li>
              <li><strong>65% reduction in manual data entry time</strong> per outbound campaign.</li>
              <li><strong>Net Promoter Score (NPS) surged from +24 to +58</strong> following the 2.0 interface release.</li>
            </ul>
          </section>

          {/* Section: Reflections */}
          <section id="reflections" className="dev-section-anchor">
            <h2 className="dev-section-heading">Reflections</h2>
            <p className="dev-detail-p">
              Overlay software must respect host website DOM boundaries and user attention. By prioritizing speed, non-blocking UI layers, and clean typography, Friender became an indispensable daily tool for sales professionals.
            </p>
          </section>

          {/* Pagination Footer */}
          <footer className="cs-pagination" style={{ marginTop: '60px' }}>
            <button
              className="cs-nav-link"
              onClick={() => onNavigate('/casestudy/wexa')}
            >
              <span className="cs-nav-dir">&larr; Previous Project</span>
              <span className="cs-nav-name">Wexa AI</span>
            </button>

            <button
              className="cs-nav-link"
              style={{ alignItems: 'flex-end' }}
              onClick={() => onNavigate('/')}
            >
              <span className="cs-nav-dir">Home &rarr;</span>
              <span className="cs-nav-name">Back to Overview</span>
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
