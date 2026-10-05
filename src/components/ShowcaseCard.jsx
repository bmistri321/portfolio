import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ShowcaseCard({
  title,
  year,
  metric,
  tags = [],
  image,
  link,
  external = false,
  onNavigate
}) {
  const handleClick = (e) => {
    if (external) return;
    if (onNavigate && link) {
      e.preventDefault();
      onNavigate(link);
    }
  };

  return (
    <a
      href={link}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      className="showcase-card"
    >
      {image && (
        <div className="showcase-preview-container">
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="showcase-preview-img"
          />
        </div>
      )}

      <div className="showcase-details">
        <div className="showcase-top-row">
          <div className="showcase-title">
            <span>{title}</span>
            {external && <ArrowUpRight size={15} color="var(--text-muted)" />}
          </div>
          {year && <span className="showcase-badge">{year}</span>}
        </div>

        {metric && <p className="showcase-metric">{metric}</p>}

        {tags.length > 0 && (
          <div className="showcase-tags">
            {tags.map((tag) => (
              <span key={tag} className="showcase-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
