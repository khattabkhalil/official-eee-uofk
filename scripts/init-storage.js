const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initStorage() {
    console.log('Initializing storage...');

    const bucketName = 'uploads';

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const exists = buckets.find(b => b.name === bucketName);

    if (exists) {
        console.log(`Bucket '${bucketName}' already exists.`);
        // Try updating it strictly or ensuring public
        const { data, error } = await supabase.storage.updateBucket(bucketName, {
            public: true,
            fileSizeLimit: 83886080, // 80MB
            allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });
        if (error) console.log('Error updating bucket:', error.message);
        else console.log('Bucket updated to public.');
    } else {
        console.log(`Creating bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 83886080,
            allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });

        if (error) console.error('Error creating bucket:', error);
        else console.log('Bucket created successfully.');
    }
}

initStorage();
