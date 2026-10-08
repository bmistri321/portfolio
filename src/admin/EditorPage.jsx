import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
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
  Type,
  Info,
  X,
  Link2,
  RefreshCw,
  Download
} from 'lucide-react';
import {
  contentService,
  mediaService,
  generateSlug,
  calculateReadingTime,
  generateUUID
} from '../lib/contentService';
import ArticleEditor from './ArticleEditor';

const EMOJIS = ['✨', '💡', '🚀', '🔥', '⚡', '🛠️', '🎨', '📐', '🧠', '🔮', '🎯', '📌', '💎', '🌱', '📦', '🔍'];

// Insert panel options (Word-style): draggable into the article, files can be
// dropped on a tile, click inserts at the cursor / opens the file picker.
const INSERT_TILES = [
  { kind: 'image', label: 'Image', hint: 'Upload & compress', Icon: ImageIcon },
  { kind: 'video', label: 'Video', hint: 'Upload MP4', Icon: Video },
  { kind: 'gif', label: 'GIF', hint: 'Upload', Icon: Film },
  { kind: 'divider', label: 'Divider', hint: 'Horizontal line', Icon: Minus },
  { kind: 'text', label: 'Text', hint: 'Paragraph block', Icon: Type },
  { kind: 'quote', label: 'Quote', hint: 'Positive / negative', Icon: Quote },
];

