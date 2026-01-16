const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function findDeadColumn() {
    console.log('🧪 Diagnosing "Resources" table columns...');

    const columns = ['id', 'subject_id', 'title_ar', 'title_en', 'file_url', 'created_at', 'type', 'added_by', 'description_ar', 'description_en', 'file_path', 'file_size', 'file_type', 'source'];

    for (const col of columns) {
        const { error } = await supabase.from('resources').select(col).limit(1);
        if (error) {
            console.log(`❌ Column "${col}": MISSING or ERROR (${error.message})`);
        } else {
            console.log(`✅ Column "${col}": OK`);
        }
    }
}

findDeadColumn();
