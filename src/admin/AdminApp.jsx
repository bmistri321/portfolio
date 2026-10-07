import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import AdminAuth from './AdminAuth';
import DashboardPage from './DashboardPage';
import ContentListPage from './ContentListPage';
import EditorPage from './EditorPage';
import MediaLibraryPage from './MediaLibraryPage';
import SettingsPage from './SettingsPage';
import PreviewModal from './PreviewModal';
import { contentService } from '../lib/contentService';
import { getStoredSession, supabaseAuth } from '../lib/supabase';
import './admin.css';

export default function AdminApp({ onNavigateLive }) {
  const [session, setSession] = useState(() => getStoredSession());
  const [checking, setChecking] = useState(true);

  // Validate the stored session against the Supabase server on load.
  // Anything that is not a live server session (legacy bypass tokens,
  // expired or revoked JWTs) is dropped and the login screen is shown.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await supabaseAuth.validateSession();
      if (!cancelled) {
        setSession(user ? getStoredSession() : null);
        setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.startsWith('/admin')) return p;
    }
    return '/admin';
  });

  const [metrics, setMetrics] = useState({
    total: 0,
    work: 0,
    tinkering: 0,
    writing: 0,
    archived: 0
  });

  const [previewItem, setPreviewItem] = useState(null);

  // Sync metrics across navigation
  const refreshMetrics = async () => {
    try {
      const stats = await contentService.getMetrics();
      setMetrics(stats);
    } catch (err) {
      console.warn('Failed to refresh metrics:', err);
    }
  };

  useEffect(() => {
    if (session) {
      refreshMetrics();
    }
  }, [session, currentPath]);

  // Handle Internal Admin Navigation
  const navigate = (path) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, 'Bishal Mistri Studio', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePop = () => {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseAuth.signOut();
    } finally {
      setSession(null);
    }
  };

  // While the stored session is being validated, show a neutral loader
  // so a stale/forged session never flashes the studio UI.
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <p style={{ color: '#a7a7b3', fontSize: '14px', fontFamily: '"Inter", system-ui, sans-serif' }}>Checking session…</p>
      </div>
    );
  }

  // If unauthenticated, show Studio Auth Screen
  if (!session) {
    return <AdminAuth onAuthenticated={() => setSession(getStoredSession())} />;
  }

  // Parse Sub-routes
  const renderCurrentView = () => {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/admin/content') {
      return (
        <ContentListPage
          defaultType="all"
          title="All Content"
          subtitle="Manage all work projects, experiments, essays, and archives."
          onNavigate={navigate}
          onPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath === '/admin/work') {
      return (
        <ContentListPage
          defaultType="work"
          title="Work Projects"
          subtitle="Detailed case studies and commercial product architecture."
          onNavigate={navigate}
          onPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath === '/admin/tinkering') {
      return (
        <ContentListPage
          defaultType="tinkering"
          title="Tinkering Experiments"
          subtitle="WebGL shaders, UI prototypes, motion concepts, and code explorations."
          onNavigate={navigate}
          onPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath === '/admin/writing') {
      return (
        <ContentListPage
          defaultType="writing"
          title="Writing & Essays"
          subtitle="Long-form editorial essays, design thoughts, and technical deep-dives."
          onNavigate={navigate}
          onPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath === '/admin/archives') {
      return (
        <ContentListPage
          defaultType="archive"
          title="Content Archives"
          subtitle="Archived content pieces preserved with original metadata."
          onNavigate={navigate}
          onPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath.startsWith('/admin/content/new')) {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const type = searchParams.get('type') || 'work';
      return (
        <EditorPage
          contentId="new"
          initialType={type}
          onNavigate={navigate}
          onOpenPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath.startsWith('/admin/content/')) {
      const id = currentPath.replace('/admin/content/', '');
      return (
        <EditorPage
          contentId={id}
          onNavigate={navigate}
          onOpenPreview={(item) => setPreviewItem(item)}
        />
      );
    }

    if (currentPath === '/admin/media') {
      return <MediaLibraryPage />;
    }

    if (currentPath === '/admin/settings') {
      return <SettingsPage />;
    }

    return <DashboardPage onNavigate={navigate} />;
  };

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={navigate}
      onLogout={handleLogout}
      metrics={metrics}
    >
      {renderCurrentView()}

      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </AdminLayout>
  );
}
