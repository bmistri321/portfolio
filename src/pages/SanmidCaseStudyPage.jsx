import React from 'react';
import { ArrowLeft } from 'lucide-react';
import ShowcaseCard from '../components/ShowcaseCard';

export default function SanmidCaseStudyPage({ onNavigate }) {
  const allProjects = [
    {
      id: 'wexa-ai',
      title: 'Wexa AI (Onboarding & Copilot)',
      year: '2026',
      metric: 'Redesigned conversational onboarding, reducing abandonment by 42% and increasing initial activation.',
      tags: ['AI Onboarding', 'B2B SaaS', 'Design System'],
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
      link: '/casestudy/wexa'
    },
    {
      id: 'friender-crm',
      title: 'Friender CRM Automation',
      year: '2025',
      metric: 'Empowered 50k+ sales reps with AI-driven lead filtering, saving ~3.5 hours per week per user.',
      tags: ['Sales Automation', 'Chrome Extension', 'Real-time CRM'],
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif',
      link: '/casestudy/friender-case-study'
    },
    {
      id: 'varcle-analytics',
      title: 'Varcle Cloud Analytics',
      year: '2024',
      metric: 'Sub-second real-time telemetry streaming and automated anomaly detection for multi-cloud infrastructure.',
      tags: ['Cloud Observability', 'Distributed Systems', 'Data Viz'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    },
    {
      id: 'antigravity-toolkit',
      title: 'Antigravity Developer IDE Toolkit',
      year: '2024-2026',
      metric: 'Floating contextual AI actions, keyboard command palettes, and real-time AST code refactoring.',
      tags: ['Developer Tools', 'AI Agent UI', 'Vite & React'],
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    }
  ];

  return (
    <div className="animate-fade-in">
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

      <div className="showcase-grid">
        {allProjects.map((project) => (
          <ShowcaseCard
            key={project.id}
            title={project.title}
            year={project.year}
            metric={project.metric}
            tags={project.tags}
            image={project.image}
            link={project.link}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <footer className="site-footer" style={{ marginTop: '48px' }}>
        <div>
          Built with <span className="footer-stamp">React &amp; Vite</span>
        </div>
        <div className="footer-stamp">Bishal</div>
      </footer>
    </div>
  );
}
