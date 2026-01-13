import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const active_only = searchParams.get('active_only') !== 'false';

        let query = supabase
            .from('announcements')
            .select(`
                *,
                users:added_by (
                    username
                )
            `);

        if (active_only) {
            query = query.eq('is_active', true);
        }

        query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const { data: announcements, error } = await query;

        if (error) throw error;

        // Flatten added_by_name if needed
        const flattened = announcements.map(a => ({
            ...a,
            added_by_name: a.users?.username || 'Admin'
        }));

        return NextResponse.json(flattened);

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

        const { data, error } = await supabase
            .from('announcements')
            .insert([{
                title_ar,
                title_en,
                content_ar,
                content_en,
                priority: priority || 'medium',
                type: type || 'general',
                added_by
            }])
            .select();

        if (error) throw error;

        return NextResponse.json({
            id: data[0].id,
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
