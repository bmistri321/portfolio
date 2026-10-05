import React, { useState, useEffect } from 'react';

// Original Live Portfolio Pages & Components
import HomePage from './pages/HomePage';
import CaseStudyPage from './pages/CaseStudyPage';
import PlaygroundPage from './pages/PlaygroundPage';
import AboutPage from './pages/AboutPage';
import FrienderCaseStudyPage from './pages/FrienderCaseStudyPage';
import WexaCaseStudyPage from './pages/WexaCaseStudyPage';
import BookPage from './pages/BookPage';
import FloatingNav from './components/FloatingNav';

// Sanmid Replica Pages & Components (for dev.bishalmistri.com)
import SanmidHomePage from './pages/SanmidHomePage';
import SanmidCaseStudyPage from './pages/SanmidCaseStudyPage';
import SanmidWexaPage from './pages/SanmidWexaPage';
import SanmidFrienderPage from './pages/SanmidFrienderPage';
import DockPage from './pages/DockPage';
import TravelPage from './pages/TravelPage';
import NavigationDock from './components/NavigationDock';

export const isDevSubdomain = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const href = window.location.href.toLowerCase();

  const stored = localStorage.getItem('bm_view_mode');
  if (stored === 'dev') return true;
  if (stored === 'main') return false;

  return (
    host.includes('dev') ||
    host === 'dev.bishalmistri.com' ||
    host === 'www.dev.bishalmistri.com' ||
    href.includes('dev.bishalmistri.com') ||
    href.includes('www.dev.bishalmistri.com') ||
    search.includes('view=dev') ||
    search.includes('v=dev') ||
    search.includes('sanmid') ||
    search.includes('dev')
  );
};

export const isBooksSubdomain = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'books.bishalmistri.com' || host.startsWith('books.');
};

export default function App() {
  const [viewMode, setViewMode] = useState(() => (isDevSubdomain() ? 'dev' : 'main'));
  const isDev = viewMode === 'dev';
  const isBooks = isBooksSubdomain();

  const getCleanPath = (path) => {
    let p = (path || '/').toLowerCase().replace('.html', '').replace(/^\/p\//, '/');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.includes('friender')) return '/casestudy/friender-case-study';
    if (p.includes('wexa')) return '/casestudy/wexa';
    if (p.includes('dock')) return '/dock';
    if (p.includes('travel')) return '/travel';
    if (p.includes('playground')) return '/playground';
    if (p.includes('about')) return '/about';
    if (p.includes('casestudy')) return '/casestudy';
    if (p.includes('ux.mastery.30.days') || p.startsWith('/book')) return '/book/ux.mastery.30.days';
    return p;
  };

  const [currentPath, setCurrentPath] = useState(() => getCleanPath(window.location.pathname));

  const titleMap = {
    '/': isBooks ? 'UX Design Mastery 30 Days — Bishal Mistri' : 'Bishal Mistri — Product Designer',
    '/dock': 'Bishal Mistri | My Dock',
    '/travel': 'Bishal Mistri | Travel & Photography',
    '/casestudy': 'Case Study — Bishal Mistri',
    '/about': 'About — Bishal Mistri',
    '/playground': 'Playground — Bishal Mistri',
    '/casestudy/friender-case-study': 'Friender Case Study — Bishal Mistri',
    '/casestudy/wexa': 'Wexa AI — Bishal Mistri',
    '/book/ux.mastery.30.days': 'UX Design Mastery 30 Days — Bishal Mistri'
  };

  const navigate = (path) => {
    const clean = getCleanPath(path);
    setCurrentPath(clean);
    const newTitle = titleMap[clean] || 'Bishal Mistri — Product Designer';
    document.title = newTitle;
    window.history.pushState(null, newTitle, clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = getCleanPath(window.location.pathname);
      setCurrentPath(path);
      document.title = titleMap[path] || 'Bishal Mistri — Product Designer';
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleViewMode = () => {
    const next = isDev ? 'main' : 'dev';
    localStorage.setItem('bm_view_mode', next);
    setViewMode(next);
  };

  // 1. DEV SUBDOMAIN / MODE (Sanmid Replica)
  if (isDev) {
    const renderDevPage = () => {
      switch (currentPath) {
        case '/dock':
          return <DockPage onNavigate={navigate} />;
        case '/travel':
          return <TravelPage onNavigate={navigate} />;
        case '/casestudy':
          return <SanmidCaseStudyPage onNavigate={navigate} />;
        case '/casestudy/wexa':
          return <SanmidWexaPage onNavigate={navigate} />;
        case '/casestudy/friender-case-study':
          return <SanmidFrienderPage onNavigate={navigate} />;
        case '/playground':
          return <PlaygroundPage onNavigate={navigate} />;
        case '/':
        default:
          return <SanmidHomePage onNavigate={navigate} />;
      }
    };

    return (
      <div className="sanmid-app-wrapper">
        <main className="sanmid-main-container">
          {renderDevPage()}
        </main>
        <NavigationDock currentPath={currentPath} onNavigate={navigate} />

        {/* View Switcher Floating Badge */}
        <button
          onClick={toggleViewMode}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            fontSize: '11px',
            fontFamily: 'monospace',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'var(--sanmid-bg-subtle)',
            color: 'var(--sanmid-text-2)',
            border: '1px solid var(--sanmid-border-subtle)',
            cursor: 'pointer',
            zIndex: 9999,
            opacity: 0.8
          }}
          title="Click to toggle between Sanmid View and Original View"
        >
          ● DEV (Sanmid View)
        </button>
      </div>
    );
  }

  // 2. BOOKS SUBDOMAIN (books.bishalmistri.com)
  if (isBooks) {
    return (
      <div className="pm-app-container">
        <main id="pm-content-wrap">
          <BookPage onNavigate={navigate} />
        </main>
        <FloatingNav currentPath={currentPath} onNavigate={navigate} />
      </div>
    );
  }

  // 3. MAIN LIVE DOMAIN (bishalmistri.com -> Original Site)
  const renderMainPage = () => {
    switch (currentPath) {
      case '/casestudy':
        return <CaseStudyPage onNavigate={navigate} />;
      case '/playground':
        return <PlaygroundPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/casestudy/friender-case-study':
        return <FrienderCaseStudyPage onNavigate={navigate} />;
      case '/casestudy/wexa':
        return <WexaCaseStudyPage onNavigate={navigate} />;
      case '/book/ux.mastery.30.days':
        return <BookPage onNavigate={navigate} />;
      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="pm-app-container">
      <main id="pm-content-wrap">
        {renderMainPage()}
      </main>
      <FloatingNav currentPath={currentPath} onNavigate={navigate} />

      {/* View Switcher Floating Badge */}
      <button
        onClick={toggleViewMode}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          fontSize: '11px',
          fontFamily: 'monospace',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: '#f4f4f4',
          color: '#555555',
          border: '1px solid #e0e0e0',
          cursor: 'pointer',
          zIndex: 9999,
          opacity: 0.8
        }}
        title="Click to toggle between Original View and Sanmid View"
      >
        ○ MAIN (Original View)
      </button>
    </div>
  );
}
