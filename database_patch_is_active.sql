-- PATCH SCRIPT: Fix missing columns and handle schema mismatches
-- Run this in your Supabase SQL Editor.

-- 1. Fix Announcements table: add 'is_active'
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Fix Questions table: rename or add 'image_path' to match API
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='image_url') THEN
        ALTER TABLE public.questions RENAME COLUMN image_url TO image_path;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='image_path') THEN
        ALTER TABLE public.questions ADD COLUMN image_path text;
    END IF;
END $$;

-- 3. Ensure Resources has all needed columns
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS description_ar text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS source text;

-- 4. Verify RLS (Row Level Security) for public access
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access Announcements" ON public.announcements;
CREATE POLICY "Public Read Access Announcements" ON public.announcements FOR SELECT USING (is_active = true);

-- 5. Give Admin full access
DROP POLICY IF EXISTS "Admin All Access Announcements" ON public.announcements;
CREATE POLICY "Admin All Access Announcements" ON public.announcements USING (true) WITH CHECK (true);

SELECT 'Database patch applied successfully! No more "is_active" errors.' as status;
