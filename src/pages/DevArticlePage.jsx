import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import DevCaseStudyLayout from '../components/DevCaseStudyLayout';
import SharedFooter from '../components/SharedFooter';
import { contentService } from '../lib/contentService';
import DOMPurify from 'dompurify';
import { isHtml } from '../lib/miniFormat';

// ---------------------------------------------------------------------------
// Mini rich-text renderer for CMS article bodies.
// Conventions (documented in the migration SQL):
//   **bold**            -> <strong>
//   "> " block          -> callout box
//   "• "/"- " lines     -> bullet list
//   blank-line groups   -> paragraphs
// ---------------------------------------------------------------------------
function renderInline(text, keyPrefix = '') {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*(.+)\*\*$/s);
    const key = `${keyPrefix}-${i}`;
    return m
      ? <strong key={key}>{m[1]}</strong>
      : <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function renderBlocks(body) {
  const blocks = String(body || '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((block, bi) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (block.startsWith('> ')) {
      return (
        <div key={bi} className="cs-callout" style={{ margin: '16px 0' }}>
          {renderInline(block.replace(/^> /, ''), `c${bi}`)}
        </div>
      );
    }
    if (lines.length > 0 && lines.every((l) => l.startsWith('• ') || l.startsWith('- '))) {
      return (
        <ul key={bi} className="cs-list">
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^[•-] /, ''), `b${bi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="dev-detail-p">
        {renderInline(block, `p${bi}`)}
      </p>
    );
  });
}

function renderImages(images) {
  return (images || []).map((img, i) => (
    <div key={`img-${i}`} className="dev-hero-mockup-frame">
      <img
        src={img.url}
        alt={img.alt || img.caption || ''}
        className="dev-hero-mockup-img"
        loading="lazy"
        decoding="async"
      />
      {img.caption && <div className="dev-mockup-caption">{img.caption}</div>}
    </div>
  ));
}

// HTML section bodies from the WYSIWYG editor: sanitized, styled via .cs-html-body.
function renderHtmlBody(body) {
  const clean = DOMPurify.sanitize(String(body || ''), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
  return <div className="cs-html-body" dangerouslySetInnerHTML={{ __html: clean }} />;
}

// Section body: HTML (WYSIWYG) preferred, legacy mini-format as fallback.
function renderSectionBody(body) {
  return isHtml(body) ? renderHtmlBody(body) : renderBlocks(body);
}

const RICH_ALLOWED = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
    'blockquote', 'h2', 'h3', 'img', 'figure', 'figcaption', 'video', 'source', 'hr', 'div'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'controls', 'preload', 'class', 'data-sentiment'],
};

// Split a unified article document at its H2s into nav-able pseudo-sections.
// Content before the first H2 becomes an "Overview" section.
function splitArticleHtml(html) {
  const doc = new DOMParser().parseFromString(`<div>${String(html || '')}</div>`, 'text/html');
  const root = doc.body.firstChild;
  const sections = [];
  let cur = null;
  const startSection = (id, label, heading) => {
    cur = { id, label, heading, parts: [] };
    sections.push(cur);
  };
  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeName === 'H2') {
      startSection(slugId(node.textContent), node.textContent.trim(), true);
    } else {
      if (!cur) startSection('overview', 'Overview', false);
      cur.parts.push(node.outerHTML !== undefined ? node.outerHTML : node.textContent);
    }
  });
  return sections
    .filter((s) => s.parts.join('').trim().length > 0)
    .map((s) => ({
      id: s.id,
      label: s.label,
      heading: s.heading ? s.label : null,
      html: DOMPurify.sanitize(s.parts.join(''), RICH_ALLOWED),
    }));
}

// Render one unified-document chunk as sanitized HTML.
function renderArticleChunk(html) {
  return <div className="cs-html-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

const slugId = (t) =>
  String(t || 'section')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

// ---------------------------------------------------------------------------
// Rich case-study article rendered from CMS fields:
// title / metadata.year / metadata.readingTime / metadata.lead[] /
// cover_image + metadata.heroCaption / metadata.sections[] {title, body, images[]}
// ---------------------------------------------------------------------------
function RichArticle({ item, onNavigate }) {
  const md = item.metadata || {};

  const useUnified = item.content && item.content.trim().length > 0;
  const sections = useUnified
    ? splitArticleHtml(item.content).map((sec) => ({
        id: sec.id,
        label: sec.label,
        heading: sec.heading,
        content: renderArticleChunk(sec.html),
      }))
    : (md.sections || []).map((sec) => ({
        id: slugId(sec.title),
        label: sec.title,
        heading: sec.title,
        content: (
          <>
            {renderSectionBody(sec.body)}
            {renderImages(sec.images)}
          </>
        ),
      }));

  return (
    <DevCaseStudyLayout
      title={item.title}
      heroVisual={
        item.cover_image
          ? { image: item.cover_image, alt: item.title }
          : null
      }
      sections={sections}
      onNavigate={onNavigate}
    />
  );
}

// ---------------------------------------------------------------------------
// Generic article fallback (items without structured sections)
// ---------------------------------------------------------------------------
function GenericArticle({ item, onNavigate }) {
  return (
    <div className="dev-page-animate">
      <header className="cs-header" style={{ marginBottom: '32px' }}>
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '16px 0 8px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ec4899', fontWeight: 600 }}>
            {item.type}
          </span>
        </div>

        <h1 className="cs-title" style={{ fontSize: '32px', lineHeight: 1.25 }}>
          {item.title}
        </h1>
      </header>

      {item.cover_image && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '36px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {item.content && (
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#E5E7EB', whiteSpace: 'pre-line', marginBottom: '40px' }}>
          {item.content}
        </div>
      )}

      <SharedFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Router: fetch once, render the rich layout when the item has structured
// sections, otherwise the generic article.
// ---------------------------------------------------------------------------
export default function DevArticlePage({ slug, onNavigate }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setFailed(false);
        const data = await contentService.getBySlug(slug);
        if (!cancelled) {
          setItem(data);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="dev-page-animate" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>Loading case study...</p>
      </div>
    );
  }

  if (failed || !item) {
    return (
      <div className="dev-page-animate" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Piece Not Found</h2>
        <p style={{ color: '#9CA3AF' }}>This project may be in draft mode or not yet published.</p>
      </div>
    );
  }

  const rich =
    (item.content && item.content.trim().length > 0) ||
    (item.metadata?.sections && item.metadata.sections.length > 0);
  return rich
    ? <RichArticle item={item} onNavigate={onNavigate} />
    : <GenericArticle item={item} onNavigate={onNavigate} />;
}
