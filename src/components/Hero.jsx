import React, { useState, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { ArrowRight, Mail, Sparkles, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { Github, Linkedin, Twitter } from './Icons';

export default function Hero() {
  const roles = [
    "Full Stack Software Engineer",
    "Cloud & Distributed Systems Architect",
    "React & Node.js Specialist",
    "Modern Web App Developer"
  ];
  
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timer;

    if (!isDeleting && displayText === currentRole) {
      // Pause at full word
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      // Move to next word
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
      setTypingSpeed(100);
    } else {
      // Typing or deleting
      timer = setTimeout(() => {
        setDisplayText(prev => 
          isDeleting ? currentRole.substring(0, prev.length - 1) : currentRole.substring(0, prev.length + 1)
        );
        setTypingSpeed(isDeleting ? 40 : 80);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, typingSpeed]);

  return (
    <section id="home" className="section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', paddingTop: '7rem' }}>
      <div className="bg-grid-pattern" aria-hidden="true"></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Status Pill Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <div className="status-pill status-available">
              <span className="status-dot" aria-hidden="true"></span>
              <span>{portfolioData.personal.status.text}</span>
            </div>
          </div>

          {/* STRICT SINGLE H1 TAG FOR ENTIRE PAGE (SEO Requirement) */}
          <h1 style={{ marginBottom: '1.25rem' }}>
            Hi, I'm <span className="gradient-text-blue">{portfolioData.personal.name}</span>
          </h1>

          {/* Dynamic Role Rotator */}
          <div style={{ minHeight: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ 
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', 
              fontWeight: '600', 
              color: '#E2E8F0',
              fontFamily: 'var(--font-mono)' 
            }}>
              <span style={{ color: 'var(--color-primary)' }}>&gt; </span>
              {displayText}
              <span style={{ 
                borderRight: '2px solid var(--color-primary)', 
                marginLeft: '3px',
                animation: 'pulse-dot 0.8s infinite'
              }}>&nbsp;</span>
            </span>
          </div>

          {/* Tagline Bio */}
          <p style={{ 
            fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', 
            lineHeight: 1.6, 
            color: 'var(--color-text-muted)', 
            maxWidth: '680px', 
            margin: '0 auto 2.5rem auto' 
          }}>
            {portfolioData.personal.tagline} Focused on crafting high-speed, intuitive interfaces supported by resilient, battle-tested cloud architectures.
          </p>

          {/* Action CTAs */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: '3.5rem'
          }}>
            <a href="#projects" className="btn btn-primary" aria-label="Explore Bishal's engineering projects">
              <span>View Projects</span>
              <ArrowRight size={18} />
            </a>

            <a href="#contact" className="btn btn-secondary" aria-label="Contact Bishal Mistri">
              <Mail size={18} />
              <span>Get in Touch</span>
            </a>

            <a href="#terminal" className="btn btn-outline" aria-label="Open Interactive Developer Terminal">
              <Terminal size={18} />
              <span>Interactive CLI</span>
            </a>
          </div>

          {/* Social Icons Hub */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
            <a 
              href={portfolioData.personal.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Bishal Mistri GitHub Profile"
              className="glass-panel"
              style={{ padding: '0.65rem', borderRadius: '10px', color: '#E2E8F0', display: 'flex', alignItems: 'center' }}
            >
              <Github size={20} />
            </a>
            <a 
              href={portfolioData.personal.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Bishal Mistri LinkedIn Profile"
              className="glass-panel"
              style={{ padding: '0.65rem', borderRadius: '10px', color: '#60A5FA', display: 'flex', alignItems: 'center' }}
            >
              <Linkedin size={20} />
            </a>
            <a 
              href={portfolioData.personal.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Bishal Mistri Twitter / X Profile"
              className="glass-panel"
              style={{ padding: '0.65rem', borderRadius: '10px', color: '#93C5FD', display: 'flex', alignItems: 'center' }}
            >
              <Twitter size={20} />
            </a>
            <a 
              href={`mailto:${portfolioData.personal.email}`}
              aria-label="Email Bishal Mistri"
              className="glass-panel"
              style={{ padding: '0.65rem', borderRadius: '10px', color: '#34D399', display: 'flex', alignItems: 'center' }}
            >
              <Mail size={20} />
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            textAlign: 'left'
          }}>
            {portfolioData.personal.stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="glass-panel"
                style={{ padding: '1.25rem 1rem', textAlign: 'center' }}
              >
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '800', 
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.25rem'
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
