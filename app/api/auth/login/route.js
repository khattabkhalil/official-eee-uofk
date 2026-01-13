import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .limit(1);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!users || users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login (optional, if column exists)
        // await supabase.from('users').update({ last_login: new Date() }).eq('id', user.id);

        // Generate JWT token
        const token = signToken({
            id: user.id,
            username: user.username,
            role: user.role
        });

        // Log activity (if table exists)
        /*
        await supabase.from('activity_log').insert({
            admin_id: user.id,
            action: 'login',
            details: 'Admin logged in'
        });
        */

        return NextResponse.json({
            token,
            admin: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
