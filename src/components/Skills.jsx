import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { Code, Server, Database, Cloud, CheckCircle2, Layers } from 'lucide-react';

export default function Skills() {
  const [activeTab, setActiveTab] = useState('all');

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code': return <Code size={20} color="#3B82F6" />;
      case 'Server': return <Server size={20} color="#10B981" />;
      case 'Database': return <Database size={20} color="#8B5CF6" />;
      case 'Cloud': return <Cloud size={20} color="#38BDF8" />;
      default: return <Layers size={20} color="#3B82F6" />;
    }
  };

  const displayedCategories = activeTab === 'all'
    ? portfolioData.skills.categories
    : portfolioData.skills.categories.filter(c => c.id === activeTab);

  return (
    <section id="skills" className="section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Layers size={14} />
            <span>Core Capabilities</span>
          </div>
          <h2>{portfolioData.skills.heading}</h2>
          <p className="section-subtitle">{portfolioData.skills.subheading}</p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '3rem'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Disciplines
          </button>
          {portfolioData.skills.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`btn btn-sm ${activeTab === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {displayedCategories.map((category) => (
            <div key={category.id} className="glass-panel" style={{ padding: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getCategoryIcon(category.icon)}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>
                  {category.name}
                </h3>
              </div>

              {/* Skill list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {category.items.map((skill, idx) => (
                  <div key={idx} style={{
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#F1F5F9', fontSize: '0.95rem' }}>
                        {skill.name}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: skill.level === 'Expert' ? '#34D399' : '#60A5FA',
                        fontWeight: '600',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: skill.level === 'Expert' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                      }}>
                        {skill.level}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {skill.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-subtle)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
