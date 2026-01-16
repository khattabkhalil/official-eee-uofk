const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeStatistics() {
    console.log('Initializing statistics for all subjects...');

    try {
        // Get all subjects
        const { data: subjects, error: subjectsError } = await supabase
            .from('subjects')
            .select('id, name_ar, code');

        if (subjectsError) {
            console.error('Error fetching subjects:', subjectsError);
            return;
        }

        console.log(`Found ${subjects.length} subjects`);

        // For each subject, ensure it has a statistics entry
        for (const subject of subjects) {
            // Check if statistics exist
            const { data: existingStats } = await supabase
                .from('subject_statistics')
                .select('*')
                .eq('subject_id', subject.id)
                .single();

            if (!existingStats) {
                console.log(`Creating statistics for: ${subject.name_ar} (${subject.code})`);

                const { error: insertError } = await supabase
                    .from('subject_statistics')
                    .insert({
                        subject_id: subject.id,
                        total_lectures: 0,
                        total_assignments: 0,
                        total_exams: 0
                    });

                if (insertError) {
                    console.error(`Error creating stats for ${subject.code}:`, insertError);
                } else {
                    console.log(`✓ Created statistics for ${subject.code}`);
                }
            } else {
                console.log(`✓ Statistics already exist for ${subject.code}`);
            }
        }

        console.log('\n✅ Statistics initialization complete!');
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

initializeStatistics();
