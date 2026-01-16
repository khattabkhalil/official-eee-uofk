const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log("--- DIAGNOSTICS STARTED ---");

    // 1. Check Admin User
    console.log("\nChecking 'admin1' user...");
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'admin1');

    if (userError) {
        console.error("Error fetching user:", userError);
    } else if (users.length === 0) {
        console.error("User 'admin1' NOT FOUND.");
    } else {
        const admin = users[0];
        console.log("User 'admin1' found. ID:", admin.id);
        console.log("Role:", admin.role);
        // Verify password 'admin1_eeeuofk'
        const isMatch = await bcrypt.compare('admin1_eeeuofk', admin.password_hash);
        console.log("Password 'admin1_eeeuofk' matches?", isMatch);

        if (!isMatch) {
            console.log("Trying to reset password to 'admin1_eeeuofk'...");
            const newHash = await bcrypt.hash('admin1_eeeuofk', 10);
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: newHash })
                .eq('id', admin.id);

            if (updateError) console.error("Failed to reset password:", updateError);
            else console.log("Password reset successfully.");
        }
    }

    // 2. Check Resources and Sync Logic
    console.log("\nChecking Resources...");
    // Get a subject
    const { data: subjects } = await supabase.from('subjects').select('*').limit(1);
    if (!subjects || subjects.length === 0) {
        console.log("No subjects found.");
    } else {
        const subject = subjects[0];
        console.log(`Testing with Subject: ${subject.name_en} (${subject.id})`);

        // Count resources manually
        const { count, error: countError } = await supabase
            .from('resources')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);

        console.log(`Actual Resource Count in DB for ${subject.code}:`, count);
        if (countError) console.error("Count error:", countError);

        // Check stats
        const { data: stats } = await supabase
            .from('subject_statistics')
            .select('*')
            .eq('subject_id', subject.id)
            .single();

        console.log("Current Stats in DB:", stats);
    }
}

diagnose();
