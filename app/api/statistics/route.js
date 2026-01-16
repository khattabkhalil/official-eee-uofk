import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { data: stats, error } = await supabase
            .from('subject_statistics')
            .select(`
                total_lectures, total_assignments, total_exams, 
                total_labs, total_practicals, total_tutorials,
                subjects:subject_id (
                    name_ar, name_en, code
                )
            `);

        if (error) throw error;

        const flattened = stats.map(s => ({
            name_ar: s.subjects?.name_ar,
            name_en: s.subjects?.name_en,
            code: s.subjects?.code,
            total_lectures: s.total_lectures,
            total_assignments: s.total_assignments,
            total_exams: s.total_exams,
            total_labs: s.total_labs,
            total_practicals: s.total_practicals,
            total_tutorials: s.total_tutorials
        }));

        return NextResponse.json(flattened);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
