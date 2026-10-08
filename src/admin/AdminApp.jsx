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

  // While the stored session is being validated, show a skeleton of the
  // admin shell so a stale/forged session never flashes the studio UI.
  if (checking) {
    const sk = (style) => <div className="admin-skel" style={style} />;
    return (
      <div className="admin-root" aria-hidden>
        <aside className="admin-sidebar" style={{ padding: '20px 16px', gap: 10 }}>
          {sk({ width: 120, height: 26, borderRadius: 8 })}
          <div style={{ height: 18 }} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i}>{sk({ height: 38, borderRadius: 9 })}</div>
          ))}
        </aside>
        <div className="admin-main" style={{ padding: '28px 32px', gap: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {sk({ width: 220, height: 30 })}
            {sk({ width: 130, height: 38, borderRadius: 9 })}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1 }}>{sk({ height: 96, borderRadius: 12 })}</div>
            ))}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>{sk({ height: 64, borderRadius: 12 })}</div>
          ))}
        </div>
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
          defaultType="work"
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

  // Focus mode: editing an item hides the sidebar + top bar for distraction-free editing
  const isEditMode =
    currentPath.startsWith('/admin/content/') && currentPath !== '/admin/content';

  return (
    <AdminLayout
      currentPath={currentPath}
      onNavigate={navigate}
      onLogout={handleLogout}
      metrics={metrics}
      hideChrome={isEditMode}
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
