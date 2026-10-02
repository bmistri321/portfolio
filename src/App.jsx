import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import CaseStudyPage from './pages/CaseStudyPage';
import PlaygroundPage from './pages/PlaygroundPage';
import AboutPage from './pages/AboutPage';
import FrienderCaseStudyPage from './pages/FrienderCaseStudyPage';
import WexaCaseStudyPage from './pages/WexaCaseStudyPage';
import BookPage from './pages/BookPage';
import FloatingNav from './components/FloatingNav';

export default function App() {
  const getCleanPath = (path) => {
    let p = (path || '/').toLowerCase().replace('.html', '').replace(/^\/p\//, '/');
    if (!p.startsWith('/')) p = '/' + p;
    if (p.includes('friender')) return '/casestudy/friender-case-study';
    if (p.includes('wexa')) return '/casestudy/wexa';
    if (p.includes('ux.mastery.30.days')) return '/book/ux.mastery.30.days';
    return p;
  };

  const [currentPath, setCurrentPath] = useState(() => getCleanPath(window.location.pathname));

  const titleMap = {
    '/': 'Bishal Mistri — Product Designer',
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

  const renderPage = () => {
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
      
      {/* Top Banner Announcement */}
      {currentPath !== '/book/ux.mastery.30.days' && (
        <a 
          href="/book/ux.mastery.30.days" 
          onClick={(e) => { e.preventDefault(); navigate('/book/ux.mastery.30.days'); }}
          className="pm-top-banner"
          aria-label="UX Design Mastery 30 Days Free Book"
        >
          UX Design Mastery 30 Days — Free Download eBook
        </a>
      )}

      {/* Main Routed Page Content */}
      <main id="pm-content-wrap">
        {renderPage()}
      </main>

      {/* Floating Bottom Navigation */}
      <FloatingNav currentPath={currentPath} onNavigate={navigate} />

    </div>
  );
}
