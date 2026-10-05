import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function SanmidFrienderPage({ onNavigate }) {
  const solutionImages = [
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-4.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-5.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-6.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-7.avif'
  ];

  return (
    <article className="animate-fade-in">
      <header className="cs-header">
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="cs-title">Friender CRM (AI Lead Automation)</h1>
        <p className="cs-summary-text">
          Designing an automated social CRM platform that helps enterprise sales reps and agency founders filter, organize, and engage qualified leads effortlessly.
        </p>

        <div className="cs-meta-grid">
          <div>
            <div className="cs-meta-label">Role</div>
            <div className="cs-meta-val">Lead UI/UX Designer</div>
          </div>
          <div>
            <div className="cs-meta-label">Timeline</div>
            <div className="cs-meta-val">2025 · Shipped</div>
          </div>
          <div>
            <div className="cs-meta-label">Impact</div>
            <div className="cs-meta-val">50k+ Active Reps · ~3.5h Saved / Week</div>
          </div>
        </div>
      </header>

      <section className="cs-section">
        <h2 className="cs-section-title">The Problem</h2>
        <p className="cs-body-p">
          Sales professionals spend up to 40% of their workday manually scrolling through social channels, copying contact info into spreadsheets, and drafting repetitive follow-up messages.
        </p>
        <p className="cs-body-p">
          Friender required a lightweight, non-intrusive extension interface that could work seamlessly on top of social platforms without blocking primary navigation.
        </p>
      </section>

      <section className="cs-section">
        <h2 className="cs-section-title">Design Solutions &amp; Workflow Optimization</h2>
        
        <div className="cs-callout">
          <strong>Key Insight:</strong> Power users rely heavily on rapid keyboard shortcuts and batch operations rather than multi-step modal dialogues.
        </div>

        {solutionImages.map((img, idx) => (
          <div key={idx} className="cs-image-frame">
            <img src={img} alt={`Friender CRM Solution Screenshot ${idx + 1}`} loading="lazy" />
            <div className="cs-image-caption">
              Workflow Phase {idx + 1}: Automated Lead Tagging &amp; Message Queue Interface
            </div>
          </div>
        ))}
      </section>

      <section className="cs-section">
        <h2 className="cs-section-title">Results &amp; Feedback</h2>
        <ul className="cs-list">
          <li><strong>Over 50,000 active users</strong> onboarded across agencies and outbound teams.</li>
          <li><strong>Average time spent per outbound campaign</strong> decreased by 65%.</li>
          <li><strong>Net Promoter Score (NPS)</strong> increased from +24 to +58.</li>
        </ul>
      </section>

      <footer className="cs-pagination">
        <button
          className="cs-nav-link"
          onClick={() => onNavigate('/casestudy/wexa')}
        >
          <span className="cs-nav-dir">&larr; Previous</span>
          <span className="cs-nav-name">Wexa AI</span>
        </button>

        <button
          className="cs-nav-link"
          style={{ alignItems: 'flex-end' }}
          onClick={() => onNavigate('/dock')}
        >
          <span className="cs-nav-dir">Next</span>
          <span className="cs-nav-name">My Dock &rarr;</span>
        </button>
      </footer>
    </article>
  );
}
