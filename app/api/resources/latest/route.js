import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || 10;

        const { data: resources, error } = await supabase
            .from('resources')
            .select(`
                *,
                subjects:subject_id (
                    name_ar,
                    name_en,
                    code
                ),
                users:added_by (
                    username
                )
            `)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        const flattened = resources.map(r => ({
            ...r,
            subject_name_ar: r.subjects?.name_ar,
            subject_name_en: r.subjects?.name_en,
            subject_code: r.subjects?.code,
            added_by_name: r.users?.username || 'Admin'
        }));

        return NextResponse.json(flattened);

    } catch (error) {
        console.error('Error fetching latest resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
