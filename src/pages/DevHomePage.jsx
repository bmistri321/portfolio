import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Archive, 
  Mail, 
  Globe, 
  ArrowUpRight 
} from 'lucide-react';
import { Github, Linkedin, Twitter } from '../components/Icons';
import InteractiveGlobe from '../components/InteractiveGlobe';
import { playUiSound, isSoundEnabled, setSoundEnabled } from '../utils/sound';
import { contentService } from '../lib/contentService';

export default function DevHomePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('work');
  const [cmsItems, setCmsItems] = useState([]);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    async function loadPublished() {
      try {
        const items = await contentService.getAll({ status: 'published' });
        setCmsItems(items);
      } catch (err) {
        console.warn('Could not load CMS items:', err);
      }
    }
    loadPublished();
  }, []);

  const toggleTheme = () => {
    playUiSound('toggle');
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playUiSound('toggle');
    }
  };

  const handleTabChange = (tab) => {
    playUiSound('tab');
    setActiveTab(tab);
  };

  const defaultWorkProjects = [
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
    },
    {
      id: 'observability',
      title: 'Realtime Observability',
      year: '2023-2026',
      metric: 'Session insights for cloud admins · $20B ARR',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      link: '/casestudy/wexa'
    },
    {
      id: 'design-system',
      title: 'Core Design System',
      year: 'WIP',
      metric: 'Documentation, tokens and components library',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      link: '/dock'
    }
  ];

  const defaultTinkeringProjects = [
    {
      id: 'virtual-desktop',
      title: 'Virtual Desktop Prototype',
      year: '2026',
      metric: 'Prototype of a Windows Virtual Desktop (made with AI)',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      link: '/playground'
    },
    {
      id: 'dock-physics',
      title: 'macOS Spring Dock',
      year: '2025',
      metric: 'Smooth magnification curve and bouncy dock interaction in React',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      link: '/dock'
    },
    {
      id: 'token-generator',
      title: 'Figma Variables Tokenizer',
      year: '2025',
      metric: 'Automated 3-layer design token generator from JSON',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      link: '/playground'
    }
  ];

  const defaultWritings = [
    {
      title: 'Designing AI Agents That Don’t Hallucinate UX',
      date: 'Feb 2026',
      metric: 'System prompts, latency states, and conversational guardrails in B2B SaaS',
      url: 'https://medium.com/@bishalmistri'
    },
    {
      title: 'The 3-Layer Design Token Architecture for Modern Teams',
      date: 'Dec 2025',
      metric: 'Primitives, Semantics & Component tokens for light/dark theme scalability',
      url: 'https://medium.com/@bishalmistri'
    },
    {
      title: 'Why Micro-Interactions Make or Break SaaS Retention',
      date: 'Oct 2025',
      metric: 'Sub-pixel alignment, keyboard shortcuts, and perceived speed',
      url: 'https://medium.com/@bishalmistri'
    }
  ];

  const defaultArchives = [
    {
      id: 'early-works',
      title: 'UX Design Mastery — 30 Days',
      year: '2024',
      metric: 'Published guide on product psychology and wireframing',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif',
      link: '/book/ux.mastery.30.days'
    },
    {
      id: 'travel-archive',
      title: 'Visual Travel Logs & Moments',
      year: '2023-2025',
      metric: 'Photographs and architectural studies across Asia',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      link: '/travel'
    }
  ];

  // Merge CMS published items
  const dynamicWork = cmsItems
    .filter((i) => i.type === 'work')
    .map((i) => ({
      id: i.id,
      title: i.title,
      year: i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
      metric: i.excerpt || i.metadata?.client || 'Interactive product design & systems architecture',
      image: i.cover_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      link: `/casestudy/${i.slug}`
    }));

  const dynamicTinkering = cmsItems
    .filter((i) => i.type === 'tinkering')
    .map((i) => ({
      id: i.id,
      title: i.title,
      year: i.metadata?.date || new Date(i.published_at || i.created_at).getFullYear().toString(),
      metric: i.excerpt || 'Interactive code exploration & prototype',
      image: i.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      link: `/casestudy/${i.slug}`
    }));

  const dynamicWriting = cmsItems
    .filter((i) => i.type === 'writing')
    .map((i) => ({
      id: i.id,
      title: i.title,
      date: new Date(i.published_at || i.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      metric: i.excerpt || i.metadata?.subtitle || 'Long-form editorial essay',
      url: `/casestudy/${i.slug}`
    }));

  const dynamicArchives = cmsItems
    .filter((i) => i.type === 'archive' || i.status === 'archived')
    .map((i) => ({
      id: i.id,
      title: i.title,
      year: new Date(i.archived_at || i.published_at || i.created_at).getFullYear().toString(),
      metric: i.excerpt || 'Archived portfolio piece',
      image: i.cover_image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      link: `/casestudy/${i.slug}`
    }));

  const getActiveList = () => {
    switch (activeTab) {
      case 'tinkering':
        return [...dynamicTinkering, ...defaultTinkeringProjects];
      case 'archives':
        return [...dynamicArchives, ...defaultArchives];
      case 'writing':
        return [...dynamicWriting, ...defaultWritings];
      case 'work':
      default:
        return [...dynamicWork, ...defaultWorkProjects];
    }
  };

  return (
    <div className="dev-page-animate">
      {/* 1. TOP HEADER: Avatar + Name + Audio Mute Toggle + Theme Toggle */}
      <header className="dev-top-bar">
        <div className="dev-profile-left">
          <div className="dev-avatar-circle">
            <InteractiveGlobe size={38} />
          </div>
          <div className="dev-profile-meta">
            <h1 className="dev-name-title">Bishal Mistri</h1>
            <p className="dev-role-sub">Product Designer</p>
          </div>
        </div>

        <div className="dev-top-actions">
          <button 
            onClick={toggleSound} 
            className="dev-icon-btn" 
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            title={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} color="#9CA3AF" />}
          </button>
          <button 
            onClick={toggleTheme} 
            className="dev-icon-btn" 
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* 2. SIGNATURE SCRIPT TAGLINE (Caveat Cursive) */}
      <div className="dev-handwritten-tagline">
        Design. Systems thinking. High agency.
      </div>

      {/* 3. NARRATIVE BIO WITH VIBRANT PINK LINKS */}
      <div className="dev-bio-section">
        <p className="dev-bio-paragraph">
          I design end-to-end product experiences, turning messy requirements and complex workflows into simple, scalable B2B products. Focused on craft and rapid prototyping. Currently looking for job, previously at <a href="https://tier5.us/" target="_blank" rel="noopener noreferrer" className="dev-pink-link" onClick={() => playUiSound('click')}>Tier5</a>. Google certified in Experience Design and Bachelor's in Arts.
        </p>

        <p className="dev-bio-paragraph">
          Outside of design, I'm into anthropology, keyboards, reading, coffee, board games, and{' '}
          <a
            href="/travel"
            className="dev-pink-link"
            onClick={(e) => {
              e.preventDefault();
              playUiSound('open');
              onNavigate('/travel');
            }}
          >
            travelling
          </a>
          . I{' '}
          <a
            href="#writing"
            className="dev-pink-link"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('writing');
            }}
          >
            write
          </a>{' '}
          and I recently started posting them online. Check out what's in my{' '}
          <a
            href="/dock"
            className="dev-pink-link"
            onClick={(e) => {
              e.preventDefault();
              playUiSound('open');
              onNavigate('/dock');
            }}
          >
            dock
          </a>
          . Always{' '}
          <a
            href="#tinkering"
            className="dev-pink-link"
            onClick={(e) => {
              e.preventDefault();
              handleTabChange('tinkering');
            }}
          >
            tinkering
          </a>
          .
        </p>

        <p className="dev-funfact-text">
          Fun fact: You won't find anyone with my exact design &amp; code toolkit stack
        </p>
      </div>

      {/* 4. SOCIAL ICONS ROW */}
      <div className="dev-social-row">
        <a href="https://twitter.com/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="Twitter" onClick={() => playUiSound('click')}>
          <Twitter size={16} />
        </a>
        <a href="mailto:contact@bishalmistri.com" className="dev-social-icon" aria-label="Email" onClick={() => playUiSound('click')}>
          <Mail size={16} />
        </a>
        <a href="https://linkedin.com/in/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="LinkedIn" onClick={() => playUiSound('click')}>
          <Linkedin size={16} />
        </a>
        <a href="https://github.com/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="GitHub" onClick={() => playUiSound('click')}>
          <Github size={16} />
        </a>
        <a href="https://bishalmistri.com" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="Website" onClick={() => playUiSound('click')}>
          <Globe size={16} />
        </a>
      </div>

      {/* 5. SEGMENTED FILTER PILL TABS */}
      <div id="home-tabs-anchor" className="dev-tabs-container">
        <button
          className={`dev-tab-pill ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => handleTabChange('work')}
        >
          <Briefcase size={13} />
          <span>Work</span>
        </button>

        <button
          className={`dev-tab-pill ${activeTab === 'tinkering' ? 'active' : ''}`}
          onClick={() => handleTabChange('tinkering')}
        >
          <Sparkles size={13} />
          <span>Tinkering</span>
        </button>

        <button
          className={`dev-tab-pill ${activeTab === 'writing' ? 'active' : ''}`}
          onClick={() => handleTabChange('writing')}
        >
          <FileText size={13} />
          <span>Writing</span>
        </button>

        <button
          className={`dev-tab-pill ${activeTab === 'archives' ? 'active' : ''}`}
          onClick={() => handleTabChange('archives')}
        >
          <Archive size={13} />
          <span>Archives</span>
        </button>
      </div>

      {/* 6. 2-COLUMN PROJECT GRID */}
      {activeTab === 'writing' ? (
        <div className="dev-writing-list">
          {getActiveList().map((item) => {
            const isInternal = item.url && item.url.startsWith('/');
            return (
              <a
                key={item.id || item.title}
                href={item.url}
                target={isInternal ? undefined : "_blank"}
                rel={isInternal ? undefined : "noopener noreferrer"}
                className="dev-writing-row"
                onClick={(e) => {
                  playUiSound('click');
                  if (isInternal) {
                    e.preventDefault();
                    playUiSound('open');
                    onNavigate(item.url);
                  }
                }}
              >
                <div>
                  <h3 className="dev-card-title">{item.title}</h3>
                  <p className="dev-card-metric">{item.metric}</p>
                </div>
                <span className="dev-year-badge">{item.date}</span>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="dev-cards-grid">
          {getActiveList().map((project) => (
            <a
              key={project.id}
              href={project.link}
              onClick={(e) => {
                playUiSound('open');
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
      )}

      {/* 7. MINIMAL FOOTER */}
      <footer className="dev-footer-row">
        <div className="dev-footer-text">
          Built with <span className="dev-footer-bold">Next.js</span> and <span className="dev-footer-bold">Antigravity</span>
        </div>
        <div className="dev-footer-name">Bishal</div>
      </footer>
    </div>
  );
}
