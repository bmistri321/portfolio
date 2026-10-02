import React from 'react';
import SharedFooter from '../components/SharedFooter';

export default function FrienderCaseStudyPage({ onNavigate }) {
  const tools = [
    { name: 'Figma', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-figma.svg' },
    { name: 'Claude', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-claude.svg' },
    { name: 'Gemini', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-gemini.svg' },
    { name: 'Hotjar', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-hotjar.svg' },
    { name: 'Jira', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-jira.svg' },
    { name: 'Zoom', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-zoom.svg' }
  ];

  const problemImages = [
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-1.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-2.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-3.avif'
  ];

  const solutionImages = [
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-4.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-5.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-6.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-7.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-8.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-9.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-10.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-11.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-12.avif',
    'https://cdn.jsdelivr.net/gh/bmistri321/casestudy-2@main/Fri-casestudy-13.avif'
  ];

  return (
    <div className="pm-animate-in">
      <div className="pm-page" id="pm-friender">
        <div className="pm-inner">
          <div className="fcs-wrap">
            
            {/* Back Button */}
            <a 
              className="pm-back-btn" 
              href="/casestudy" 
              onClick={(e) => { e.preventDefault(); onNavigate('/casestudy'); }}
            >
              <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
              <span>Back</span>
            </a>

            {/* Title */}
            <h1 className="fcs-title">
              How my <u>AI</u> solution <u>saving</u> users <u>time</u> and <u>effort</u>
            </h1>

            {/* Meta */}
            <div className="fcs-meta">
              <div className="fcs-meta-col">
                <div className="fcs-meta-item">
                  <span className="fcs-meta-label">Project type</span>
                  <span className="fcs-meta-value">B2B SaaS CRM</span>
                </div>
                <div className="fcs-meta-item">
                  <span className="fcs-meta-label">My role</span>
                  <span className="fcs-meta-value">Product Designer</span>
                </div>
                <div className="fcs-meta-item">
                  <span className="fcs-meta-label">Duration</span>
                  <span className="fcs-meta-value">2 Weeks</span>
                </div>
              </div>

              <div className="fcs-meta-col">
                <div className="fcs-meta-item">
                  <span className="fcs-meta-label">Team</span>
                  <span className="fcs-meta-value">1 Designer, 1 PM, 4 Engineers</span>
                </div>
                <div className="fcs-meta-item">
                  <span className="fcs-meta-label">Tools</span>
                  <div className="fcs-tools">
                    {tools.map((t, idx) => (
                      <img key={idx} alt={t.name} src={t.src} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* What this software does */}
            <div className="fcs-item">
              <div className="fcs-item-title">What this software (FRIENDER) does?</div>
              <p className="fcs-desc-single">
                This software called Friender. A organic marketing software. This software helps businesses get organic reach to their product or services through promotion on social media platforms like Facebook.
              </p>
            </div>

            {/* About case study */}
            <div className="fcs-item">
              <div className="fcs-item-title">About case study</div>
              <div className="fcs-desc-2col">
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-value">
                    In this case study my focus will be showing a module design and how I have understood a core problem and delivered a user-friendly solution.
                  </span>
                </div>
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-value">
                    The module name is Post scheduler. This module uses AI to understand the user's product and needs, creating Facebook posts that save time and increase conversions.
                  </span>
                </div>
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-value">
                    Also, later I have shared how I created variables and components, establishing an automated design system to ensure consistency and maintain a single source of truth.
                  </span>
                </div>
              </div>
            </div>

            {/* Bridge: Problem */}
            <div className="fcs-bridge">
              Without further delay,<br />
              let's drive straight into the <u>Problem</u>
            </div>

            {/* Problem Gallery */}
            <div className="pm-bottom-gallery">
              {problemImages.map((src, idx) => (
                <img key={idx} alt={`Friender Problem Slide ${idx + 1}`} src={src} decoding="async" loading="lazy" />
              ))}
            </div>

            {/* Bridge: Solution */}
            <div className="fcs-bridge">
              Without further delay,<br />
              let's drive straight into the <u>solution</u>
            </div>

            {/* Solution Gallery */}
            <div className="pm-bottom-gallery">
              {solutionImages.map((src, idx) => (
                <img key={idx} alt={`Friender Solution Slide ${idx + 1}`} src={src} decoding="async" loading="lazy" />
              ))}
            </div>

          </div>
        </div>
      </div>

      <SharedFooter />
    </div>
  );
}
