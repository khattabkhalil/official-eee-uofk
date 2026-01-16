'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

export default function SubjectsPage() {
  const { t } = useApp();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="page-header">
        <h1 className="page-title">{t('المقررات الدراسية', 'Courses')}</h1>
        <p className="page-description">
          {t('جميع مقررات الفصل الدراسي الأول', 'All Semester 1 courses')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {subjects.map((subject) => (
          <Link href={`/subjects/${subject.id}`} key={subject.id} className="subject-card-link">
            <div className="subject-card card hover-lift">
              <div className="subject-header">
                <div>
                  <h3 className="subject-name">{subject.name_ar}</h3>
                  <p className="subject-name-en">{subject.name_en}</p>
                </div>
                <div className="subject-code">{subject.code}</div>
              </div>

              {subject.description_ar && (
                <p className="subject-description">
                  {subject.description_ar}
                </p>
              )}

              <div className="subject-stats">
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <span>{subject.total_lectures} {t('محاضرة مدروسة', 'lectures studied')}</span>
                </div>
                {['EGS11203', 'EGS11304'].includes(subject.code) && subject.total_labs > 0 && (
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>{subject.total_labs} {t('معامل', 'labs')}</span>
                  </div>
                )}
                {subject.code === 'EGS12405' && subject.total_practicals > 0 && (
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 17 10 11 14 15 20 9" />
                      <polyline points="14 9 20 9 20 15" />
                    </svg>
                    <span>{subject.total_practicals} {t('عملي', 'practical')}</span>
                  </div>
                )}
                {['EGS11101', 'EGS11102'].includes(subject.code) && subject.total_tutorials > 0 && (
                  <div className="stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                    <span>{subject.total_tutorials} {t('تمارين', 'tutorials')}</span>
                  </div>
                )}
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <span>{subject.total_assignments} {t('واجب', 'assignments')}</span>
                </div>
                <div className="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <span>{subject.total_exams} {t('امتحان', 'exams')}</span>
                </div>
              </div>

              <div className="subject-footer">
                <span className="text-sm text-secondary">
                  {t('آخر تحديث:', 'Last updated:')} {new Date(subject.updated_at).toLocaleDateString('ar-EG')}
                </span>
                <span className="view-link">
                  {t('عرض المقرر', 'View Course')} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
        }

        .subject-card-link {
          text-decoration: none;
          display: block;
        }

        .subject-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .subject-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .subject-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .subject-name-en {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .subject-code {
          background: var(--primary-100);
          color: var(--primary-700);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .subject-description {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .subject-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .stat-item svg {
          color: var(--primary-600);
        }

        .subject-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .view-link {
          color: var(--primary-600);
          font-weight: 600;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .subject-header {
            flex-direction: column;
          }

          .subject-code {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
