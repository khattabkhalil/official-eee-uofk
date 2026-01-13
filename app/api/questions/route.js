import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject_id = searchParams.get('subject_id');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        let query = `
      SELECT q.*, s.name_ar as subject_name_ar, s.name_en as subject_name_en
      FROM questions q
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE 1=1
    `;
        const params = [];

        if (subject_id) {
            query += ' AND q.subject_id = ?';
            params.push(subject_id);
        }

        if (difficulty) {
            query += ' AND q.difficulty = ?';
            params.push(difficulty);
        }

        if (search) {
            query += ' AND (q.question_text_ar LIKE ? OR q.question_text_en LIKE ? OR q.topic_ar LIKE ? OR q.topic_en LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY q.created_at DESC';

        const questions = await db.query(query, params);

        return NextResponse.json(questions);

    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const subject_id = formData.get('subject_id');
        const topic_ar = formData.get('topic_ar');
        const topic_en = formData.get('topic_en');
        const question_text_ar = formData.get('question_text_ar');
        const question_text_en = formData.get('question_text_en');
        const answer_text_ar = formData.get('answer_text_ar');
        const answer_text_en = formData.get('answer_text_en');
        const difficulty = formData.get('difficulty');
        const added_by = formData.get('added_by');
        const image = formData.get('image');

        if (!question_text_ar || !question_text_en) {
            return NextResponse.json(
                { error: 'Question text in both languages is required' },
                { status: 400 }
            );
        }

        let image_path = null;

        // Handle image upload
        if (image && image instanceof File) {
            const fs = require('fs');
            const path = require('path');

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'questions');

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${Date.now()}-${image.name}`;
            const filePath = path.join(uploadDir, fileName);

            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fs.writeFileSync(filePath, buffer);

            image_path = `/uploads/questions/${fileName}`;
        }

        const result = await db.query(
            `INSERT INTO questions 
       (subject_id, topic_ar, topic_en, question_text_ar, question_text_en, 
        answer_text_ar, answer_text_en, image_path, difficulty, added_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [subject_id, topic_ar, topic_en, question_text_ar, question_text_en,
                answer_text_ar, answer_text_en, image_path, difficulty || 'medium', added_by]
        );

        // Update statistics
        if (subject_id) {
            await db.query(
                'UPDATE statistics SET total_questions = total_questions + 1 WHERE subject_id = ?',
                [subject_id]
            );
        }

        return NextResponse.json({
            id: result.insertId,
            image_path,
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
