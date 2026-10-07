import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { Image as ImageIcon, Video, Film } from 'lucide-react';
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

// Floating contextual toolbar (select text) — no boxes anywhere.
const TOOLBAR = [
  ['bold', 'italic', 'underline'],
  [{ header: [2, 3, false] }],
  ['blockquote', { list: 'bullet' }, { list: 'ordered' }],
  ['link', 'clean'],
];

const MAX_IMG_DIM = 1600;

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

// ---------------------------------------------------------------------------
// ArticleEditor — one unified document per project.
// Type text, select for the floating toolbar, press "/" for image/video/GIF.
// ---------------------------------------------------------------------------
export default function ArticleEditor({ value, onChange, placeholder }) {
  const wrapRef = useRef(null);
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [slash, setSlash] = useState(null); // { index, top, left }
  const slashRef = useRef(null);
  const [uploading, setUploading] = useState(null); // 'image' | 'video' | 'gif' | null
  const pendingIndex = useRef(0);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const gifInputRef = useRef(null);

  const setSlashState = (s) => {
    slashRef.current = s;
    setSlash(s);
  };

  useEffect(() => {
    if (quillRef.current || !containerRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'bubble',
      placeholder: placeholder || "Start writing… Type '/' for image, video or GIF.",
      modules: { toolbar: TOOLBAR },
    });

    if (value && value.trim()) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    const maybeOpenSlash = () => {
      const sel = quill.getSelection();
      if (!sel) {
        setSlashState(null);
        return;
      }
      // Keep open while the user types a filter word after "/"
      if (slashRef.current) {
        const sIdx = slashRef.current.index;
        if (sel.index > sIdx) {
          const between = quill.getText(sIdx, sel.index - sIdx);
          if (/^\/\w*$/.test(between)) return;
        }
        setSlashState(null);
        return;
      }
      // Open when "/" is typed at the start of a line
      const idx = sel.index;
      if (idx > 0 && quill.getText(idx - 1, 1) === '/' && (idx === 1 || quill.getText(idx - 2, 1) === '\n')) {
        const b = quill.getBounds(idx - 1);
        setSlashState({ index: idx - 1, top: b.top + b.height + 8, left: Math.max(0, b.left) });
      }
    };

    quill.on('text-change', (delta, oldDelta, source) => {
      const isEmpty = quill.getText().trim().length === 0;
      onChangeRef.current(isEmpty ? '' : quill.root.innerHTML);
      if (source === 'user') maybeOpenSlash();
    });
    quill.on('selection-change', (range) => {
      if (!range && slashRef.current) setSlashState(null);
    });
    const onKey = (e) => {
      if (e.key === 'Escape') setSlashState(null);
    };
    quill.root.addEventListener('keydown', onKey);

    quillRef.current = quill;
    const containerEl = containerRef.current;
    return () => {
      quillRef.current = null;
      quill.root.removeEventListener('keydown', onKey);
      if (containerEl) containerEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSlashAndFocus = () => {
    const quill = quillRef.current;
    const s = slashRef.current;
    let idx = quill.getSelection()?.index ?? quill.getLength();
    if (s) {
      const end = quill.getSelection()?.index ?? s.index + 1;
      quill.deleteText(s.index, Math.max(1, end - s.index), 'user');
      idx = s.index;
      setSlashState(null);
    }
    pendingIndex.current = idx;
    return idx;
  };

  const chooseMedia = (kind) => {
    removeSlashAndFocus();
    if (kind === 'image') imageInputRef.current?.click();
    else if (kind === 'video') videoInputRef.current?.click();
    else if (kind === 'gif') gifInputRef.current?.click();
  };

  const handleFile = async (kind, file) => {
    if (!file) return;
    const quill = quillRef.current;
    setUploading(kind);
    try {
      const processed = kind === 'image' ? await compressImage(file) : file;
      const url = await uploadToSupabase(processed, file.name);
      const idx = Math.min(pendingIndex.current, quill.getLength());
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

  return (
    <div ref={wrapRef} className="admin-quill-wrap admin-article-editor" style={{ position: 'relative' }}>
      <div ref={containerRef} />

      {slash && (
        <div
          className="admin-slash-menu"
          style={{ position: 'absolute', top: slash.top, left: slash.left, zIndex: 40 }}
        >
          <button type="button" onClick={() => chooseMedia('image')}>
            <ImageIcon size={15} />
            <span className="asm-label">Image</span>
            <span className="asm-hint">upload & compress</span>
          </button>
          <button type="button" onClick={() => chooseMedia('video')}>
            <Video size={15} />
            <span className="asm-label">Video</span>
            <span className="asm-hint">upload MP4</span>
          </button>
          <button type="button" onClick={() => chooseMedia('gif')}>
            <Film size={15} />
            <span className="asm-label">GIF</span>
            <span className="asm-hint">upload</span>
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
}
