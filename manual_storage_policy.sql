-- Create a policy to allow public uploads
-- This is necessary because enabling RLS on storage.objects blocks all access by default
-- Note: 'uploads' is the name of the bucket

-- Drop existing policies if any to avoid conflict
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;

-- Create policy to allow inserting files into 'uploads' bucket for ANYONE (including unauthenticated for now, or authenticated if user prefers)
-- User request said "secure file upload" but currently getting 500 errors often means RLS blocking.
-- Given the "Login is not working" or "Dashboard button appears" implies auth state is flaky. 
-- Let's check if the user is authenticated for uploads.
-- Ideally: (bucket_id = 'uploads' AND auth.role() = 'authenticated')
-- But for debugging the 500 error which might be permission denied:

CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Allow public read access to the uploaded files
CREATE POLICY "Public Read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'uploads');

-- If we want to allow updates/deletes? Maybe not for now.

-- IMPORTANT: Enable RLS on the table if not already enabled (it usually is for storage)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
