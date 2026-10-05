import React, { useState } from 'react';
import {
  Save,
  Database,
  User,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Activity,
  ExternalLink
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

export default function SettingsPage() {
  const initialConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [anonKey, setAnonKey] = useState(initialConfig.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Author Profile State
  const [authorName, setAuthorName] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('bm_setting_author_name') || 'Bishal Mistri' : 'Bishal Mistri'));
  const [authorEmail, setAuthorEmail] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('bm_setting_author_email') || 'contact@bishalmistri.com' : 'contact@bishalmistri.com'));
  const [authorBio, setAuthorBio] = useState(() => (typeof localStorage !== 'undefined' ? localStorage.getItem('bm_setting_author_bio') || 'Product Designer & Full Stack Software Engineer' : 'Product Designer & Full Stack Software Engineer'));

  const handleSaveAll = (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, anonKey);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bm_setting_author_name', authorName);
      localStorage.setItem('bm_setting_author_email', authorEmail);
      localStorage.setItem('bm_setting_author_bio', authorBio);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopySql = () => {
    const sqlScript = `-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('work', 'tinkering', 'writing', 'archive')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    thumbnail TEXT,
    author TEXT DEFAULT 'Bishal Mistri',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archived_at TIMESTAMPTZ,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    previous_type TEXT,
    previous_status TEXT
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published content" ON public.content FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users full access to content" ON public.content FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Studio Settings</h1>
          <p className="admin-page-subtitle">
            Configure publishing credentials, author profile, and database connections.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSaveAll}
        >
          {savedSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{savedSuccess ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Settings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: 'var(--admin-accent)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Author Profile</h2>
            </div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Contact Email</label>
                <input
                  type="email"
                  className="admin-form-input"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Default Byline / Bio</label>
              <input
                type="text"
                className="admin-form-input"
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} style={{ color: 'var(--admin-sparkle)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Supabase Database & Storage</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: initialConfig.isConfigured ? 'var(--admin-success)' : 'var(--admin-warning)' }}>
              <Activity size={13} />
              <span>{initialConfig.isConfigured ? 'Connected to Live Cloud' : 'Using Studio Local Store (Configurable)'}</span>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Project URL (VITE_SUPABASE_URL)</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="https://qirpufadoruqvgubpqzx.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Anon Public Key (VITE_SUPABASE_ANON_KEY)</label>
              <input
                type="password"
                className="admin-form-input"
                placeholder="Enter your Supabase public anon key..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
              />
            </div>

            <div style={{
              backgroundColor: 'var(--admin-bg-surface-elevated)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-sm)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--admin-text-primary)' }}>
                  SQL Schema & Storage Migration Script
                </div>
                <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                  Creates tables `content`, `tags`, `media` and sets up RLS security policies.
                </div>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={handleCopySql}
              >
                {copiedSql ? <Check size={13} style={{ color: 'var(--admin-success)' }} /> : <Copy size={13} />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy Schema SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
