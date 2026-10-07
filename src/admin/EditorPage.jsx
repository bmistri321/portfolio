import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Smile,
  Minus,
  Video,
  Film,
  Info,
  ChevronDown,
  X
} from 'lucide-react';
import {
  contentService,
  mediaService,
  generateSlug,
  calculateReadingTime,
  generateUUID
} from '../lib/contentService';
import ArticleEditor from './ArticleEditor';

const COMMON_TAGS = [
  'UI/UX',
  'Product Design',
  'React',
  'TypeScript',
  'AI',
  'Design Systems',
  'WebGL',
  'Cloud',
  'Architecture',
  'Philosophy',
  'Figma',
  'Motion'
];

const EMOJIS = ['✨', '💡', '🚀', '🔥', '⚡', '🛠️', '🎨', '📐', '🧠', '🔮', '🎯', '📌', '💎', '🌱', '📦', '🔍'];

// Insert panel options (Word-style): draggable into the article, files can be
// dropped on a tile, click inserts at the cursor / opens the file picker.
const INSERT_TILES = [
  { kind: 'image', label: 'Image', hint: 'Upload & compress', Icon: ImageIcon },
  { kind: 'video', label: 'Video', hint: 'Upload MP4', Icon: Video },
  { kind: 'gif', label: 'GIF', hint: 'Upload', Icon: Film },
  { kind: 'divider', label: 'Divider', hint: 'Horizontal line', Icon: Minus },
];

