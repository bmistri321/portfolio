import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Mail, 
  ArrowUpRight 
} from 'lucide-react';
import { Linkedin, Behance } from '../components/Icons';
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

  // Merge CMS published items
  const dynamicWork = cmsItems
    .filter((i) => i.type === 'work')
    .map((i) => ({
      id: i.id,
      title: i.title,
      year: i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
      metric: i.excerpt || i.metadata?.client || 'Interactive product design & systems architecture',
      image: i.cover_image || '',
      link: i.metadata?.link || i.metadata?.projectUrl || `/casestudy/${i.slug}`
    }));

  const dynamicTinkering = cmsItems
    .filter((i) => i.type === 'tinkering')
    .map((i) => ({
      id: i.id,
      title: i.title,
      year: i.metadata?.date || i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
      metric: i.excerpt || 'Interactive code exploration & prototype',
      image: i.cover_image || '',
      link: i.metadata?.link || i.metadata?.demoUrl || i.metadata?.projectUrl || `/casestudy/${i.slug}`
    }));

  const dynamicWriting = cmsItems
    .filter((i) => i.type === 'writing')
    .map((i) => ({
      id: i.id,
      title: i.title,
      date: i.metadata?.date || new Date(i.published_at || i.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      metric: i.excerpt || i.metadata?.subtitle || 'Long-form editorial essay',
      url: i.metadata?.projectUrl || i.metadata?.external_url || i.metadata?.link || `/casestudy/${i.slug}`
    }));



  // CMS is the single source of truth — manage items in the admin portal.
  const getActiveList = () => {
    switch (activeTab) {
      case 'tinkering':
        return dynamicTinkering;
      case 'writing':
        return dynamicWriting;
      case 'work':
      default:
        return dynamicWork;
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
          I design end-to-end product experiences, turning messy requirements and complex workflows into simple, scalable B2B products. Focused on craft and rapid prototyping. Currently looking for better opportunity, previously at <a href="https://tier5.us/" target="_blank" rel="noopener noreferrer" className="dev-pink-link" onClick={() => playUiSound('click')}>Tier5</a>. Google certified in Experience Design and Bachelor's in Arts.
        </p>

        <p className="dev-bio-paragraph">
          Outside of design, I'm into arts, coffee, online games, and{' '}
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
            href="https://instagram.com/bishalsphotos"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-pink-link"
            onClick={() => playUiSound('open')}
          >
            photograph
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
        <a href="mailto:contact@bishalmistri.com" className="dev-social-icon" aria-label="Email" onClick={() => playUiSound('click')}>
          <Mail size={16} />
        </a>
        <a href="https://linkedin.com/in/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="LinkedIn" onClick={() => playUiSound('click')}>
          <Linkedin size={16} />
        </a>
        <a href="https://behance.net/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="Behance" onClick={() => playUiSound('click')}>
          <Behance size={16} />
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
              {project.image ? (
                <div className="dev-card-img-box">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="dev-card-img"
                  />
                </div>
              ) : null}

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
