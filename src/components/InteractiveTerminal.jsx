import React, { useState, useRef, useEffect } from 'react';
import { portfolioData } from '../data/portfolioData';
import { Terminal, CornerDownLeft, Sparkles, RefreshCw, Check } from 'lucide-react';

export default function InteractiveTerminal() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Welcome to bishalmistri.com developer shell v2.6.0' },
    { type: 'system', text: "Type 'help' or click quick actions below to inspect profile." },
    { type: 'command', text: 'whoami' },
    { type: 'response', text: `${portfolioData.personal.name} - ${portfolioData.personal.title}` }
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim().toLowerCase();
    if (!trimmed) return;

    if (trimmed === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    }

    const newHistory = [...history, { type: 'command', text: cmdStr }];

    if (portfolioData.terminalCommands[trimmed]) {
      newHistory.push({ type: 'response', text: portfolioData.terminalCommands[trimmed] });
    } else if (trimmed === 'whoami') {
      newHistory.push({ type: 'response', text: `${portfolioData.personal.name} — ${portfolioData.personal.title}` });
    } else {
      newHistory.push({
        type: 'error',
        text: `Command not found: '${cmdStr}'. Type 'help' to see valid commands.`
      });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(inputVal);
  };

  const quickActions = ['help', 'bio', 'skills', 'projects', 'contact', 'sudo hire', 'clear'];

  return (
    <section id="terminal" className="section" style={{ background: 'rgba(18, 18, 22, 0.4)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Terminal size={14} />
            <span>Interactive Developer Shell</span>
          </div>
          <h2>Console &amp; CLI Mode</h2>
          <p className="section-subtitle">Test out commands directly or click quick query tags</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Quick Action Badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginRight: '0.25rem' }}>
              Quick inputs:
            </span>
            {quickActions.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleCommand(cmd)}
                className="btn btn-outline btn-sm"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px'
                }}
              >
                ${cmd}
              </button>
            ))}
          </div>

          {/* Terminal Window */}
          <div className="terminal-window">
            
            {/* Window Topbar */}
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot" style={{ background: '#EF4444' }}></div>
                <div className="terminal-dot" style={{ background: '#F59E0B' }}></div>
                <div className="terminal-dot" style={{ background: '#10B981' }}></div>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
                bishal@portfolio: ~ (zsh)
              </div>
              <button
                onClick={() => setHistory([])}
                title="Clear Terminal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
              {history.map((item, idx) => (
                <div key={idx} style={{ marginBottom: '0.65rem', lineHeight: '1.5' }}>
                  {item.type === 'system' && (
                    <div style={{ color: '#64748B' }}># {item.text}</div>
                  )}
                  {item.type === 'command' && (
                    <div style={{ color: '#F1F5F9' }}>
                      <span style={{ color: '#10B981' }}>visitor@bishalmistri</span>
                      <span style={{ color: '#94A3B8' }}>:</span>
                      <span style={{ color: '#60A5FA' }}>~</span>
                      <span style={{ color: '#E2E8F0' }}>$ {item.text}</span>
                    </div>
                  )}
                  {item.type === 'response' && (
                    <div style={{ color: '#93C5FD', paddingLeft: '1rem', borderLeft: '2px solid rgba(59, 130, 246, 0.4)' }}>
                      {item.text}
                    </div>
                  )}
                  {item.type === 'error' && (
                    <div style={{ color: '#FCA5A5', paddingLeft: '1rem', borderLeft: '2px solid #EF4444' }}>
                      {item.text}
                    </div>
                  )}
                </div>
              ))}

              {/* Active Prompt Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ color: '#10B981', marginRight: '0.35rem' }}>visitor@bishalmistri</span>
                <span style={{ color: '#94A3B8', marginRight: '0.35rem' }}>:</span>
                <span style={{ color: '#60A5FA', marginRight: '0.35rem' }}>~</span>
                <span style={{ color: '#E2E8F0', marginRight: '0.5rem' }}>$</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="type a command (e.g. help)..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem'
                  }}
                  autoCapitalize="off"
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Terminal command prompt"
                />
              </form>
              <div ref={terminalEndRef} />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
