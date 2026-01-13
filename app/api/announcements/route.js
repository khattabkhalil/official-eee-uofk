import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const active_only = searchParams.get('active_only') !== 'false';

        let query = `
      SELECT a.*, ad.name as added_by_name
      FROM announcements a
      LEFT JOIN admins ad ON a.added_by = ad.id
    `;

        if (active_only) {
            query += ' WHERE a.is_active = TRUE';
        }

        query += ' ORDER BY a.priority DESC, a.created_at DESC';

        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }

        const announcements = await db.query(query);

        return NextResponse.json(announcements);

    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { title_ar, title_en, content_ar, content_en, priority, type, added_by } = await request.json();

        if (!title_ar || !title_en || !content_ar || !content_en) {
            return NextResponse.json(
                { error: 'All title and content fields are required' },
                { status: 400 }
            );
        }

        const result = await db.query(
            `INSERT INTO announcements 
       (title_ar, title_en, content_ar, content_en, priority, type, added_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title_ar, title_en, content_ar, content_en, priority || 'medium', type || 'general', added_by]
        );

        return NextResponse.json({
            id: result.insertId,
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
