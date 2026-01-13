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
        const added_by = formData.get('added_by');
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

            file_path = uploadData.path; // Usually just fileName or path in bucket

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
                file_path, // Stores key in bucket
                file_url,  // Stores public access URL
                file_size,
                file_type,
                source,
                added_by: parseInt(added_by)
            }])
            .select();

        if (insertError) {
            console.error('Resource insert error:', insertError);
            throw insertError;
        }

        // Update statistics
        const statField = type === 'lecture' ? 'total_lectures' :
            type === 'sheet' ? 'total_sheets' :
                type === 'assignment' ? 'total_assignments' :
                    type === 'exam' ? 'total_exams' :
                        type === 'reference' ? 'total_references' :
                            type === 'important_question' ? 'total_questions' : null;

        if (statField) {
            // First get current value
            const { data: currentStat } = await supabase
                .from('statistics')
                .select(statField)
                .eq('subject_id', subject_id)
                .single();

            if (currentStat) {
                const newValue = (currentStat[statField] || 0) + 1;
                await supabase
                    .from('statistics')
                    .update({ [statField]: newValue })
                    .eq('subject_id', subject_id);
            } else {
                // Maybe create?
                // .insert({ subject_id, [statField]: 1 })
            }
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
            .select(`
                *,
                subjects:subject_id (
                    name_ar,
                    name_en
                )
            `);

        if (subject_id) {
            query = query.eq('subject_id', subject_id);
        }

        if (type) {
            query = query.eq('type', type);
        }

        query = query.order('created_at', { ascending: false });

        const { data: resources, error } = await query;

        if (error) throw error;

        // Flatten subject names
        const flattened = resources.map(r => ({
            ...r,
            subject_name_ar: r.subjects?.name_ar,
            subject_name_en: r.subjects?.name_en
        }));

        return NextResponse.json(flattened);

    } catch (error) {
        console.error('Error fetching resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
