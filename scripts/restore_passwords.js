const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function restore() {
    console.log("Restoring original passwords...");

    const admins = [
        { username: 'admin1', password: 'admin1_eeeuofk' },
        { username: 'admin2', password: 'admin2_eeeuofk' },
        { username: 'admin3', password: 'admin3_eeeuofk' },
        { username: 'admin4', password: 'admin4_eeeuofk' },
        { username: 'admin5', password: 'admin5_eeeuofk' },
    ];

    for (const admin of admins) {
        const hash = await bcrypt.hash(admin.password, 10);

        // Find ID first
        const { data: users } = await supabase.from('users').select('id').eq('username', admin.username);

        if (users && users.length > 0) {
            const { error } = await supabase
                .from('users')
                .update({ password_hash: hash })
                .eq('id', users[0].id);

            if (error) console.error(`Failed to update ${admin.username}:`, error.message);
            else console.log(`Restored password for ${admin.username}`);
        } else {
            console.log(`User ${admin.username} not found.`);
        }
    }
}

restore();
