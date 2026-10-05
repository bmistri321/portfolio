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
  Sparkles,
  ExternalLink,
  LogOut,
  Plus,
  Sun,
  Moon
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
  const [theme, setTheme] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('bm_admin_theme') || 'dark' : 'dark'));

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('bm_admin_theme', next);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-admin-theme', next);
    }
  };

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

  return (
    <div className="admin-root" data-admin-theme={theme}>
      <div className="admin-shell">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open-mobile' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-brand" onClick={() => onNavigate('/admin')} style={{ cursor: 'pointer' }}>
              <div className="admin-brand-icon">
                <Sparkles size={16} />
              </div>
              {!isCollapsed && (
                <>
                  <span>Bishal Mistri</span>
                  <span className="admin-brand-badge">CMS</span>
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
              <button
                type="button"
                className="admin-btn-ghost admin-btn-icon"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                title="View live portfolio site in new tab"
              >
                <span>Live Site</span>
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
