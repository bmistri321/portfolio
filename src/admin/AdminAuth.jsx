import React, { useState } from 'react';
import { supabaseAuth, getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
import { Compass, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminAuth({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(() => getSupabaseConfig());
  const [setupUrl, setSetupUrl] = useState('');
  const [setupKey, setSetupKey] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await supabaseAuth.signInWithPassword(email, password);
      onAuthenticated();
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetup = (e) => {
    e.preventDefault();
    setError(null);
    saveSupabaseConfig(setupUrl, setupKey);
    const next = getSupabaseConfig();
    setConfig(next);
    if (!next.isConfigured) {
      setError('Both the Project URL and the anon key are required.');
    }
  };

  const header = (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--admin-accent), #6366f1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        marginBottom: '16px',
        boxShadow: 'var(--admin-shadow-md)'
      }}>
        <Compass size={24} />
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '6px' }}>
        Publishing Studio
      </h1>
      <p style={{ fontSize: '13.5px', color: 'var(--admin-text-secondary)' }}>
        Bishal Mistri Personal Content Management
      </p>
    </div>
  );

  const errorBox = error && (
    <div style={{
      padding: '10px 14px',
      borderRadius: 'var(--admin-radius-sm)',
      backgroundColor: 'var(--admin-danger-subtle)',
      color: 'var(--admin-danger)',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px'
    }}>
      <AlertCircle size={16} />
      <span>{error}</span>
    </div>
  );

  // Supabase not connected yet — show the one-time setup form (no fake login).
  if (!config.isConfigured) {
    return (
      <div className="admin-root" data-admin-theme="dark" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div className="admin-card" style={{ maxWidth: '420px', width: '100%', padding: '36px 32px' }}>
          {header}
          {errorBox}
          <p style={{ fontSize: '13.5px', color: 'var(--admin-text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
            Connect your Supabase project to enable studio sign-in. Find both values in your
            Supabase dashboard under <strong>Project Settings &rarr; API</strong>.
          </p>
          <form onSubmit={handleSaveSetup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Project URL</label>
              <input
                type="url"
                className="admin-form-input"
                placeholder="https://your-project.supabase.co"
                value={setupUrl}
                onChange={(e) => setSetupUrl(e.target.value)}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Anon Key</label>
              <input
                type="password"
                className="admin-form-input"
                placeholder="Supabase anon (public) key"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            >
              Save &amp; Continue
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root" data-admin-theme="dark" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="admin-card" style={{ maxWidth: '420px', width: '100%', padding: '36px 32px' }}>
        {header}
        {errorBox}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Email Address</label>
            <input
              type="email"
              className="admin-form-input"
              placeholder="contact@bishalmistri.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Enter Studio'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
