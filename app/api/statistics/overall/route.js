import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch and sum all stats from our linked table
        const { data: stats, error: statsError } = await supabase
            .from('subject_statistics')
            .select('*');

        if (statsError) {
            console.error('Stats Table Error:', statsError);
            return NextResponse.json({
                totalLectures: 0,
                totalAssignments: 0,
                totalExams: 0,
                totalSheets: 0,
                totalReferences: 0,
                totalQuestions: 0,
                totalSubjects: 0
            });
        }

        // Sum up the statistics
        const totals = (stats || []).reduce((acc, curr) => ({
            totalLectures: acc.totalLectures + (curr.total_lectures || 0),
            totalAssignments: acc.totalAssignments + (curr.total_assignments || 0),
            totalExams: acc.totalExams + (curr.total_exams || 0),
            totalSheets: acc.totalSheets + (curr.total_sheets || 0),
            totalReferences: acc.totalReferences + (curr.total_references || 0),
            totalImportantQuestions: acc.totalImportantQuestions + (curr.total_important_questions || 0),
            totalQuestionsStat: acc.totalQuestionsStat + (curr.total_questions || 0)
        }), {
            totalLectures: 0,
            totalAssignments: 0,
            totalExams: 0,
            totalSheets: 0,
            totalReferences: 0,
            totalImportantQuestions: 0,
            totalQuestionsStat: 0
        });

        // Get live counts for global numbers (as backup or primary for some)
        const { count: totalQuestionsLive } = await supabase.from('questions').select('*', { count: 'exact', head: true });
        const { count: totalSubjects } = await supabase.from('subjects').select('*', { count: 'exact', head: true });

        return NextResponse.json({
            totalLectures: totals.totalLectures,
            totalAssignments: totals.totalAssignments,
            totalExams: totals.totalExams,
            totalSheets: totals.totalSheets,
            totalReferences: totals.totalReferences,
            totalImportantQuestions: totals.totalImportantQuestions,
            totalQuestions: totalQuestionsLive || totals.totalQuestionsStat || 0,
            totalSubjects: totalSubjects || 0
        });

    } catch (error) {
        console.error('Final Stats Error:', error.message);
        return NextResponse.json({
            totalLectures: 0,
            totalAssignments: 0,
            totalExams: 0,
            totalSheets: 0,
            totalReferences: 0,
            totalQuestions: 0,
            totalSubjects: 0
        });
    }
}
