import React, { useState, useEffect, Suspense, lazy } from 'react';

import PlaygroundPage from './pages/PlaygroundPage';
import BookPage from './pages/BookPage';
import FloatingNav from './components/FloatingNav';
import { applyPageMeta } from './lib/pageMeta';

// Dev Site Pages & Components (for dev.bishalmistri.com)
import DevHomePage from './pages/DevHomePage';
import DevCaseStudyPage from './pages/DevCaseStudyPage';
import DevArticlePage from './pages/DevArticlePage';
import DockPage from './pages/DockPage';
import TravelPage from './pages/TravelPage';

// Admin CMS Application (for admin.bishalmistri.com & /admin)
// Code-split: the admin editor (Quill etc.) only downloads when the admin loads.
const AdminApp = lazy(() => import('./admin/AdminApp'));

// Minimal loading state shown while a code-split chunk loads.
const ChunkFallback = () => <div className="app-loading-fallback" aria-hidden="true" />;

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
    // Main live domain now serves the workbench (old static site removed)
    host === 'bishalmistri.com' ||
    host === 'www.bishalmistri.com' ||
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

  const descriptionMap = {
    '/': isBooks
      ? 'UX Design Mastery in 30 Days — a guided book by Bishal Mistri.'
      : 'Bishal Mistri is a Product Designer contributing to a better future by solving one problem at a time.',
    '/dock': 'The tools, apps and gear Bishal Mistri uses every day — his digital dock.',
    '/travel': 'Travel stories and photography by Bishal Mistri.',
    '/casestudy': 'Case studies by Bishal Mistri — end-to-end product design across AI tools, B2B SaaS and design systems.',
    '/about': 'About Bishal Mistri — product designer focused on craft, systems thinking and rapid prototyping.',
    '/playground': 'Design experiments and playful interactions by Bishal Mistri.',
    '/casestudy/friender-case-study': 'Friender case study by Bishal Mistri — designing a toolbar CRM for recruiters.',
    '/casestudy/wexa': 'Wexa AI case study by Bishal Mistri — redesigning developer onboarding for an AI coding tool.',
    '/book/ux.mastery.30.days': 'UX Design Mastery in 30 Days — a guided book by Bishal Mistri.'
  };

  const applyRouteMeta = (path) => {
    applyPageMeta({
      title: titleMap[path] || 'Bishal Mistri — Product Designer',
      description: descriptionMap[path]
    });
  };

  const navigate = (path) => {
    const clean = getCleanPath(path);
    setCurrentPath(clean);
    applyRouteMeta(clean);
    window.history.pushState(null, document.title, clean);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    applyRouteMeta(getCleanPath(window.location.pathname));
    const handlePopState = () => {
      const path = getCleanPath(window.location.pathname);
      setCurrentPath(path);
      applyRouteMeta(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 0. ADMIN PORTAL (admin.bishalmistri.com OR /admin)
  if (isAdmin || currentPath.startsWith('/admin')) {
    return (
      <Suspense fallback={<ChunkFallback />}>
        <AdminApp onNavigateLive={navigate} />
      </Suspense>
    );
  }

  // 1. DEV SUBDOMAIN (dev.bishalmistri.com -> Dev Site)
  if (isDev) {
    const isDetailPage = currentPath.startsWith('/casestudy/') || currentPath.startsWith('/writing/');

    const renderDetailCaseStudy = () => {
      switch (currentPath) {
        // NOTE: no hardcoded slugs here — the slug always resolves
        // dynamically from the URL, so renaming a slug in the admin
        // never breaks the page again.
        case '/casestudy':
          return <DevCaseStudyPage onNavigate={navigate} />;
        default:
          if (currentPath.startsWith('/casestudy/') || currentPath.startsWith('/writing/')) {
            const slug = currentPath.replace('/casestudy/', '').replace('/writing/', '');
            return <DevArticlePage slug={slug} onNavigate={navigate} />;
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

  // 3. FALLBACK — any other domain serves the workbench too.
  // (The main live domain is handled by the isDev branch above.)
  return (
    <div className="dev-app-wrapper">
      <main className="dev-main-container">
        <DevHomePage onNavigate={navigate} />
      </main>
    </div>
  );
}
