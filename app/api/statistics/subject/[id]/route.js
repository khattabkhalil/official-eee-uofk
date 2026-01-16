import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Fetch stats for specific subject
        const { data: stats, error } = await supabase
            .from('subject_statistics')
            .select('*')
            .eq('subject_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found' which might happen if initialized lazily

        const defaultStats = {
            total_lectures: 0,
            total_assignments: 0,
            total_exams: 0,
            total_sheets: 0,
            total_references: 0,
            total_important_questions: 0,
            total_questions: 0,
            total_labs: 0,
            total_practicals: 0,
            total_tutorials: 0
        };

        return NextResponse.json(stats || defaultStats);

    } catch (error) {
        console.error('Error fetching subject statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        // Allowed fields
        const {
            total_lectures,
            total_assignments,
            total_exams,
            total_sheets,
            total_references,
            total_important_questions,
            total_questions,
            total_labs,
            total_practicals,
            total_tutorials
        } = body;

        const updates = {
            total_lectures: total_lectures || 0,
            total_assignments: total_assignments || 0,
            total_exams: total_exams || 0,
            total_sheets: total_sheets || 0,
            total_references: total_references || 0,
            total_important_questions: total_important_questions || 0,
            total_questions: total_questions || 0,
            total_labs: total_labs || 0,
            total_practicals: total_practicals || 0,
            total_tutorials: total_tutorials || 0,
            updated_at: new Date().toISOString()
        };

        // Upsert logic: if row missing, insert.
        // Since id is subject_id here (based on URL), wait.
        // The URL is /api/statistics/subject/[id]. [id] IS subject_id (bigint).

        const { data, error } = await supabase
            .from('subject_statistics')
            .upsert({
                subject_id: id,
                ...updates
            }, { onConflict: 'subject_id' })
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Detailed error updating subject statistics:', error.message);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
                subjectId: params.id
            },
            { status: 500 }
        );
    }
}
