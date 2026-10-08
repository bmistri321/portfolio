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

  // Sliding + squeezing active-tab indicator. The pink pill glides to the
  // active tab and stretches toward it mid-flight (liquid squeeze), the
  // radius staying a perfect capsule throughout.
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);
  const indicatorAnim = useRef(null);
  const [indicatorInit, setIndicatorInit] = useState(null);

  const readIndicatorPos = () => {
    const el = indicatorRef.current;
    const cs = window.getComputedStyle(el);
    const m = /matrix\((.+)\)/.exec(cs.transform);
    let x = 0;
    if (m) {
      const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
      if (parts.length === 6 && isFinite(parts[4])) x = parts[4];
    }
    const w = parseFloat(cs.width);
    return { x, w: isFinite(w) ? w : 0 };
  };

  const moveIndicator = (animate) => {
    const root = tabsRef.current;
    const el = indicatorRef.current;
    if (!root || !el) return;
    const btn = root.querySelector('.dev-tab-pill.active');
    if (!btn) return;
    const newX = btn.offsetLeft;
    const newW = btn.offsetWidth;
    // Current visual position (accounts for an interrupted animation).
    const from = readIndicatorPos();
    if (indicatorAnim.current) {
      indicatorAnim.current.cancel();
      indicatorAnim.current = null;
    }
    // Pin exactly where it is so there's no flash, then animate from there.
    el.style.transform = `translateX(${from.x}px)`;
    el.style.width = `${from.w}px`;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduceMotion || (from.x === newX && from.w === newW)) return;
    // Squeeze: stretch toward the target first (trailing edge lingers),
    // then the trailing edge catches up and the pill settles.
    const movingRight = newX >= from.x;
    const midX = movingRight ? from.x : newX;
    const midW = movingRight ? newX + newW - from.x : from.x + from.w - newX;
    const anim = el.animate(
      [
        { transform: `translateX(${from.x}px)`, width: `${from.w}px` },
        { transform: `translateX(${midX}px)`, width: `${midW}px`, offset: 0.45 },
        { transform: `translateX(${newX}px)`, width: `${newW}px` }
      ],
      { duration: 480, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
    );
    indicatorAnim.current = anim;
  };

  // Initial placement (no animation) + re-place on resize / font load.
  useEffect(() => {
    const root = tabsRef.current;
    const btn = root?.querySelector('.dev-tab-pill.active');
    if (btn) setIndicatorInit({ x: btn.offsetLeft, w: btn.offsetWidth });
    const onResize = () => moveIndicator(false);
    window.addEventListener('resize', onResize);
    const fonts = document.fonts;
    if (fonts && fonts.ready) fonts.ready.then(() => moveIndicator(false)).catch(() => {});
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Squeeze-glide on every tab switch.
  useEffect(() => {
    moveIndicator(true);
  }, [activeTab]);

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
        Design craft. Systems thinking. Product impact.
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
          and I recently started{' '}
          <a
            href="https://www.pexels.com/@bishal/"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-pink-link"
            onClick={() => playUiSound('open')}
          >
            posting them online
          </a>
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
        <a href="mailto:hello@bishalmistri.com" className="dev-social-icon" aria-label="Email" onClick={() => playUiSound('click')}>
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
      <div id="home-tabs-anchor" className="dev-tabs-container" ref={tabsRef}>
        {indicatorInit && (
          <span
            aria-hidden="true"
            ref={indicatorRef}
            className="dev-tab-indicator"
            style={{ width: indicatorInit.w, transform: `translateX(${indicatorInit.x}px)` }}
          />
        )}
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
                <h3 className="dev-card-title">{item.title}</h3>
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
          Built with <span className="dev-footer-bold">React</span> and <span className="dev-footer-bold">Antigravity</span>
        </div>
        <a href="mailto:hello@bishalmistri.com" className="dev-footer-name" onClick={() => playUiSound('click')}>hello@bishalmistri.com</a>
      </footer>
    </div>
  );
}
