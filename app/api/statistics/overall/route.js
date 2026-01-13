import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        // Get overall statistics sums
        // Note: Supabase doesn't have a direct SUM(all) like SQL without RPC, 
        // but we can fetch the statistics table and sum in JS for reasonable data sizes,
        // or use RPC if the user allowed it. For simplicity and robustness with the existing schema:
        const { data: stats, error: statsError } = await supabase
            .from('statistics')
            .select('total_lectures, total_sheets, total_assignments, total_exams, total_references, total_questions');

        if (statsError) throw statsError;

        const totals = stats.reduce((acc, curr) => ({
            totalLectures: acc.totalLectures + (curr.total_lectures || 0),
            totalSheets: acc.totalSheets + (curr.total_sheets || 0),
            totalAssignments: acc.totalAssignments + (curr.total_assignments || 0),
            totalExams: acc.totalExams + (curr.total_exams || 0),
            totalReferences: acc.totalReferences + (curr.total_references || 0),
            totalQuestions: acc.totalQuestions + (curr.total_questions || 0)
        }), {
            totalLectures: 0,
            totalSheets: 0,
            totalAssignments: 0,
            totalExams: 0,
            totalReferences: 0,
            totalQuestions: 0
        });

        const { count, error: countError } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        return NextResponse.json({
            ...totals,
            totalSubjects: count || 0
        });

    } catch (error) {
        console.error('Error fetching overall statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
