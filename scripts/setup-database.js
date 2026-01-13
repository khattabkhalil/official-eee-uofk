const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function setupDatabase() {
  console.log('🚀 Starting Supabase setup...');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.error('❌ Error: Supabase credentials not found in .env.local');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('📋 Seeding initial data...');

  // Subjects
  const subjects = [
    { name_ar: 'الحسبان I', name_en: 'Calculus I', code: 'EGS11101', semester: 1 },
    { name_ar: 'الجبر الخطي', name_en: 'Linear Algebra', code: 'EGS11102', semester: 1 },
    { name_ar: 'الفيزياء I', name_en: 'Physics I', code: 'EGS11203', semester: 1 },
    { name_ar: 'الكيمياء I', name_en: 'Chemistry I', code: 'EGS11304', semester: 1 },
    { name_ar: 'برمجة الحاسوب', name_en: 'Computer Programming', code: 'EGS12405', semester: 1 },
    { name_ar: 'اللغة العربية I', name_en: 'Arabic Language I', code: 'HUM11101', semester: 1 },
    { name_ar: 'الثقافة الإسلامية I', name_en: 'Islamic Culture I', code: 'HUM12302', semester: 1 }
  ];

  for (const subject of subjects) {
    const { data: existing } = await supabase.from('subjects').select('id').eq('code', subject.code).single();
    if (!existing) {
      const { data, error } = await supabase.from('subjects').insert(subject).select();
      if (!error && data[0]) {
        console.log(`✅ Subject created: ${subject.name_en}`);
        await supabase.from('statistics').insert({ subject_id: data[0].id });
      }
    }
  }

  // Admins
  const passwordHash = await bcrypt.hash('admin123', 10);
  const users = [
    { username: 'admin1', password_hash: passwordHash, role: 'admin' },
    { username: 'admin2', password_hash: passwordHash, role: 'admin' },
    { username: 'admin3', password_hash: passwordHash, role: 'admin' },
    { username: 'admin4', password_hash: passwordHash, role: 'admin' },
    { username: 'admin5', password_hash: passwordHash, role: 'admin' }
  ];

  for (const user of users) {
    const { data: existing } = await supabase.from('users').select('id').eq('username', user.username).single();
    if (!existing) {
      const { error } = await supabase.from('users').insert(user);
      if (!error) console.log(`✅ Admin created: ${user.username}`);
    }
  }

  console.log('✅ Supabase setup completed successfully!');
  console.log('Note: Ensure you have run the contents of DB_SCHEMA.sql in the Supabase SQL Editor first.');
}

if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = setupDatabase;

