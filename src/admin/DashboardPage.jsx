import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  FlaskConical,
  PenLine,
  ArrowRight,
  Clock,
  Sparkles,
  FileEdit
} from 'lucide-react';
import { contentService } from '../lib/contentService';

export default function DashboardPage({ onNavigate }) {
  const [metrics, setMetrics] = useState({
    total: 0,
    work: 0,
    tinkering: 0,
    writing: 0,
    archived: 0,
    drafts: 0,
    published: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [stats, all] = await Promise.all([
          contentService.getMetrics(),
          contentService.getAll({ sort: 'updated_desc' })
        ]);
        setMetrics(stats);
        setRecentItems(all.slice(0, 6));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Editorial Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Publishing Overview</h1>
          <p className="admin-page-subtitle">
            Curate and broadcast projects, experiments, and essays across your digital presence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => onNavigate('/admin/content/new?type=work')}
          >
            <Briefcase size={14} />
            <span>+ Work</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => onNavigate('/admin/content/new?type=tinkering')}
          >
            <FlaskConical size={14} />
            <span>+ Tinkering</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-primary admin-btn-sm"
            onClick={() => onNavigate('/admin/content/new?type=writing')}
          >
            <PenLine size={14} />
            <span>+ Writing</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card" onClick={() => onNavigate('/admin/work')} style={{ cursor: 'pointer' }}>
          <div className="admin-metric-label">Work Projects</div>
          <div className="admin-metric-value">{metrics.work}</div>
        </div>

        <div className="admin-metric-card" onClick={() => onNavigate('/admin/tinkering')} style={{ cursor: 'pointer' }}>
          <div className="admin-metric-label">Tinkering</div>
          <div className="admin-metric-value">{metrics.tinkering}</div>
        </div>

        <div className="admin-metric-card" onClick={() => onNavigate('/admin/writing')} style={{ cursor: 'pointer' }}>
          <div className="admin-metric-label">Writing & Essays</div>
          <div className="admin-metric-value">{metrics.writing}</div>
        </div>

        <div className="admin-metric-card" onClick={() => onNavigate('/admin/archives')} style={{ cursor: 'pointer' }}>
          <div className="admin-metric-label">Archived</div>
          <div className="admin-metric-value">{metrics.archived}</div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-label">Live Published</div>
          <div className="admin-metric-value" style={{ color: 'var(--admin-success)' }}>
            {metrics.published}
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-label">Drafts</div>
          <div className="admin-metric-value" style={{ color: 'var(--admin-warning)' }}>
            {metrics.drafts}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--admin-text-muted)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Recent Studio Activity</h2>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => onNavigate('/admin/content')}
          >
            <span>View All Content</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                    No content entries yet. Click any "+ New" button above to publish your first piece!
                  </td>
                </tr>
              ) : (
                recentItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-item-title-wrap">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="admin-item-thumb" />
                        ) : (
                          <div className="admin-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)' }}>
                            <Sparkles size={14} />
                          </div>
                        )}
                        <div>
                          <a
                            href={`/admin/content/${item.id}`}
                            onClick={(e) => { e.preventDefault(); onNavigate(`/admin/content/${item.id}`); }}
                            className="admin-item-title"
                          >
                            {item.title}
                          </a>
                          <span className="admin-item-slug">/{item.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill admin-pill-type">{item.type}</span>
                    </td>
                    <td>
                      <span className={`admin-pill admin-pill-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatDate(item.updated_at || item.created_at)}</td>
                    <td className="admin-actions-cell">
                      <div className="admin-actions-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => onNavigate(`/admin/content/${item.id}`)}
                          title="Open Editor"
                        >
                          <FileEdit size={13} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
