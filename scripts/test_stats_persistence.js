const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Use SERVICE_KEY if available for higher privilege testing, but usually API uses ANON.
// Let's test with ANON to replicate API environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStats() {
    console.log("--- Testing Statistics Persistence ---");

    // 1. Get a subject
    const { data: subjects, error: subjError } = await supabase.from('subjects').select('id, name_en').limit(1);
    if (subjError || !subjects.length) {
        console.error("No subjects found:", subjError);
        return;
    }

    const subject = subjects[0];
    console.log(`Target Subject: ${subject.name_en} (ID: ${subject.id})`);

    // 2. Read current stats
    const { data: initialStats, error: readError } = await supabase
        .from('subject_statistics')
        .select('*')
        .eq('subject_id', subject.id)
        .single();

    if (readError) {
        console.log("No initial stats found (or error). Creating logic handles this? Error:", readError.message);
    } else {
        console.log("Initial Lectures Count:", initialStats.total_lectures);
    }

    // 3. TARGET VALUE
    const targetValue = Math.floor(Math.random() * 1000);
    console.log(`Attempting to update Lectures to: ${targetValue}`);

    // 4. Perform Update (mimics PUT route logic)
    const { data: updated, error: updateError } = await supabase
        .from('subject_statistics')
        .upsert({
            subject_id: subject.id,
            total_lectures: targetValue,
            updated_at: new Date()
        }, { onConflict: 'subject_id' })
        .select()
        .single();

    if (updateError) {
        console.error("❌ Update FAILED:", updateError.message);
        console.log("Hint: This might be RLS (Row Level Security).");
    } else {
        console.log("✅ Update call successful. Returned:", updated.total_lectures);

        // 5. Verify Persistence by reading again completely separately
        const { data: verify, error: verifyError } = await supabase
            .from('subject_statistics')
            .select('*')
            .eq('subject_id', subject.id)
            .single();

        if (verifyError) console.error("Verify read error:", verifyError);
        else {
            console.log(`🔎 Verified Read from DB: ${verify.total_lectures}`);
            if (verify.total_lectures === targetValue) {
                console.log("SUCCESS: Database persisted the value.");
            } else {
                console.error("FAILURE: Database returned different value!", verify.total_lectures);
            }
        }
    }
}

testStats();
