import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  FileEdit,
  Eye,
  Send,
  Archive,
  RotateCcw,
  Trash2,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Star
} from 'lucide-react';
import { contentService } from '../lib/contentService';

export default function ContentListPage({
  defaultType = 'all',
  title = 'All Content',
  subtitle = 'Manage, organize, and publish your personal portfolio content.',
  onNavigate,
  onPreview
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState(defaultType);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('order_index');
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    item: null,
    title: '',
    message: ''
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAll({
        type: typeFilter,
        status: statusFilter,
        search: searchQuery,
        sort: sortOption
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTypeFilter(defaultType);
  }, [defaultType]);

  useEffect(() => {
    loadContent();
  }, [typeFilter, statusFilter, searchQuery, sortOption]);

  const handlePublish = async (item) => {
    try {
        await contentService.publish(item.id);
        loadContent();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleUnpublish = async (item) => {
    try {
        await contentService.unpublish(item.id);
        loadContent();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleArchive = async (item) => {
    try {
        await contentService.archive(item.id);
        setConfirmModal({ isOpen: false, action: null, item: null, title: '', message: '' });
        loadContent();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleRestore = async (item) => {
    try {
        await contentService.restore(item.id);
        loadContent();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleDelete = async (item) => {
    try {
        await contentService.delete(item.id);
        setConfirmModal({ isOpen: false, action: null, item: null, title: '', message: '' });
        loadContent();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => onNavigate(`/admin/content/new?type=${typeFilter === 'all' || typeFilter === 'archive' ? 'work' : typeFilter}`)}
        >
          <Plus size={16} />
          <span>New {typeFilter === 'all' || typeFilter === 'archive' ? 'Piece' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-table-controls">
          <div className="admin-search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by title, slug, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            {defaultType === 'all' && (
              <select
                className="admin-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="work">Work</option>
                <option value="tinkering">Tinkering</option>
                <option value="writing">Writing</option>
                <option value="archive">Archives</option>
              </select>
            )}

            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <select
              className="admin-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="order_index">Custom Order (as on live site)</option>
              <option value="updated_desc">Recently Updated</option>
              <option value="published_desc">Recently Published</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                    Loading studio items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--admin-bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)' }}>
                        <Layers size={18} />
                      </div>
                      <div style={{ fontWeight: 500, fontSize: '15px', color: 'var(--admin-text-primary)' }}>
                        Nothing here yet
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--admin-text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                        Start creating your first entry in this category to publish it.
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => onNavigate(`/admin/content/new?type=${typeFilter === 'all' || typeFilter === 'archive' ? 'work' : typeFilter}`)}
                        style={{ marginTop: '8px' }}
                      >
                        <Plus size={14} />
                        <span>Create New Piece</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-item-title-wrap">
                        {item.cover_image ? (
                          <img src={item.cover_image} alt="" className="admin-item-thumb" />
                        ) : (
                          <div className="admin-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)' }}>
                            <FileText size={14} />
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
                    <td>
                      {item.featured ? (
                        <Star size={15} style={{ color: 'var(--admin-warning)', fill: 'var(--admin-warning)' }} />
                      ) : (
                        <span style={{ color: 'var(--admin-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>{formatDate(item.published_at)}</td>
                    <td>{formatDate(item.updated_at || item.created_at)}</td>
                    <td className="admin-actions-cell">
                      <div className="admin-actions-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => onNavigate(`/admin/content/${item.id}`)}
                          title="Edit Piece"
                        >
                          <FileEdit size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => onPreview(item)}
                          title="Preview Mode"
                        >
                          <Eye size={13} />
                        </button>

                        {item.status === 'draft' ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handlePublish(item)}
                            title="Publish Live"
                            style={{ color: 'var(--admin-success)' }}
                          >
                            <Send size={13} />
                          </button>
                        ) : item.status === 'published' ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleUnpublish(item)}
                            title="Unpublish (Revert to Draft)"
                          >
                            <RotateCcw size={13} />
                          </button>
                        ) : null}

                        {item.status !== 'archived' ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              action: 'archive',
                              item,
                              title: 'Archive Content Piece',
                              message: `Are you sure you want to archive "${item.title}"? It will be removed from active public listings but preserved in Archives.`
                            })}
                            title="Archive Piece"
                          >
                            <Archive size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleRestore(item)}
                            title="Restore to Active Category"
                            style={{ color: 'var(--admin-accent)' }}
                          >
                            <RotateCcw size={13} />
                            <span>Restore</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            action: 'delete',
                            item,
                            title: 'Delete Permanently',
                            message: `Are you sure you want to permanently delete "${item.title}"? This cannot be undone. We recommend archiving instead.`
                          })}
                          title="Delete"
                          style={{ color: 'var(--admin-danger)' }}
                        >
                          <Trash2 size={13} />
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

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="admin-modal-backdrop" onClick={() => setConfirmModal({ isOpen: false, action: null, item: null, title: '', message: '' })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: confirmModal.action === 'delete' ? 'var(--admin-danger)' : 'var(--admin-warning)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{confirmModal.title}</h3>
              </div>
            </div>
            <div className="admin-modal-body">
              {confirmModal.message}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setConfirmModal({ isOpen: false, action: null, item: null, title: '', message: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`admin-btn ${confirmModal.action === 'delete' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                onClick={() => {
                  if (confirmModal.action === 'delete') handleDelete(confirmModal.item);
                  if (confirmModal.action === 'archive') handleArchive(confirmModal.item);
                }}
              >
                {confirmModal.action === 'delete' ? 'Delete Permanently' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
