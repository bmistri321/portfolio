import React, { useState } from 'react';
import { supabaseAuth, getSupabaseConfig, getStoredSession, saveSupabaseConfig, saveStoredSession } from '../lib/supabase';
import { ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

function ArtShapes() {
  return (
    <div className="bm-art" aria-hidden="true">
      <span className="a-blue-circle" />
      <span className="a-indigo-semi" />
      <span className="a-coral" />
      <span className="a-lav-semi" />
      <span className="a-dots" />
      <span className="a-pink-blob" />
      <span className="a-wedge" />
      <span className="a-sky-semi" />
      <span className="a-tri" />
    </div>
  );
}

function Shell({ headline, children }) {
  return (
    <div className="bm-login-root">
      <ArtShapes />
      <div className="bm-login-left">
        <div className="bm-login-card">
          {children}
        </div>
      </div>
      <div className="bm-login-right">
        <h2 className="bm-headline">{headline}</h2>
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div className="bm-error">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

export default function AdminAuth({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
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
      if (!keepLoggedIn) {
        // Session-only login: move the session out of persistent storage.
        const session = getStoredSession();
        saveStoredSession(session, false);
      }
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

  // Supabase not connected yet — one-time setup form (no fake login).
  if (!config.isConfigured) {
    return (
      <Shell headline={<>Connect your studio.<br />Start publishing.</>}>
        <h1 className="bm-title">Connect Supabase</h1>
        <p className="bm-sub">
          Paste your project credentials to enable studio sign-in. Find both values in your
          Supabase dashboard under <strong>Project Settings &rarr; API</strong>.
        </p>
        <ErrorBox message={error} />
        <form onSubmit={handleSaveSetup}>
          <div className="bm-field">
            <input
              type="url"
              className="bm-input"
              placeholder="Project URL — https://your-project.supabase.co"
              value={setupUrl}
              onChange={(e) => setSetupUrl(e.target.value)}
              required
            />
          </div>
          <div className="bm-field">
            <input
              type="password"
              className="bm-input"
              placeholder="Anon (public) key"
              value={setupKey}
              onChange={(e) => setSetupKey(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bm-btn">
            Save &amp; Continue
            <ArrowRight size={17} />
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell headline={<>Changing the way<br />your work is seen</>}>
      <h1 className="bm-title">Login</h1>
      <ErrorBox message={error} />

      <form onSubmit={handleLogin}>
        <div className="bm-field">
          <input
            type="email"
            className="bm-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="bm-field">
          <div className="bm-pass-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              className="bm-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="bm-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <label className="bm-keep">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
          />
          Keep me logged in
        </label>

        <button type="submit" className="bm-btn" disabled={loading}>
          {loading ? 'Authenticating…' : 'Login'}
          {!loading && <ArrowRight size={17} />}
        </button>
      </form>
    </Shell>
  );
}
