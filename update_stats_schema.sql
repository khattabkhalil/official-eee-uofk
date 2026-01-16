-- Add missing columns to subject_statistics
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_sheets int DEFAULT 0;
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_references int DEFAULT 0;
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_important_questions int DEFAULT 0;

-- Optional: If you want to keep 'total_questions' (from questions table) in the stats table for performance
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_questions int DEFAULT 0;

SELECT 'Statistics table updated with new columns' as status;
