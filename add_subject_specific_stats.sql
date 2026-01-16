-- Add subject-specific columns to subject_statistics
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_labs int DEFAULT 0;
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_practicals int DEFAULT 0;
ALTER TABLE public.subject_statistics ADD COLUMN IF NOT EXISTS total_tutorials int DEFAULT 0;

-- Optional: Comments for clarity
COMMENT ON COLUMN public.subject_statistics.total_labs IS 'Specific for Physics and Chemistry';
COMMENT ON COLUMN public.subject_statistics.total_practicals IS 'Specific for Computer Programming';
COMMENT ON COLUMN public.subject_statistics.total_tutorials IS 'Specific for Math subjects (Calculus, Linear Algebra)';

SELECT 'Subject-specific columns added successfully' as status;
