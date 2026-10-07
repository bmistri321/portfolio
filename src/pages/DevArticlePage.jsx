import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
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
    'blockquote', 'h2', 'h3', 'img', 'figure', 'figcaption', 'video', 'source'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'controls', 'preload'],
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
function RichArticle({ item, siblings, onNavigate }) {
  const md = item.metadata || {};
  const idx = siblings.findIndex((s) => s.id === item.id);
  const hasArticle = (s) =>
    (s.metadata?.sections && s.metadata.sections.length > 0) ||
    (s.content && s.content.trim().length > 0);

  let prev = null;
  let next = null;
  for (let i = idx - 1; i >= 0; i--) {
    if (hasArticle(siblings[i])) { prev = siblings[i]; break; }
  }
  for (let i = idx + 1; i < siblings.length; i++) {
    if (hasArticle(siblings[i])) { next = siblings[i]; break; }
  }
  const linkFor = (s) => s.metadata?.link || `/casestudy/${s.slug}`;
  const meta = [md.year, md.readingTime || '5 minutes read'].filter(Boolean).join(' · ');

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
      meta={meta}
      lead={
        <>
          {(md.lead || []).map((p, i) => (
            <p key={i} className="dev-detail-p">
              {renderInline(p, `lead-${i}`)}
            </p>
          ))}
        </>
      }
      heroVisual={
        item.cover_image
          ? { image: item.cover_image, caption: md.heroCaption || '', alt: item.title }
          : null
      }
      sections={sections}
      onNavigate={onNavigate}
      prevProject={prev ? { name: prev.title, link: linkFor(prev) } : undefined}
      nextProject={next ? { name: next.title, link: linkFor(next) } : undefined}
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
          <span style={{ color: '#6B7280' }}>•</span>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {item.metadata?.readingTime || '2 min read'}
          </span>
        </div>

        <h1 className="cs-title" style={{ fontSize: '32px', lineHeight: 1.25 }}>
          {item.title}
        </h1>

        {item.excerpt && (
          <p className="cs-summary-text" style={{ fontSize: '16px', lineHeight: 1.6, marginTop: '12px' }}>
            {item.excerpt}
          </p>
        )}

        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '16px' }}>
            {item.tags.map((t) => (
              <span key={t} style={{ fontSize: '11.5px', padding: '3px 10px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E5E7EB' }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {item.cover_image && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '36px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {(item.metadata?.client || item.metadata?.role || item.metadata?.year || item.metadata?.duration) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '36px'
        }}>
          {item.metadata.client && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '4px' }}>Client / Company</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#F3F4F6' }}>{item.metadata.client}</div>
            </div>
          )}
          {item.metadata.role && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '4px' }}>Role</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#F3F4F6' }}>{item.metadata.role}</div>
            </div>
          )}
          {item.metadata.year && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '4px' }}>Year</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#F3F4F6' }}>{item.metadata.year}</div>
            </div>
          )}
          {item.metadata.duration && (
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: '4px' }}>Duration</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#F3F4F6' }}>{item.metadata.duration}</div>
            </div>
          )}
        </div>
      )}

      {item.content && (
        <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#E5E7EB', whiteSpace: 'pre-line', marginBottom: '40px' }}>
          {item.content}
        </div>
      )}

      {(item.metadata?.projectUrl || item.metadata?.repoUrl || item.metadata?.demoUrl) && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {item.metadata.projectUrl && (
            <a
              href={item.metadata.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-pink-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
            >
              <span>View Live Project</span>
              <ExternalLink size={14} />
            </a>
          )}
          {item.metadata.repoUrl && (
            <a
              href={item.metadata.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-pink-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
            >
              <span>GitHub Repository</span>
              <ExternalLink size={14} />
            </a>
          )}
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
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setFailed(false);
        const [data, work] = await Promise.all([
          contentService.getBySlug(slug),
          contentService.getAll({ type: 'work', status: 'published' }),
        ]);
        if (!cancelled) {
          setItem(data);
          setSiblings(work || []);
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
    ? <RichArticle item={item} siblings={siblings} onNavigate={onNavigate} />
    : <GenericArticle item={item} onNavigate={onNavigate} />;
}
