import React from 'react';

export default function SharedFooter() {
  return (
    <div className="pm-page pm-footer-block">
      <div className="pm-inner">
        
        {/* Resume Section */}
        <div className="pm-row pm-row--sticky">
          <div className="pm-label">Resume</div>
          <div className="pm-content">
            <a 
              className="pm-resume-link" 
              href="https://raw.githack.com/bmistri321/resume/main/Bishal_Mistri_Resume_Final.pdf" 
              rel="noopener noreferrer" 
              target="_blank"
            >
              <span>Download</span>
              <span className="pm-arrow">
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </span>
            </a>
            <p className="pm-resume-desc">My 2026 product design resume</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="pm-row pm-row--sticky">
          <div className="pm-label">Contact</div>
          <div className="pm-content">
            <div className="pm-phone">+91 7908903895</div>
            <div className="pm-email-block">
              <a className="pm-email-row" href="mailto:hello@bishalmistri.com">
                <span className="pm-email-label">hello@bishalmistri.com</span>
                <span className="pm-arrow">
                  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
              <p className="pm-email-desc">I prefer to read email over other forms of communication. Feel free to reach out.</p>
            </div>
            
            {/* Socials Grid */}
            <div className="pm-socials-grid">
              <div className="pm-social-col">
                <a className="pm-social-link" href="https://instagram.com/bishalsphotos" rel="noopener noreferrer" target="_blank">
                  <span className="pm-link-text">Instagram</span>
                </a>
                <a className="pm-social-link" href="https://behance.net/bishalmistri" rel="noopener noreferrer" target="_blank">
                  <span className="pm-link-text">Behance</span>
                </a>
              </div>
              <div className="pm-social-col">
                <a className="pm-social-link" href="https://linkedin.com/in/bishalmistri" rel="noopener noreferrer" target="_blank">
                  <span className="pm-link-text">Linkedin</span>
                </a>
                <a className="pm-social-link" href="https://x.com/iambishalmistri" rel="noopener noreferrer" target="_blank">
                  <span className="pm-link-text">X</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Footer text */}
        <div className="pm-footer">
          <p className="pm-footer-text">© Bishal Mistri 2026. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
