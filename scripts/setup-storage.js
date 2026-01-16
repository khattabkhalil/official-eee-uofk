const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// MUST use the SERVICE_ROLE_KEY for admin privileges (bypasses RLS)
// If you don't have it in .env.local as SUPABASE_SERVICE_ROLE_KEY, check your Supabase dashboard settings -> API.
// Usually in local development with Next.js starter it might be defined differently,
// but let's try using the ANON key first if the service key is missing, 
// though typically changing bucket public status requires elevated privileges.
// Wait, the user has NEXT_PUBLIC_SUPABASE_ANON_KEY.
// We really need the SERVICE_ROLE_KEY for admin tasks like creating buckets with specific config if RLS is strict.
// Assuming the user has access to console, they can copy it.
// BUT, let's try to 'upsert' the bucket with public: true using the client we have.

// If the user's .env.local only has anon key, this script might fail on permission if RLS is strict.
// Let's assume standard setup.

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
    console.log('Setting up storage bucket "uploads"...');

    const bucketName = 'uploads';

    try {
        // 1. Try to get the bucket
        const { data: bucket, error } = await supabase.storage.getBucket(bucketName);

        if (error && error.message.includes('not found')) {
            console.log('Bucket not found. Creating...');
            // Create
            const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true, // This is the generic "Public" flag
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            });

            if (createError) {
                console.error('Error creating bucket:', createError);
            } else {
                console.log('Bucket created successfully!');
            }
        } else if (bucket) {
            console.log('Bucket exists. Updating configuration...');
            // Update to ensure it is public
            const { data, error: updateError } = await supabase.storage.updateBucket(bucketName, {
                public: true,
                fileSizeLimit: 52428800,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            });

            if (updateError) {
                console.error('Error updating bucket:', updateError);
                // Fallback: If update fails (e.g. permission), we might just hope it's already public.
            } else {
                console.log('Bucket updated to be public.');
            }
        } else {
            console.error('Error checking bucket:', error);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

setupStorage();
