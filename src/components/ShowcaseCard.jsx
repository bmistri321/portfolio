import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ShowcaseCard({
  title,
  year,
  metric,
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
    <div className="dev-project-card-wrapper">
      <a
        href={link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="dev-project-item"
      >
        {image && (
          <div className="dev-project-img-wrap">
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="dev-project-img"
            />
          </div>
        )}

        <div className="dev-project-meta">
          <div className="dev-project-title-row">
            <h3 className="dev-project-title">
              <span>{title}</span>
              {external && <ArrowUpRight size={14} className="dev-external-icon" />}
            </h3>
            {year && <span className="dev-project-year">{year}</span>}
          </div>

          {metric && <p className="dev-project-desc">{metric}</p>}
        </div>
      </a>
    </div>
  );
}
