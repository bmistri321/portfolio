-- ==============================================================================
-- BISHAL MISTRI PERSONAL CMS - SCHEMA & RLS FIX MIGRATION
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. Ensure UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Update/Align Content Table Columns
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('work', 'tinkering', 'writing', 'archive')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add any missing columns safely
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Bishal Mistri';
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS previous_type TEXT;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS previous_status TEXT;

-- 3. Ensure Media Table Exists
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video', 'document', 'other')),
    mime_type TEXT,
    size_bytes BIGINT DEFAULT 0,
    alt_text TEXT,
    caption TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Indexes for High-Speed Lookups
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON public.content(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_order_index ON public.content(order_index ASC);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);

-- 5. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_content_updated_at ON public.content;
CREATE TRIGGER set_content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 7. Content Policies
DROP POLICY IF EXISTS "Public can view published content" ON public.content;
CREATE POLICY "Public can view published content"
    ON public.content FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users full access to content" ON public.content;
CREATE POLICY "Authenticated users full access to content"
    ON public.content FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Media Policies
DROP POLICY IF EXISTS "Public can view media" ON public.media;
CREATE POLICY "Public can view media"
    ON public.media FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users full access to media" ON public.media;
CREATE POLICY "Authenticated users full access to media"
    ON public.media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Storage Bucket Setup (portfolio-media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Storage Upload" ON storage.objects;
CREATE POLICY "Authenticated Storage Upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Storage Update" ON storage.objects;
CREATE POLICY "Authenticated Storage Update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Storage Delete" ON storage.objects;
CREATE POLICY "Authenticated Storage Delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media');
