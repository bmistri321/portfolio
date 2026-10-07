import React, { useState } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';

export default function PreviewModal({ item, onClose }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' or 'mobile'

  if (!item) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div className="admin-preview-frame-wrap" onClick={(e) => e.stopPropagation()}>
        {/* Preview Topbar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--admin-border)',
          backgroundColor: 'var(--admin-bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text-primary)' }}>
              Live Portfolio Preview
            </span>
            <span className={`admin-pill admin-pill-${item.status}`}>
              {item.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--admin-bg-surface-elevated)',
              borderRadius: 'var(--admin-radius-sm)',
              padding: '2px',
              border: '1px solid var(--admin-border)'
            }}>
              <button
                type="button"
                className={`admin-btn-ghost admin-btn-sm ${viewport === 'desktop' ? 'active' : ''}`}
                onClick={() => setViewport('desktop')}
                title="Desktop Viewport"
                style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: viewport === 'desktop' ? 'var(--admin-bg-surface)' : 'transparent' }}
              >
                <Monitor size={15} />
              </button>
              <button
                type="button"
                className={`admin-btn-ghost admin-btn-sm ${viewport === 'mobile' ? 'active' : ''}`}
                onClick={() => setViewport('mobile')}
                title="Mobile Viewport"
                style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: viewport === 'mobile' ? 'var(--admin-bg-surface)' : 'transparent' }}
              >
                <Smartphone size={15} />
              </button>
            </div>

            <button
              type="button"
              className="admin-btn-ghost admin-btn-icon"
              onClick={onClose}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview Body Canvas */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#ececef',
          display: 'flex',
          justifyContent: 'center',
          padding: viewport === 'mobile' ? '30px 16px' : '40px 24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: viewport === 'mobile' ? '390px' : '760px',
            backgroundColor: '#ffffff',
            border: viewport === 'mobile' ? '1px solid #e4e4e7' : '1px solid #e4e4e7',
            borderRadius: viewport === 'mobile' ? '28px' : '12px',
            padding: viewport === 'mobile' ? '28px 20px' : '32px 28px',
            color: '#18181b',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
            boxShadow: viewport === 'mobile' ? '0 20px 50px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.06)',
            minHeight: '100%'
          }}>
            {/* Cover Image */}
            {item.cover_image && (
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
                <img src={item.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Header / Title */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a1a1aa' }}>
                  {item.type}
                </span>
                <span style={{ color: '#52525b' }}>•</span>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  {item.metadata?.readingTime || '2 min read'}
                </span>
              </div>

              <h1 style={{ fontSize: viewport === 'mobile' ? '26px' : '36px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '12px' }}>
                {item.title || 'Untitled Piece'}
              </h1>

              {item.excerpt && (
                <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '16px' }}>
                  {item.excerpt}
                </p>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {item.tags.map((t) => (
                    <span key={t} style={{ fontSize: '11.5px', padding: '3px 9px', borderRadius: '9999px', backgroundColor: '#f0f0f3', color: '#52525b', border: '1px solid #e4e4e7' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e4e4e7', margin: '28px 0' }} />

            {/* Content Body Rendering */}
            <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#3f3f46', whiteSpace: 'pre-line' }}>
              {item.content || 'No content written yet.'}
            </div>

            {/* Case Study Modular Sections */}
            {item.metadata?.sections && item.metadata.sections.length > 0 && (
              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {item.metadata.sections.map((sec, idx) => (
                  <div key={idx} style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f7f7f8', border: '1px solid #e4e4e7' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: '#18181b' }}>
                      {sec.title}
                    </h3>
                    <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
