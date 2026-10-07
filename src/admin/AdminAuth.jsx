import React, { useState } from 'react';
import { supabaseAuth, getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';
import { Compass, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminAuth({ onAuthenticated }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [config, setConfig] = useState(() => getSupabaseConfig());
  const [setupUrl, setSetupUrl] = useState('');
  const [setupKey, setSetupKey] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await supabaseAuth.signInWithPassword(email, password);
        onAuthenticated();
      } else {
        const res = await supabaseAuth.signUp(email, password);
        if (res.access_token) {
          onAuthenticated();
        } else {
          setSuccessMsg('Account created! If confirmation is required, please check your email or proceed to sign in.');
          setMode('signin');
        }
      }
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
        Bishal Mistri Portfolio Control Center
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

  const successBox = successMsg && (
    <div style={{
      padding: '10px 14px',
      borderRadius: 'var(--admin-radius-sm)',
      backgroundColor: 'var(--admin-success-subtle)',
      color: 'var(--admin-success)',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '20px'
    }}>
      <span>{successMsg}</span>
    </div>
  );

  // Supabase not connected yet — show the one-time setup form.
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
        {successBox}

        <div style={{ display: 'flex', background: 'var(--admin-bg-surface-elevated)', borderRadius: '8px', padding: '3px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'signin' ? 'var(--admin-bg-surface)' : 'transparent',
              color: mode === 'signin' ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)',
              boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'signup' ? 'var(--admin-bg-surface)' : 'transparent',
              color: mode === 'signup' ? 'var(--admin-text-primary)' : 'var(--admin-text-secondary)',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Admin
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            {loading ? (mode === 'signin' ? 'Authenticating...' : 'Creating Account...') : (mode === 'signin' ? 'Enter Studio' : 'Create Admin Account')}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
