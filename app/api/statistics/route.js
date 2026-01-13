import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        const stats = await db.query(`
            SELECT 
                s.name_ar, s.name_en, s.code,
                st.total_lectures, st.total_assignments, st.total_exams, st.total_questions
            FROM statistics st
            JOIN subjects s ON st.subject_id = s.id
        `);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
