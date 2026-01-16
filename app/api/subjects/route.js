import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Fetch subjects
        const { data: subjects, error: subjError } = await supabase
            .from('subjects')
            .select('*')
            .order('code', { ascending: true });

        if (subjError) throw subjError;

        // Fetch statistics (if the table exists, otherwise handle gracefully)
        // Fetch statistics (if the table exists, otherwise handle gracefully)
        const { data: statistics, error: statError } = await supabase
            .from('subject_statistics')
            .select('*');

        // If statistics table doesn't exist or is empty, just return subjects
        const statsMap = {};
        if (statistics) {
            statistics.forEach(stat => {
                statsMap[stat.subject_id] = stat;
            });
        }

        const subjectsWithStats = subjects.map(s => {
            const stat = statsMap[s.id] || {};
            // Filter out id and created_at from stat if they conflict, though spreading usually overrides content
            // However, we want the subject fields to take precedence or coexist. 
            // The original SQL did `s.*, st.total_lectures...`
            return {
                ...s,
                total_lectures: stat.total_lectures || 0,
                total_assignments: stat.total_assignments || 0,
                total_exams: stat.total_exams || 0,
                total_sheets: stat.total_sheets || 0,
                total_references: stat.total_references || 0,
                total_important_questions: stat.total_important_questions || 0,
                total_questions: stat.total_questions || 0,
                total_labs: stat.total_labs || 0,
                total_practicals: stat.total_practicals || 0,
                total_tutorials: stat.total_tutorials || 0
            };
        });

        return NextResponse.json(subjectsWithStats);

    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { name_ar, name_en, code, description_ar, description_en, semester } = await request.json();

        if (!name_ar || !name_en || !code) {
            return NextResponse.json(
                { error: 'Name (AR), Name (EN), and Code are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('subjects')
            .insert([
                { name_ar, name_en, code, description_ar, description_en, semester: semester || 1 }
            ])
            .select();

        if (error) throw error;

        const newSubject = data[0];

        // Initialize statistics
        await supabase
            .from('subject_statistics')
            .insert([{ subject_id: newSubject.id }]);

        return NextResponse.json(newSubject, { status: 201 });

    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
