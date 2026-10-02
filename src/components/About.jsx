import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { Zap, ShieldCheck, Sparkles, Cpu, Layers, Server } from 'lucide-react';

export default function About() {
  const iconMap = {
    "Performance First": <Zap size={24} color="#3B82F6" />,
    "Resilient Architecture": <ShieldCheck size={24} color="#10B981" />,
    "Intuitive UX & Clean Code": <Sparkles size={24} color="#8B5CF6" />
  };

  return (
    <section id="about" className="section" style={{ background: 'rgba(18, 18, 22, 0.4)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Cpu size={14} />
            <span>Biography &amp; Core Focus</span>
          </div>
          <h2>{portfolioData.about.heading}</h2>
          <p className="section-subtitle">{portfolioData.about.subheading}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          marginBottom: '4rem'
        }}>
          
          {/* Bio Text Column */}
          <div className="glass-panel" style={{ padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              Full Stack Engineer with a Passion for Performance
            </h3>
            {portfolioData.about.bio.map((para, i) => (
              <p key={i} style={{ marginBottom: '1.25rem', lineHeight: '1.7', color: 'var(--color-text-muted)' }}>
                {para}
              </p>
            ))}

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border)'
            }}>
              <span className="tech-chip">📍 {portfolioData.personal.location}</span>
              <span className="tech-chip">🚀 React &amp; Next.js</span>
              <span className="tech-chip">⚡ Node &amp; Distributed APIs</span>
              <span className="tech-chip">☁️ GCP &amp; Containers</span>
            </div>
          </div>

          {/* Quick Highlight Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {portfolioData.about.principles.map((principle, index) => (
              <div 
                key={index}
                className="glass-panel glass-panel-interactive"
                style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
              >
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {iconMap[principle.title] || <Layers size={24} color="#3B82F6" />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: '#FFFFFF' }}>
                    {principle.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
