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
    <div className="sanmid-project-card-wrapper">
      <a
        href={link}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        className="sanmid-project-item"
      >
        {image && (
          <div className="sanmid-project-img-wrap">
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="sanmid-project-img"
            />
          </div>
        )}

        <div className="sanmid-project-meta">
          <div className="sanmid-project-title-row">
            <h3 className="sanmid-project-title">
              <span>{title}</span>
              {external && <ArrowUpRight size={14} className="sanmid-external-icon" />}
            </h3>
            {year && <span className="sanmid-project-year">{year}</span>}
          </div>

          {metric && <p className="sanmid-project-desc">{metric}</p>}
        </div>
      </a>
    </div>
  );
}
