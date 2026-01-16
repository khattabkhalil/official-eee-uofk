import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing!');
}
if (!supabaseAnonKey) {
    console.error('❌ CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing!');
}

if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client or throw? 
    // Throwing is better but let's be louder in logs.
    throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
