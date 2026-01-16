import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request) {
    try {
        const { orders } = await request.json(); // Array of { id, order_index }

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: 'Invalid orders data' }, { status: 400 });
        }

        const updates = orders.map(o =>
            supabase
                .from('resources')
                .update({ order_index: o.order_index })
                .eq('id', o.id)
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating resource order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
