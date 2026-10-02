import React from 'react';
import { portfolioData } from '../data/portfolioData';
import { Briefcase, Calendar, MapPin, CheckCircle2, GraduationCap } from 'lucide-react';

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Briefcase size={14} />
            <span>Career Path</span>
          </div>
          <h2>Work Experience &amp; Journey</h2>
          <p className="section-subtitle">Professional milestones, leadership roles, and academic foundation</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Timeline Wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            
            {portfolioData.experience.map((exp, index) => (
              <div key={index} className="glass-panel" style={{ padding: '2.25rem', position: 'relative' }}>
                
                {/* Header info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                      {exp.role}
                    </h3>
                    <div style={{ fontSize: '1.05rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                      {exp.company}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-subtle)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <Calendar size={13} />
                      {exp.period}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-subtle)'
                    }}>
                      <MapPin size={13} />
                      {exp.location}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  {exp.description}
                </p>

                {/* Highlights */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {exp.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.9rem', color: '#CBD5E1' }}>
                      <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: '3px' }} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                {/* Tech chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  {exp.technologies.map((tech, tIdx) => (
                    <span key={tIdx} className="tech-chip">
                      {tech}
                    </span>
                  ))}
                </div>

              </div>
            ))}

            {/* Education Card */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{
                  padding: '0.6rem',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <GraduationCap size={22} color="#A78BFA" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                    {portfolioData.education[0].degree}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {portfolioData.education[0].institution} • {portfolioData.education[0].period}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>
                <strong>Key Focus:</strong> {portfolioData.education[0].focus}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
