import React, { useState } from 'react';
import { supabaseAuth, getSupabaseConfig, saveStoredSession } from '../lib/supabase';
import { Compass, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminAuth({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const config = getSupabaseConfig();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (config.isConfigured) {
        await supabaseAuth.signInWithPassword(email, password);
      } else {
        // Fallback local studio session if Supabase is being initialized
        saveStoredSession({
          user: { email: email || 'bishal@bishalmistri.com', role: 'admin' },
          access_token: 'local_studio_session'
        });
      }
      onAuthenticated();
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudioAccess = () => {
    saveStoredSession({
      user: { email: 'bishal@bishalmistri.com', name: 'Bishal Mistri', role: 'admin' },
      access_token: 'studio_pass_local'
    });
    onAuthenticated();
  };

  return (
    <div className="admin-root" data-admin-theme="dark" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="admin-card" style={{ maxWidth: '420px', width: '100%', padding: '36px 32px' }}>
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

        {error && (
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
        )}

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

        <div style={{ margin: '24px 0 18px', textAlign: 'center', position: 'relative' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)' }} />
          <span style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--admin-bg-surface)',
            padding: '0 12px',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--admin-text-muted)'
          }}>
            Studio Access
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickStudioAccess}
          className="admin-btn admin-btn-ghost"
          style={{ width: '100%', padding: '9px', fontSize: '13px' }}
        >
          <Lock size={14} />
          <span>Quick Admin Access (Bishal)</span>
        </button>
      </div>
    </div>
  );
}
