import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { Trash2, Repeat } from 'lucide-react';
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
  const [mediaHover, setMediaHover] = useState(null); // { kind, node, top, right } | null
  const [dropHint, setDropHint] = useState(null); // { top } | null — blue insert line while dragging
  const pendingIndex = useRef(0);
  const replaceRef = useRef(null); // DOM node to swap out after a Replace upload

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

    // Hovering an image/video/GIF shows the Delete / Replace bar.
    const onMediaOver = (e) => {
      const t = e.target && e.target.closest ? e.target.closest('img, video') : null;
      if (t && quill.root.contains(t) && wrapRef.current) {
        const wrapRect = wrapRef.current.getBoundingClientRect();
        const r = t.getBoundingClientRect();
        const srcAttr = t.getAttribute('src') || '';
        const kind = t.tagName === 'VIDEO' ? 'video' : (/\.gif(\?|$)/i.test(srcAttr) ? 'gif' : 'image');
        setMediaHover({
          kind,
          node: t,
          top: Math.max(0, r.top - wrapRect.top + 8),
          right: Math.max(0, wrapRect.right - r.right + 8),
        });
      }
    };
    const onMediaOut = (e) => {
      const rt = e.relatedTarget;
      if (rt && rt.closest && rt.closest('.admin-media-hoverbar')) return;
      const t = e.target && e.target.closest ? e.target.closest('img, video') : null;
      const rtt = rt && rt.closest ? rt.closest('img, video') : null;
      if (t && t === rtt) return;
      setMediaHover(null);
    };
    const onScrollHide = () => setMediaHover(null);
    quill.root.addEventListener('mouseover', onMediaOver);
    quill.root.addEventListener('mouseout', onMediaOut);
    document.addEventListener('scroll', onScrollHide, true);

    // Never let a stray file drop navigate the browser away from the editor.
    const killDrop = (e) => e.preventDefault();
    document.addEventListener('dragover', killDrop);
    document.addEventListener('drop', killDrop);

    // Keep the floating bubble toolbar fully visible: Quill centers it on the
    // selection, which can push its outer options past the document edge where
    // the scroll container clips them.
    const containerEl = containerRef.current;
    const clampBubbleToolbar = () => {
      const tooltip = containerEl.querySelector('.ql-tooltip');
      if (!tooltip || tooltip.classList.contains('ql-editing')) return;
      const canvas = wrapRef.current ? wrapRef.current.closest('.admin-editor-canvas') : null;
      const bounds = (canvas || wrapRef.current || containerEl).getBoundingClientRect();
      const r = tooltip.getBoundingClientRect();
      let dx = 0;
      if (r.right > bounds.right) dx = bounds.right - r.right - 8;
      else if (r.left < bounds.left) dx = bounds.left - r.left + 8;
      if (dx) {
        const cur = parseFloat(tooltip.style.left) || 0;
        tooltip.style.left = `${cur + dx}px`;
      }
    };
    quill.on('selection-change', () => {
      requestAnimationFrame(clampBubbleToolbar);
    });

    quillRef.current = quill;
    return () => {
      quillRef.current = null;
      quill.root.removeEventListener('mouseover', onMediaOver);
      quill.root.removeEventListener('mouseout', onMediaOut);
      document.removeEventListener('scroll', onScrollHide, true);
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

  const caretRangeAt = (clientX, clientY) => {
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
      const quill = quillRef.current;
      if (range && quill && quill.root.contains(range.startContainer)) return range;
    } catch {
      /* fall through */
    }
    return null;
  };

  // Index without touching the live selection (used while dragging).
  const quietIndexFromPoint = (clientX, clientY) => {
    const quill = quillRef.current;
    if (!quill) return 0;
    const range = caretRangeAt(clientX, clientY);
    if (!range) return quill.getLength();
    const sc = range.startContainer;
    if (sc.nodeType === 3) {
      const leaf = Quill.find(sc);
      if (leaf) {
        try {
          return quill.getIndex(leaf) + range.startOffset;
        } catch {
          /* fall through */
        }
      }
    }
    const el = sc.nodeType === 1 ? sc : sc.parentNode;
    const blot = el ? Quill.find(el, true) : null;
    if (blot) {
      try {
        return quill.getIndex(blot);
      } catch {
        /* fall through */
      }
    }
    return quill.getLength();
  };

  // Map drop coordinates to a document index via the DOM caret (applies the selection).
  const indexFromPoint = (clientX, clientY) => {
    const quill = quillRef.current;
    if (!quill) return 0;
    const range = caretRangeAt(clientX, clientY);
    if (range) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        quill.focus();
        const qsel = quill.getSelection();
        if (qsel) return qsel.index;
      } catch {
        /* fall through */
      }
    }
    return quill.getLength();
  };

  // Blue insert line while a tile / file is dragged over the document.
  const isInsertDrag = (e) => {
    const types = Array.from(e.dataTransfer.types || []);
    return types.includes(INSERT_MIME) || types.includes('Files');
  };

  const showDropHint = (e) => {
    if (!isInsertDrag(e)) {
      setDropHint(null);
      return;
    }
    const quill = quillRef.current;
    if (!quill || !wrapRef.current || !containerRef.current) return;
    const idx = quietIndexFromPoint(e.clientX, e.clientY);
    try {
      const b = quill.getBounds(idx);
      const top =
        containerRef.current.getBoundingClientRect().top -
        wrapRef.current.getBoundingClientRect().top +
        b.top;
      setDropHint({ top });
    } catch {
      /* ignore */
    }
  };

  const insertTextAt = (index) => {
    const quill = quillRef.current;
    if (!quill) return;
    const idx = clampIndex(index ?? cursorIndex());
    quill.insertText(idx, '\n', 'user');
    quill.setSelection(Math.min(idx + 1, quill.getLength()), 'silent');
    quill.focus();
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
    const replaceNode = replaceRef.current;
    replaceRef.current = null;
    setUploading(kind);
    try {
      const processed = kind === 'image' ? await compressImage(file) : file;
      const url = await uploadToSupabase(processed, file.name);
      let idx = clampIndex(atIndex ?? pendingIndex.current);
      // Replace: remove the old media first so the new one takes its exact spot.
      if (replaceNode) {
        try {
          const blot = Quill.find(replaceNode);
          if (blot && quill.root.contains(replaceNode)) {
            idx = quill.getIndex(blot);
            quill.deleteText(idx, 1, 'user');
          }
        } catch {
          /* old node already gone */
        }
      }
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

  const blotIndexOf = (node) => {
    try {
      const blot = Quill.find(node);
      if (blot) return quillRef.current.getIndex(blot);
    } catch {
      /* ignore */
    }
    return null;
  };

  const deleteHoverMedia = () => {
    const quill = quillRef.current;
    const node = mediaHover?.node;
    setMediaHover(null);
    if (!quill || !node) return;
    const idx = blotIndexOf(node);
    if (idx !== null) quill.deleteText(idx, 1, 'user');
  };

  const replaceHoverMedia = () => {
    const node = mediaHover?.node;
    const kind = mediaHover?.kind;
    setMediaHover(null);
    if (!node || !kind) return;
    replaceRef.current = node;
    const idx = blotIndexOf(node);
    pendingIndex.current = idx !== null ? idx : cursorIndex();
    const input =
      kind === 'video' ? videoInputRef.current : kind === 'gif' ? gifInputRef.current : imageInputRef.current;
    if (input) {
      // If the file dialog is dismissed, forget the pending replacement.
      const onCancel = () => {
        if (replaceRef.current === node) replaceRef.current = null;
        input.removeEventListener('cancel', onCancel);
      };
      input.addEventListener('cancel', onCancel);
      input.click();
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
    insertText: (index) => insertTextAt(index ?? null),
    insertFiles: (index, files) => insertFilesAt(index ?? null, files),
    pickFiles: (kind, index) => pickFilesAt(kind, index ?? null),
    indexFromPoint: (x, y) => indexFromPoint(x, y),
  }));

  const onDragOverWrap = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    showDropHint(e);
  };

  const onDragLeaveWrap = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropHint(null);
  };

  const onDropOnEditor = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropHint(null);
    const kind = e.dataTransfer.getData(INSERT_MIME);
    const files = Array.from(e.dataTransfer.files || []);
    const idx = indexFromPoint(e.clientX, e.clientY);
    if (kind === 'divider') {
      insertDividerAt(idx);
    } else if (kind === 'text') {
      insertTextAt(idx);
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
      onDragEnter={showDropHint}
      onDragOver={onDragOverWrap}
      onDragLeave={onDragLeaveWrap}
      onDrop={onDropOnEditor}
    >
      <div ref={containerRef} />
      {dropHint && <div className="admin-drop-hint" style={{ top: dropHint.top }} />}

      {mediaHover && (
        <div
          className="admin-media-hoverbar"
          style={{ position: 'absolute', top: mediaHover.top, right: mediaHover.right, zIndex: 40 }}
          onMouseLeave={() => setMediaHover(null)}
        >
          <button type="button" className="danger" onMouseDown={(e) => e.preventDefault()} onClick={deleteHoverMedia}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={replaceHoverMedia}>
            <Repeat size={14} />
            <span>Replace</span>
          </button>
        </div>
      )}

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
