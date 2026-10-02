import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';
import { Mail, Send, Copy, Check, MessageSquare, Clock } from 'lucide-react';
import { Github, Linkedin, Twitter } from './Icons';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolioData.personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Mail size={14} />
            <span>Initiate Contact</span>
          </div>
          <h2>Let's Build Something Exceptional</h2>
          <p className="section-subtitle">
            Open for new software engineering roles, high-impact consulting, or architectural collaborations
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          
          {/* Left info column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#FFFFFF' }}>
                Direct Communication
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Whether you have an upcoming system architecture project, a full-time engineering opportunity, or just want to talk tech, feel free to reach out.
              </p>

              {/* Email Copy Card */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <Mail size={18} color="#3B82F6" style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#F1F5F9', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {portfolioData.personal.email}
                  </span>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="btn btn-outline btn-sm"
                  style={{ flexShrink: 0, padding: '0.35rem 0.65rem' }}
                  aria-label="Copy email address to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#10B981" />
                      <span style={{ color: '#10B981' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <Clock size={16} color="#8B5CF6" />
                  <span>Response time: Usually within 24 hours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span className="status-dot"></span>
                  <span>Current Status: Ready for new projects</span>
                </div>
              </div>
            </div>

            {/* Social Connect Matrix */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#FFFFFF' }}>
                Connect on the Web
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <a 
                  href={portfolioData.personal.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', gap: '0.35rem' }}
                  aria-label="Visit Bishal's GitHub"
                >
                  <Github size={18} />
                  <span style={{ fontSize: '0.75rem' }}>GitHub</span>
                </a>
                <a 
                  href={portfolioData.personal.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', gap: '0.35rem' }}
                  aria-label="Visit Bishal's LinkedIn"
                >
                  <Linkedin size={18} color="#60A5FA" />
                  <span style={{ fontSize: '0.75rem' }}>LinkedIn</span>
                </a>
                <a 
                  href={portfolioData.personal.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', gap: '0.35rem' }}
                  aria-label="Visit Bishal's Twitter"
                >
                  <Twitter size={18} color="#93C5FD" />
                  <span style={{ fontSize: '0.75rem' }}>Twitter</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right form column */}
          <div className="glass-panel" style={{ padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#FFFFFF' }}>
              Send a Direct Message
            </h3>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              Fill out this quick form or email me directly at contact@bishalmistri.com
            </p>

            {submitted ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Check size={24} color="#10B981" />
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Message Transmitted!
                </h4>
                <p style={{ color: '#A7F3D0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Thank you for reaching out. Bishal will review your message and reply promptly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Your Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="subject" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    placeholder="Project Inquiry / Opportunity"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Describe your goals, requirements, or inquiry..."
                    className="form-textarea"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <span>Sending Transmission...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