export default function EditorPage({
  contentId,
  initialType = 'work',
  onNavigate
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
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaTarget, setMediaTarget] = useState('cover'); // 'cover' or 'editor'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [slugStatus, setSlugStatus] = useState({ checked: false, isUnique: true, msg: '' });
  const [quotePopup, setQuotePopup] = useState(null); // { index } — pending quote insertion
  const [manualSaved, setManualSaved] = useState(false); // Save button turns green after a manual save
  const [mediumUrl, setMediumUrl] = useState('');
  const [mediumBusy, setMediumBusy] = useState(false);
  const [mediumMsg, setMediumMsg] = useState(null); // { ok: bool, text: string }
  const [mediumUpdate, setMediumUpdate] = useState(null); // newer Medium version held back by local edits
  const mediumAutoCheckedRef = useRef(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
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
    setManualSaved(false);
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-generate slug and SEO defaults if title changes
      if (field === 'title' && (isNew || !prev.slug || prev.slug === generateSlug(prev.title))) {
        next.slug = generateSlug(value);
        if (!next.seo_title) next.seo_title = value;
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

  const confirmQuote = (sentiment) => {
    if (quotePopup) {
      articleRef.current?.insertCallout(quotePopup.index, sentiment);
      setQuotePopup(null);
    }
  };

  // Esc closes the quote popup
  useEffect(() => {
    if (!quotePopup) return;
    const onKey = (e) => { if (e.key === 'Escape') setQuotePopup(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [quotePopup]);

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
      setManualSaved(true);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setSaveStatus('unsaved');
      setManualSaved(false);
    }
  };

  // Publish Workflow
  const handlePublish = async () => {
    setSaveStatus('saving');
    try {
      const updatedData = {
        ...formData,
        status: 'published',
        published_at: new Date().toISOString()
      };

      if (!persistedRef.current) {
        const created = await contentService.create(updatedData);
        persistedRef.current = true;
        setFormData(created);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, 'Bishal Mistri Studio', `/admin/content/${created.id}`);
        }
      } else {
        const updated = await contentService.publish(formData.id, updatedData.published_at);
        setFormData(updated);
      }
      setSaveStatus('saved');
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

  // Update a single metadata key (e.g. the "Year label") with autosave.
  const handleMetadataField = (key, value) => {
    setManualSaved(false);
    setFormData((prev) => ({
      ...prev,
      metadata: { ...(prev.metadata || {}), [key]: value }
    }));
    scheduleAutosave();
  };

  // ---------- Medium import / sync (Writing) ----------
  // Linked state lives in metadata.medium: { url, postId, feedUrl, sync,
  // lastSyncedAt, contentHash }. No DB migration needed.
  const medium = formData.metadata?.medium || null;

  const fetchMediumArticle = async (url) => {
    const res = await fetch('/api/fetch-medium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json().catch(() => ({}));
    if (!data.ok) throw new Error(data.error || 'Could not fetch the article.');
    return data;
  };

  // Applies fetched Medium data to the form. Sync updates the article body
  // (+ excerpt); the title and cover are only set on import, never silently
  // overwritten afterwards.
  const applyMediumData = (data, { overwriteTitle }) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (overwriteTitle || !next.title || next.title === 'Untitled Piece') {
        next.title = data.title || next.title;
        next.slug = generateSlug(next.title);
        if (!next.seo_title) next.seo_title = next.title;
      }
      if (overwriteTitle || !next.excerpt) next.excerpt = data.excerpt || next.excerpt;
      next.content = data.html;
      if (!next.cover_image && data.coverImage) {
        next.cover_image = data.coverImage;
        if (!next.thumbnail) next.thumbnail = data.coverImage;
        if (!next.og_image) next.og_image = data.coverImage;
      }
      next.metadata = {
        ...next.metadata,
        readingTime: calculateReadingTime(data.html),
        medium: {
          url: data.url,
          postId: data.postId,
          feedUrl: data.feedUrl,
          sync: prev.metadata?.medium?.sync !== false,
          lastSyncedAt: new Date().toISOString(),
          contentHash: data.contentHash
        }
      };
      return next;
    });
    setMediumUpdate(null);
    scheduleAutosave();
  };

  const handleMediumImport = async () => {
    const url = mediumUrl.trim();
    if (!url) {
      setMediumMsg({ ok: false, text: 'Paste a Medium article link first.' });
      return;
    }
    if (
      formData.content && formData.content.trim() &&
      !window.confirm('Replace the current content with the Medium article?')
    ) return;
    setMediumBusy(true);
    setMediumMsg(null);
    try {
      const data = await fetchMediumArticle(url);
      applyMediumData(data, { overwriteTitle: true });
      setMediumUrl('');
      setMediumMsg({ ok: true, text: `Imported \u201C${data.title}\u201D from Medium.` });
    } catch (err) {
      setMediumMsg({ ok: false, text: err.message });
    } finally {
      setMediumBusy(false);
    }
  };

  const handleMediumSync = async (dataOverride) => {
    const m = formDataRef.current?.metadata?.medium;
    if (!m?.url) return;
    setMediumBusy(true);
    setMediumMsg(null);
    try {
      const data = dataOverride || await fetchMediumArticle(m.url);
      if (data.contentHash === m.contentHash) {
        setFormData((prev) => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            medium: { ...prev.metadata.medium, lastSyncedAt: new Date().toISOString() }
          }
        }));
        scheduleAutosave();
        setMediumMsg({ ok: true, text: 'Already up to date with Medium.' });
        return;
      }
      const localEdited =
        formDataRef.current?.updated_at && m.lastSyncedAt &&
        new Date(formDataRef.current.updated_at) > new Date(m.lastSyncedAt);
      if (localEdited && !dataOverride) {
        // Hold the newer version for review instead of clobbering his edits.
        setMediumUpdate(data);
        setMediumMsg({
          ok: false,
          text: 'Medium has a newer version, but you edited this piece after the last sync. Review it below before overwriting your edits.'
        });
        return;
      }
      if (localEdited && dataOverride && !window.confirm('Overwrite your edits with Medium\u2019s version?')) return;
      applyMediumData(data, { overwriteTitle: false });
      setMediumMsg({ ok: true, text: 'Updated from Medium.' });
    } catch (err) {
      setMediumMsg({ ok: false, text: err.message });
    } finally {
      setMediumBusy(false);
    }
  };

  const toggleMediumSync = () => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        medium: { ...prev.metadata.medium, sync: !(prev.metadata.medium?.sync !== false) }
      }
    }));
    scheduleAutosave();
  };

  const unlinkMedium = () => {
    if (!window.confirm('Unlink this piece from Medium? Auto-sync will stop; the imported text stays.')) return;
    setFormData((prev) => {
      const md = { ...prev.metadata };
      delete md.medium;
      return { ...prev, metadata: md };
    });
    setMediumUpdate(null);
    setMediumMsg(null);
    scheduleAutosave();
  };

  // Quiet background check: if this piece is linked with auto-sync on and we
  // have not checked in over a day, look for a newer Medium version. Applies
  // it directly when there are no local edits; otherwise holds it for review.
  useEffect(() => {
    if (loading || isNew || mediumAutoCheckedRef.current) return;
    mediumAutoCheckedRef.current = true;
    const m = formDataRef.current?.metadata?.medium;
    if (!m?.url || m.sync === false) return;
    const last = m.lastSyncedAt ? new Date(m.lastSyncedAt).getTime() : 0;
    if (Date.now() - last < 24 * 3600 * 1000) return;
    (async () => {
      try {
        const data = await fetchMediumArticle(m.url);
        if (!data.ok || data.contentHash === m.contentHash) return;
        const localEdited =
          formDataRef.current?.updated_at && m.lastSyncedAt &&
          new Date(formDataRef.current.updated_at) > new Date(m.lastSyncedAt);
        if (localEdited) {
          setMediumUpdate(data);
          setMediumMsg({ ok: false, text: 'Medium has a newer version of this piece. Review it below when ready.' });
        } else {
          applyMediumData(data, { overwriteTitle: false });
          setMediumMsg({ ok: true, text: 'Synced the latest version from Medium.' });
        }
      } catch {
        // Quiet: the manual "Sync from Medium" button surfaces errors.
      }
    })();
  }, [loading, isNew]);

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
    // Skeleton mirrors the edit page structure: top bar, insert panel,
    // cover, title, meta rows, article lines, SEO panel.
    const sk = (style) => <div className="admin-skel" style={style} />;
    return (
      <div className="admin-editor-layout" aria-hidden>
        <header className="admin-editor-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {sk({ width: 110, height: 30, borderRadius: 8 })}
            {sk({ width: 170, height: 36, borderRadius: 8 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {sk({ width: 90, height: 32, borderRadius: 8 })}
            {sk({ width: 96, height: 36, borderRadius: 8 })}
          </div>
        </header>
        <div className="admin-editor-canvas-wrap">
          {formData.type === 'work' && (
            <aside className="admin-insert-panel">
              {sk({ width: 80, height: 14 })}
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>{sk({ height: 54, borderRadius: 10 })}</div>
              ))}
            </aside>
          )}
          <div className="admin-editor-canvas">
            {sk({ height: 240, borderRadius: 12 })}
            {sk({ height: 40, width: '55%' })}
            {sk({ height: 20, width: '92%' })}
            {sk({ height: 20, width: '78%' })}
            <div style={{ height: 8 }} />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {sk({ width: 150, height: 13, flexShrink: 0 })}
                {sk({ height: 13, flex: 1 })}
              </div>
            ))}
            <div style={{ height: 8 }} />
            {sk({ height: 18, width: 110 })}
            {[96, 100, 89, 97, 94, 72].map((w, i) => (
              <div key={i}>{sk({ height: 15, width: `${w}%` })}</div>
            ))}
          </div>
          <aside className="admin-seo-panel">
            {sk({ width: 60, height: 14 })}
            {sk({ height: 13, width: '45%' })}
            {sk({ height: 30, borderRadius: 6 })}
            {sk({ height: 13, width: '55%' })}
            {sk({ height: 62, borderRadius: 6 })}
            {sk({ height: 13, width: '50%' })}
            {sk({ height: 30, borderRadius: 6 })}
            {sk({ height: 140, borderRadius: 8 })}
          </aside>
        </div>
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
            className={`admin-btn admin-btn-sm ${manualSaved ? 'admin-btn-success' : formData.status === 'published' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
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
            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => handlePublish()}
            >
              <Send size={14} />
              <span>Publish</span>
            </button>
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
                    if (kind === 'quote') return;
                    const files = Array.from(e.dataTransfer.files || []);
                    if (files.length) articleRef.current?.insertFiles(null, files);
                  }}
                  onClick={() => {
                    if (kind === 'divider') articleRef.current?.insertDivider(null);
                    else if (kind === 'text') articleRef.current?.insertText(null);
                    else if (kind === 'quote') articleRef.current?.requestQuote(null);
                    else articleRef.current?.pickFiles(kind, null);
                  }}
                  title={kind === 'divider' ? 'Click to insert a divider line' : kind === 'text' ? 'Drag into the document or click to insert a text paragraph' : kind === 'quote' ? 'Drag into the document or click, then choose Positive or Negative' : 'Drag into the document, click to upload, or drop files here'}
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
              {/* Medium import / sync (Writing only) */}
              {formData.type === 'writing' && (
                <div
                  style={{
                    border: '1px solid var(--admin-border)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: medium ? '10px' : '12px' }}>
                    <Link2 size={15} style={{ color: 'var(--admin-text-muted)' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Medium</span>
                    {medium?.lastSyncedAt && (
                      <span style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)', marginLeft: 'auto' }}>
                        Last synced {new Date(medium.lastSyncedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {!medium ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        value={mediumUrl}
                        onChange={(e) => setMediumUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleMediumImport(); }}
                        placeholder="Paste a Medium article link to import its title and text…"
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
                        <span>{mediumBusy ? 'Importing…' : 'Import'}</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a
                        href={medium.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '12.5px', color: 'var(--admin-text-secondary)', wordBreak: 'break-all' }}
                      >
                        {medium.url}
                      </a>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => handleMediumSync()}
                          disabled={mediumBusy}
                        >
                          <RefreshCw size={14} />
                          <span>{mediumBusy ? 'Syncing…' : 'Sync from Medium'}</span>
                        </button>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer', color: 'var(--admin-text-secondary)' }}>
                          <input type="checkbox" checked={medium.sync !== false} onChange={toggleMediumSync} />
                          Auto-sync daily
                        </label>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={unlinkMedium}
                        >
                          Unlink
                        </button>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>
                        Edits you make on Medium appear here automatically. Sync updates the article text; your title and cover stay as you set them.
                      </div>
                    </div>
                  )}

                  {mediumUpdate && (
                    <div style={{ marginTop: '10px', padding: '10px 12px', border: '1px solid #d97706', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12.5px', marginBottom: '8px' }}>
                        Medium has a newer version — you edited this piece after the last sync.
                      </div>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm"
                        onClick={() => handleMediumSync(mediumUpdate)}
                        disabled={mediumBusy}
                      >
                        Overwrite with Medium's version
                      </button>
                    </div>
                  )}
                  {mediumMsg && (
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: '12.5px',
                        color: mediumMsg.ok ? '#16a34a' : 'var(--admin-danger)'
                      }}
                    >
                      {mediumMsg.text}
                    </div>
                  )}
                </div>
              )}

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
              </div>

              {/* Reading time meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
                <div style={{ color: 'var(--admin-text-muted)', fontSize: '12.5px' }}>
                  {formData.metadata?.readingTime || calculateReadingTime(formData.content)}
                </div>
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

          {formData.type === 'work' && (
            <div className="admin-meta-panel" style={{ marginTop: '4px' }}>
              {/* Unified article — one document: text, / for image / video / GIF */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Article</h4>
                <ArticleEditor
                  ref={articleRef}
                  key={`article-${formData.id}`}
                  value={formData.content || ''}
                  onChange={(html) => handleFieldChange('content', html)}
                  onRequestQuote={(idx) => setQuotePopup({ index: idx })}
                  placeholder="Write the case study… Use the Insert panel for text, images, video, GIFs or dividers."
                />
              </div>
            </div>
          )}


        </div>

        {quotePopup && (
          <div className="admin-quote-popup-backdrop" onClick={() => setQuotePopup(null)}>
            <div className="admin-quote-popup" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Choose quote style">
              <h4 className="admin-quote-popup-title">Quote style?</h4>
              <p className="admin-quote-popup-sub">Pick how this quote should look.</p>
              <div className="admin-quote-popup-btns">
                <button type="button" className="admin-quote-btn admin-quote-positive" onClick={() => confirmQuote('positive')}>
                  Positive
                </button>
                <button type="button" className="admin-quote-btn admin-quote-negative" onClick={() => confirmQuote('negative')}>
                  Negative
                </button>
              </div>
              <button type="button" className="admin-quote-cancel" onClick={() => setQuotePopup(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <aside className="admin-seo-panel">
          <h3 className="admin-seo-panel-title">SEO</h3>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="url-slug"
              value={formData.slug}
              onChange={(e) => {
                handleFieldChange('slug', e.target.value);
                checkSlug(e.target.value);
              }}
            />
            {slugStatus.checked && !slugStatus.isUnique && (
              <span style={{ color: 'var(--admin-danger)', fontSize: '11px' }}>{slugStatus.msg}</span>
            )}
          </div>

          {['work', 'tinkering', 'writing'].includes(formData.type) && (
            <div className="admin-form-group">
              <label className="admin-form-label">Year label</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="2026 or WIP"
                value={formData.metadata?.year || ''}
                onChange={(e) => handleMetadataField('year', e.target.value)}
              />
            </div>
          )}

          {formData.type === 'writing' && (
            <div className="admin-form-group">
              <label className="admin-form-label">Link</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="https://…"
                value={formData.metadata?.external_url || ''}
                onChange={(e) => handleMetadataField('external_url', e.target.value)}
              />
            </div>
          )}

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
    </div>
  );
}
