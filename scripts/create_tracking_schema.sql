-- ==============================================================================
-- BISHAL MISTRI PORTFOLIO - VISITOR TRACKING SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- before the /data page can show anything. It creates ONE table,
-- public.site_visits, and nothing else.
--
-- Privacy by design: locations are approximate (city-level, from Vercel
-- geo headers) and the raw visitor IP is never stored — api/track.js
-- stores only its SHA-256 hash. There is NO public SELECT policy, so
-- visitor data is never readable anonymously; only a signed-in admin
-- (authenticated) or the service role can read it.
-- ==============================================================================

-- 1. Enable UUID Extension (same pattern as init_cms_schema.sql)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Site Visits Table
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone TEXT,
    device TEXT,
    browser TEXT,
    os TEXT,
    screen TEXT,
    language TEXT,
    ip_hash TEXT,
    duration_seconds INTEGER,
    max_scroll INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Indexes for the /data dashboard queries
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor_id ON public.site_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_country ON public.site_visits(country);
CREATE INDEX IF NOT EXISTS idx_site_visits_page_path ON public.site_visits(page_path);

-- 4. Enable Row Level Security
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- 5. Explicit grants (Supabase no longer auto-grants new tables, 2026-10-30:
-- without these, inserts fail with 42501 "permission denied for table").
-- Anonymous visitors may ONLY insert (that is how /api/track writes);
-- they may NOT select, update, or delete.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT INSERT ON public.site_visits TO anon;
GRANT ALL ON public.site_visits TO authenticated, service_role;

-- 6. RLS Policies — deliberately NO public/anon SELECT policy.
DROP POLICY IF EXISTS "Anonymous visitors can insert site visits" ON public.site_visits;
CREATE POLICY "Anonymous visitors can insert site visits"
    ON public.site_visits FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to site visits" ON public.site_visits;
CREATE POLICY "Authenticated users full access to site visits"
    ON public.site_visits FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
