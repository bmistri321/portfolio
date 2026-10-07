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
  Star,
  ChevronUp,
  ChevronDown,
  Link2,
  Loader2,
  Download
} from 'lucide-react';
import { contentService, calculateReadingTime } from '../lib/contentService';

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

  // Medium quick-import (Writing list)
  const [mediumUrl, setMediumUrl] = useState('');
  const [mediumBusy, setMediumBusy] = useState(false);
  const [mediumMsg, setMediumMsg] = useState(null); // { ok: bool, text: string }

  const isWriting = typeFilter === 'writing';
  const showOrder = isWriting && sortOption === 'order_index';

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

  // Paste a Medium link here to add the article straight to the Writing list
  // (created as a draft — click its title to review and publish).
  const handleMediumImport = async () => {
    const url = mediumUrl.trim();
    if (!url) {
      setMediumMsg({ ok: false, text: 'Paste a Medium article link first.' });
      return;
    }
    setMediumBusy(true);
    setMediumMsg(null);
    try {
      const res = await fetch('/api/fetch-medium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || 'Could not fetch the article.');
      const now = new Date().toISOString();
      await contentService.create({
        type: 'writing',
        status: 'draft',
        title: data.title || 'Untitled Piece',
        excerpt: data.excerpt || '',
        content: data.html,
        cover_image: data.coverImage || null,
        author: data.author || 'Bishal Mistri',
        metadata: {
          readingTime: calculateReadingTime(data.html),
          medium: {
            url: data.url,
            postId: data.postId,
            feedUrl: data.feedUrl,
            sync: true,
            lastSyncedAt: now,
            contentHash: data.contentHash
          }
        }
      });
      setMediumUrl('');
      setMediumMsg({ ok: true, text: `Imported \u201C${data.title}\u201D as a draft \u2014 click its title to review and publish.` });
      loadContent();
    } catch (err) {
      setMediumMsg({ ok: false, text: err.message });
    } finally {
      setMediumBusy(false);
    }
  };

  // Move a row up/down in the custom (live-site) order.
  const handleMove = async (item, dir) => {
    const sorted = [...items];
    const i = sorted.findIndex((r) => r.id === item.id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const other = sorted[j];
    const a = Number(item.order_index);
    const b = Number(other.order_index);
    try {
      if (Number.isFinite(a) && Number.isFinite(b) && a !== b) {
        // Clean swap of the two positions.
        await contentService.update(item.id, { order_index: b });
        await contentService.update(other.id, { order_index: a });
      } else {
        // Equal or missing positions: re-seat this pair by renumbering
        // the whole list so the order is unambiguous.
        const reordered = [...sorted];
        const [moved] = reordered.splice(i, 1);
        reordered.splice(j, 0, moved);
        for (let k = 0; k < reordered.length; k++) {
          await contentService.update(reordered[k].id, { order_index: (k + 1) * 10 });
        }
      }
      loadContent();
    } catch (err) {
      alert(`Reorder failed: ${err.message}`);
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

      {/* Medium quick-import (Writing list only) */}
      {isWriting && (
        <div className="admin-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Link2 size={15} style={{ color: 'var(--admin-text-muted)' }} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Import from Medium</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="url"
              value={mediumUrl}
              onChange={(e) => setMediumUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleMediumImport(); }}
              placeholder="Paste a Medium article link to add it to this list…"
              disabled={mediumBusy}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '13px',
                color: 'var(--admin-text-primary)',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={handleMediumImport}
              disabled={mediumBusy}
            >
              {mediumBusy ? <Loader2 size={14} /> : <Download size={14} />}
              <span>{mediumBusy ? 'Importing…' : 'Add to list'}</span>
            </button>
          </div>
          {mediumMsg && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '12.5px',
                color: mediumMsg.ok ? '#16a34a' : 'var(--admin-danger)'
              }}
            >
              {mediumMsg.text}
            </div>
          )}
        </div>
      )}

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
                {showOrder && <th style={{ width: '60px' }}></th>}
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
                  <td colSpan={showOrder ? 8 : 7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                    Loading studio items...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={showOrder ? 8 : 7} style={{ textAlign: 'center', padding: '48px 20px' }}>
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
                items.map((item, idx) => (
                  <tr key={item.id}>
                    {showOrder && (
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleMove(item, 'up')}
                            disabled={idx === 0}
                            title="Move up (higher on the live site)"
                            style={{ padding: '6px' }}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => handleMove(item, 'down')}
                            disabled={idx === items.length - 1}
                            title="Move down (lower on the live site)"
                            style={{ padding: '6px' }}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </td>
                    )}
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
                        {!isWriting && (
                          <>
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

                        </>)}
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
