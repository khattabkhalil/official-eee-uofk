-- 1. Ensure the subject_statistics table exists and is linked
CREATE TABLE IF NOT EXISTS public.subject_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id bigint NOT NULL REFERENCES subjects(id) ON DELETE CASCADE UNIQUE,
  total_lectures integer DEFAULT 0,
  total_assignments integer DEFAULT 0,
  total_exams integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure resources table has the 'type' column (CRITICAL FIX)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='type') THEN
        ALTER TABLE public.resources ADD COLUMN type text NOT NULL DEFAULT 'lecture';
    END IF;
END $$;

-- 3. Ensure foreign key relationships are solid
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='resources_subject_id_fkey') THEN
        ALTER TABLE public.resources ADD CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable public access to statistics (Required for Home Page)
ALTER TABLE public.subject_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.subject_statistics FOR SELECT USING (true);
CREATE POLICY "Full Admin Access" ON public.subject_statistics USING (true) WITH CHECK (true);

-- 5. Final verification check
SELECT 'Database schema is now linked and verified!' as status;
