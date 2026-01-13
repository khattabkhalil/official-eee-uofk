require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('Starting seed...');

    // ---- Subjects (with correct schema) ----
    const subjects = [
        { name_ar: 'الحسبان I', name_en: 'Calculus I', code: 'EGS11101', description_ar: 'مقدمة في التفاضل والتكامل', description_en: 'Introduction to Calculus', semester: 1 },
        { name_ar: 'الجبر الخطي', name_en: 'Linear Algebra', code: 'EGS11102', description_ar: 'المصفوفات والمتجهات', description_en: 'Matrices and Vectors', semester: 1 },
        { name_ar: 'الفيزياء I', name_en: 'Physics I', code: 'EGS11203', description_ar: 'الميكانيكا والخواص العامة للمادة', description_en: 'Mechanics and General Properties of Matter', semester: 1 },
        { name_ar: 'الكيمياء I', name_en: 'Chemistry I', code: 'EGS11304', description_ar: 'الكيمياء العامة', description_en: 'General Chemistry', semester: 1 },
        { name_ar: 'برمجة الحاسوب', name_en: 'Computer Programming', code: 'EGS12405', description_ar: 'مقدمة في البرمجة', description_en: 'Introduction to Programming', semester: 1 },
        { name_ar: 'اللغة العربية I', name_en: 'Arabic Language I', code: 'HUM11101', description_ar: 'النحو والصرف', description_en: 'Arabic Grammar', semester: 1 },
        { name_ar: 'الثقافة الإسلامية I', name_en: 'Islamic Culture I', code: 'HUM12302', description_ar: 'مقدمة في الثقافة الإسلامية', description_en: 'Introduction to Islamic Culture', semester: 1 },
    ];

    for (let subject of subjects) {
        // Check if exists
        const { data: existing } = await supabase.from('subjects').select('id').eq('code', subject.code).single();
        if (!existing) {
            const { data, error } = await supabase.from('subjects').insert(subject).select();
            if (error) console.log(`Subject insert error (${subject.code}):`, error.message);
            else {
                console.log('Inserted subject:', subject.name_en);
                // Init statistics
                await supabase.from('statistics').insert({ subject_id: data[0].id });
            }
        } else {
            console.log('Subject already exists:', subject.code);
        }
    }

    // ---- Users (Admins) ----
    const passwordHash = await bcrypt.hash('admin123', 10);
    const users = [
        { username: 'admin1', password_hash: passwordHash, role: 'admin' },
        { username: 'admin2', password_hash: passwordHash, role: 'admin' },
        { username: 'admin3', password_hash: passwordHash, role: 'admin' },
        { username: 'admin4', password_hash: passwordHash, role: 'admin' },
        { username: 'admin5', password_hash: passwordHash, role: 'admin' },
    ];

    for (let user of users) {
        // Check if exists
        const { data: existing } = await supabase.from('users').select('id').eq('username', user.username).single();
        if (!existing) {
            const { error } = await supabase.from('users').insert(user);
            if (error) {
                console.log(`User insert error (${user.username}):`, error.message);
            } else {
                console.log('Inserted user:', user.username);
            }
        } else {
            console.log('User already exists:', user.username);
        }
    }

    console.log('Seeding completed successfully.');
}

seed();
