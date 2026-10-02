import React from 'react';
import SharedFooter from '../components/SharedFooter';

export default function CaseStudyPage({ onNavigate }) {
  return (
    <div className="pm-animate-in">
      <div className="pm-page" id="pm-cs">
        <div className="pm-inner">
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Case study</div>
            <div className="pm-content">
              
              {/* Case Study 1: Friender */}
              <div className="pm-cs-item">
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'inherit', width: '100%' }}>
                  <a 
                    className="pm-cs-link" 
                    href="/casestudy/friender-case-study"
                    onClick={(e) => { e.preventDefault(); onNavigate('/casestudy/friender-case-study'); }}
                  >
                    <div className="pm-cs-title-row">
                      <span className="pm-cs-title">How my AI solution saving users time and effort</span>
                      <span className="pm-arrow">
                        <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </svg>
                      </span>
                    </div>
                    <span className="pm-cs-meta">Tier5 | B2B CRM Case study</span>
                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></span>
                  </a>
                  <div className="pm-case-study-single-image pm-img-loaded">
                    <img 
                      alt="Friender AI Solution Case study cover" 
                      src="https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Cover.avif" 
                      decoding="async" 
                      loading="lazy" 
                    />
                  </div>
                </div>
              </div>

              {/* Case Study 2: Wexa */}
              <div className="pm-cs-item">
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'inherit', width: '100%' }}>
                  <a 
                    className="pm-cs-link" 
                    href="/casestudy/wexa"
                    onClick={(e) => { e.preventDefault(); onNavigate('/casestudy/wexa'); }}
                  >
                    <div className="pm-cs-title-row">
                      <span className="pm-cs-title">Wexa AI Onboarding Flow Redesign</span>
                      <span className="pm-arrow">
                        <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        </svg>
                      </span>
                    </div>
                    <span className="pm-cs-meta">Independent UX Audit &amp; Concept Redesign</span>
                    <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}></span>
                  </a>
                  <div className="pm-case-study-single-image pm-img-loaded">
                    <img 
                      alt="Wexa AI Onboarding Case study cover" 
                      src="https://res.cloudinary.com/ovj5ffsn/image/upload/v1787147929/cover.avif" 
                      decoding="async" 
                      loading="lazy" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <SharedFooter />
    </div>
  );
}
