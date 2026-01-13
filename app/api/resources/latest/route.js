import { NextResponse } from 'next/server';

const db = require('@/lib/db');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || 10;

        const resources = await db.query(`
      SELECT 
        r.*,
        s.name_ar as subject_name_ar,
        s.name_en as subject_name_en,
        s.code as subject_code,
        a.name as added_by_name
      FROM resources r
      LEFT JOIN subjects s ON r.subject_id = s.id
      LEFT JOIN admins a ON r.added_by = a.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

        return NextResponse.json(resources);

    } catch (error) {
        console.error('Error fetching latest resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
