import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const announcements = await db.query(`
      SELECT a.*, ad.name as added_by_name
      FROM announcements a
      LEFT JOIN admins ad ON a.added_by = ad.id
      WHERE a.id = ?
    `, [id]);

        if (announcements.length === 0) {
            return NextResponse.json(
                { error: 'Announcement not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(announcements[0]);

    } catch (error) {
        console.error('Error fetching announcement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { title_ar, title_en, content_ar, content_en, priority, type, is_active } = await request.json();

        await db.query(
            `UPDATE announcements 
       SET title_ar = ?, title_en = ?, content_ar = ?, content_en = ?, 
           priority = ?, type = ?, is_active = ?
       WHERE id = ?`,
            [title_ar, title_en, content_ar, content_en, priority, type, is_active, id]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        await db.query('DELETE FROM announcements WHERE id = ?', [id]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
