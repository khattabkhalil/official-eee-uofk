import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from('announcement_reactions')
            .select('reaction_type, count')
            .eq('announcement_id', id);

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { id } = params;
        const { reaction_type } = await request.json();

        if (!['like', 'love', 'wow', 'sad'].includes(reaction_type)) {
            return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
        }

        // Fetch current count
        const { data: current } = await supabase
            .from('announcement_reactions')
            .select('count')
            .eq('announcement_id', id)
            .eq('reaction_type', reaction_type)
            .single();

        if (current) {
            await supabase
                .from('announcement_reactions')
                .update({ count: current.count + 1 })
                .eq('announcement_id', id)
                .eq('reaction_type', reaction_type);
        } else {
            await supabase
                .from('announcement_reactions')
                .insert({
                    announcement_id: parseInt(id),
                    reaction_type,
                    count: 1
                });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reaction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
