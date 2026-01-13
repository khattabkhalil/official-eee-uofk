import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        // Get overall statistics
        const stats = await db.query(`
      SELECT 
        SUM(total_lectures) as totalLectures,
        SUM(total_sheets) as totalSheets,
        SUM(total_assignments) as totalAssignments,
        SUM(total_exams) as totalExams,
        SUM(total_references) as totalReferences,
        SUM(total_questions) as totalQuestions
      FROM statistics
    `);

        const subjectCount = await db.query('SELECT COUNT(*) as count FROM subjects');

        return NextResponse.json({
            totalLectures: stats[0]?.totalLectures || 0,
            totalAssignments: stats[0]?.totalAssignments || 0,
            totalExams: stats[0]?.totalExams || 0,
            totalSubjects: subjectCount[0]?.count || 0,
            totalSheets: stats[0]?.totalSheets || 0,
            totalReferences: stats[0]?.totalReferences || 0,
            totalQuestions: stats[0]?.totalQuestions || 0
        });

    } catch (error) {
        console.error('Error fetching overall statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
