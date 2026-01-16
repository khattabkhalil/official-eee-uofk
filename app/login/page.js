'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login, t } = useApp();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t('فشل تسجيل الدخول', 'Login failed'));
            }

            // Login successful
            login(data.token, data.admin);
            router.push('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="card w-full max-w-md fade-in">
                <div className="text-center mb-xl">
                    <h1 className="text-2xl font-bold mb-sm">{t('تسجيل دخول المشرفين', 'Admin Login')}</h1>
                    <p className="text-secondary">{t('يرجى تسجيل الدخول للوصول إلى لوحة التحكم', 'Please login to access the dashboard')}</p>
                </div>

                {error && (
                    <div className="alert alert-error mb-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-lg">
                        <label className="block mb-sm font-medium">{t('اسم المستخدم', 'Username')}</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder=""
                            required
                            dir="ltr"
                        />
                    </div>

                    <div className="mb-xl">
                        <label className="block mb-sm font-medium">{t('كلمة المرور', 'Password')}</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            dir="ltr"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : t('تسجيل الدخول', 'Login')}
                    </button>
                </form>

                <div className="mt-lg text-center">
                    <Link href="/" className="text-sm text-primary hover:underline">
                        {t('العودة للصفحة الرئيسية', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
