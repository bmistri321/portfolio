import React from 'react';
import ShowcaseCard from '../components/ShowcaseCard';

export default function SanmidHomePage({ onNavigate }) {
  const projects = [
    {
      id: 'wexa-ai',
      title: 'Wexa AI (Phase 1)',
      year: '2026',
      metric: 'Reduce onboarding drop-off by 42% and automate workspace setup',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
      link: '/casestudy/wexa'
    },
    {
      id: 'friender-crm',
      title: 'Friender CRM',
      year: '2025',
      metric: '50k+ active users, higher retention, ~3.5h saved weekly per rep',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif',
      link: '/casestudy/friender-case-study'
    },
    {
      id: 'varcle-analytics',
      title: 'Varcle Observability Platform',
      year: '2024',
      metric: 'Real-time telemetry and sub-second anomaly detection for multi-cloud infra',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    },
    {
      id: 'antigravity-toolkit',
      title: 'Antigravity Developer Workspace',
      year: '2023-2026',
      metric: 'Floating AI context menu and zero-latency AST code refactoring',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    },
    {
      id: 'design-system',
      title: 'Design System & Tokens',
      year: 'WIP',
      metric: 'Documentation, primitives, and 3-tier token architecture',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      link: '/dock'
    },
    {
      id: 'virtual-desktop',
      title: 'Interactive Web Playground',
      year: 'WIP',
      metric: 'Prototypes of ideas, spring physics, and canvas shaders',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      link: '/playground'
    }
  ];

  return (
    <div className="sanmid-page-animate">
      {/* Header Bio */}
      <header className="sanmid-header">
        <h1 className="sanmid-main-title">Bishal Mistri</h1>
        <h2 className="sanmid-sub-title">Product Designer &amp; Design Technologist</h2>
        <div className="sanmid-tagline">Technical. Systems thinking. High agency.</div>

        <p className="sanmid-bio-p">
          I design end-to-end from 0-to-1, transforming messy, ambiguous, and technically challenging problems into shipped B2B solutions. Focused on craft, typography, and rapid prototyping.
        </p>

        <p className="sanmid-bio-p">
          Outside of design, I am into photography, mechanical keyboards, coffee, and{' '}
          <a
            href="/travel"
            className="sanmid-inline-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/travel');
            }}
          >
            travelling
          </a>
          . I{' '}
          <a
            href="https://medium.com/@bishalmistri"
            target="_blank"
            rel="noopener noreferrer"
            className="sanmid-inline-link"
          >
            write
          </a>{' '}
          and share thoughts online. Check out what is in my{' '}
          <a
            href="/dock"
            className="sanmid-inline-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/dock');
            }}
          >
            dock
          </a>
          . Always{' '}
          <a
            href="/playground"
            className="sanmid-inline-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/playground');
            }}
          >
            tinkering
          </a>
          .
        </p>

        <div className="sanmid-funfact">
          Fun fact: Obsessed with sub-pixel alignment, keyboard-driven UI, and zero-latency interactions
        </div>
      </header>

      {/* Project Showcase List */}
      <section className="sanmid-project-list">
        {projects.map((project) => (
          <ShowcaseCard
            key={project.id}
            title={project.title}
            year={project.year}
            metric={project.metric}
            image={project.image}
            link={project.link}
            onNavigate={onNavigate}
          />
        ))}
      </section>

      {/* Footer */}
      <footer className="sanmid-footer">
        <div>
          Built with <span className="sanmid-footer-strong">React</span> and <span className="sanmid-footer-strong">Cursor</span>
        </div>
        <div className="sanmid-footer-author">Bishal</div>
      </footer>
    </div>
  );
}
