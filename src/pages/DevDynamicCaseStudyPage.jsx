import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Calendar, User, Briefcase, Clock, Tag } from 'lucide-react';
import { contentService } from '../lib/contentService';
import SharedFooter from '../components/SharedFooter';

export default function DevDynamicCaseStudyPage({ slug, onNavigate }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);
        const data = await contentService.getBySlug(slug);
        setItem(data);
      } catch (err) {
        console.error('Failed to load case study by slug:', err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [slug]);

  if (loading) {
    return (
      <div className="dev-page-animate" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>Loading case study...</p>
      </div>
    );
  }

  if (!item) {
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

        {/* Tags */}
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

      {/* Cover Image */}
      {item.cover_image && (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', marginBottom: '36px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Project Metadata Grid */}
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

      {/* Main Content Body */}
      <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#E5E7EB', whiteSpace: 'pre-line', marginBottom: '40px' }}>
        {item.content}
      </div>

      {/* Modular Case Study Sections */}
      {item.metadata?.sections && item.metadata.sections.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }}>
          {item.metadata.sections.map((sec, idx) => (
            <div key={idx} style={{ padding: '24px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: '#FFFFFF' }}>
                {sec.title}
              </h3>
              <p style={{ fontSize: '15px', color: '#9CA3AF', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* External Project Links */}
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
