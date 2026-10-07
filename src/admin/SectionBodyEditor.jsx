import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import { ensureHtml } from '../lib/miniFormat';

// Floating contextual toolbar (no boxes): headings, inline formats, quote, lists, link.
const TOOLBAR = [
  ['bold', 'italic', 'underline'],
  [{ header: [2, 3, false] }],
  ['blockquote', { list: 'bullet' }, { list: 'ordered' }],
  ['link', 'clean'],
];

// WYSIWYG section-body editor (Blogger-style). Stores HTML.
// Legacy mini-format bodies are converted to HTML on load for display.
export default function SectionBodyEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (quillRef.current || !containerRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'bubble',
      placeholder: placeholder || 'Write here...',
      modules: { toolbar: TOOLBAR },
    });

    const html = ensureHtml(value);
    if (html) {
      quill.clipboard.dangerouslyPasteHTML(html);
    }

    quill.on('text-change', () => {
      const isEmpty = quill.getText().trim().length === 0;
      onChangeRef.current(isEmpty ? '' : quill.root.innerHTML);
    });

    quillRef.current = quill;
    const containerEl = containerRef.current;
    return () => {
      quillRef.current = null;
      if (containerEl) containerEl.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="admin-quill-wrap">
      <div ref={containerRef} />
    </div>
  );
}
