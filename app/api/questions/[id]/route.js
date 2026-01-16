import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        const { data: questions, error } = await supabase
            .from('questions')
            .select(`
                *,
                subjects:subject_id (
                    name_ar,
                    name_en
                )
            `)
            .eq('id', id)
            .limit(1);

        if (error) throw error;

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        const question = questions[0];
        return NextResponse.json({
            ...question,
            subject_name_ar: question.subjects?.name_ar,
            subject_name_en: question.subjects?.name_en
        });

    } catch (error) {
        console.error('Error fetching question:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const formData = await request.formData();

        const subject_id = formData.get('subject_id');
        const topic_ar = formData.get('topic_ar');
        const topic_en = formData.get('topic_en');
        const question_text_ar = formData.get('question_text_ar');
        const question_text_en = formData.get('question_text_en');
        const answer_text_ar = formData.get('answer_text_ar');
        const answer_text_en = formData.get('answer_text_en');
        const difficulty = formData.get('difficulty');
        const image = formData.get('image');
        const answer_image = formData.get('answer_image');

        const updates = {
            subject_id: parseInt(subject_id),
            topic_ar,
            topic_en,
            question_text_ar,
            question_text_en,
            answer_text_ar,
            answer_text_en,
            difficulty: difficulty || 'medium',
            updated_at: new Date()
        };

        // Handle question image upload if new image provided
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

            updates.image_path = publicData.publicUrl;
        }

        // Handle answer image upload if new image provided
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

            updates.answer_image_path = publicData.publicUrl;
        }

        const { error } = await supabase
            .from('questions')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            image_path: updates.image_path,
            answer_image_path: updates.answer_image_path
        });

    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Fetch question to get subject_id for stat update
        const { data: question } = await supabase
            .from('questions')
            .select('subject_id')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Update statistics
        if (question && question.subject_id) {
            const { data: currentStat } = await supabase
                .from('subject_statistics')
                .select('total_questions')
                .eq('subject_id', question.subject_id)
                .single();

            if (currentStat) {
                await supabase
                    .from('subject_statistics')
                    .update({
                        total_questions: Math.max(0, (currentStat.total_questions || 0) - 1),
                        updated_at: new Date()
                    })
                    .eq('subject_id', question.subject_id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting question:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
