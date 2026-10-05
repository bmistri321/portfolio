-- ==============================================================================
-- BISHAL MISTRI PERSONAL CMS - SUPABASE DATABASE SCHEMA & POLICIES
-- ==============================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Content Table
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

-- 3. Create Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Content Tags Junction Table
CREATE TABLE IF NOT EXISTS public.content_tags (
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

-- 5. Create Media Table
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

-- 6. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON public.content(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_featured ON public.content(featured);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- 7. Trigger for Automatic updated_at Timestamps
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

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 9. Setup RLS Policies

-- Public Read Policies (Allow anyone to read published content and associated tags/media)
DROP POLICY IF EXISTS "Public can view published content" ON public.content;
CREATE POLICY "Public can view published content"
    ON public.content FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
CREATE POLICY "Public can view tags"
    ON public.tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view content tags" ON public.content_tags;
CREATE POLICY "Public can view content tags"
    ON public.content_tags FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view media" ON public.media;
CREATE POLICY "Public can view media"
    ON public.media FOR SELECT
    USING (true);

-- Authenticated Admin Policies (Full CRUD for authenticated users)
DROP POLICY IF EXISTS "Authenticated users full access to content" ON public.content;
CREATE POLICY "Authenticated users full access to content"
    ON public.content FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to tags" ON public.tags;
CREATE POLICY "Authenticated users full access to tags"
    ON public.tags FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to content_tags" ON public.content_tags;
CREATE POLICY "Authenticated users full access to content_tags"
    ON public.content_tags FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users full access to media" ON public.media;
CREATE POLICY "Authenticated users full access to media"
    ON public.media FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 10. Storage Bucket Setup (portfolio-media)
-- Note: You can also create the 'portfolio-media' bucket in Supabase Dashboard -> Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for portfolio-media bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
CREATE POLICY "Authenticated Users Can Upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Users Can Update" ON storage.objects;
CREATE POLICY "Authenticated Users Can Update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Authenticated Users Can Delete" ON storage.objects;
CREATE POLICY "Authenticated Users Can Delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media');
