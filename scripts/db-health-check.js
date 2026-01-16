const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseHealth() {
    console.log('--- EEE UofK Database Health Check ---');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Missing environment variables in .env.local');
        return;
    }

    const supabase = createClient(url, key);

    const tables = ['subjects', 'resources', 'announcements', 'questions', 'users', 'subject_statistics'];

    for (const table of tables) {
        try {
            const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`❌ Table "${table}": ERROR (${error.message})`);
            } else {
                console.log(`✅ Table "${table}": OK (${count} rows)`);
            }
        } catch (e) {
            console.error(`❌ Table "${table}": CRASHED (${e.message})`);
        }
    }

    // specific column check for resources
    const { data: resData, error: resError } = await supabase.from('resources').select('*').limit(1);
    if (resError) {
        console.error('❌ Resource column check failed:', resError.message);
    } else if (resData && resData.length > 0) {
        const cols = Object.keys(resData[0]);
        console.log('📋 Resource Columns:', cols.join(', '));
        if (!cols.includes('type')) console.error('🔴 CRITICAL: "type" column is missing from resources!');
        if (!cols.includes('subject_id')) console.error('🔴 CRITICAL: "subject_id" column is missing from resources!');
    } else {
        console.log('ℹ️ Resources table is empty, could not verify columns.');
    }

    console.log('\n--- End of Health Check ---');
}

checkDatabaseHealth();
