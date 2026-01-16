import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        const file_url_input = formData.get('file_url'); // If provided directly
        const file = formData.get('file');

        if (!subject_id || !type || !title_ar || !title_en) {
            return NextResponse.json(
                { error: 'Subject ID, type, and titles are required' },
                { status: 400 }
            );
        }

        let file_path = null;
        let file_url = file_url_input || null;
        let file_size = null;
        let file_type = null;

        // Handle file upload
        if (file && file instanceof File && file.size > 0) {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('uploads')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw new Error('File upload failed');
            }

            file_path = uploadData.path;

            // Get Public URL
            const { data: publicData } = supabase
                .storage
                .from('uploads')
                .getPublicUrl(fileName);

            file_url = publicData.publicUrl;
            file_size = file.size;
            file_type = file.type;
        }

        // Insert resource
        const { data: resourceData, error: insertError } = await supabase
            .from('resources')
            .insert([{
                subject_id: parseInt(subject_id),
                type,
                title_ar,
                title_en,
                description_ar,
                description_en,
                file_path,
                file_url,
                file_size,
                file_type,
                source
            }])
            .select();

        if (insertError) {
            console.error('Resource insert error:', insertError);
            throw insertError;
        }

        const statField = type === 'assignment' ? 'total_assignments' :
            type === 'exam' ? 'total_exams' :
                type === 'sheet' ? 'total_sheets' :
                    type === 'reference' ? 'total_references' :
                        (type === 'important_question' || type === 'important_questions') ? 'total_important_questions' : null;

        if (statField) {
            // New Approach: Fetch current, then upsert immediately
            const { data: currentStat } = await supabase
                .from('subject_statistics')
                .select('*')
                .eq('subject_id', parseInt(subject_id))
                .single();

            const updates = {
                subject_id: parseInt(subject_id),
                [statField]: (currentStat ? (currentStat[statField] || 0) : 0) + 1,
                updated_at: new Date()
            };

            await supabase
                .from('subject_statistics')
                .upsert(updates, { onConflict: 'subject_id' });
        }

        return NextResponse.json({
            id: resourceData[0].id,
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating resource:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject_id = searchParams.get('subject_id');
        const type = searchParams.get('type');

        let query = supabase
            .from('resources')
            .select('*');

        if (subject_id) {
            query = query.eq('subject_id', subject_id);
        }

        if (type) {
            query = query.eq('type', type);
        }

        query = query.order('order_index', { ascending: true })
            .order('created_at', { ascending: false });

        const { data: resources, error } = await query;

        if (error) throw error;

        // Fetch subject names manually
        const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name_ar, name_en');

        const subjectMap = {};
        (subjects || []).forEach(s => {
            subjectMap[s.id] = s;
        });

        // Flatten subject names
        const flattened = (resources || []).map(r => {
            const subj = subjectMap[r.subject_id] || {};
            return {
                ...r,
                subject_name_ar: subj.name_ar || 'N/A',
                subject_name_en: subj.name_en || 'N/A'
            };
        });

        return NextResponse.json(flattened);

    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
