const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassword() {
    console.log("Resetting password for 'admin1'...");

    // Hash '123456'
    const newHash = await bcrypt.hash('123456', 10);

    const { data: users, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('username', 'admin1');

    if (findError) {
        console.error("Error finding user:", findError);
        return;
    }

    if (users.length === 0) {
        console.log("User 'admin1' not found. Creating it...");
        const { error: createError } = await supabase.from('users').insert({
            username: 'admin1',
            password_hash: newHash,
            role: 'admin'
        });
        if (createError) console.error("Error creating user:", createError);
        else console.log("User 'admin1' created with password '123456'");
    } else {
        const user = users[0];
        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHash })
            .eq('id', user.id);

        if (updateError) console.error("Error updating password:", updateError);
        else console.log("Password for 'admin1' reset to '123456'");
    }
}

fixPassword();
