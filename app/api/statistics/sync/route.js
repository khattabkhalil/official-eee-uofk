import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        // 1. Get all subjects
        const { data: subjects, error: subjError } = await supabase.from('subjects').select('id, name_en');
        if (subjError) throw subjError;

        const results = [];

        for (const subject of subjects) {
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

            if (!upsertError) {
                results.push({ id: subject.id, success: true });
            }
        }

        return NextResponse.json({ success: true, count: results.length });

    } catch (error) {
        console.error('🛑 Sync Route Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
