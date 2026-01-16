'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useParams } from 'next/navigation';

export default function SubjectDetailPage() {
  const { t } = useApp();
  const params = useParams();
  const [subject, setSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('references');
  const [loading, setLoading] = useState(true);
  const [completedResources, setCompletedResources] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('completed_resources');
    if (saved) {
      setCompletedResources(JSON.parse(saved));
    }
  }, []);

  const toggleCompletion = (resourceId) => {
    const newCompleted = completedResources.includes(resourceId)
      ? completedResources.filter(id => id !== resourceId)
      : [...completedResources, resourceId];

    setCompletedResources(newCompleted);
    localStorage.setItem('completed_resources', JSON.stringify(newCompleted));
  };

  useEffect(() => {
    if (params.id) {
      fetchSubject();
    }
  }, [params.id]);

  const fetchSubject = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubject(data);
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'references', label: t('المراجع', 'References'), icon: '📚' },
    { id: 'lectures', label: t('المحاضرات', 'Lectures'), icon: '📖' },
    { id: 'sheets', label: t('الأوراق', 'Sheets'), icon: '📄' },
    { id: 'assignments', label: t('الواجبات', 'Assignments'), icon: '✍️' },
    { id: 'exams', label: t('نماذج الامتحانات', 'Exam Models'), icon: '📝' },
    { id: 'important_questions', label: t('أسئلة مهمة', 'Important Questions'), icon: '⭐' },
  ];

  const renderResourceList = (resources) => {
    if (!resources || resources.length === 0) {
      return (
        <div className="empty-state">
          <p>{t('لا توجد موارد متاحة حالياً', 'No resources available yet')}</p>
        </div>
      );
    }

    return (
      <div className="resources-list">
        {resources.map((resource) => (
          <div key={resource.id} className={`resource-item card ${completedResources.includes(resource.id) ? 'completed' : ''}`}>
            <div className="completion-toggle" onClick={() => toggleCompletion(resource.id)}>
              <div className={`checkbox ${completedResources.includes(resource.id) ? 'checked' : ''}`}>
                {completedResources.includes(resource.id) && '✓'}
              </div>
            </div>
            <div className="resource-content">
              <div className="resource-header">
                <h4 className="resource-title">{resource.title_ar || resource.title_en}</h4>
                <div className="flex items-center gap-sm">
                  {completedResources.includes(resource.id) && (
                    <span className="badge badge-success text-xs">{t('تم الإكمال', 'Completed')}</span>
                  )}
                  <span className="resource-date">
                    {new Date(resource.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              {resource.description_ar && (
                <p className="resource-description">{resource.description_ar}</p>
              )}

              <div className="resource-meta">
                {resource.source && (
                  <span className="meta-item">
                    <strong>{t('المصدر:', 'Source:')}</strong> {resource.source}
                  </span>
                )}
                {resource.file_size && (
                  <span className="meta-item">
                    <strong>{t('الحجم:', 'Size:')}</strong> {(resource.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>

              {(resource.file_path || resource.file_url) && (
                <div className="resource-actions">
                  {resource.file_path && (
                    <a href={resource.file_path} download target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      {t('تحميل الملف', 'Download File')}
                    </a>
                  )}
                  {resource.file_url && (
                    <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      {t('فتح الرابط', 'Open Link')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <h2>{t('المقرر غير موجود', 'Course not found')}</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      {/* Subject Header */}
      <div className="subject-header-section">
        <div className="subject-info">
          <div className="subject-code-badge">{subject.code}</div>
          <h1 className="subject-title">{subject.name_ar}</h1>
          <p className="subject-subtitle">{subject.name_en}</p>
          {subject.description_ar && (
            <p className="subject-description">{subject.description_ar}</p>
          )}
        </div>

        {/* Statistics */}
        <div className="subject-stats-grid">
          <div className="stat-box">
            <div className="stat-value">{subject.total_lectures}</div>
            <div className="stat-label">{t('محاضرات مدروسة', 'Lectures Studied')}</div>
          </div>
          {['EGS11203', 'EGS11304'].includes(subject.code) && subject.total_labs > 0 && (
            <div className="stat-box">
              <div className="stat-value">{subject.total_labs}</div>
              <div className="stat-label">{t('معامل', 'Labs')}</div>
            </div>
          )}
          {subject.code === 'EGS12405' && subject.total_practicals > 0 && (
            <div className="stat-box">
              <div className="stat-value">{subject.total_practicals}</div>
              <div className="stat-label">{t('عملي', 'Practical')}</div>
            </div>
          )}
          {['EGS11101', 'EGS11102'].includes(subject.code) && subject.total_tutorials > 0 && (
            <div className="stat-box">
              <div className="stat-value">{subject.total_tutorials}</div>
              <div className="stat-label">{t('تمارين', 'Tutorials')}</div>
            </div>
          )}
          <div className="stat-box">
            <div className="stat-value">{subject.total_sheets}</div>
            <div className="stat-label">{t('أوراق', 'Sheets')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{subject.total_assignments}</div>
            <div className="stat-label">{t('واجبات', 'Assignments')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{subject.total_exams}</div>
            <div className="stat-label">{t('امتحانات', 'Exams')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{subject.total_references}</div>
            <div className="stat-label">{t('مراجع', 'References')}</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{subject.total_questions}</div>
            <div className="stat-label">{t('أسئلة', 'Questions')}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderResourceList(subject.resources?.[activeTab])}
      </div>

      <style jsx>{`
        .subject-header-section {
          margin-bottom: 3rem;
        }

        .subject-info {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subject-code-badge {
          display: inline-block;
          background: var(--primary-100);
          color: var(--primary-700);
          padding: 0.5rem 1.5rem;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .subject-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-400));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subject-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .subject-description {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .subject-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        @media(min-width: 640px) {
            .subject-stats-grid {
                 grid-template-columns: repeat(3, 1fr);
            }
        }

        @media(min-width: 1024px) {
            .subject-stats-grid {
                grid-template-columns: repeat(6, 1fr);
            }
        }

        .stat-box {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-600);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .tabs-container {
          margin-bottom: 2rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid var(--border-color);
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--primary-600);
          background: var(--bg-secondary);
        }

        .tab.active {
          color: var(--primary-600);
          border-bottom-color: var(--primary-600);
          font-weight: 600;
        }

        .tab-icon {
          font-size: 1.25rem;
        }

        .tab-content {
          min-height: 400px;
        }

        .resources-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .resource-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .resource-item.completed {
          opacity: 0.7;
          border-color: var(--success-200);
          background: var(--success-50);
        }

        .completion-toggle {
          cursor: pointer;
          flex-shrink: 0;
          padding-top: 0.25rem;
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          color: white;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .checkbox.checked {
          background: var(--success-500);
          border-color: var(--success-500);
        }

        .resource-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .resource-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .resource-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .resource-date {
          font-size: 0.875rem;
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        .resource-description {
          font-size: 0.9375rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .resource-meta {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .resource-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-tertiary);
        }



          .tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
          }

          .tab {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
