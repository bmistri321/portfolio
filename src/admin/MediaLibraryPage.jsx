import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Check,
  Image as ImageIcon,
  Film,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { mediaService } from '../lib/contentService';

export default function MediaLibraryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaService.getAll({
        type: typeFilter,
        search: searchQuery
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [typeFilter, searchQuery]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await mediaService.upload(file);
      }
      await loadMedia();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMedia = async (id) => {
    await mediaService.delete(id);
    setDeleteModal({ isOpen: false, item: null });
    loadMedia();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
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
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media Library</h1>
          <p className="admin-page-subtitle">
            Upload, inspect, and organize image assets and project media.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud size={16} />
          <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className="admin-cover-dropzone"
        style={{ height: '140px', marginBottom: '24px' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={28} style={{ color: 'var(--admin-accent)', opacity: 0.8 }} />
        <div style={{ fontSize: '13.5px', color: 'var(--admin-text-secondary)', textAlign: 'center' }}>
          Drag files here to upload to your media storage, or click to browse
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-table-controls">
          <div className="admin-search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search media by filename or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-group">
            <select
              className="admin-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
              Loading media assets...
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
              No media files found matching your search.
            </div>
          ) : (
            <div className="admin-media-grid">
              {items.map((item) => (
                <div key={item.id} className="admin-media-item">
                  <div className="admin-media-thumb-wrap">
                    {item.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={32} style={{ color: 'var(--admin-text-muted)' }} />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.alt_text} />
                    )}
                  </div>

                  <div className="admin-media-meta">
                    <span className="admin-media-name" title={item.filename}>
                      {item.filename}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                      <span>{formatSize(item.size_bytes)}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleCopyUrl(item)}
                        title="Copy direct asset URL"
                      >
                        {copiedId === item.id ? <Check size={12} style={{ color: 'var(--admin-success)' }} /> : <Copy size={12} />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon"
                        title="Open full size"
                      >
                        <ExternalLink size={12} />
                      </a>

                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-icon"
                        onClick={() => setDeleteModal({ isOpen: true, item })}
                        style={{ color: 'var(--admin-danger)' }}
                        title="Delete asset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="admin-modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, item: null })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--admin-danger)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Delete Media Asset</h3>
              </div>
            </div>
            <div className="admin-modal-body">
              Are you sure you want to permanently delete <strong>{deleteModal.item?.filename}</strong>? Any published pages referencing this image URL will be impacted.
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setDeleteModal({ isOpen: false, item: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => handleDeleteMedia(deleteModal.item.id)}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
