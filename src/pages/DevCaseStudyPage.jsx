import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ShowcaseCard from '../components/ShowcaseCard';

export default function DevCaseStudyPage({ onNavigate }) {
  const allProjects = [
    {
      id: 'wexa-ai',
      title: 'Wexa AI (Phase 1)',
      year: '2026',
      metric: 'Reduce support ticket by 30% and save ~$20M annually',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
      link: '/casestudy/wexa'
    },
    {
      id: 'friender-crm',
      title: 'Friender Toolbar & CRM',
      year: '2025',
      metric: '100M+ end users, higher NPS, ~$8M saved',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif',
      link: '/casestudy/friender-case-study'
    },
    {
      id: 'varcle-platform',
      title: 'Varcle Platform Redesign',
      year: '2024',
      metric: '400k+ admins, less churn, more revenue',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    },
    {
      id: 'antigravity-workflows',
      title: 'Antigravity Admin Workflows',
      year: '2023-2026',
      metric: 'Admin workflows for Cloud IDE · $20B ARR',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    }
  ];

  return (
    <div className="dev-page-animate">
      <header className="cs-header">
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="cs-title">Selected Case Studies</h1>
        <p className="cs-summary-text">
          Deep dives into complex product design, systems architecture, and AI interaction workflows.
        </p>
      </header>

      <div className="dev-cards-grid">
        {allProjects.map((project) => (
          <a
            key={project.id}
            href={project.link}
            onClick={(e) => {
              if (project.link.startsWith('/')) {
                e.preventDefault();
                onNavigate(project.link);
              }
            }}
            className="dev-project-card"
          >
            <div className="dev-card-img-box">
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="dev-card-img"
              />
            </div>
            <div className="dev-card-info">
              <div className="dev-card-title-row">
                <h3 className="dev-card-title">{project.title}</h3>
                {project.year && <span className="dev-year-badge">{project.year}</span>}
              </div>
              {project.metric && <p className="dev-card-metric">{project.metric}</p>}
            </div>
          </a>
        ))}
      </div>

      <footer className="dev-footer-row" style={{ marginTop: '48px' }}>
        <div>
          Built with <span className="dev-footer-bold">Next.js</span> and <span className="dev-footer-bold">Antigravity</span>
        </div>
        <div className="dev-footer-name">Bishal</div>
      </footer>
    </div>
  );
}
