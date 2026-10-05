import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function DevWexaPage({ onNavigate }) {
  const auditProblems = [
    {
      num: 1,
      title: 'Problem: No Way to Go Back',
      desc: "The previous onboarding flow did not allow users to revisit or modify their prior answers.",
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-1.avif',
      why: 'Users often refine decisions as they understand the product better. Without back navigation, users feel trapped or abandon the onboarding entirely.',
      principle: "Nielsen's Heuristic #3: User Control & Freedom",
      impact: ['Reduced user confidence', 'Higher abandonment risk', 'Increased friction']
    },
    {
      num: 2,
      title: 'Problem: Split-Screen Onboarding Divides Attention',
      desc: 'The onboarding displayed the questionnaire alongside a preview that appeared interactive but was non-functional.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-2.avif',
      why: "Onboarding should focus on one task at a time. The faux-interactive preview creates false affordances and cognitive overload.",
      principle: "Jakob's Law & Progressive Disclosure",
      impact: ['Divided attention', 'Cognitive fatigue', 'Confusing mental model']
    },
    {
      num: 3,
      title: 'Problem: Conversational Layout Creates Visual Clutter',
      desc: 'Questions were formatted as an endless chat stream, leaving old questions cluttering the viewport.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-3.avif',
      why: 'While chat works for open-ended conversation, onboarding flows thrive on structured, linear progression.',
      principle: 'Aesthetic & Minimalist Design',
      impact: ['Harder to scan', 'Reduced clarity', 'Longer time-to-value']
    },
    {
      num: 4,
      title: 'Problem: Progress Indicator Lacks Clear Steps',
      desc: 'Only a continuous loading bar was shown with no step count or remaining duration.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-4.avif',
      why: 'Users need to know how much effort is remaining. Uncertainty breeds drop-offs.',
      principle: 'Visibility of System Status',
      impact: ['Onboarding anxiety', 'Elevated drop-off rate']
    },
    {
      num: 5,
      title: 'Problem: GitHub Integration Required Manual Tokens',
      desc: 'Users had to generate personal access tokens, copy them manually, and paste them during setup.',
      image: 'https://cdn.jsdelivr.net/gh/bmistri321/Images-web@main/Img-wexa-5.avif',
      why: 'Manual token generation adds immense friction and exposes users to permission misconfigurations.',
      principle: 'Error Prevention & Minimal Effort',
      impact: ['Setup failure points', 'High initial drop-off']
    }
  ];

  return (
    <article className="dev-page-animate">
      <header className="cs-header">
        <button
          className="cs-back-btn"
          onClick={() => onNavigate('/')}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 className="cs-title">Wexa AI (Onboarding Flow Redesign)</h1>
        <p className="cs-summary-text">
          Redesigning the onboarding and AI configuration experience for Wexa AI — transforming an ambiguous questionnaire into a streamlined 3-step activation funnel that reduced user drop-off by 42%.
        </p>

        <div className="cs-meta-grid">
          <div>
            <div className="cs-meta-label">Role &amp; Scope</div>
            <div className="cs-meta-val">Lead Product Designer</div>
          </div>
          <div>
            <div className="cs-meta-label">Timeline</div>
            <div className="cs-meta-val">2026 · Shipped</div>
          </div>
          <div>
            <div className="cs-meta-label">Core Impact</div>
            <div className="cs-meta-val">+42% Activation · -68% Setup Time</div>
          </div>
        </div>
      </header>

      <section className="cs-section">
        <h2 className="cs-section-title">The Challenge</h2>
        <p className="cs-body-p">
          Wexa AI is an intelligent developer assistant designed to automate repository workflows and code refactoring. However, initial user analytics revealed a severe drop-off during onboarding: nearly <strong>52% of signed-up users</strong> dropped off before connecting their first repository.
        </p>
        <p className="cs-body-p">
          Through user session recordings, heuristic evaluation, and interviews, I identified critical structural blockers in the flow:
        </p>
        <ul className="cs-list">
          <li><strong>Trapped Navigation:</strong> Zero ability to edit previous choices without clearing session state.</li>
          <li><strong>Cognitive Noise:</strong> Chat-bubble layout cluttered the screen with past prompts.</li>
          <li><strong>Manual Security Setup:</strong> Forcing users to generate raw GitHub PAT tokens instead of 1-click OAuth integration.</li>
        </ul>
      </section>

      <section className="cs-section">
        <div className="cs-callout">
          <strong>North Star Objective:</strong> Deliver immediate time-to-first-value in under 90 seconds by shifting from an interrogative questionnaire to progressive automated discovery.
        </div>
      </section>

      <section className="cs-section">
        <h2 className="cs-section-title">Deep Dive: Friction Points &amp; Redesigns</h2>
        
        {auditProblems.map((item) => (
          <div key={item.num} style={{ marginBottom: '40px' }}>
            <h3 className="cs-section-subtitle">{item.title}</h3>
            <p className="cs-body-p">{item.desc}</p>

            <div className="cs-image-frame">
              <img src={item.image} alt={item.title} loading="lazy" />
              <div className="cs-image-caption">
                Heuristic Evaluation: {item.principle}
              </div>
            </div>

            <p className="cs-body-p">
              <strong>Why this mattered:</strong> {item.why}
            </p>
          </div>
        ))}
      </section>

      <section className="cs-section">
        <h2 className="cs-section-title">Launch &amp; Measurable Outcomes</h2>
        <p className="cs-body-p">
          Following the staged rollout of the redesign:
        </p>
        <ul className="cs-list">
          <li><strong>42% decrease in onboarding abandonment</strong> within the first 30 days.</li>
          <li><strong>Average time-to-first-repo connected</strong> dropped from 14.2 minutes to 2.4 minutes.</li>
          <li><strong>Customer satisfaction (CSAT)</strong> for the initial setup phase rose from 3.2 to 4.8 / 5.</li>
        </ul>
      </section>

      <footer className="cs-pagination">
        <button
          className="cs-nav-link"
          onClick={() => onNavigate('/')}
        >
          <span className="cs-nav-dir">Previous</span>
          <span className="cs-nav-name">Home</span>
        </button>

        <button
          className="cs-nav-link"
          style={{ alignItems: 'flex-end' }}
          onClick={() => onNavigate('/casestudy/friender-case-study')}
        >
          <span className="cs-nav-dir">Next Case Study</span>
          <span className="cs-nav-name">Friender CRM &rarr;</span>
        </button>
      </footer>
    </article>
  );
}
