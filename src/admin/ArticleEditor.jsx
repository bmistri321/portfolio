import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { mediaService } from '../lib/contentService';

// ---------------------------------------------------------------------------
// Custom <video> blot (real video tag — Quill's built-in video blot is iframe-only)
// ---------------------------------------------------------------------------
const BlockEmbed = Quill.import('blots/block/embed');
class ArticleVideoBlot extends BlockEmbed {
  static create(src) {
    const node = super.create();
    node.setAttribute('controls', '');
    node.setAttribute('preload', 'metadata');
    node.setAttribute('src', src);
    return node;
  }
  static value(node) {
    return node.getAttribute('src');
  }
}
ArticleVideoBlot.blotName = 'articleVideo';
ArticleVideoBlot.tagName = 'video';
try {
  Quill.register(ArticleVideoBlot);
} catch {
  /* already registered */
}

// ---------------------------------------------------------------------------
// Divider blot — a real <hr> the Insert panel can drop in
// ---------------------------------------------------------------------------
class DividerBlot extends BlockEmbed {
  static create() {
    const node = super.create();
    node.setAttribute('class', 'article-divider');
    return node;
  }
}
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';
try {
  Quill.register(DividerBlot);
} catch {
  /* already registered */
}

// Floating contextual toolbar (select text) — no boxes anywhere.
const TOOLBAR = [
  ['bold', 'italic', 'underline'],
  [{ header: [2, 3, false] }],
  ['blockquote', { list: 'bullet' }, { list: 'ordered' }],
  ['link', 'clean'],
];

const MAX_IMG_DIM = 1600;
const INSERT_MIME = 'application/x-insert-kind';

// Compress an image in-browser (canvas). GIFs pass through untouched to
// preserve animation. Returns a File ready for upload.
async function compressImage(file) {
  if (file.type === 'image/gif') return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_IMG_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((res) => canvas.toBlob(res, outType, 0.82));
  if (!blob) return file;
  const name = file.name.replace(/\.[a-z0-9]+$/i, '') + (outType === 'image/png' ? '.png' : '.jpg');
  return new File([blob], name, { type: outType });
}

// Upload to Supabase storage. NEVER falls back to a local data URI —
// a failed upload throws instead of embedding base64 in the document.
async function uploadToSupabase(file, altText) {
  const uploaded = await mediaService.upload(file, { alt_text: altText || file.name });
  if (!uploaded || !uploaded.url || uploaded.url.startsWith('data:')) {
    throw new Error('Upload failed — the file was not saved. Check your connection and try again.');
  }
  return uploaded.url;
}

function kindOfFile(file) {
  if (!file || !file.type) return null;
  if (file.type === 'image/gif') return 'gif';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  return null;
}

// ---------------------------------------------------------------------------
// ArticleEditor — one unified document per project.
// Type text, select for the floating toolbar, press "/" for image/video/GIF,
// or drag options in from the Insert panel.
// ---------------------------------------------------------------------------
const ArticleEditor = forwardRef(function ArticleEditor({ value, onChange, placeholder }, ref) {
  const wrapRef = useRef(null);
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [uploading, setUploading] = useState(null); // 'image' | 'video' | 'gif' | null
  const pendingIndex = useRef(0);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const gifInputRef = useRef(null);

  useEffect(() => {
    if (quillRef.current || !containerRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'bubble',
      placeholder: placeholder || 'Start writing… Use the Insert panel for images, video, GIFs or dividers.',
      modules: { toolbar: TOOLBAR },
    });

    if (value && value.trim()) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    quill.on('text-change', () => {
      const isEmpty = quill.getText().trim().length === 0;
      onChangeRef.current(isEmpty ? '' : quill.root.innerHTML);
    });

    // Never let a stray file drop navigate the browser away from the editor.
    const killDrop = (e) => e.preventDefault();
    document.addEventListener('dragover', killDrop);
    document.addEventListener('drop', killDrop);

    quillRef.current = quill;
    const containerEl = containerRef.current;
    return () => {
      quillRef.current = null;
      document.removeEventListener('dragover', killDrop);
      document.removeEventListener('drop', killDrop);
      if (containerEl) containerEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clampIndex = (idx) => {
    const quill = quillRef.current;
    return Math.max(0, Math.min(idx ?? quill.getLength(), quill.getLength()));
  };

  const cursorIndex = () => {
    const quill = quillRef.current;
    return quill.getSelection()?.index ?? quill.getLength();
  };

  // Map drop coordinates to a document index via the DOM caret.
  const indexFromPoint = (clientX, clientY) => {
    const quill = quillRef.current;
    if (!quill) return 0;
    try {
      let range = null;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(clientX, clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(clientX, clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }
      if (range && quill.root.contains(range.startContainer)) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        quill.focus();
        const qsel = quill.getSelection();
        if (qsel) return qsel.index;
      }
    } catch {
      /* fall through */
    }
    return quill.getLength();
  };

  const insertDividerAt = (index) => {
    const quill = quillRef.current;
    if (!quill) return;
    const idx = clampIndex(index ?? cursorIndex());
    quill.insertEmbed(idx, 'divider', true, 'user');
    quill.setSelection(idx + 1, 'silent');
    quill.focus();
  };

  const pickFilesAt = (kind, index) => {
    pendingIndex.current = clampIndex(index ?? cursorIndex());
    if (kind === 'image') imageInputRef.current?.click();
    else if (kind === 'video') videoInputRef.current?.click();
    else if (kind === 'gif') gifInputRef.current?.click();
  };

  const handleFile = async (kind, file, atIndex) => {
    if (!file) return;
    const quill = quillRef.current;
    setUploading(kind);
    try {
      const processed = kind === 'image' ? await compressImage(file) : file;
      const url = await uploadToSupabase(processed, file.name);
      const idx = clampIndex(atIndex ?? pendingIndex.current);
      if (kind === 'video') {
        quill.insertEmbed(idx, 'articleVideo', url, 'user');
      } else {
        quill.insertEmbed(idx, 'image', url, 'user');
      }
      quill.setSelection(idx + 1, 'silent');
      quill.focus();
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const insertFilesAt = async (index, files) => {
    let idx = clampIndex(index ?? cursorIndex());
    for (const file of files || []) {
      const kind = kindOfFile(file);
      if (!kind) continue;
      // eslint-disable-next-line no-await-in-loop
      await handleFile(kind, file, idx);
      idx += 1;
    }
  };

  // API for the Insert panel (drag from panel, drop files on tiles, click).
  useImperativeHandle(ref, () => ({
    insertDivider: (index) => insertDividerAt(index ?? null),
    insertFiles: (index, files) => insertFilesAt(index ?? null, files),
    pickFiles: (kind, index) => pickFilesAt(kind, index ?? null),
    indexFromPoint: (x, y) => indexFromPoint(x, y),
  }));

  const onDropOnEditor = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const kind = e.dataTransfer.getData(INSERT_MIME);
    const files = Array.from(e.dataTransfer.files || []);
    const idx = indexFromPoint(e.clientX, e.clientY);
    if (kind === 'divider') {
      insertDividerAt(idx);
    } else if (kind) {
      pickFilesAt(kind, idx);
    } else if (files.length > 0) {
      await insertFilesAt(idx, files);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="admin-quill-wrap admin-article-editor"
      style={{ position: 'relative' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOnEditor}
    >
      <div ref={containerRef} />

      {uploading && (
        <div className="admin-uploading-pill">
          Uploading {uploading} to Supabase…
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFile('image', e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={gifInputRef}
        type="file"
        accept="image/gif"
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFile('gif', e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFile('video', e.target.files[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
});

export default ArticleEditor;
