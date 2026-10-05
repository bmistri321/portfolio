import React from 'react';
import DevCaseStudyLayout from '../components/DevCaseStudyLayout';

export default function DevWexaPage({ onNavigate }) {
  const sections = [
    {
      id: 'introduction',
      label: 'Introduction',
      heading: 'Introduction',
      content: (
        <p className="dev-detail-p">
          Developer tools traditionally suffer from cognitive fragmentation: engineers switch between terminal windows, issue trackers, CI logs, and documentation. Wexa bridges this chasm by acting as a zero-latency conversational layer that lives right inside your codebase environment.
        </p>
      )
    },
    {
      id: 'problem',
      label: 'Problem',
      heading: 'Problem',
      content: (
        <>
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
        </>
      )
    },
    {
      id: 'architecture',
      label: 'AI architecture',
      heading: 'AI Architecture',
      content: (
        <>
          <p className="dev-detail-p">
            We mapped the cognitive model around three concentric rings of context:
          </p>
          <div className="cs-callout" style={{ margin: '16px 0' }}>
            <strong>Context Hierarchy:</strong> Active Buffer &rarr; Repository AST Index &rarr; Global Organization Knowledge Base. The model only queries deeper rings when semantic confidence is below 85%.
          </div>
        </>
      )
    },
    {
      id: 'principles',
      label: 'Principles',
      heading: 'Principles',
      content: (
        <>
          <p className="dev-detail-p">
            1. <strong>Frictionless Defaults:</strong> Smart auto-detection of framework, test suites, and linter configs.
          </p>
          <p className="dev-detail-p">
            2. <strong>Predictable Reversibility:</strong> Every AI-suggested mutation can be diffed, inspected, and undone in a single keypress.
          </p>
          <p className="dev-detail-p">
            3. <strong>Progressive Disclosure:</strong> Keep the interface ultra-clean until specific telemetry or code smells require deeper inspection.
          </p>
        </>
      )
    },
    {
      id: 'iterations',
      label: 'Iterations',
      heading: 'Iterations',
      content: (
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
      )
    },
    {
      id: 'ux-improvements',
      label: 'UX Improvements',
      heading: 'UX Improvements',
      content: (
        <>
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
        </>
      )
    },
    {
      id: 'branding',
      label: 'Design System',
      heading: 'Design System',
      content: (
        <p className="dev-detail-p">
          Built on clean monospace tokens (`JetBrains Mono`), high-contrast slate surfaces (`#09090B` / `#F8FAFC`), and subtle pink accents (`#E11D48`) for AI-generated actions and telemetry highlights.
        </p>
      )
    },
    {
      id: 'evaluations',
      label: 'AI Evaluations',
      heading: 'AI Evaluations',
      content: (
        <p className="dev-detail-p">
          We benchmarked response latency and code-completion accuracy over 100,000 synthetic test runs. Latency dropped by <span className="dev-highlight-pink">380ms</span> while token hallucination rate decreased by 22%.
        </p>
      )
    },
    {
      id: 'launch',
      label: 'Launch',
      heading: 'Launch & Outcomes',
      content: (
        <ul className="cs-list">
          <li><strong>+42% increase in onboarding completion</strong> within the first 30 days post-launch.</li>
          <li><strong>Time to first repository connected</strong> fell from 14.2 minutes to 2.1 minutes.</li>
          <li><strong>Support tickets related to setup</strong> decreased by 68%.</li>
        </ul>
      )
    },
    {
      id: 'reflections',
      label: 'Reflections',
      heading: 'Reflections',
      content: (
        <p className="dev-detail-p">
          Designing for developer tools requires honoring keyboard-first muscle memory. Removing visual noise and focusing on speed makes the difference between an AI tool being loved vs uninstalled.
        </p>
      )
    },
    {
      id: 'explorations',
      label: 'Explorations',
      heading: 'Explorations',
      content: (
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
      )
    }
  ];

  const lead = (
    <>
      <p className="dev-detail-p">
        Now that Wexa AI (officially Wexa Core Engine) has reached General Availability (GA), I can finally share one of the most challenging design and systems projects of my career.
      </p>
      <p className="dev-detail-p">
        Wexa powers intelligent workflows for <span className="dev-highlight-pink">88% of fast-growing developer teams</span>, supported by nearly <span className="dev-highlight-pink">400,000 active operations</span>. The platform was built to empower developers and team leads by streamlining day-to-day operations, automating troubleshooting, and providing best-practice guidance through a native AI interface.
      </p>
    </>
  );

  return (
    <DevCaseStudyLayout
      title="Wexa AI (Phase 1)"
      meta="2026 · 6 minutes read"
      lead={lead}
      heroVisual={{
        image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
        caption: 'Wexa Assistant — Contextual repository intelligence and live AI prompt suggestions',
        alt: 'Wexa AI Hero Mockup'
      }}
      sections={sections}
      onNavigate={onNavigate}
      nextProject={{
        name: 'Friender CRM',
        link: '/casestudy/friender-case-study'
      }}
    />
  );
}
