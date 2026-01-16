import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Fetch subject statistics (simulate join)
        const { data: subjects, error: subjError } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', id);

        if (subjError) throw subjError;

        if (!subjects || subjects.length === 0) {
            return NextResponse.json(
                { error: 'Subject not found' },
                { status: 404 }
            );
        }

        const subject = subjects[0];

        // Fetch stats if possible
        // Fetch stats if possible
        const { data: statsData } = await supabase
            .from('subject_statistics')
            .select('*')
            .eq('subject_id', id);

        const stats = statsData?.[0] || {};
        const subjectWithStats = {
            ...subject,
            total_lectures: stats.total_lectures || 0,
            total_assignments: stats.total_assignments || 0,
            total_exams: stats.total_exams || 0,
            total_sheets: stats.total_sheets || 0,
            total_references: stats.total_references || 0,
            total_questions: stats.total_questions || 0,
            total_labs: stats.total_labs || 0,
            total_practicals: stats.total_practicals || 0,
            total_tutorials: stats.total_tutorials || 0
        };

        // Get resources for this subject
        const { data: resources, error: resError } = await supabase
            .from('resources')
            .select('*')
            .eq('subject_id', id)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: false });

        if (resError) {
            console.error('Error fetching resources:', resError);
            // Don't throw, just return empty resources
        }

        // Map resources
        const mappedResources = (resources || []).map(r => ({
            ...r,
            added_by_name: 'Admin' // Since we removed added_by tracking
        }));

        // Group resources by type
        const groupedResources = {
            lectures: mappedResources.filter(r => r.type === 'lecture'),
            sheets: mappedResources.filter(r => r.type === 'sheet'),
            assignments: mappedResources.filter(r => r.type === 'assignment'),
            exams: mappedResources.filter(r => r.type === 'exam'),
            references: mappedResources.filter(r => r.type === 'reference'),
            important_questions: mappedResources.filter(r => r.type === 'important_question')
        };

        return NextResponse.json({
            ...subjectWithStats,
            resources: groupedResources
        });

    } catch (error) {
        console.error('Error fetching subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { name_ar, name_en, code, description_ar, description_en, semester } = await request.json();

        const { error } = await supabase
            .from('subjects')
            .update({ name_ar, name_en, code, description_ar, description_en, semester })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating subject:', error);
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
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
