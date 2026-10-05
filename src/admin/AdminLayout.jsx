import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  FlaskConical,
  PenLine,
  Archive,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  ExternalLink,
  LogOut,
  Plus
} from 'lucide-react';

export default function AdminLayout({
  currentPath,
  onNavigate,
  onLogout,
  children,
  metrics = {}
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);


  const navItems = [
    {
      group: 'Overview',
      items: [
        { id: '/admin', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Content',
      items: [
        { id: '/admin/content', label: 'All Content', icon: Layers, count: metrics.total },
        { id: '/admin/work', label: 'Work', icon: Briefcase, count: metrics.work },
        { id: '/admin/tinkering', label: 'Tinkering', icon: FlaskConical, count: metrics.tinkering },
        { id: '/admin/writing', label: 'Writing', icon: PenLine, count: metrics.writing },
        { id: '/admin/archives', label: 'Archives', icon: Archive, count: metrics.archived }
      ]
    },
    {
      group: 'Media',
      items: [
        { id: '/admin/media', label: 'Media Library', icon: ImageIcon }
      ]
    },
    {
      group: 'System',
      items: [
        { id: '/admin/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const getBreadcrumbs = () => {
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') return ['Dashboard'];
    if (currentPath === '/admin/content') return ['Content', 'All Items'];
    if (currentPath === '/admin/work') return ['Content', 'Work'];
    if (currentPath === '/admin/tinkering') return ['Content', 'Tinkering'];
    if (currentPath === '/admin/writing') return ['Content', 'Writing'];
    if (currentPath === '/admin/archives') return ['Content', 'Archives'];
    if (currentPath === '/admin/media') return ['Media', 'Library'];
    if (currentPath === '/admin/settings') return ['System', 'Settings'];
    if (currentPath.startsWith('/admin/content/new')) return ['Content', 'New Piece'];
    if (currentPath.startsWith('/admin/content/')) return ['Content', 'Edit Item'];
    return ['Portal'];
  };

  const breadcrumbs = getBreadcrumbs();

  const getDevSiteUrl = () => {
    if (typeof window === 'undefined') return 'https://dev.bishalmistri.com';
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/?mode=dev';
    }
    return 'https://dev.bishalmistri.com';
  };

  const getMainSiteUrl = () => {
    if (typeof window === 'undefined') return 'https://bishalmistri.com';
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return '/';
    }
    return 'https://bishalmistri.com';
  };

  return (
    <div className="admin-root" data-admin-theme="dark">
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open-mobile' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-brand" onClick={() => onNavigate('/admin')} style={{ cursor: 'pointer' }}>
              <div className="admin-brand-icon">
                <Compass size={16} />
              </div>
              {!isCollapsed && (
                <>
                  <span>Bishal Mistri</span>
                  <span className="admin-brand-badge">Studio</span>
                </>
              )}
            </div>

            <button
              type="button"
              className="admin-btn-ghost admin-btn-icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{ display: isMobileOpen ? 'none' : 'flex' }}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {isMobileOpen && (
              <button
                type="button"
                className="admin-btn-ghost admin-btn-icon"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="admin-sidebar-nav">
            {navItems.map((group) => (
              <div key={group.group} className="admin-nav-group">
                {!isCollapsed && <div className="admin-nav-group-title">{group.group}</div>}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.id || (item.id === '/admin' && currentPath === '/admin/dashboard');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`admin-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsMobileOpen(false);
                      }}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} />
                      {!isCollapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {typeof item.count === 'number' && (
                            <span className="admin-nav-badge">{item.count}</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="admin-sidebar-footer">
            {!isCollapsed ? (
              <>
                <div className="admin-user-info">
                  <div className="admin-avatar">BM</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text-primary)' }}>Bishal Mistri</span>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Admin Studio</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-btn-ghost admin-btn-icon"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="admin-btn-ghost admin-btn-icon"
                onClick={onLogout}
                title="Sign Out"
                style={{ margin: '0 auto' }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className={`admin-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Top Bar */}
          <header className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                className="admin-btn-ghost admin-btn-icon"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                style={{ display: 'none' }}
                id="admin-mobile-toggle"
              >
                <Menu size={18} />
              </button>

              <nav className="admin-breadcrumbs">
                <a href="/admin" onClick={(e) => { e.preventDefault(); onNavigate('/admin'); }}>Studio</a>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span className="separator">/</span>
                    <span className={idx === breadcrumbs.length - 1 ? 'current' : ''}>{crumb}</span>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <div className="admin-topbar-actions">
              <a
                href={getDevSiteUrl()}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                title="Open Dev Site (dev.bishalmistri.com)"
              >
                <span>Dev Site</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={getMainSiteUrl()}
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                title="Open Main Site (bishalmistri.com)"
              >
                <span>Main Site</span>
                <ExternalLink size={13} />
              </a>

              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => onNavigate('/admin/content/new?type=work')}
              >
                <Plus size={14} />
                <span>New Piece</span>
              </button>
            </div>
          </header>

          {/* Render Active View */}
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
