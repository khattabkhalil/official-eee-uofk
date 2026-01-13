import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const db = require('@/lib/db');



export async function POST(request) {
    try {
        const formData = await request.formData();

        const subject_id = formData.get('subject_id');
        const type = formData.get('type');
        const title_ar = formData.get('title_ar');
        const title_en = formData.get('title_en');
        const description_ar = formData.get('description_ar');
        const description_en = formData.get('description_en');
        const source = formData.get('source');
        const file_url = formData.get('file_url');
        const added_by = formData.get('added_by');
        const file = formData.get('file');

        if (!subject_id || !type || !title_ar || !title_en) {
            return NextResponse.json(
                { error: 'Subject ID, type, and titles are required' },
                { status: 400 }
            );
        }

        let file_path = null;
        let file_size = null;
        let file_type = null;

        // Handle file upload
        if (file && file instanceof File) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');

            // Create upload directory if it doesn't exist
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${Date.now()}-${file.name}`;
            const filePath = path.join(uploadDir, fileName);

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fs.writeFileSync(filePath, buffer);

            file_path = `/uploads/${fileName}`;
            file_size = file.size;
            file_type = file.type;
        }

        // Insert resource
        const result = await db.query(
            `INSERT INTO resources 
       (subject_id, type, title_ar, title_en, description_ar, description_en, 
        file_path, file_url, file_size, file_type, source, added_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subject_id, type, title_ar, title_en, description_ar, description_en,
                file_path, file_url, file_size, file_type, source, added_by]
        );

        // Update statistics
        const statField = type === 'lecture' ? 'total_lectures' :
            type === 'sheet' ? 'total_sheets' :
                type === 'assignment' ? 'total_assignments' :
                    type === 'exam' ? 'total_exams' :
                        type === 'reference' ? 'total_references' :
                            type === 'important_question' ? 'total_questions' : null;

        if (statField) {
            await db.query(
                `UPDATE statistics SET ${statField} = ${statField} + 1 WHERE subject_id = ?`,
                [subject_id]
            );
        }

        return NextResponse.json({
            id: result.insertId,
            file_path,
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject_id = searchParams.get('subject_id');
        const type = searchParams.get('type');

        let query = `
      SELECT r.*, s.name_ar as subject_name_ar, s.name_en as subject_name_en
      FROM resources r
      LEFT JOIN subjects s ON r.subject_id = s.id
      WHERE 1=1
    `;
        const params = [];

        if (subject_id) {
            query += ' AND r.subject_id = ?';
            params.push(subject_id);
        }

        if (type) {
            query += ' AND r.type = ?';
            params.push(type);
        }

        query += ' ORDER BY r.created_at DESC';

        const resources = await db.query(query, params);

        return NextResponse.json(resources);

    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
