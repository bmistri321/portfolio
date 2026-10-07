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

// Dev Site Pages & Components (for dev.bishalmistri.com)
import DevHomePage from './pages/DevHomePage';
import DevCaseStudyPage from './pages/DevCaseStudyPage';
import DevDynamicCaseStudyPage from './pages/DevDynamicCaseStudyPage';
import DevWexaPage from './pages/DevWexaPage';
import DevFrienderPage from './pages/DevFrienderPage';
import DockPage from './pages/DockPage';
import TravelPage from './pages/TravelPage';

// Admin CMS Application (for admin.bishalmistri.com & /admin)
import AdminApp from './admin/AdminApp';

export const isAdminSubdomain = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const search = window.location.search;
  const path = window.location.pathname.toLowerCase();
  return (
    host === 'admin.bishalmistri.com' ||
    host === 'www.admin.bishalmistri.com' ||
    host.startsWith('admin.') ||
    host.includes('.admin.') ||
    host.includes('admin.bishalmistri.com') ||
    path.startsWith('/admin') ||
    search.includes('mode=admin')
  );
};

export const isDevSubdomain = () => {
  if (typeof window === 'undefined') return false;
  if (isAdminSubdomain()) return false;
  const host = window.location.hostname.toLowerCase();
  const search = window.location.search;
  return (
    host === 'dev.bishalmistri.com' ||
    host === 'www.dev.bishalmistri.com' ||
    host.startsWith('dev.') ||
    host.includes('.dev.') ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    search.includes('mode=dev')
  );
};

export const isBooksSubdomain = () => {
  if (typeof window === 'undefined') return false;
  if (isAdminSubdomain()) return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'books.bishalmistri.com' || host.startsWith('books.');
};

export default function App() {
  const isAdmin = isAdminSubdomain();
  const isDev = isDevSubdomain();
  const isBooks = isBooksSubdomain();

  const getCleanPath = (path) => {
    let p = (path || '/').toLowerCase().replace('.html', '').replace(/^\/p\//, '/');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.startsWith('/admin')) return p;
    if (p.includes('friender')) return '/casestudy/friender-case-study';
    if (p.includes('wexa')) return '/casestudy/wexa';
    if (p.startsWith('/casestudy/')) return p;
    if (p.startsWith('/writing/')) return p;
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

  // 0. ADMIN PORTAL (admin.bishalmistri.com OR /admin)
  if (isAdmin || currentPath.startsWith('/admin')) {
    return <AdminApp onNavigateLive={navigate} />;
  }

  // 1. DEV SUBDOMAIN (dev.bishalmistri.com -> Dev Site)
  if (isDev) {
    const isDetailPage = currentPath.startsWith('/casestudy/') || currentPath.startsWith('/writing/');

    const renderDetailCaseStudy = () => {
      switch (currentPath) {
        case '/casestudy/wexa':
          return <DevWexaPage onNavigate={navigate} />;
        case '/casestudy/friender-case-study':
          return <DevFrienderPage onNavigate={navigate} />;
        case '/casestudy':
          return <DevCaseStudyPage onNavigate={navigate} />;
        default:
          if (currentPath.startsWith('/casestudy/') || currentPath.startsWith('/writing/')) {
            const slug = currentPath.replace('/casestudy/', '').replace('/writing/', '');
            return <DevDynamicCaseStudyPage slug={slug} onNavigate={navigate} />;
          }
          return null;
      }
    };

    const renderBasePage = () => {
      switch (currentPath) {
        case '/dock':
          return <DockPage onNavigate={navigate} />;
        case '/travel':
          return <TravelPage onNavigate={navigate} />;
        case '/playground':
          return <PlaygroundPage onNavigate={navigate} />;
        default:
          return <DevHomePage onNavigate={navigate} />;
      }
    };

    return (
      <div className="dev-app-wrapper">
        <main className="dev-main-container">
          {renderBasePage()}
        </main>

        {isDetailPage && renderDetailCaseStudy()}
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
    </div>
  );
}
