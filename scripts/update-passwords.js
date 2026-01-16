const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updatePasswords() {
    console.log('Starting password update...');

    const admins = [
        { username: 'admin1', password: 'admin1_eeeuofk' },
        { username: 'admin2', password: 'admin2_eeeuofk' },
        { username: 'admin3', password: 'admin3_eeeuofk' },
        { username: 'admin4', password: 'admin4_eeeuofk' },
        { username: 'admin5', password: 'admin5_eeeuofk' },
    ];

    for (const admin of admins) {
        const passwordHash = await bcrypt.hash(admin.password, 10);

        // Check if user exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', admin.username)
            .single();

        if (existing) {
            // Update
            const { error } = await supabase
                .from('users')
                .update({ password_hash: passwordHash, role: 'admin' })
                .eq('username', admin.username);

            if (error) console.error(`Error updating ${admin.username}:`, error.message);
            else console.log(`Updated password for: ${admin.username}`);
        } else {
            // Insert
            const { error } = await supabase
                .from('users')
                .insert({
                    username: admin.username,
                    password_hash: passwordHash,
                    role: 'admin'
                });

            if (error) console.error(`Error creating ${admin.username}:`, error.message);
            else console.log(`Created user: ${admin.username}`);
        }
    }
    console.log('Password update complete.');
}

updatePasswords();
