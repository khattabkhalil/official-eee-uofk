import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject_id = searchParams.get('subject_id');
        const difficulty = searchParams.get('difficulty');
        const search = searchParams.get('search');

        let query = supabase
            .from('questions')
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

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        if (search) {
            query = query.or(`question_text_ar.ilike.%${search}%,question_text_en.ilike.%${search}%,topic_ar.ilike.%${search}%,topic_en.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data: questions, error } = await query;

        if (error) throw error;

        const flattened = questions.map(q => ({
            ...q,
            subject_name_ar: q.subjects?.name_ar,
            subject_name_en: q.subjects?.name_en
        }));

        return NextResponse.json(flattened);

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
        const answer_image = formData.get('answer_image');

        if (!question_text_ar || !question_text_en) {
            return NextResponse.json(
                { error: 'Question text in both languages is required' },
                { status: 400 }
            );
        }

        let image_path = null;
        let answer_image_path = null;

        // Handle question image upload
        if (image && image instanceof File && image.size > 0) {
            const fileName = `${Date.now()}-q-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('uploads')
                .upload(`questions/${fileName}`, image);

            if (uploadError) {
                console.error('Question image upload error:', uploadError);
                throw new Error('Question image upload failed');
            }

            const { data: publicData } = supabase
                .storage
                .from('uploads')
                .getPublicUrl(`questions/${fileName}`);

            image_path = publicData.publicUrl;
        }

        // Handle answer image upload
        if (answer_image && answer_image instanceof File && answer_image.size > 0) {
            const fileName = `${Date.now()}-a-${answer_image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('uploads')
                .upload(`questions/${fileName}`, answer_image);

            if (uploadError) {
                console.error('Answer image upload error:', uploadError);
                throw new Error('Answer image upload failed');
            }

            const { data: publicData } = supabase
                .storage
                .from('uploads')
                .getPublicUrl(`questions/${fileName}`);

            answer_image_path = publicData.publicUrl;
        }

        const { data: questionData, error: insertError } = await supabase
            .from('questions')
            .insert([{
                subject_id: parseInt(subject_id),
                topic_ar,
                topic_en,
                question_text_ar,
                question_text_en,
                answer_text_ar,
                answer_text_en,
                image_path,
                answer_image_path,
                difficulty: difficulty || 'medium',
                // added_by: added_by
            }])
            .select();

        if (insertError) throw insertError;

        // Update statistics
        if (subject_id) {
            const { data: currentStat } = await supabase
                .from('subject_statistics')
                .select('total_questions')
                .eq('subject_id', parseInt(subject_id))
                .single();

            const updates = {
                subject_id: parseInt(subject_id),
                total_questions: ((currentStat?.total_questions || 0) + 1),
                updated_at: new Date()
            };

            await supabase
                .from('subject_statistics')
                .upsert(updates, { onConflict: 'subject_id' });
        }

        return NextResponse.json({
            id: questionData[0].id,
            image_path,
            answer_image_path,
            success: true
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
