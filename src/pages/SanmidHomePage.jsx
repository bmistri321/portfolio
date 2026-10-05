import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import ShowcaseCard from '../components/ShowcaseCard';

export default function SanmidHomePage({ onNavigate }) {
  const projects = [
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
    },
    {
      id: 'design-system',
      title: '3-Layer Design Token Architecture',
      year: 'WIP',
      metric: 'Primitives, Semantics & Components token system for consistent light/dark theme scalability.',
      tags: ['Design Tokens', 'Figma Variables', 'CSS Modules'],
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      link: '/dock'
    },
    {
      id: 'interactive-prototypes',
      title: 'Interactive Web Experiments & Playground',
      year: 'WIP',
      metric: 'Collection of experiments in micro-interactions, spring physics, and canvas rendering.',
      tags: ['Creative Coding', 'Canvas', 'WebGL'],
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      link: '/playground'
    }
  ];

  const writings = [
    {
      title: 'Designing AI Agents That Don’t Hallucinate UX',
      date: 'Feb 2026',
      readTime: '6 min read',
      url: 'https://medium.com/@bishalmistri'
    },
    {
      title: 'The 3-Tier Design Token Architecture for Modern Teams',
      date: 'Dec 2025',
      readTime: '8 min read',
      url: 'https://medium.com/@bishalmistri'
    },
    {
      title: 'Why Micro-Interactions Make or Break B2B SaaS Retention',
      date: 'Oct 2025',
      readTime: '5 min read',
      url: 'https://medium.com/@bishalmistri'
    }
  ];

  const tinkeringItems = [
    {
      title: 'Figma to Token JSON Exporter',
      desc: 'CLI tool to parse Figma variables and generate production-ready CSS variables.'
    },
    {
      title: 'macOS Spring Physics Curve',
      desc: 'Lightweight JS utility mimicking Apple dock magnification and bounce curves.'
    },
    {
      title: 'Prompt-to-Component Generator',
      desc: 'Zero-latency UI builder powered by Claude 3.7 and AST rewriting.'
    },
    {
      title: 'Sub-pixel Alignment Validator',
      desc: 'Micro-browser extension detecting rendering blur on fractional grid layouts.'
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Bio Header */}
      <header className="bio-header">
        <div className="bio-title-row">
          <h1 className="bio-name">Bishal Mistri</h1>
          <div className="bio-status-badge">
            <span className="bio-status-dot" />
            <span>Available for projects</span>
          </div>
        </div>

        <div className="bio-role">Product Designer &amp; Design Technologist</div>
        <div className="bio-tagline">Technical. Systems thinking. High agency.</div>

        <p className="bio-narrative">
          I design and engineer end-to-end from 0-to-1, transforming messy, ambiguous, and technically challenging problems into shipped B2B SaaS solutions. Focused on craft, typography, and rapid prototyping.
        </p>

        <p className="bio-narrative">
          Outside of design, I am into photography, mechanical keyboards, coffee, and{' '}
          <a
            href="/travel"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/travel');
            }}
          >
            travelling
          </a>
          . I{' '}
          <a href="#writing">write</a> and share thoughts online. Check out what is in my{' '}
          <a
            href="/dock"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/dock');
            }}
          >
            dock
          </a>
          . Always <a href="#tinkering">tinkering</a>.
        </p>

        <div className="bio-funfact">
          <span>✨</span>
          <span>Fun fact: Obsessed with sub-pixel alignment, keyboard-driven UI, and zero-latency interactions.</span>
        </div>
      </header>

      {/* Showcase Grid */}
      <h2 className="sanmid-section-heading">Selected Work</h2>
      <div className="showcase-grid">
        {projects.map((project) => (
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

      {/* Writing Section */}
      <h2 id="writing" className="sanmid-section-heading">Writing</h2>
      <div className="writing-list">
        {writings.map((item) => (
          <a
            key={item.title}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="writing-item"
          >
            <span className="writing-title">{item.title}</span>
            <span className="writing-date">{item.date} · {item.readTime}</span>
          </a>
        ))}
      </div>

      {/* Tinkering Section */}
      <h2 id="tinkering" className="sanmid-section-heading">Tinkering &amp; Experiments</h2>
      <div className="tinkering-grid">
        {tinkeringItems.map((item) => (
          <div key={item.title} className="tinker-card">
            <div className="tinker-title">
              <span>{item.title}</span>
              <ArrowUpRight size={14} color="var(--text-muted)" />
            </div>
            <div className="tinker-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div>
          Built with <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className="inline-link">React</a> and{' '}
          <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="inline-link">Cursor</a>
        </div>
        <div className="footer-stamp">Bishal</div>
      </footer>
    </div>
  );
}
