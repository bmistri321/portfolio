import React from 'react';
import SharedFooter from '../components/SharedFooter';

export default function HomePage({ onNavigate }) {
  return (
    <div className="pm-animate-in">
      <div className="pm-page">
        <div className="pm-inner">
          
          {/* HERO SECTION */}
          <section className="pm-hero">
            <div className="pm-hero-text">
              <p className="pm-hero-name">Bishal Mistri</p>
              <h1 className="pm-hero-headline">
                I'm micro observer, identifying micro pain points, design smarter, more efficient solutions.
              </h1>
            </div>
            <div className="pm-hero-photo">
              <div className="pm-img-wrap pm-img-loaded">
                <img 
                  alt="Bishal Mistri" 
                  decoding="async" 
                  loading="lazy" 
                  src="https://res.cloudinary.com/ovj5ffsn/image/upload/v1787150915/bishal_mistri.avif" 
                />
              </div>
            </div>
          </section>

          {/* ABOUT ROW */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">About</div>
            <div className="pm-content pm-story">
              <p className="pm-story-text">
                Product Designer with 5+ years of experience delivering end-to-end, user-centered digital experiences for B2B SaaS platforms serving US and global clients. Skilled in product discovery, systems thinking, and translating complex workflows into scalable, accessible solutions. Adept at stakeholder alignment, cross-functional collaboration (PM, Eng, QA), and shipping production-ready designs in agile environments.
              </p>
              <a 
                className="pm-portfolio-link" 
                href="/about" 
                onClick={(e) => { e.preventDefault(); onNavigate('/about'); }}
              >
                <span className="pm-link-text">More about me</span>
                <span className="pm-arrow">
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* CASE STUDY PREVIEW ROW */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Case study</div>
            <div className="pm-content">
              
              {/* Case 1: Friender */}
              <div className="pm-project-item">
                <a 
                  className="pm-project-link" 
                  href="/casestudy/friender-case-study"
                  onClick={(e) => { e.preventDefault(); onNavigate('/casestudy/friender-case-study'); }}
                >
                  <div className="pm-project-title-row">
                    <span className="pm-project-title">How my AI solution saving users time and effort</span>
                    <span className="pm-arrow">
                      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </div>
                  <span className="pm-project-meta">Tier5 | B2B CRM</span>
                </a>
              </div>

              {/* Case 2: Wexa */}
              <div className="pm-project-item">
                <a 
                  className="pm-project-link" 
                  href="/casestudy/wexa"
                  onClick={(e) => { e.preventDefault(); onNavigate('/casestudy/wexa'); }}
                >
                  <div className="pm-project-title-row">
                    <span className="pm-project-title">Wexa AI Onboarding Flow Redesign</span>
                    <span className="pm-arrow">
                      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </div>
                  <span className="pm-project-meta">Independent UX Audit &amp; Concept Redesign</span>
                </a>
              </div>

              <a 
                className="pm-portfolio-link" 
                href="/casestudy"
                onClick={(e) => { e.preventDefault(); onNavigate('/casestudy'); }}
              >
                <span className="pm-link-text">All case study</span>
                <span className="pm-arrow">
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* SHARED FOOTER */}
      <SharedFooter />
    </div>
  );
}
