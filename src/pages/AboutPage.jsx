import React from 'react';
import SharedFooter from '../components/SharedFooter';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="pm-animate-in">
      <div className="pm-page" id="pm-about">
        <div className="pm-inner">
          
          {/* ABOUT STORY */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">About</div>
            <div className="pm-content pm-story">
              
              <p className="pm-story-text">
                I was born and raised in Ashoknagar, an urban town near Kolkata. From a very young age, I was deeply drawn to anything creative. Long before I knew what digital design was, I was constantly working with my hands making handmade crafts, painting, and drawing. For me, creativity wasn't just a hobby; it was my primary way of expressing myself and understanding the world around me. Those early days spent sketching and crafting from scratch laid the artistic foundation for the way I look at design today.
              </p>

              {/* Photo Set 1 */}
              <div className="pm-photos">
                <div className="pm-photo pm-img-loaded"><img alt="About childhood crafts and sketching 1" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-1.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About childhood crafts and sketching 2" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-2.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About childhood crafts and sketching 3" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-3.webp" decoding="async" loading="lazy" /></div>
              </div>

              <p className="pm-story-text">
                My academic journey was a process of continuous exploration. A pivotal shift happened back in 2015, while I was in the 10th standard, when I got my first PC. As I spent more time online, I constantly ran into frustrating user issues and clunky websites. Because I've always been someone who wants to fix things, I started looking into how I could solve these digital roadblocks myself. That curiosity led me directly to the world of UI/UX. Later, as I attended West Bengal State University (WBSU) and graduated with a degree in Arts, I realized I could perfectly combine my traditional artistic background with this new problem-solving mindset to fix the very issues I faced as a user. From there, I dove headfirst into learning the craft.
              </p>

              {/* Photo Set 2 */}
              <div className="pm-photos">
                <div className="pm-photo pm-img-loaded"><img alt="About exploration and early journey 4" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-4.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About exploration and early journey 5" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-5.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About exploration and early journey 6" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-6.webp" decoding="async" loading="lazy" /></div>
              </div>

              <p className="pm-story-text">
                Today, I bring that same childhood creativity and "fixer" mentality into my career as a UI/UX Designer. With over five years of professional experience working remotely, I specialize in transforming complex problems into seamless, user-centric digital products. My day-to-day focus ranges from architecting large-scale, scalable design systems in Figma for robust SaaS platforms to exploring innovative ways AI can streamline workflows for digital managers.
              </p>

              {/* Photo Set 3 */}
              <div className="pm-photos">
                <div className="pm-photo pm-img-loaded"><img alt="About design systems and professional journey 7" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-7.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About design systems and professional journey 8" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-8.webp" decoding="async" loading="lazy" /></div>
                <div className="pm-photo pm-img-loaded"><img alt="About design systems and professional journey 9" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/About-img-9.webp" decoding="async" loading="lazy" /></div>
              </div>

            </div>
          </div>

          {/* EXPERIENCE ROW */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Experience</div>
            <div className="pm-content">
              
              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">UI UX Designer</span>
                  <span className="pm-exp-type">Full Time - Remote</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">Tier5 | Jan 2024 - AUG 2026</span>
                  <span className="pm-exp-location">Kolkata</span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Junior UI UX Designer</span>
                  <span className="pm-exp-type">Full Time - Hybrid</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">Tier5 | Apr 2022 - Dec 2023</span>
                  <span className="pm-exp-location">Kolkata</span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Trainee UI UX Designer</span>
                  <span className="pm-exp-type">Full Time - Office</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">Tier5 | Jan 2021 - Mar 2022</span>
                  <span className="pm-exp-location">Kolkata</span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Intern UI UX Designer</span>
                  <span className="pm-exp-type">Full Time - Remote</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">Tier5 | Feb 2021 - Apr 2021</span>
                  <span className="pm-exp-location">Kolkata</span>
                </div>
              </div>

            </div>
          </div>

          {/* EDUCATION ROW */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Education</div>
            <div className="pm-content">
              
              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Google UX Design</span>
                  <a className="pm-exp-type" href="https://raw.githack.com/bmistri321/resume/main/Google_UX_Design_Certificate.pdf" rel="noopener noreferrer" target="_blank">
                    <span>Certificate</span>
                    <span className="pm-arrow">
                      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </a>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">Coursera | 2021 - 2022</span>
                  <span className="pm-exp-location"></span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">IT SMART</span>
                  <span className="pm-exp-type">Certificate</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">APLL | 2017 - 2020</span>
                  <span className="pm-exp-location"></span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Bachelor of Arts</span>
                  <span className="pm-exp-type">Degree</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">WBSU | 2017 - 2020</span>
                  <span className="pm-exp-location"></span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Higher Secondary Education</span>
                  <span className="pm-exp-type">Certificate</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">WBCHSE | 2015 - 2016</span>
                  <span className="pm-exp-location"></span>
                </div>
              </div>

              <div className="pm-exp-item">
                <div className="pm-exp-row">
                  <span className="pm-exp-title">Secondary Education</span>
                  <span className="pm-exp-type">Certificate</span>
                </div>
                <div className="pm-exp-row">
                  <span className="pm-exp-meta">WBCHSE | 2009 - 2014</span>
                  <span className="pm-exp-location"></span>
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
