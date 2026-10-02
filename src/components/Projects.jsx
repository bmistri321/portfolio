import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ExternalLink, Sparkles, FolderGit2, CheckCircle, ArrowUpRight } from 'lucide-react';
import { Github } from './Icons';

export default function Projects() {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Full Stack', 'Tools & AI', 'Backend & Systems'];

  const filteredProjects = filter === 'All'
    ? portfolioData.projects
    : portfolioData.projects.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()) || filter === 'All');

  return (
    <section id="projects" className="section" style={{ background: 'rgba(18, 18, 22, 0.3)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <FolderGit2 size={14} />
            <span>Showcase &amp; Case Studies</span>
          </div>
          <h2>Featured Engineering Projects</h2>
          <p className="section-subtitle">
            Production systems, developer tools, and high-performance cloud applications built by Bishal Mistri
          </p>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '3.5rem'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem'
        }}>
          {filteredProjects.map((project) => (
            <article 
              key={project.id} 
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Project Visual Preview Box */}
              <div 
                style={{
                  height: '180px',
                  background: 'linear-gradient(135deg, #15161C 0%, #1F2029 100%)',
                  borderBottom: '1px solid var(--color-border)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  overflow: 'hidden'
                }}
              >
                {/* SVG Mockup Element with required ALT accessibility title & description */}
                <svg 
                  viewBox="0 0 400 160" 
                  style={{ width: '100%', height: '100%', opacity: 0.85 }} 
                  role="img" 
                  aria-label={project.imageAlt}
                >
                  <title>{project.imageAlt}</title>
                  <desc>{project.description}</desc>
                  
                  {/* Subtle Grid */}
                  <pattern id={`grid-${project.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1"/>
                  </pattern>
                  <rect width="400" height="160" fill={`url(#grid-${project.id})`} />

                  {/* Browser Window Frame Preview */}
                  <rect x="20" y="15" width="360" height="135" rx="8" fill="#12131A" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                  <circle cx="35" cy="28" r="4" fill="#EF4444" opacity="0.7"/>
                  <circle cx="47" cy="28" r="4" fill="#F59E0B" opacity="0.7"/>
                  <circle cx="59" cy="28" r="4" fill="#10B981" opacity="0.7"/>
                  
                  {/* Mock content lines */}
                  <rect x="80" y="24" width="120" height="8" rx="4" fill="rgba(255, 255, 255, 0.15)" />
                  <rect x="35" y="48" width="80" height="24" rx="4" fill="rgba(59, 130, 246, 0.25)" stroke="rgba(59, 130, 246, 0.4)" />
                  <rect x="125" y="48" width="140" height="24" rx="4" fill="rgba(255, 255, 255, 0.05)" />
                  <rect x="35" y="82" width="330" height="10" rx="3" fill="rgba(255, 255, 255, 0.08)" />
                  <rect x="35" y="100" width="260" height="10" rx="3" fill="rgba(255, 255, 255, 0.08)" />
                  <rect x="35" y="118" width="180" height="10" rx="3" fill="rgba(255, 255, 255, 0.08)" />
                </svg>

                {/* Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#93C5FD'
                }}>
                  {project.badge}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    color: 'var(--color-primary)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {project.category}
                  </span>
                  
                  {/* Semantic H3 for Project Title */}
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem', color: '#FFFFFF' }}>
                    {project.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  {project.description}
                </p>

                {/* Impact Highlight */}
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.825rem',
                  color: '#6EE7B7',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#10B981' }} />
                  <span><strong>Impact:</strong> {project.impact}</span>
                </div>

                {/* Tech Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem', marginTop: 'auto' }}>
                  {project.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="tech-chip">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Card Action Links */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--color-border)'
                }}>
                  <a 
                    href={project.liveUrl} 
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    aria-label={`View live overview of ${project.title}`}
                  >
                    <span>Overview</span>
                    <ArrowUpRight size={14} />
                  </a>

                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.45rem 0.75rem' }}
                    aria-label={`View GitHub source code for ${project.title}`}
                  >
                    <Github size={16} />
                  </a>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
