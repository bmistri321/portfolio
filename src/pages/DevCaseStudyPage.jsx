import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { contentService, CONTENT_LIST_SELECT } from '../lib/contentService';

// Case-study index: rendered from the CMS so it always matches the admin panel.
export default function DevCaseStudyPage({ onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const items = await contentService.getAll({ type: 'work', status: 'published', select: CONTENT_LIST_SELECT });
        if (cancelled) return;
        setProjects(
          items.map((i) => ({
            id: i.id,
            title: i.title,
            year: i.metadata?.year || new Date(i.published_at || i.created_at).getFullYear().toString(),
            metric: i.excerpt || i.metadata?.client || 'Interactive product design & systems architecture',
            image: i.cover_image || '',
            link: i.metadata?.link || i.metadata?.projectUrl || `/casestudy/${i.slug}`,
          }))
        );
      } catch (err) {
        console.warn('Could not load case studies:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="dev-page-animate dev-page-bounce">
      <header className="cs-header">
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="cs-title">Selected Case Studies</h1>
        <p className="cs-summary-text">
          Deep dives into complex product design, systems architecture, and AI interaction workflows.
        </p>
      </header>

      {loading ? (
        <p style={{ color: '#9CA3AF', padding: '40px 0', textAlign: 'center' }}>Loading case studies...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: '#9CA3AF', padding: '40px 0', textAlign: 'center' }}>
          No case studies published yet. Publish work items in the admin studio.
        </p>
      ) : (
        <div className="dev-cards-grid">
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              onClick={(e) => {
                if (project.link.startsWith('/')) {
                  e.preventDefault();
                  onNavigate(project.link);
                }
              }}
              className="dev-project-card"
            >
              {project.image ? (
                <div className="dev-card-img-box">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    decoding="async"
                    className="dev-card-img"
                  />
                </div>
              ) : null}
              <div className="dev-card-info">
                <div className="dev-card-title-row">
                  <h3 className="dev-card-title">{project.title}</h3>
                  {project.year && <span className="dev-year-badge">{project.year}</span>}
                </div>
                {project.metric && <p className="dev-card-metric">{project.metric}</p>}
              </div>
            </a>
          ))}
        </div>
      )}

      <footer className="dev-footer-row" style={{ marginTop: '48px' }}>
        <div>
          Built with <span className="dev-footer-bold">React</span> and <span className="dev-footer-bold">Antigravity</span>
        </div>
        <div className="dev-footer-name">Bishal</div>
      </footer>
    </div>
  );
}
