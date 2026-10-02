import React from 'react';
import SharedFooter from '../components/SharedFooter';

export default function WexaCaseStudyPage({ onNavigate }) {
  const tools = [
    { name: 'Figma', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-figma.svg' },
    { name: 'Claude', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-claude.svg' },
    { name: 'Gemini', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-gemini.svg' },
    { name: 'Hotjar', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-hotjar.svg' },
    { name: 'Jira', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-jira.svg' },
    { name: 'Zoom', src: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/soft-img-zoom.svg' }
  ];

  const auditProblems = [
    {
      num: 1,
      title: 'Problem: No Way to Go Back',
      desc: "The onboarding flow doesn't allow users to revisit or modify their previous answers.",
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-1.avif',
      why: 'Users often refine their decisions as they learn more about the product. Without a way to go back, they may feel trapped, lose confidence in their choices, or restart the onboarding entirely.',
      principle: "Nielsen's Heuristic - User Control & Freedom",
      impact: ['Reduced user confidence', 'Higher abandonment risk', 'Increased frustration']
    },
    {
      num: 2,
      title: 'Problem: Split-Screen Onboarding Divides Attention',
      desc: 'The onboarding displays the questionnaire alongside a profile preview that appears interactive.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
      why: "Users expect onboarding to focus on one task at a time. The preview competes for attention and suggests interactions that aren't available, creating unnecessary cognitive load and confusion.",
      principle: "Jakob's Law • Progressive Disclosure • False Affordance",
      impact: ['Divided attention', 'Increased cognitive load', 'Confusing onboarding experience']
    },
    {
      num: 3,
      title: 'Problem: Conversational Layout Creates Visual Noise',
      desc: 'Questions are presented in a chat-style interface, showing previous messages throughout the onboarding process.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-3.avif',
      why: 'While conversational layouts work well for messaging apps, onboarding benefits from a structured, step-by-step flow. Displaying previous questions adds visual clutter without helping users complete the task.',
      principle: 'Aesthetic & Minimalist Design • Progressive Disclosure',
      impact: ['Harder to scan information', 'Reduced focus', 'Longer completion time']
    },
    {
      num: 4,
      title: 'Problem: Progress Indicator Lacks Context',
      desc: 'The onboarding only displays a progress bar without indicating the current step or the total number of steps.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-4.avif',
      why: 'Users are more comfortable completing tasks when they understand how much work remains. Without clear progress information, the process feels uncertain and potentially longer than it actually is.',
      principle: 'Visibility of System Status',
      impact: ['Increased onboarding anxiety', 'Higher drop-off rate', 'Lower user confidence']
    },
    {
      num: 5,
      title: 'Problem: GitHub Integration Requires Manual Setup',
      desc: 'Users must generate a GitHub personal access token, copy it manually, and enter their username during setup.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-5.avif',
      why: 'Manual configuration increases effort and introduces opportunities for mistakes. A lengthy setup process can discourage users from completing onboarding, especially when simpler authentication methods are widely available.',
      principle: 'Reduce User Effort • Error Prevention',
      impact: ['Slower onboarding', 'Increased setup errors', 'Higher abandonment rate']
    }
  ];

  const solutions = [
    {
      num: 1,
      title: 'Solution: Introduced a Focused, Step-by-Step Flow',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-new-1.avif',
      changes: [
        'Redesigned the onboarding into a single-question-per-screen experience.',
        'Removed the side-by-side profile preview from the onboarding flow.',
        'Introduced a cleaner visual hierarchy with one clear primary action.'
      ],
      why: 'Presenting one task at a time helps users focus on the current decision without unnecessary distractions. This approach aligns with familiar onboarding patterns and reduces cognitive load.',
      principles: "Jakob's Law • Progressive Disclosure • Aesthetic & Minimalist Design"
    },
    {
      num: 2,
      title: 'Solution: Introduced a Focused, Step-by-Step Flow',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-new-2.avif',
      changes: [
        'Added Previous and Skip actions to every onboarding step.',
        'Enabled users to navigate freely between steps without losing progress.'
      ],
      why: 'Giving users control over their journey reduces anxiety and allows them to revisit or modify previous decisions whenever needed.',
      principles: 'User Control & Freedom • Error Prevention'
    },
    {
      num: 3,
      title: 'Solution: Introduced a Focused, Step-by-Step Flow',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-new-3.avif',
      changes: [
        'Added a progress indicator with explicit step numbers (e.g., Step 2 of 5).',
        'Kept progress visible throughout the onboarding process.'
      ],
      why: 'Displaying clear progress helps users understand how much of the onboarding remains, making the experience feel shorter and more predictable.',
      principles: 'Visibility of System Status'
    },
    {
      num: 4,
      title: 'Solution: Introduced a Focused, Step-by-Step Flow',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-new-4.avif',
      changes: [
        'Replaced the manual GitHub Personal Access Token setup with OAuth authentication.',
        'Eliminated the need to manually enter usernames and tokens.'
      ],
      why: 'A one-click authentication flow significantly reduces setup effort, minimizes configuration errors, and creates a smoother onboarding experience.',
      principles: 'Reduce User Effort • Error Prevention'
    },
    {
      num: 5,
      title: 'Solution: Introduced a Focused, Step-by-Step Flow',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-new-5.avif',
      changes: [
        'Introduced a final review screen displaying all collected information.',
        'Added Edit actions for each section, allowing users to make changes before completing setup.'
      ],
      why: 'Separating the review process from the onboarding questions keeps users focused during setup while still providing an opportunity to verify and refine their information before submission.',
      principles: 'User Control & Freedom • Recognition Rather Than Recall'
    }
  ];

  return (
    <div className="pm-animate-in">
      <div className="pm-page" id="pm-wexa">
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
              Wexa AI <u>Onboarding</u> Flow Independent UX Audit and Improvised <u>Redesign</u>
            </h1>

            {/* Goal statement */}
            <div className="fcs-item">
              <div className="fcs-item-title">Goal statement</div>
              <p className="fcs-desc-single">
                This is an independent concept case study created to identify usability issues and redesign the Wexa AI onboarding flow. The goal is to reduce friction, improve usability and accessibility, and create a more intuitive onboarding experience. This project is not affiliated with or commissioned by Wexa AI.
              </p>
            </div>

            {/* Project details */}
            <div className="fcs-meta">
              <div className="fcs-meta-col">
                <div className="fcs-meta-item"><span className="fcs-meta-label">Project type</span><span className="fcs-meta-value">UX Audit</span></div>
                <div className="fcs-meta-item"><span className="fcs-meta-label">My role</span><span className="fcs-meta-value">UX Audit, UX Research, UI Design</span></div>
                <div className="fcs-meta-item"><span className="fcs-meta-label">Duration</span><span className="fcs-meta-value">2 Days</span></div>
              </div>
              <div className="fcs-meta-col">
                <div className="fcs-meta-item"><span className="fcs-meta-label">Team</span><span className="fcs-meta-value">1 Designer</span></div>
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

            {/* Cover image */}
            <div className="fcs-image pm-img-loaded">
              <img alt="Wexa Case Study Cover banner" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-cover.avif" decoding="async" loading="lazy" />
            </div>

            {/* UX Audit Section */}
            <div className="fcs-bridge">
              UX <u>Audit</u>
            </div>
            <p className="fcs-desc-single">
              During my audit of the existing onboarding flow, I identified several usability issues that increased cognitive load, created unnecessary friction, and made the setup process feel longer than necessary. I evaluated the experience using Nielsen's Heuristics, Jakob's Law, and established UX best practices.
            </p>

            {/* Problems 1-5 */}
            {auditProblems.map((prob) => (
              <div key={prob.num} className="fcs-item">
                <div className="fcs-image">
                  <div className="fcs-screen-label">
                    <div className="fcs-screen-num">{prob.num}</div>
                    <div className="fcs-screen-title">{prob.title}</div>
                    <p className="fcs-desc-single">{prob.desc}</p>
                  </div>
                  <img alt={`Problem ${prob.num}`} src={prob.image} decoding="async" loading="lazy" />
                </div>
                <div className="fcs-desc-2col">
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">Why it Matters</span>
                    <span className="fcs-meta-value">{prob.why}</span>
                  </div>
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">UX Principle</span>
                    <span className="fcs-meta-value">{prob.principle}</span>
                  </div>
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">Impact</span>
                    {prob.impact.map((imp, i) => (
                      <span key={i} className="fcs-meta-value">• {imp}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* User Journey */}
            <div className="fcs-bridge">
              User <u>Journey</u>
            </div>
            <div className="fcs-image pm-img-loaded">
              <img alt="Wexa User Journey Map" src="https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-journey-map.jpg" decoding="async" loading="lazy" />
            </div>

            {/* Design Strategy */}
            <div className="fcs-bridge">
              Design <u>Strategy</u>
            </div>
            <div className="fcs-item">
              <p className="fcs-desc-single">
                The UX audit revealed that the existing onboarding experience introduced unnecessary friction, divided users' attention, and lacked a sense of control. Rather than addressing each issue individually, I established a set of design principles to guide every design decision.
              </p>
              <div className="fcs-desc-2col">
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-label">One Task at a Time</span>
                  <span className="fcs-meta-value">Presenting one question per screen eliminates competing visual elements and lets users focus entirely on the immediate decision.</span>
                </div>
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-label">Give Users Control</span>
                  <span className="fcs-meta-value">Users should always feel in control. Clear Previous, Skip, and Edit actions allow easy navigation without feeling trapped.</span>
                </div>
                <div className="fcs-meta-item2">
                  <span className="fcs-meta-label">Reduce Cognitive Load</span>
                  <span className="fcs-meta-value">Removing visual clutter, improving hierarchy, and progressively disclosing options reduces mental fatigue.</span>
                </div>
              </div>
            </div>

            {/* Redesign Experience */}
            <div className="fcs-bridge">
              Redesign <u>Experience</u>
            </div>
            <p className="fcs-desc-single">
              Applying the design strategy, I restructured the onboarding flow into a focused, step-by-step experience.
            </p>

            {/* Solutions 1-5 */}
            {solutions.map((sol) => (
              <div key={sol.num} className="fcs-item">
                <div className="fcs-image">
                  <div className="fcs-screen-label">
                    <div className="fcs-screen-num">{sol.num}</div>
                    <div className="fcs-screen-title">{sol.title}</div>
                  </div>
                  <img alt={`Solution ${sol.num}`} src={sol.image} decoding="async" loading="lazy" />
                </div>
                <div className="fcs-desc-2col">
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">What Changed</span>
                    {sol.changes.map((ch, cIdx) => (
                      <span key={cIdx} className="fcs-meta-value">• {ch}</span>
                    ))}
                  </div>
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">Why</span>
                    <span className="fcs-meta-value">{sol.why}</span>
                  </div>
                  <div className="fcs-meta-item2">
                    <span className="fcs-meta-label">UX Principles Applied</span>
                    <span className="fcs-meta-value">{sol.principles}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Outcome */}
            <div className="fcs-bridge">
              Final <u>Outcome</u>
            </div>
            <p className="fcs-desc-single">
              The redesigned onboarding transforms a conversation-based, multi-focus experience into a guided, step-by-step workflow, dramatically improving completion rate, clarity, and trust.
            </p>
            <div className="fcs-desc-2col">
              <div className="fcs-meta-item2">
                <span className="fcs-meta-label">Expected Impact</span>
                <span className="fcs-meta-value">• Reduced cognitive load through progressive disclosure.</span>
                <span className="fcs-meta-value">• Faster onboarding by simplifying authentication with OAuth.</span>
                <span className="fcs-meta-value">• Improved user confidence with clear navigation and review options.</span>
                <span className="fcs-meta-value">• Clearer progress visibility, reducing uncertainty and drop-off.</span>
              </div>
            </div>

            <div className="fcs-meta-item2">
              <span className="fcs-meta-label"><b>Thank you</b> for visiting</span>
            </div>

          </div>
        </div>
      </div>

      <SharedFooter />
    </div>
  );
}