export default function EditorPage({
  contentId,
  initialType = 'work',
  onNavigate,
  onOpenPreview
}) {
  const isNew = !contentId || contentId === 'new';

  // Core Content State
  const [formData, setFormData] = useState({
    id: isNew ? generateUUID() : contentId,
    title: '',
    slug: '',
    type: initialType,
    status: 'draft',
    excerpt: '',
    content: '',
    cover_image: '',
    thumbnail: '',
    author: 'Bishal Mistri',
    published_at: null,
    featured: false,
    tags: [],
    metadata: {
      client: '',
      role: '',
      year: new Date().getFullYear().toString(),
      duration: '',
      team: '',
      tools: [],
      projectUrl: '',
      repoUrl: '',
      demoUrl: '',
      subtitle: '',
      readingTime: '1 min read',
      sections: []
    },
    seo_title: '',
    seo_description: '',
    og_image: ''
  });

  const [loading, setLoading] = useState(!isNew);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [customPublishModal, setCustomPublishModal] = useState(false);
  const [publishDateInput, setPublishDateInput] = useState('');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaTarget, setMediaTarget] = useState('cover'); // 'cover' or 'editor'
  const [tagInput, setTagInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [slugStatus, setSlugStatus] = useState({ checked: false, isUnique: true, msg: '' });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const excerptRef = useRef(null);
  const leadRef = useRef(null);
  const seoDescRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const articleRef = useRef(null); // Insert panel -> ArticleEditor imperative API
  const isInitialLoad = useRef(true);
  const formDataRef = useRef(formData);
  const persistedRef = useRef(!isNew); // true once the row exists in the DB
  const lastSavedSigRef = useRef(null);
  const dirtyRef = useRef(false);

  // Keep the excerpt textarea sized to its content (wraps like a blog editor)
  const autoGrowTextarea = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Load existing content if editing
  useEffect(() => {
    async function loadItem() {
      if (!isNew) {
        try {
          setLoading(true);
          const existing = await contentService.getById(contentId);
          if (existing) {
            setFormData({
              ...existing,
              metadata: {
                client: '',
                role: '',
                year: new Date().getFullYear().toString(),
                duration: '',
                team: '',
                tools: [],
                projectUrl: '',
                repoUrl: '',
                demoUrl: '',
                subtitle: '',
                readingTime: '1 min read',
                sections: [],
                ...(existing.metadata || {})
              }
            });
          }
        } catch (err) {
          console.error('Failed to load item for edit:', err);
        } finally {
          setLoading(false);
          setTimeout(() => { isInitialLoad.current = false; }, 300);
        }
      } else {
        isInitialLoad.current = false;
      }
    }
    loadItem();
  }, [contentId, isNew]);

  // Size the title + excerpt textareas to existing content once the item loads
  useEffect(() => {
    if (!loading) {
      autoGrowTextarea(titleRef.current);
      autoGrowTextarea(excerptRef.current);
      autoGrowTextarea(leadRef.current);
      autoGrowTextarea(seoDescRef.current);
      autoGrowTextarea(textareaRef.current);
    }
  }, [loading]);

  // Check Slug Uniqueness
  const checkSlug = useCallback(async (slugToCheck) => {
    if (!slugToCheck) return;
    const clean = generateSlug(slugToCheck);
    const isUnique = await contentService.isSlugUnique(clean, formData.id);
    setSlugStatus({
      checked: true,
      isUnique,
      msg: isUnique ? 'Slug available' : 'Slug already in use by another item'
    });
  }, [formData.id]);

  // Handle Input Changes with Autosave Trigger
  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-generate slug and SEO defaults if title changes
      if (field === 'title' && (isNew || !prev.slug || prev.slug === generateSlug(prev.title))) {
        next.slug = generateSlug(value);
        if (!next.seo_title) next.seo_title = value;
      }

      if (field === 'excerpt' && !next.seo_description) {
        next.seo_description = value;
      }

      if (field === 'content') {
        const time = calculateReadingTime(value);
        next.metadata = { ...next.metadata, readingTime: time };
      }

      return next;
    });

    scheduleAutosave();
  };

  // Changing type moves the card to a different tab on the live site —
  // confirm deliberately so a mis-tap can't silently recategorize content.
  const handleTypeChange = (nextType) => {
    if (nextType === formData.type) return;
    const label = { work: 'Work', tinkering: 'Tinkering', writing: 'Writing' }[nextType] || nextType;
    const ok = window.confirm(
      `Move "${formData.title || 'this item'}" to ${label}? It will appear under a different tab on the live site.`
    );
    if (ok) handleFieldChange('type', nextType);
  };

  const handleMetadataChange = (metaKey, value) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [metaKey]: value
      }
    }));
    scheduleAutosave();
  };

  // ---------- Autosave ----------
  // formDataRef always holds the latest form, so the debounced saver never
  // writes stale data (setState is async; a debounced closure would lag a keystroke).
  useEffect(() => {
    formDataRef.current = formData;
  });

  const autosaveSignature = (d) =>
    JSON.stringify([
      d.title, d.slug, d.excerpt, d.content, d.cover_image, d.thumbnail,
      d.status, d.featured, d.tags, d.metadata,
      d.seo_title, d.seo_description, d.og_image,
    ]);

  const doAutosave = useCallback(async () => {
    const data = formDataRef.current;
    if (autosaveSignature(data) === lastSavedSigRef.current) return; // nothing new to save
    setSaveStatus('saving');
    try {
      if (!persistedRef.current) {
        const created = await contentService.create(data);
        persistedRef.current = true;
        // Point the URL at the real item without remounting the editor.
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, 'Bishal Mistri Studio', `/admin/content/${created.id}`);
        }
      } else {
        await contentService.update(data.id, data);
      }
      lastSavedSigRef.current = autosaveSignature(formDataRef.current);
      dirtyRef.current = false;
      setSaveStatus('saved');
    } catch (err) {
      console.warn('Autosave error:', err);
      setSaveStatus('unsaved');
    }
  }, []);

  const scheduleAutosave = useCallback(() => {
    if (isInitialLoad.current) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    dirtyRef.current = true;
    setSaveStatus('unsaved');
    autosaveTimerRef.current = setTimeout(doAutosave, 1500);
  }, [doAutosave]);

  // Best-effort flush when leaving the editor.
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
        doAutosave();
      }
    };
  }, [doAutosave]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Explicit Save
  const handleManualSave = async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    setSaveStatus('saving');
    try {
      const data = formDataRef.current;
      if (!persistedRef.current) {
        const created = await contentService.create(data);
        persistedRef.current = true;
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, 'Bishal Mistri Studio', `/admin/content/${created.id}`);
        }
      } else {
        await contentService.update(data.id, data);
      }
      lastSavedSigRef.current = autosaveSignature(formDataRef.current);
      dirtyRef.current = false;
      setSaveStatus('saved');
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setSaveStatus('unsaved');
    }
  };

  // Publish Workflow
  const handlePublish = async (customDate = null) => {
    setSaveStatus('saving');
    try {
      const pubDate = customDate || new Date().toISOString();
      const updatedData = {
        ...formData,
        status: 'published',
        published_at: pubDate
      };

      if (!persistedRef.current) {
        const created = await contentService.create(updatedData);
        persistedRef.current = true;
        setFormData(created);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, 'Bishal Mistri Studio', `/admin/content/${created.id}`);
        }
      } else {
        const updated = await contentService.publish(formData.id, pubDate);
        setFormData(updated);
      }
      setSaveStatus('saved');
      setCustomPublishModal(false);
    } catch (err) {
      alert(`Publishing failed: ${err.message}`);
      setSaveStatus('unsaved');
    }
  };

  const handleUnpublish = async () => {
    try {
      const updated = await contentService.unpublish(formData.id);
      setFormData(updated);
      setSaveStatus('saved');
    } catch (err) {
      alert(`Unpublish failed: ${err.message}`);
    }
  };

  // Cover Image Handling
  const handleCoverUpload = async (file) => {
    if (!file) return;
    try {
      setSaveStatus('saving');
      const uploaded = await mediaService.upload(file, { alt_text: formData.title || 'Cover image' });
      setFormData((prev) => ({
        ...prev,
        cover_image: uploaded.url,
        thumbnail: prev.thumbnail || uploaded.url,
        og_image: prev.og_image || uploaded.url
      }));
      setSaveStatus('saved');
    } catch (err) {
      alert(`Cover upload failed: ${err.message}`);
      setSaveStatus('unsaved');
    }
  };

  // Open Media Library Modal
  const openMediaLibrary = async (target = 'cover') => {
    setMediaTarget(target);
    const media = await mediaService.getAll();
    setMediaItems(media);
    setMediaPickerOpen(true);
  };

  const selectMediaItem = (item) => {
    if (mediaTarget === 'cover') {
      setFormData((prev) => ({
        ...prev,
        cover_image: item.url,
        thumbnail: prev.thumbnail || item.url,
        og_image: prev.og_image || item.url
      }));
      scheduleAutosave();
    } else if (mediaTarget === 'editor') {
      insertIntoContent(`\n\n![${item.alt_text || item.filename}](${item.url})\n\n`);
    }
    setMediaPickerOpen(false);
  };

  // Textarea Formatter Utility
  const insertIntoContent = (snippet, wrap = false) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = formData.content;

    let newContent;
    if (wrap) {
      const selected = current.substring(start, end);
      newContent = current.substring(0, start) + snippet + selected + snippet + current.substring(end);
    } else {
      newContent = current.substring(0, start) + snippet + current.substring(end);
    }

    handleFieldChange('content', newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Tag Management
  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.trim();
    if (!clean) return;
    if (!formData.tags.includes(clean)) {
      const nextTags = [...formData.tags, clean];
      handleFieldChange('tags', nextTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = formData.tags.filter((t) => t !== tagToRemove);
    handleFieldChange('tags', nextTags);
  };

  // Lead paragraphs: textarea with blank-line-separated paragraphs <-> metadata.lead[]
  const handleLeadChange = (text) => {
    const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    handleMetadataChange('lead', paras);
  };

  // Drag and Drop Images inside writing area
  const handleDropOnEditor = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      for (const file of files) {
        const media = await mediaService.upload(file);
        insertIntoContent(`\n\n![${media.alt_text || media.filename}](${media.url})\n\n`);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ color: 'var(--admin-text-muted)' }}>Loading studio canvas...</p>
      </div>
    );
  }

  return (
    <div className="admin-editor-layout">
      {/* Top Action Bar */}
      <header className="admin-editor-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => onNavigate('/admin/content')}
          >
            <ArrowLeft size={16} />
            <span>Studio</span>
          </button>

          <select
            className="admin-select"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            style={{ fontWeight: 600, textTransform: 'capitalize' }}
          >
            <option value="work">Work Project</option>
            <option value="tinkering">Tinkering Experiment</option>
            <option value="writing">Writing & Essay</option>
          </select>

          <div className={`admin-editor-save-state ${saveStatus}`}>
            {saveStatus === 'saving' && (
              <>
                <Loader2 size={13} className="spin-icon" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check size={13} />
                <span>Saved</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <AlertCircle size={13} />
                <span>Unsaved</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-sm"
            onClick={() => onOpenPreview(formData)}
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            className={`admin-btn admin-btn-sm ${formData.status === 'published' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={handleManualSave}
            title="Save all changes"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          {formData.status === 'published' ? (
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={handleUnpublish}
              title="Revert to Draft"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => handlePublish()}
              >
                <Send size={14} />
                <span>Publish</span>
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary admin-btn-sm"
                onClick={() => setCustomPublishModal(true)}
                title="Schedule / Custom Date Publish"
                style={{ padding: '6px 8px' }}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Canvas View Container */}
      <div className="admin-editor-canvas-wrap">
        {formData.type === 'work' && (
          <aside className="admin-insert-panel">
            <h3 className="admin-insert-panel-title">Insert</h3>
            <div className="admin-insert-tiles">
              {INSERT_TILES.map(({ kind, label, hint, Icon }) => (
                <div
                  key={kind}
                  className="admin-insert-tile"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-insert-kind', kind);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = Array.from(e.dataTransfer.files || []);
                    if (files.length) articleRef.current?.insertFiles(null, files);
                  }}
                  onClick={() => {
                    if (kind === 'divider') articleRef.current?.insertDivider(null);
                    else articleRef.current?.pickFiles(kind, null);
                  }}
                  title={kind === 'divider' ? 'Click to insert a divider line' : 'Drag into the document, click to upload, or drop files here'}
                >
                  <span className="admin-insert-tile-icon">
                    <Icon size={16} />
                  </span>
                  <span className="admin-insert-tile-text">
                    <span className="admin-insert-tile-label">{label}</span>
                    <span className="admin-insert-tile-hint">{hint}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="admin-insert-panel-note">Drag into the document, click to insert, or drop files onto a tile.</p>
          </aside>
        )}
        <div className="admin-editor-canvas">
          <>
              {/* Cover Image Uploader */}
              <div
                className="admin-cover-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleCoverUpload(file);
                }}
              >
                {formData.cover_image ? (
                  <>
                    <img src={formData.cover_image} alt="" className="admin-cover-preview" />
                    <div className="admin-cover-overlay">
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <UploadCloud size={14} />
                        <span>Replace</span>
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        onClick={() => openMediaLibrary('cover')}
                      >
                        <ImageIcon size={14} />
                        <span>Media Library</span>
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleFieldChange('cover_image', '')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                    <UploadCloud size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--admin-text-secondary)', marginBottom: '4px' }}>
                      Drag and drop cover image here
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => openMediaLibrary('cover')}
                      >
                        Choose from Media
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
              </div>

              {/* Title & Subtitle */}
              <div>
                <textarea
                  ref={titleRef}
                  className="admin-title-input"
                  placeholder="Enter title..."
                  value={formData.title}
                  rows={1}
                  onChange={(e) => {
                    handleFieldChange('title', e.target.value);
                    autoGrowTextarea(e.target);
                  }}
                />
                <textarea
                  ref={excerptRef}
                  className="admin-subtitle-input"
                  placeholder="Short description / excerpt..."
                  value={formData.excerpt}
                  rows={2}
                  onChange={(e) => {
                    handleFieldChange('excerpt', e.target.value);
                    autoGrowTextarea(e.target);
                  }}
                  style={{ marginTop: '8px' }}
                />
              </div>

              {/* Slug & Tags Meta Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--admin-text-muted)', fontFamily: 'var(--admin-font-mono)' }}>
                  <span>slug:</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      handleFieldChange('slug', e.target.value);
                      checkSlug(e.target.value);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '2px 0',
                      color: 'var(--admin-text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '12.5px'
                    }}
                  />
                  {slugStatus.checked && !slugStatus.isUnique && (
                    <span style={{ color: 'var(--admin-danger)', fontSize: '11px' }}>{slugStatus.msg}</span>
                  )}
                </div>

                <div style={{ color: 'var(--admin-text-muted)' }}>•</div>

                <div style={{ color: 'var(--admin-text-muted)', fontSize: '12.5px' }}>
                  {formData.metadata?.readingTime || calculateReadingTime(formData.content)}
                </div>
              </div>

              {/* Tag Pill Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Tag size={14} style={{ color: 'var(--admin-text-muted)' }} />
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="admin-pill"
                    style={{ backgroundColor: 'var(--admin-bg-surface-elevated)', color: 'var(--admin-text-primary)', cursor: 'pointer' }}
                    onClick={() => handleRemoveTag(tag)}
                    title="Click to remove"
                  >
                    {tag} &times;
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '12.5px',
                    color: 'var(--admin-text-primary)',
                    minWidth: '90px'
                  }}
                />
              </div>

              {/* Quick Tag Recommendations */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '-12px' }}>
                {COMMON_TAGS.filter((t) => !formData.tags.includes(t)).slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleAddTag(t)}
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', border: '1px solid var(--admin-border-subtle)' }}
                  >
                    + {t}
                  </button>
                ))}
              </div>

              {formData.type === 'work' ? null : (
              <>
              {/* Editor Formatting Toolbar */}
              <div className="admin-editor-toolbar">
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('# ')}
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('## ')}
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('### ')}
                  title="Heading 3"
                >
                  <Heading3 size={16} />
                </button>

                <div className="admin-toolbar-divider" />

                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('**', true)}
                  title="Bold (Cmd+B)"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('*', true)}
                  title="Italic (Cmd+I)"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('<u>', true)}
                  title="Underline (Cmd+U)"
                >
                  <Underline size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('~~', true)}
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('`', true)}
                  title="Inline Code"
                >
                  <Code size={16} />
                </button>

                <div className="admin-toolbar-divider" />

                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n- ')}
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n1. ')}
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n- [ ] ')}
                  title="Task Checklist"
                >
                  <CheckSquare size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n> ')}
                  title="Blockquote"
                >
                  <Quote size={16} />
                </button>

                <div className="admin-toolbar-divider" />

                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n```javascript\n// code here\n```\n')}
                  title="Code Block"
                >
                  <Code size={16} style={{ color: 'var(--admin-sparkle)' }} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n| Feature | Description | Status |\n| :--- | :--- | :--- |\n| Item 1 | Value | Active |\n')}
                  title="Insert Table"
                >
                  <TableIcon size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n> [!NOTE]\n> Key context or announcement.\n\n')}
                  title="Callout Box"
                >
                  <Info size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => insertIntoContent('\n---\n')}
                  title="Divider"
                >
                  <Minus size={16} />
                </button>

                <div className="admin-toolbar-divider" />

                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => openMediaLibrary('editor')}
                  title="Insert Image from Media Library"
                >
                  <ImageIcon size={16} />
                </button>
                <button
                  type="button"
                  className="admin-toolbar-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji Picker"
                >
                  <Smile size={16} />
                </button>
              </div>

              {/* Emoji Quick Bar */}
              {showEmojiPicker && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--admin-bg-surface)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--admin-radius-sm)',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '10px'
                }}>
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        insertIntoContent(emoji);
                        setShowEmojiPicker(false);
                      }}
                      style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Content Area */}
              <textarea
                ref={textareaRef}
                className="admin-editor-content-area"
                placeholder="Start writing your thoughts, case study narrative, or code experiments... (Drag & drop images directly here)"
                value={formData.content}
                onChange={(e) => {
                  handleFieldChange('content', e.target.value);
                  autoGrowTextarea(e.target);
                }}
                onDrop={handleDropOnEditor}
                rows={8}
              />
              </>
              )}
            </>

          {/* Project details + sections (work items) — inline in the single-page flow */}
          {formData.type === 'work' && (
            <div className="admin-meta-panel" style={{ marginTop: '4px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                Case Study & Project Meta
              </h3>

              <div className="admin-meta-rows">
                <div className="admin-form-group">
                  <label className="admin-form-label">Client / Company</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Varcle Technologies"
                    value={formData.metadata.client || ''}
                    onChange={(e) => handleMetadataChange('client', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Your Role</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Lead Full Stack & Product Architect"
                    value={formData.metadata.role || ''}
                    onChange={(e) => handleMetadataChange('role', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Year / Timeline</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 2024"
                    value={formData.metadata.year || ''}
                    onChange={(e) => handleMetadataChange('year', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Duration</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. 3 Months"
                    value={formData.metadata.duration || ''}
                    onChange={(e) => handleMetadataChange('duration', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Project URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    placeholder="https://..."
                    value={formData.metadata.projectUrl || ''}
                    onChange={(e) => handleMetadataChange('projectUrl', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Repository URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    placeholder="https://github.com/..."
                    value={formData.metadata.repoUrl || ''}
                    onChange={(e) => handleMetadataChange('repoUrl', e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Caption</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Caption shown under the cover image on the article page"
                    value={formData.metadata.heroCaption || ''}
                    onChange={(e) => handleMetadataChange('heroCaption', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group" style={{ marginTop: '16px' }}>
                <label className="admin-form-label">Lead Paragraphs (intro under the title — blank line between paragraphs)</label>
                <textarea
                  ref={leadRef}
                  rows={1}
                  className="admin-form-input"
                  style={{ lineHeight: 1.6 }}
                  placeholder="Opening paragraphs of the case study..."
                  value={(formData.metadata.lead || []).join('\n\n')}
                  onChange={(e) => {
                    handleLeadChange(e.target.value);
                    autoGrowTextarea(e.target);
                  }}
                />
              </div>

              {/* Unified article — one document: text, / for image / video / GIF */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Article</h4>
                <ArticleEditor
                  ref={articleRef}
                  key={`article-${formData.id}`}
                  value={formData.content || ''}
                  onChange={(html) => handleFieldChange('content', html)}
                  placeholder="Write the case study… Type '/' to add an image, video or GIF."
                />
              </div>
            </div>
          )}


        </div>

        <aside className="admin-seo-panel">
          <h3 className="admin-seo-panel-title">SEO</h3>

          <div className="admin-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="admin-form-label">SEO Title</label>
              <span style={{ fontSize: '11px', color: (formData.seo_title || '').length > 60 ? 'var(--admin-danger)' : 'var(--admin-text-muted)' }}>
                {(formData.seo_title || '').length} / 60
              </span>
            </div>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Page title in Google search results"
              value={formData.seo_title}
              onChange={(e) => handleFieldChange('seo_title', e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="admin-form-label">Meta Description</label>
              <span style={{ fontSize: '11px', color: (formData.seo_description || '').length > 160 ? 'var(--admin-danger)' : 'var(--admin-text-muted)' }}>
                {(formData.seo_description || '').length} / 160
              </span>
            </div>
            <textarea
              ref={seoDescRef}
              rows={1}
              className="admin-form-input"
              style={{ lineHeight: 1.55 }}
              placeholder="1–2 sentence description for search and social cards"
              value={formData.seo_description}
              onChange={(e) => {
                handleFieldChange('seo_description', e.target.value);
                autoGrowTextarea(e.target);
              }}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Social Card Image</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-form-input"
                placeholder="https://..."
                value={formData.og_image}
                onChange={(e) => handleFieldChange('og_image', e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => openMediaLibrary('cover')}
              >
                <ImageIcon size={14} />
                <span>Select</span>
              </button>
            </div>
            {formData.og_image && (
              <img
                src={formData.og_image}
                alt="Social card preview"
                style={{ width: '100%', borderRadius: '8px', marginTop: '8px', display: 'block' }}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Media Library Selection Modal */}
      {mediaPickerOpen && (
        <div className="admin-modal-backdrop" onClick={() => setMediaPickerOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Select Asset from Media Library</h3>
              <button
                type="button"
                className="admin-btn-ghost admin-btn-icon"
                onClick={() => setMediaPickerOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="admin-media-grid">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="admin-media-item"
                    onClick={() => selectMediaItem(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="admin-media-thumb-wrap">
                      <img src={item.url} alt={item.alt_text} />
                    </div>
                    <div className="admin-media-meta">
                      <span className="admin-media-name">{item.filename}</span>
                      <span className="admin-media-sub">{item.alt_text || 'Select asset'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Publish Date Modal */}
      {customPublishModal && (
        <div className="admin-modal-backdrop" onClick={() => setCustomPublishModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Publish with Custom Date</h3>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Publish Date & Time</label>
                <input
                  type="datetime-local"
                  className="admin-form-input"
                  value={publishDateInput}
                  onChange={(e) => setPublishDateInput(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setCustomPublishModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => handlePublish(publishDateInput ? new Date(publishDateInput).toISOString() : null)}
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
