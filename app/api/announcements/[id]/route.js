import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const { data: announcements, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', id)
            .limit(1);

        if (error) throw error;

        if (!announcements || announcements.length === 0) {
            return NextResponse.json(
                { error: 'Announcement not found' },
                { status: 404 }
            );
        }

        const announcement = announcements[0];
        return NextResponse.json({
            ...announcement,
            added_by_name: 'Admin'
        });

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

        const { error } = await supabase
            .from('announcements')
            .update({
                title_ar,
                title_en,
                content_ar,
                content_en,
                priority,
                type,
                is_active
            })
            .eq('id', id);

        if (error) throw error;

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

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
