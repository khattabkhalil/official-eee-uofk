'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

export default function HomePage() {
    const { t } = useApp();
    const [stats, setStats] = useState({
        totalLectures: 0,
        totalAssignments: 0,
        totalExams: 0,
        totalSubjects: 7
    });
    const [latestResources, setLatestResources] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, resourcesRes, announcementsRes] = await Promise.all([
                fetch('/api/statistics/overall'),
                fetch('/api/resources/latest?limit=6'),
                fetch('/api/announcements?limit=3')
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (resourcesRes.ok) {
                const resourcesData = await resourcesRes.json();
                setLatestResources(resourcesData);
            }

            if (announcementsRes.ok) {
                const announcementsData = await announcementsRes.json();
                setAnnouncements(announcementsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getResourceTypeLabel = (type) => {
        const labels = {
            lecture: t('محاضرة', 'Lecture'),
            sheet: t('ورقة عمل', 'Sheet'),
            assignment: t('واجب', 'Assignment'),
            exam: t('امتحان', 'Exam'),
            reference: t('مرجع', 'Reference'),
            important_question: t('سؤال مهم', 'Important Question')
        };
        return labels[type] || type;
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: 'badge-error',
            high: 'badge-warning',
            medium: 'badge-info',
            low: 'badge-success'
        };
        return badges[priority] || 'badge-info';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            {/* Hero Section */}
            <section className="hero-section fade-in">
                <div className="hero-content">
                    <h1 className="hero-title gradient-text">
                        {t('منصة إدارة المحتوى الأكاديمي', 'Academic Management Platform')}
                    </h1>
                    <p className="hero-description">
                        {t(
                            'منصة شاملة لإدارة المحتوى الأكاديمي لطلاب الفصل الدراسي الأول - قسم الهندسة الكهربائية والإلكترونية',
                            'Comprehensive platform for managing academic content for Semester 1 students - Electrical and Electronic Engineering Department'
                        )}
                    </p>
                    <div className="hero-actions">
                        <Link href="/subjects" className="btn btn-primary btn-lg">
                            {t('تصفح المواد', 'Browse Subjects')}
                        </Link>
                        <Link href="/questions" className="btn btn-outline btn-lg">
                            {t('بنك الأسئلة', 'Question Bank')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Statistics Cards */}
            <section className="stats-section">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="stat-card card hover-lift">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalLectures}</div>
                            <div className="stat-label">{t('المحاضرات', 'Lectures')}</div>
                        </div>
                    </div>

                    <div className="stat-card card hover-lift">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalAssignments}</div>
                            <div className="stat-label">{t('الواجبات', 'Assignments')}</div>
                        </div>
                    </div>

                    <div className="stat-card card hover-lift">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalExams}</div>
                            <div className="stat-label">{t('الامتحانات', 'Exams')}</div>
                        </div>
                    </div>

                    <div className="stat-card card hover-lift">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalSubjects}</div>
                            <div className="stat-label">{t('المواد', 'Subjects')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Resources */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">{t('أحدث الموارد', 'Latest Resources')}</h2>
                    <Link href="/subjects" className="btn btn-outline btn-sm">
                        {t('عرض الكل', 'View All')}
                    </Link>
                </div>

                {latestResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {latestResources.map((resource) => (
                            <div key={resource.id} className="card hover-lift">
                                <div className="resource-card">
                                    <div className="flex justify-between items-center mb-md">
                                        <span className="badge badge-primary">{getResourceTypeLabel(resource.type)}</span>
                                        <span className="text-sm text-secondary">
                                            {new Date(resource.created_at).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    <h3 className="resource-title">{resource.title_ar || resource.title_en}</h3>
                                    <p className="resource-subject">{resource.subject_name_ar || resource.subject_name_en}</p>
                                    {resource.source && (
                                        <p className="text-sm text-tertiary mt-sm">
                                            {t('المصدر:', 'Source:')} {resource.source}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>{t('لا توجد موارد متاحة حالياً', 'No resources available yet')}</p>
                    </div>
                )}
            </section>

            {/* Announcements Preview */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">{t('الإعلانات', 'Announcements')}</h2>
                    <Link href="/announcements" className="btn btn-outline btn-sm">
                        {t('عرض الكل', 'View All')}
                    </Link>
                </div>

                {announcements.length > 0 ? (
                    <div className="announcements-list">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="announcement-card card">
                                <div className="flex justify-between items-start gap-md">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-sm mb-sm">
                                            <span className={`badge ${getPriorityBadge(announcement.priority)}`}>
                                                {t(announcement.priority, announcement.priority)}
                                            </span>
                                            <span className="text-sm text-tertiary">
                                                {new Date(announcement.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <h3 className="announcement-title">{announcement.title_ar || announcement.title_en}</h3>
                                        <p className="announcement-content">
                                            {(announcement.content_ar || announcement.content_en).substring(0, 150)}...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>{t('لا توجد إعلانات حالياً', 'No announcements yet')}</p>
                    </div>
                )}
            </section>

            <style jsx>{`
        .hero-section {
          text-align: center;
          padding: 4rem 0;
          margin-bottom: 3rem;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .stats-section {
          margin-bottom: 3rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .resource-card {
          height: 100%;
        }

        .resource-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .resource-subject {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .announcements-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .announcement-card {
          padding: 1.5rem;
        }

        .announcement-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .announcement-content {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-tertiary);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
        </div>
    );
}
