import React, { useState } from 'react';
import SharedFooter from '../components/SharedFooter';

export default function BookPage({ onNavigate }) {
  const [downloadCount, setDownloadCount] = useState(148);
  const [showToast, setShowToast] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    setDownloadCount((prev) => prev + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);

    const pdfUrl = 'https://res.cloudinary.com/ovj5ffsn/image/upload/v1787318763/Book.pdf';
    
    // Fetch blob and trigger direct download
    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'UX_Design_Mastery_30_Days.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(pdfUrl, '_blank');
      });
  };

  const weeks = [
    {
      title: 'Week 1 - Usability Foundations',
      days: [
        { day: 'Day 01', topic: "Nielsen's 10 Heuristics - Part 1" },
        { day: 'Day 02', topic: "Nielsen's 10 Heuristics - Part 2" },
        { day: 'Day 03', topic: 'Testing Usability: Heuristic Evaluation vs. Usability Testing' },
        { day: 'Day 04', topic: "Mental Models and Jakob's Law" },
        { day: 'Day 05', topic: 'Information Architecture (IA)' }
      ]
    },
    {
      title: 'Week 2 - Understanding the User',
      days: [
        { day: 'Day 06', topic: "Nielsen's 10 Heuristics - Part 1" },
        { day: 'Day 07', topic: 'The 4 Forces of Progress' },
        { day: 'Day 08', topic: 'Job Stories (Actionable JTBD)' },
        { day: 'Day 09', topic: 'Customer Journey Mapping' },
        { day: 'Day 10', topic: 'Empathy Mapping' },
        { day: 'Day 11', topic: 'Conducting JTBD Interviews' },
        { day: 'Day 12', topic: '"How Might We" Questions' },
        { day: 'Day 13', topic: 'Wireframing and The Fidelity Spectrum' },
        { day: 'Day 14', topic: 'Outcome-Driven Innovation (ODI)' }
      ]
    },
    {
      title: 'Week 3 - Advanced Design Principles',
      days: [
        { day: 'Day 15', topic: 'Visual Hierarchy and Gestalt Principles' },
        { day: 'Day 16', topic: 'Scanning Patterns: F-Pattern and Z-Pattern' },
        { day: 'Day 17', topic: 'Color Theory & Accessibility' },
        { day: 'Day 18', topic: 'Typography and Readability' },
        { day: 'Day 19', topic: 'Grids, Layouts, and Spacing Systems' },
        { day: 'Day 20', topic: 'Microinteractions and Feedback' },
        { day: 'Day 21', topic: 'Dark Patterns: The Ethics of UX' }
      ]
    },
    {
      title: 'Week 4 - Practical Application & Review',
      days: [
        { day: 'Day 22', topic: 'The UX Audit (Heuristic Evaluation in Practice)' },
        { day: 'Day 23', topic: 'Usability Testing: The Rule of 5' },
        { day: 'Day 24', topic: 'A/B Testing (Quantitative Research)' },
        { day: 'Day 25', topic: 'Design Systems and Atomic Design' },
        { day: 'Day 26', topic: 'Developer Handoff: From Design to Code' },
        { day: 'Day 27', topic: 'The UX Case Study (Building Your Portfolio)' },
        { day: 'Day 28', topic: 'Defending Your Design: Stakeholder Management' },
        { day: 'Day 29', topic: 'The Whiteboard Challenge.' },
        { day: 'Day 30', topic: 'Graduation & Your Next Steps' }
      ]
    }
  ];

  const isBooksSubdomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('books.');

  return (
    <div className="pm-animate-in">
      <div className="pm-page" id="pm-book">
        <div className="pm-inner">
          
          {/* Back Button */}
          <a 
            className="pm-back-btn" 
            href={isBooksSubdomain ? 'https://portfolio.bishalmistri.com' : '/'} 
            onClick={(e) => {
              if (isBooksSubdomain) {
                return;
              }
              e.preventDefault();
              onNavigate('/');
            }}
          >
            <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
            <span>{isBooksSubdomain ? 'Portfolio' : 'Home'}</span>
          </a>

          {/* Hero Section */}
          <section className="pm-book-hero-layout">
            <div className="pm-hero-photo">
              <div className="pm-img-wrap pm-book-image-wrap pm-img-loaded">
                <img 
                  alt="UX Design Mastery Book Cover" 
                  src="https://res.cloudinary.com/ovj5ffsn/image/upload/v1787316099/book.img.1.png" 
                  decoding="async" 
                  loading="lazy" 
                />
              </div>
            </div>

            <div className="pm-hero-text">
              <p className="pm-hero-name">E-Book</p>
              <h1 className="pm-hero-headline">
                UX DESIGN<br />MASTERY 30 DAYS
              </h1>

              <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                <span>
                  <span style={{ textDecoration: 'line-through', color: '#a9a9a9', marginRight: '8px' }}>₹ 1000</span>
                  <strong style={{ color: '#000' }}>FREE</strong> Download
                </span>
              </div>

              <div className="pm-book-action-row">
                <button 
                  className="pm-download-btn" 
                  onClick={handleDownload}
                  style={{ border: 'none' }}
                >
                  Download
                </button>
                <div className="pm-book-copies-sold">
                  <strong style={{ color: '#000' }}>{downloadCount}</strong> Copies downloaded
                </div>
              </div>

              <div className={`pm-download-toast ${showToast ? 'show' : ''}`}>
                Thanks for downloading 😎 Enjoy the curriculum!
              </div>
            </div>
          </section>

          {/* Table of Contents */}
          <div className="pm-row pm-row--sticky">
            <div className="pm-label">Table of Contents</div>
            <div className="pm-content">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="pm-exp-item" style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                    {week.title}
                  </h3>
                  {week.days.map((item, dIdx) => (
                    <div key={dIdx} className="pm-exp-row" style={{ padding: '4px 0' }}>
                      <span className="pm-exp-type" style={{ minWidth: '70px' }}>{item.day}</span>
                      <span className="pm-exp-type" style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}>
                        {item.topic}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <SharedFooter />
    </div>
  );
}
