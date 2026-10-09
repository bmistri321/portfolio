import React, { useState, useEffect, useRef } from 'react';
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
import FrienderCoverAnim from '../components/FrienderCoverAnim';
import WexaCoverAnim from '../components/WexaCoverAnim';
import { playUiSound, isSoundEnabled, setSoundEnabled } from '../utils/sound';
import { contentService, CONTENT_LIST_SELECT } from '../lib/contentService';

// A pasted link may miss its scheme — make it safe to open in a new tab.
const normalizeExternalUrl = (u) => {
  const t = (u || '').trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

// Tinkering is hidden from the public site but NOT removed — content,
// admin, and tab logic stay intact. Flip to true to show it again.
const SHOW_TINKERING = false;

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
        const items = await contentService.getAll({ status: 'published', select: CONTENT_LIST_SELECT });
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

  // Sliding active-tab indicator: measures the active pill and glides the
  // pink background to it with ease-in-out (no cross-fade jerk).
  const tabsRef = useRef(null);
  const [tabIndicator, setTabIndicator] = useState(null);
  useEffect(() => {
    const place = () => {
      const root = tabsRef.current;
      if (!root) return;
      const btn = root.querySelector('.dev-tab-pill.active');
      if (!btn) return;
      setTabIndicator({ x: btn.offsetLeft, w: btn.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    const fonts = document.fonts;
    if (fonts && fonts.ready) fonts.ready.then(place).catch(() => {});
    return () => window.removeEventListener('resize', place);
  }, [activeTab]);

  // Merge CMS published items
  const dynamicWork = cmsItems
    .filter((i) => i.type === 'work')
    .map((i) => ({
      id: i.id,
      slug: i.slug,
      title: i.title,
      year: i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
      metric: i.seo_description || i.excerpt || i.metadata?.client || 'Interactive product design & systems architecture',
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
      year: i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
      date: i.metadata?.date || new Date(i.published_at || i.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      metric: i.excerpt || i.metadata?.subtitle || 'Long-form editorial essay',
      // Writings with an external link (any pasted URL, or the Medium article)
      // open it in a new tab instead of the internal article page.
      url: normalizeExternalUrl(i.metadata?.external_url) || i.metadata?.medium?.url || i.metadata?.projectUrl || i.metadata?.link || `/casestudy/${i.slug}`
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
    <>
      <div className="dev-edge-fade-top" aria-hidden="true" />
      <div className="dev-progressive-blur" aria-hidden="true">
        {[
          [0.195, 0], [0.39, 12.5], [0.78, 25], [1.5625, 37.5],
          [3.125, 50], [6.25, 62.5], [12.5, 75], [25, 87.5],
        ].map(([b, s], i) => (
          <div
            key={i}
            className="dev-progressive-blur-layer"
            style={{
              backdropFilter: `blur(${b}px)`,
              WebkitBackdropFilter: `blur(${b}px)`,
              maskImage: `linear-gradient(to bottom, transparent ${s}%, black ${s + 12.5}%, black ${s + 25}%, transparent ${s + 37.5}%)`,
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${s}%, black ${s + 12.5}%, black ${s + 25}%, transparent ${s + 37.5}%)`,
            }}
          />
        ))}
      </div>
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
        Design craft. Systems thinking. Product impact.
      </div>

      {/* 3. NARRATIVE BIO WITH VIBRANT PINK LINKS */}
      <div className="dev-bio-section">
        <p className="dev-bio-paragraph">
          I design end-to-end product experiences, turning messy requirements and complex workflows into simple, scalable B2B products. Focused on craft and rapid prototyping. Currently looking for better opportunity, previously at <a href="https://tier5.us/" target="_blank" rel="noopener noreferrer" className="dev-pink-link" onClick={() => playUiSound('click')}>Tier5</a>. Google certified in Experience Design and Bachelor's in Arts.
        </p>

        <p className="dev-bio-paragraph">
          Outside of design, I'm into arts, coffee, online games, and{' '}
          travelling
          . I{' '}
          <a
            href="https://www.pexels.com/@bishal/"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-pink-link"
            onClick={() => playUiSound('open')}
          >
            photograph
          </a>{' '}
          and I recently started{' '}
          posting them online
          . Check out what's in my{' '}
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
          {SHOW_TINKERING ? (
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
          ) : (
            'tinkering'
          )}
          .
        </p>

        <p className="dev-funfact-text">
          Fun fact: You won't find anyone with my exact design &amp; code toolkit stack
        </p>
      </div>

      {/* 4. SOCIAL ICONS ROW */}
      <div className="dev-social-row">
        <a href="mailto:hello@bishalmistri.com" className="dev-social-icon" aria-label="Email" onClick={() => playUiSound('click')}>
          <Mail size={20} />
        </a>
        <a href="https://linkedin.com/in/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="LinkedIn" onClick={() => playUiSound('click')}>
          <Linkedin size={20} />
        </a>
        <a href="https://behance.net/bishalmistri" target="_blank" rel="noopener noreferrer" className="dev-social-icon" aria-label="Behance" onClick={() => playUiSound('click')}>
          <Behance size={20} />
        </a>
      </div>

      {/* 5. SEGMENTED FILTER PILL TABS */}
      <div id="home-tabs-anchor" className="dev-tabs-container" ref={tabsRef}>
        {tabIndicator && (
          <span
            aria-hidden="true"
            className="dev-tab-indicator"
            style={{ width: tabIndicator.w, transform: `translateX(${tabIndicator.x}px)` }}
          />
        )}
        <button
          className={`dev-tab-pill ${activeTab === 'work' ? 'active' : ''}`}
          onClick={() => handleTabChange('work')}
        >
          <Briefcase size={13} />
          <span>Work</span>
        </button>

        {SHOW_TINKERING && (
          <button
            className={`dev-tab-pill ${activeTab === 'tinkering' ? 'active' : ''}`}
            onClick={() => handleTabChange('tinkering')}
          >
            <Sparkles size={13} />
            <span>Tinkering</span>
          </button>
        )}

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
                <span className="dev-writing-icon"><FileText size={18} /></span>
                <h3 className="dev-card-title dev-writing-title">{item.title}</h3>
                <span className="dev-writing-year">{item.year}</span>
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
              {project.slug && project.slug.startsWith('friender') ? (
                <div className="dev-card-img-box">
                  <FrienderCoverAnim />
                </div>
              ) : project.slug && project.slug.startsWith('wexa') ? (
                <div className="dev-card-img-box">
                  <WexaCoverAnim />
                </div>
              ) : project.image ? (
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
                  {project.year && (
                    <span className="dev-year-badge">
                      <span className="dev-year-text">{project.year}</span>
                      <span className="dev-year-arrow">→</span>
                    </span>
                  )}
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
          Built with <span className="dev-footer-bold">React</span> and <span className="dev-footer-bold">Antigravity</span>
        </div>
        <a href="mailto:hello@bishalmistri.com" className="dev-footer-name" onClick={() => playUiSound('click')}>hello@bishalmistri.com</a>
      </footer>
      </div>
    </>
  );
}
