'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function StatisticsPage() {
    const { t } = useApp();
    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);


    // Additional state for subject stats
    const [subjectStats, setSubjectStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, subjectStatsRes] = await Promise.all([
                    fetch('/api/statistics/overall'),
                    fetch('/api/statistics')
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (subjectStatsRes.ok) setSubjectStats(await subjectStatsRes.json());

            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-xl text-center"><div className="spinner"></div></div>;

    const maxLectures = 14; // Approximate max lectures per semester

    return (
        <div className="container py-xl" style={{ paddingTop: '3rem' }}>
            <div className="mb-xl text-center">
                <h1 className="text-3xl font-bold mb-sm">{t('الإحصائيات الأكاديمية', 'Academic Statistics')}</h1>
                <p className="text-secondary">{t('متابعة التقدم وسير العملية التعليمية', 'Tracking progress and educational process')}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-lg mb-2xl">
                <div className="card p-lg border-l-4 border-l-primary-500">
                    <div className="text-3xl font-bold text-primary mb-xs">{stats?.totalSubjects || 0}</div>
                    <div className="text-sm text-secondary">{t('إجمالي المواد', 'Total Subjects')}</div>
                </div>
                <div className="card p-lg border-l-4 border-l-success">
                    <div className="text-3xl font-bold text-success mb-xs">{stats?.totalLectures || 0}</div>
                    <div className="text-sm text-secondary">{t('محاضرات تم رفعها', 'Uploaded Lectures')}</div>
                </div>
                <div className="card p-lg border-l-4 border-l-warning">
                    <div className="text-3xl font-bold text-warning mb-xs">{stats?.totalAssignments || 0}</div>
                    <div className="text-sm text-secondary">{t('واجبات', 'Assignments')}</div>
                </div>
                <div className="card p-lg border-l-4 border-l-error">
                    <div className="text-3xl font-bold text-error mb-xs">{stats?.totalExams || 0}</div>
                    <div className="text-sm text-secondary">{t('امتحانات سابقة', 'Past Exams')}</div>
                </div>
            </div>

            {/* Subject Progress */}
            <h2 className="text-2xl font-bold mb-lg">{t('تقدم المواد', 'Subjects Progress')}</h2>
            <div className="grid grid-cols-2 gap-lg">
                {subjectStats.map(stat => {
                    const progress = Math.min(100, (stat.total_lectures / maxLectures) * 100);

                    return (
                        <div key={stat.code} className="card p-lg">
                            <div className="flex justify-between items-center mb-md">
                                <h3 className="text-lg font-bold">{t(stat.name_ar, stat.name_en)}</h3>
                                <span className="text-sm text-secondary">{stat.code}</span>
                            </div>

                            <div className="mb-sm">
                                <div className="flex justify-between text-sm mb-xs">
                                    <span>{t('اكتمال المنهج', 'Course Completion')}</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div
                                        className="bg-primary-600 h-2.5 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex gap-md mt-md text-xs text-secondary">
                                <span>{t('المحاضرات', 'Lectures')}: {stat.total_lectures || 0}</span>
                                <span>{t('الواجبات', 'Assignments')}: {stat.total_assignments || 0}</span>
                            </div>
                            <div className="mt-sm text-xs text-tertiary">
                                * {t('يتم تحديث الإحصائيات تلقائياً', 'Statistics update automatically')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
