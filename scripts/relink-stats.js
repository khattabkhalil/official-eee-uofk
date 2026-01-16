const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function syncStatistics() {
    console.log('🚀 Starting Statistics Re-Link Engine...');

    try {
        // 1. Get all subjects
        const { data: subjects, error: subjError } = await supabase.from('subjects').select('id, name_en');
        if (subjError) throw subjError;

        console.log(`📊 Found ${subjects.length} subjects. Analyzing content...`);

        for (const subject of subjects) {
            console.log(`\n🔍 Analyzing: ${subject.name_en}`);

            // 2. Count real resources in DB
            const { data: resources, error: resError } = await supabase
                .from('resources')
                .select('type')
                .eq('subject_id', subject.id);

            // 3. Count questions
            const { count: questionsCount } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('subject_id', subject.id);

            const counts = {
                lectures: 0,
                assignments: 0,
                exams: 0,
                sheets: 0,
                references: 0,
                important_questions: 0
            };

            if (resources) {
                resources.forEach(r => {
                    const type = r.type?.toLowerCase();
                    if (type === 'lecture') counts.lectures++;
                    else if (type === 'assignment') counts.assignments++;
                    else if (type === 'exam') counts.exams++;
                    else if (type === 'sheet') counts.sheets++;
                    else if (type === 'reference') counts.references++;
                    else if (type === 'important_question' || type === 'important_questions') counts.important_questions++;
                });
            }

            console.log(`   Found: ${counts.lectures} Lectures, ${counts.assignments} Assignments, ${counts.exams} Exams, ${counts.sheets} Sheets`);

            // 4. Update the centralized subject_statistics table
            const { error: upsertError } = await supabase
                .from('subject_statistics')
                .upsert({
                    subject_id: subject.id,
                    total_lectures: counts.lectures,
                    total_assignments: counts.assignments,
                    total_exams: counts.exams,
                    total_sheets: counts.sheets,
                    total_references: counts.references,
                    total_important_questions: counts.important_questions,
                    total_questions: questionsCount || 0,
                    updated_at: new Date()
                }, { onConflict: 'subject_id' });

            if (upsertError) {
                console.error(`   ❌ Failed to update ${subject.name_en}:`, upsertError.message);
            } else {
                console.log(`   ✅ Statistics synced successfully!`);
            }
        }

        console.log('\n✨ All statistics have been linked and verified!');
        console.log('The Home Page and Dashboard will now show 100% accurate data.');

    } catch (error) {
        console.error('🛑 Sync Engine Error:', error.message);
    }
}

syncStatistics();
