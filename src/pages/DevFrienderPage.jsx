import React from 'react';
import DevCaseStudyLayout from '../components/DevCaseStudyLayout';

export default function DevFrienderPage({ onNavigate }) {
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

  const sections = [
    {
      id: 'introduction',
      label: 'Introduction',
      heading: 'Introduction',
      content: (
        <p className="dev-detail-p">
          Modern outbound sales requires navigating disparate social ecosystems. Reps were burdened with manually copying conversation transcripts, switching between dozens of browser tabs, and losing valuable context on prospective buyers.
        </p>
      )
    },
    {
      id: 'problem',
      label: 'Problem',
      heading: 'Problem',
      content: (
        <p className="dev-detail-p">
          Enterprise reps spent up to <span className="dev-highlight-pink">40% of their workday</span> on mundane administrative tasks rather than engaging with high-intent prospects. Previous software iterations felt intrusive, slowing down web pages and cluttering primary chat interfaces.
        </p>
      )
    },
    {
      id: 'insights',
      label: 'User Insights',
      heading: 'User Insights',
      content: (
        <div className="cs-callout" style={{ margin: '16px 0' }}>
          <strong>Key Design Insight:</strong> Power users do not want another standalone dashboard. They demand lightweight, floating micro-interactions with rapid keyboard shortcut bindings.
        </div>
      )
    },
    {
      id: 'architecture',
      label: 'CRM Architecture',
      heading: 'CRM Architecture',
      content: (
        <p className="dev-detail-p">
          We engineered a modular docked sidebar that dynamically collapses into a discreet micro-pill when inactive, expanding instantly upon detecting profile URLs or inbound message activity.
        </p>
      )
    },
    {
      id: 'workflow',
      label: 'Workflow UX',
      heading: 'Workflow UX & Iterations',
      content: (
        <div>
          {solutionImages.map((img, idx) => (
            <div key={idx} className="dev-hero-mockup-frame">
              <img src={img.url} alt={img.caption} className="dev-hero-mockup-img" loading="lazy" />
              <div className="dev-mockup-caption">{img.caption}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'outcomes',
      label: 'Results & Impact',
      heading: 'Results & Impact',
      content: (
        <ul className="cs-list">
          <li><strong>50k+ active weekly sales reps</strong> onboarded across North America and Europe.</li>
          <li><strong>65% reduction in manual data entry time</strong> per outbound campaign.</li>
          <li><strong>Net Promoter Score (NPS) surged from +24 to +58</strong> following the 2.0 interface release.</li>
        </ul>
      )
    },
    {
      id: 'reflections',
      label: 'Reflections',
      heading: 'Reflections',
      content: (
        <p className="dev-detail-p">
          Overlay software must respect host website DOM boundaries and user attention. By prioritizing speed, non-blocking UI layers, and clean typography, Friender became an indispensable daily tool for sales professionals.
        </p>
      )
    }
  ];

  const lead = (
    <>
      <p className="dev-detail-p">
        Friender is a high-velocity social CRM and lead generation system designed to automate outreach for <span className="dev-highlight-pink">50,000+ active enterprise sales reps</span> and agency owners.
      </p>
      <p className="dev-detail-p">
        By engineering a zero-latency browser overlay, sales reps manage their entire prospect pipeline without leaving their native communications flow, saving over <span className="dev-highlight-pink">3.5 hours per rep every week</span>.
      </p>
    </>
  );

  return (
    <DevCaseStudyLayout
      title="Friender Toolbar & CRM"
      meta="2025 · 5 minutes read"
      lead={lead}
      heroVisual={{
        image: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif',
        caption: 'Friender 2.0 — Contextual browser toolbar and omnichannel pipeline manager',
        alt: 'Friender CRM Hero Mockup'
      }}
      sections={sections}
      onNavigate={onNavigate}
      prevProject={{
        name: 'Wexa AI',
        link: '/casestudy/wexa'
      }}
    />
  );
}
