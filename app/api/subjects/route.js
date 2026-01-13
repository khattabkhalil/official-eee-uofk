import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        const subjects = await db.query(`
      SELECT 
        s.*,
        COALESCE(st.total_lectures, 0) as total_lectures,
        COALESCE(st.total_sheets, 0) as total_sheets,
        COALESCE(st.total_assignments, 0) as total_assignments,
        COALESCE(st.total_exams, 0) as total_exams,
        COALESCE(st.total_references, 0) as total_references,
        COALESCE(st.total_questions, 0) as total_questions
      FROM subjects s
      LEFT JOIN statistics st ON s.id = st.subject_id
      ORDER BY s.code ASC
    `);

        return NextResponse.json(subjects);

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

        const result = await db.query(
            `INSERT INTO subjects (name_ar, name_en, code, description_ar, description_en, semester) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name_ar, name_en, code, description_ar || null, description_en || null, semester || 1]
        );

        // Initialize statistics for the new subject
        await db.query(
            'INSERT INTO statistics (subject_id) VALUES (?)',
            [result.insertId]
        );

        return NextResponse.json({
            id: result.insertId,
            name_ar,
            name_en,
            code,
            description_ar,
            description_en,
            semester
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
