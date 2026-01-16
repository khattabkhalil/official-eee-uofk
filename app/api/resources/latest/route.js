import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitStr = searchParams.get('limit');
        const limit = limitStr ? parseInt(limitStr) : 10;

        // Verify limit is a valid number
        const safeLimit = isNaN(limit) ? 10 : limit;

        // Query specific columns to avoid errors if some are missing (like 'type' or 'added_by')
        const { data: resources, error } = await supabase
            .from('resources')
            .select('id, subject_id, title_ar, title_en, file_url, created_at')
            .order('created_at', { ascending: false })
            .limit(safeLimit);

        if (error) {
            console.error('Supabase error in latest resources:', error);
            // Don't crash the whole page, return empty list with error flag
            return NextResponse.json([], {
                headers: { 'X-Error': 'DB_QUERY_FAILED', 'X-Details': error.message }
            });
        }

        // Fetch subject names manually to avoid join issues
        const { data: subjects, error: subjError } = await supabase
            .from('subjects')
            .select('id, name_ar, name_en, code');

        if (subjError) {
            console.error('Subject fetch error in latest resources:', subjError);
        }

        const subjectMap = {};
        if (subjects) {
            subjects.forEach(s => {
                if (s && s.id) subjectMap[s.id] = s;
            });
        }

        const flattened = (resources || []).map(r => {
            if (!r) return null;
            const subj = (r.subject_id && subjectMap[r.subject_id]) || {};
            return {
                ...r,
                subject_name_ar: subj.name_ar || 'N/A',
                subject_name_en: subj.name_en || 'N/A',
                subject_code: subj.code || '',
                added_by_name: 'Admin'
            };
        }).filter(Boolean);

        return NextResponse.json(flattened);

    } catch (error) {
        console.error('Detailed error in latest resources:', error.message);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
                hint: 'Check if all columns (subject_id, created_at) exist in the resources table.'
            },
            { status: 500 }
        );
    }
}
