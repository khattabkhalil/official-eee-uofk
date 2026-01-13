import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request, { params }) {
    try {
        const { id } = params;

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
      WHERE s.id = ?
    `, [id]);

        if (subjects.length === 0) {
            return NextResponse.json(
                { error: 'Subject not found' },
                { status: 404 }
            );
        }

        const subject = subjects[0];

        // Get resources for this subject
        const resources = await db.query(`
      SELECT r.*, a.name as added_by_name
      FROM resources r
      LEFT JOIN admins a ON r.added_by = a.id
      WHERE r.subject_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

        // Group resources by type
        const groupedResources = {
            lectures: resources.filter(r => r.type === 'lecture'),
            sheets: resources.filter(r => r.type === 'sheet'),
            assignments: resources.filter(r => r.type === 'assignment'),
            exams: resources.filter(r => r.type === 'exam'),
            references: resources.filter(r => r.type === 'reference'),
            important_questions: resources.filter(r => r.type === 'important_question')
        };

        return NextResponse.json({
            ...subject,
            resources: groupedResources
        });

    } catch (error) {
        console.error('Error fetching subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { name_ar, name_en, code, description_ar, description_en, semester } = await request.json();

        await db.query(
            `UPDATE subjects 
       SET name_ar = ?, name_en = ?, code = ?, description_ar = ?, description_en = ?, semester = ?
       WHERE id = ?`,
            [name_ar, name_en, code, description_ar, description_en, semester, id]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await db.query('DELETE FROM subjects WHERE id = ?', [id]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
