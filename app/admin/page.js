'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const { isAdmin, logout, t, adminData } = useApp();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Data States
    const [subjects, setSubjects] = useState([]);
    const [resources, setResources] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [stats, setStats] = useState({});

    // Forms States
    const [resourceForm, setResourceForm] = useState({
        subject_id: '',
        type: 'lecture',
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        source: '',
        file: null
    });

    const [announcementForm, setAnnouncementForm] = useState({
        title_ar: '',
        title_en: '',
        content_ar: '',
        content_en: '',
        priority: 'medium',
        type: 'general'
    });

    const [questionForm, setQuestionForm] = useState({
        subject_id: '',
        topic_ar: '',
        topic_en: '',
        question_text_ar: '',
        question_text_en: '',
        answer_text_ar: '',
        answer_text_en: '',
        difficulty: 'medium',
        image: null,
        answer_image: null
    });

    // Edit States
    const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    useEffect(() => {
        if (!isAdmin) {
            router.push('/login');
            return;
        }

        fetchInitialData();
    }, [isAdmin, router]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [subjRes, resRes, annRes, qRes, statRes] = await Promise.all([
                fetch('/api/subjects'),
                fetch('/api/resources/latest'), // Need all resources really, but let's start with this or implement a full list
                fetch('/api/announcements'),
                fetch('/api/questions'),
                fetch('/api/statistics/overall')
            ]);

            if (subjRes.ok) setSubjects(await subjRes.json());
            if (resRes.ok) setResources(await resRes.json());
            if (annRes.ok) setAnnouncements(await annRes.json());
            if (qRes.ok) setQuestions(await qRes.json());
            if (statRes.ok) setStats(await statRes.json());

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(resourceForm).forEach(key => {
            if (resourceForm[key] !== null) formData.append(key, resourceForm[key]);
        });
        formData.append('added_by', adminData.id);

        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert(t('تم إضافة المورد بنجاح', 'Resource added successfully'));
                fetchInitialData();
                setResourceForm({ ...resourceForm, title_ar: '', title_en: '', file: null });
            }
        } catch (error) {
            console.error('Error adding resource:', error);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!confirm(t('هل أنت متأكد من حذف هذا المورد؟', 'Are you sure you want to delete this resource?'))) return;
        if (!confirm(t('هذا الإجراء غير قابل للتراجع. هل أنت متأكد تماماً؟', 'This action is permanent. Are you absolutely sure?'))) return;
        try {
            const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert(t('تم حذف المورد', 'Resource deleted'));
                fetchInitialData();
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    };

    const reorderResources = async (subjectId, resourceId, direction) => {
        const subjectResources = resources.filter(r => r.subject_id === subjectId).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        const index = subjectResources.findIndex(r => r.id === resourceId);
        if (index === -1) return;

        const newResources = [...subjectResources];
        if (direction === 'up' && index > 0) {
            [newResources[index - 1], newResources[index]] = [newResources[index], newResources[index - 1]];
        } else if (direction === 'down' && index < newResources.length - 1) {
            [newResources[index + 1], newResources[index]] = [newResources[index], newResources[index + 1]];
        } else {
            return;
        }

        const orders = newResources.map((r, i) => ({ id: r.id, order_index: i }));

        try {
            const res = await fetch('/api/resources/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders })
            });
            if (res.ok) {
                fetchInitialData();
            }
        } catch (error) {
            console.error('Error reordering resources:', error);
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingAnnouncementId
                ? `/api/announcements/${editingAnnouncementId}`
                : '/api/announcements';

            const method = editingAnnouncementId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...announcementForm, added_by: adminData.id })
            });
            if (res.ok) {
                alert(editingAnnouncementId ? t('تم تحديث الإعلان بنجاح', 'Announcement updated successfully') : t('تم إضافة الإعلان بنجاح', 'Announcement added successfully'));
                fetchInitialData();
                setAnnouncementForm({
                    title_ar: '',
                    title_en: '',
                    content_ar: '',
                    content_en: '',
                    priority: 'medium',
                    type: 'general'
                });
                setEditingAnnouncementId(null);
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!confirm(t('هل أنت متأكد من حذف هذا الإعلان؟', 'Are you sure you want to delete this announcement?'))) return;
        if (!confirm(t('هذا الإجراء غير قابل للتراجع. هل أنت متأكد تماماً؟', 'This action is permanent. Are you absolutely sure?'))) return;
        try {
            const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert(t('تم حذف الإعلان', 'Announcement deleted'));
                fetchInitialData();
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(questionForm).forEach(key => {
            if (questionForm[key] !== null) formData.append(key, questionForm[key]);
        });
        formData.append('added_by', adminData.id);

        const url = editingQuestionId
            ? `/api/questions/${editingQuestionId}`
            : '/api/questions';

        const method = editingQuestionId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                body: formData
            });
            if (res.ok) {
                alert(editingQuestionId ? t('تم تحديث السؤال بنجاح', 'Question updated successfully') : t('تم إضافة السؤال بنجاح', 'Question added successfully'));
                fetchInitialData();
                setQuestionForm({
                    subject_id: '',
                    topic_ar: '',
                    topic_en: '',
                    question_text_ar: '',
                    question_text_en: '',
                    answer_text_ar: '',
                    answer_text_en: '',
                    difficulty: 'medium',
                    image: null,
                    answer_image: null
                });
                setEditingQuestionId(null);
            }
        } catch (error) {
            console.error('Error saving question:', error);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!confirm(t('هل أنت متأكد من حذف هذا السؤال؟', 'Are you sure you want to delete this question?'))) return;
        if (!confirm(t('هذا الإجراء غير قابل للتراجع. هل أنت متأكد تماماً؟', 'This action is permanent. Are you absolutely sure?'))) return;
        try {
            const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert(t('تم حذف السؤال', 'Question deleted'));
                fetchInitialData();
            }
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    if (loading) return <div className="p-xl text-center"><div className="spinner"></div></div>;

    const renderOverview = () => (
        <div className="space-y-lg fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                <div className="card p-lg text-center border-l-4 border-success">
                    <h3 className="text-3xl font-bold text-success">{stats.totalLectures || 0}</h3>
                    <p className="text-secondary font-medium">{t('المحاضرات المدروسة', 'Lectures Studied')}</p>
                </div>
                <div className="card p-lg text-center border-l-4 border-warning">
                    <h3 className="text-3xl font-bold text-warning">{stats.totalAssignments || 0}</h3>
                    <p className="text-secondary font-medium">{t('الواجبات', 'Assignments')}</p>
                </div>
                <div className="card p-lg text-center border-l-4 border-error">
                    <h3 className="text-3xl font-bold text-error">{stats.totalExams || 0}</h3>
                    <p className="text-secondary font-medium">{t('الامتحانات', 'Exams')}</p>
                </div>
                <div className="card p-lg text-center border-l-4 border-primary">
                    <h3 className="text-3xl font-bold text-primary">{stats.totalSheets || 0}</h3>
                    <p className="text-secondary font-medium">{t('أوراق العمل', 'Sheets')}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                <div className="card p-lg text-center">
                    <h3 className="text-3xl font-bold text-info">{stats.totalReferences || 0}</h3>
                    <p className="text-secondary font-medium">{t('المراجع', 'References')}</p>
                </div>
                <div className="card p-lg text-center">
                    <h3 className="text-3xl font-bold text-secondary">{stats.totalQuestions || 0}</h3>
                    <p className="text-secondary font-medium">{t('بنك الأسئلة', 'Question Bank')}</p>
                </div>
                <div className="card p-lg text-center">
                    <h3 className="text-3xl font-bold text-accent">{stats.totalSubjects || 0}</h3>
                    <p className="text-secondary font-medium">{t('المقررات الدراسية', 'Courses')}</p>
                </div>
            </div>
        </div>
    );

    const renderResourceForm = () => (
        <div className="space-y-lg">
            <div className="card fade-in">
                <h3 className="text-xl font-bold mb-lg">{t('إضافة مورد جديد', 'Add New Resource')}</h3>
                <form onSubmit={handleResourceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block mb-sm">{t('المقرر', 'Course')}</label>
                        <select
                            className="select"
                            value={resourceForm.subject_id}
                            onChange={e => setResourceForm({ ...resourceForm, subject_id: e.target.value })}
                            required
                        >
                            <option value="">{t('اختر المقرر', 'Select Course')}</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name_ar} - {s.code}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-sm">{t('النوع', 'Type')}</label>
                        <select
                            className="select"
                            value={resourceForm.type}
                            onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}
                        >
                            <option value="lecture">{t('محاضرة', 'Lecture')}</option>
                            <option value="sheet">{t('ورقة عمل', 'Sheet')}</option>
                            <option value="assignment">{t('واجب', 'Assignment')}</option>
                            <option value="exam">{t('امتحان', 'Exam')}</option>
                            <option value="reference">{t('مرجع', 'Reference')}</option>
                            <option value="important_question">{t('سؤال مهم', 'Important Question')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-sm">{t('رابط المصدر (اختياري)', 'Source URL (Optional)')}</label>
                        <input
                            type="url"
                            className="input"
                            value={resourceForm.source}
                            onChange={e => setResourceForm({ ...resourceForm, source: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block mb-sm">{t('العنوان (عربي)', 'Title (Arabic)')}</label>
                        <input
                            type="text"
                            className="input"
                            value={resourceForm.title_ar}
                            onChange={e => setResourceForm({ ...resourceForm, title_ar: e.target.value })}
                            required
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block mb-sm">{t('العنوان (إنجليزي)', 'Title (English)')}</label>
                        <input
                            type="text"
                            className="input"
                            value={resourceForm.title_en}
                            onChange={e => setResourceForm({ ...resourceForm, title_en: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block mb-sm">{t('الملف', 'File')}</label>
                        <input
                            type="file"
                            className="input"
                            onChange={e => setResourceForm({ ...resourceForm, file: e.target.files[0] })}
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-md">
                        <button type="submit" className="btn btn-primary w-full">{t('إضافة المورد', 'Add Resource')}</button>
                    </div>
                </form>
            </div>

            <div className="card fade-in">
                <h3 className="text-xl font-bold mb-lg">{t('الموارد الحالية', 'Current Resources')}</h3>
                <div className="space-y-xl">
                    {subjects.map(s => {
                        const subjectResources = resources.filter(r => r.subject_id === s.id).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                        if (subjectResources.length === 0) return null;
                        return (
                            <div key={s.id}>
                                <h4 className="font-bold text-lg mb-md pb-xs border-b border-color">{s.name_ar}</h4>
                                <div className="space-y-sm">
                                    {subjectResources.map((r, index) => (
                                        <div key={r.id} className="p-md border border-color rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md hover:bg-tertiary/5">
                                            <div className="flex-1 w-full sm:w-auto">
                                                <div className="flex items-center gap-sm">
                                                    <span className="badge badge-info text-xs">{t(r.type, r.type)}</span>
                                                    <span className="font-medium truncate block">{r.title_ar || r.title_en}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-xs w-full sm:w-auto justify-end">
                                                <button
                                                    className="btn btn-outline btn-xs flex-1 sm:flex-none"
                                                    disabled={index === 0}
                                                    onClick={() => reorderResources(s.id, r.id, 'up')}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-xs flex-1 sm:flex-none"
                                                    disabled={index === subjectResources.length - 1}
                                                    onClick={() => reorderResources(s.id, r.id, 'down')}
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-xs flex-1 sm:flex-none"
                                                    style={{ borderColor: 'var(--error-300)', color: 'var(--error-600)' }}
                                                    onClick={() => handleDeleteResource(r.id)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderAnnouncementForm = () => (
        <div className="space-y-lg">
            <div className="card fade-in">
                <div className="flex justify-between items-center mb-lg">
                    <h3 className="text-xl font-bold">{editingAnnouncementId ? t('تعديل الإعلان', 'Edit Announcement') : t('إضافة إعلان جديد', 'Add New Announcement')}</h3>
                    {editingAnnouncementId && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setEditingAnnouncementId(null);
                                setAnnouncementForm({
                                    title_ar: '',
                                    title_en: '',
                                    content_ar: '',
                                    content_en: '',
                                    priority: 'medium',
                                    type: 'general'
                                });
                            }}
                        >
                            {t('إلغاء التعديل', 'Cancel Edit')}
                        </button>
                    )}
                </div>
                <form onSubmit={handleAnnouncementSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block mb-sm">{t('النوع', 'Type')}</label>
                        <select
                            className="select"
                            value={announcementForm.type}
                            onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                        >
                            <option value="general">{t('عام', 'General')}</option>
                            <option value="exam">{t('امتحان', 'Exam')}</option>
                            <option value="submission">{t('تسليم', 'Submission')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-sm">{t('العنوان (عربي)', 'Title (Arabic)')}</label>
                        <input
                            type="text"
                            className="input"
                            value={announcementForm.title_ar}
                            onChange={e => setAnnouncementForm({ ...announcementForm, title_ar: e.target.value })}
                            required
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block mb-sm">{t('العنوان (إنجليزي)', 'Title (English)')}</label>
                        <input
                            type="text"
                            className="input"
                            value={announcementForm.title_en}
                            onChange={e => setAnnouncementForm({ ...announcementForm, title_en: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block mb-sm">{t('المحتوى (عربي)', 'Content (Arabic)')}</label>
                        <textarea
                            className="textarea"
                            value={announcementForm.content_ar}
                            onChange={e => setAnnouncementForm({ ...announcementForm, content_ar: e.target.value })}
                            required
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block mb-sm">{t('المحتوى (إنجليزي)', 'Content (English)')}</label>
                        <textarea
                            className="textarea"
                            value={announcementForm.content_en}
                            onChange={e => setAnnouncementForm({ ...announcementForm, content_en: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 mt-md">
                        <button type="submit" className="btn btn-primary w-full">
                            {editingAnnouncementId ? t('تحديث الإعلان', 'Update Announcement') : t('نشر الإعلان', 'Publish Announcement')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card fade-in">
                <h3 className="text-xl font-bold mb-lg">{t('الإعلانات الحالية', 'Current Announcements')}</h3>
                <div className="space-y-md">
                    {announcements.map(ann => (
                        <div key={ann.id} className="p-md border border-color rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                            <div className="w-full sm:w-auto overflow-hidden">
                                <h4 className="font-bold">{ann.title_ar || ann.title_en}</h4>
                                <p className="text-sm text-secondary truncate">{ann.content_ar || ann.content_en}</p>
                            </div>
                            <div className="flex gap-sm w-full sm:w-auto">
                                <button
                                    className="btn btn-outline btn-sm flex-grow sm:flex-grow-0"
                                    onClick={() => {
                                        setEditingAnnouncementId(ann.id);
                                        setAnnouncementForm({
                                            title_ar: ann.title_ar || '',
                                            title_en: ann.title_en || '',
                                            content_ar: ann.content_ar || '',
                                            content_en: ann.content_en || '',
                                            priority: ann.priority || 'medium',
                                            type: ann.type || 'general'
                                        });
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    {t('تعديل', 'Edit')}
                                </button>
                                <button
                                    className="btn btn-outline btn-sm flex-grow sm:flex-grow-0"
                                    style={{ borderColor: 'var(--border-color)', opacity: 0.7 }}
                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                >
                                    {t('حذف', 'Delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && <p className="text-center text-tertiary py-md">{t('لا توجد إعلانات', 'No announcements')}</p>}
                </div>
            </div>
        </div>
    );


    return (
        <div className="container py-xl" style={{ paddingTop: '2rem' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{t('لوحة تحكم المشرف', 'Admin Dashboard')}</h1>
                    <p className="text-secondary">{t('مرحباً', 'Welcome')}, {adminData?.username}</p>
                </div>
                <div className="flex flex-wrap gap-sm w-full md:w-auto">
                    <button
                        onClick={async () => {
                            if (!confirm(t('هل تريد مزامنة جميع الإحصائيات؟ قد يستغرق هذا بضع ثوانٍ.', 'Sync all statistics? This might take a few seconds.'))) return;
                            try {
                                const res = await fetch('/api/statistics/sync', { method: 'POST' });
                                if (res.ok) {
                                    alert(t('تمت المزامنة بنجاح!', 'Sync completed successfully!'));
                                    fetchInitialData();
                                }
                            } catch (e) {
                                console.error(e);
                                alert('Sync failed');
                            }
                        }}
                        className="btn btn-outline btn-sm flex-grow md:flex-grow-0 items-center gap-xs"
                    >
                        🔄 {t('مزامنة', 'Sync')}
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger btn-sm flex-grow md:flex-grow-0">
                        {t('تسجيل خروج', 'Logout')}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-md mb-xl">
                <div className="flex flex-wrap gap-md mb-xl">
                    {[
                        { id: 'overview', label: t('نظرة عامة', 'Overview') },
                        { id: 'statistics', label: t('الإحصائيات', 'Statistics') },
                        { id: 'resources', label: t('الموارد', 'Resources') },
                        { id: 'announcements', label: t('الإعلانات', 'Announcements') },
                        { id: 'questions', label: t('الأسئلة', 'Questions') }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'} flex-grow`}
                            style={{ minWidth: '120px' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'statistics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg fade-in">
                    {subjects.map(subject => (
                        <div key={subject.id} className="card">
                            <h3 className="text-lg font-bold mb-sm">{subject.name_ar}</h3>
                            <p className="text-secondary text-sm mb-md">{subject.code}</p>

                            <div className="space-y-sm">
                                <div>
                                    <label className="text-xs text-secondary block mb-xs">{t('المحاضرات المدروسة', 'Lectures Studied')}</label>
                                    <input
                                        type="number"
                                        className="input h-8 text-sm"
                                        defaultValue={subject.total_lectures}
                                        id={`lectures-${subject.id}`}
                                    />
                                </div>
                                {['EGS11203', 'EGS11304'].includes(subject.code) && (
                                    <div>
                                        <label className="text-xs text-secondary block mb-xs">{t('المعامل', 'Labs')}</label>
                                        <input
                                            type="number"
                                            className="input h-8 text-sm"
                                            defaultValue={subject.total_labs || 0}
                                            id={`labs-${subject.id}`}
                                        />
                                    </div>
                                )}
                                {subject.code === 'EGS12405' && (
                                    <div>
                                        <label className="text-xs text-secondary block mb-xs">{t('العملي', 'Practical')}</label>
                                        <input
                                            type="number"
                                            className="input h-8 text-sm"
                                            defaultValue={subject.total_practicals || 0}
                                            id={`practicals-${subject.id}`}
                                        />
                                    </div>
                                )}
                                {['EGS11101', 'EGS11102'].includes(subject.code) && (
                                    <div>
                                        <label className="text-xs text-secondary block mb-xs">{t('التمارين', 'Tutorials')}</label>
                                        <input
                                            type="number"
                                            className="input h-8 text-sm"
                                            defaultValue={subject.total_tutorials || 0}
                                            id={`tutorials-${subject.id}`}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-secondary block mb-xs">{t('الواجبات', 'Assignments')}</label>
                                    <input
                                        type="number"
                                        className="input h-8 text-sm"
                                        defaultValue={subject.total_assignments}
                                        id={`assignments-${subject.id}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-secondary block mb-xs">{t('الامتحانات', 'Exams')}</label>
                                    <input
                                        type="number"
                                        className="input h-8 text-sm"
                                        defaultValue={subject.total_exams}
                                        id={`exams-${subject.id}`}
                                    />
                                </div>
                                <button
                                    className="btn btn-primary btn-sm w-full mt-sm"
                                    onClick={async () => {
                                        const lectures = document.getElementById(`lectures-${subject.id}`).value;
                                        const assignments = document.getElementById(`assignments-${subject.id}`).value;
                                        const exams = document.getElementById(`exams-${subject.id}`).value;
                                        const labs = document.getElementById(`labs-${subject.id}`)?.value || 0;
                                        const practicals = document.getElementById(`practicals-${subject.id}`)?.value || 0;
                                        const tutorials = document.getElementById(`tutorials-${subject.id}`)?.value || 0;

                                        try {
                                            const res = await fetch(`/api/statistics/subject/${subject.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    total_lectures: parseInt(lectures),
                                                    total_assignments: parseInt(assignments),
                                                    total_exams: parseInt(exams),
                                                    total_labs: parseInt(labs),
                                                    total_practicals: parseInt(practicals),
                                                    total_tutorials: parseInt(tutorials)
                                                })
                                            });
                                            if (res.ok) {
                                                alert(t('تم تحديث الإحصائيات', 'Statistics updated'));
                                                fetchInitialData(); // Refresh to update overview and sync
                                            } else {
                                                alert('Error updating');
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Error updating');
                                        }
                                    }}
                                >
                                    {t('حفظ', 'Save')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'resources' && renderResourceForm()}
            {activeTab === 'announcements' && renderAnnouncementForm()}
            {activeTab === 'questions' && (
                <div className="space-y-lg">
                    <div className="card fade-in">
                        <div className="flex justify-between items-center mb-lg">
                            <h3 className="text-xl font-bold">{editingQuestionId ? t('تعديل السؤال', 'Edit Question') : t('إضافة سؤال جديد', 'Add New Question')}</h3>
                            {editingQuestionId && (
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        setEditingQuestionId(null);
                                        setQuestionForm({
                                            subject_id: '',
                                            topic_ar: '',
                                            topic_en: '',
                                            question_text_ar: '',
                                            question_text_en: '',
                                            answer_text_ar: '',
                                            answer_text_en: '',
                                            difficulty: 'medium',
                                            image: null
                                        });
                                    }}
                                >
                                    {t('إلغاء التعديل', 'Cancel Edit')}
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleQuestionSubmit} className="grid grid-cols-1 gap-md">
                            <div className="">
                                <label className="block mb-sm">{t('المقرر', 'Course')}</label>
                                <select
                                    className="select"
                                    value={questionForm.subject_id}
                                    onChange={e => setQuestionForm({ ...questionForm, subject_id: e.target.value })}
                                    required
                                >
                                    <option value="">{t('اختر المقرر', 'Select Course')}</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name_ar}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('الموضوع (عربي)', 'Topic (Arabic)')}
                                    value={questionForm.topic_ar}
                                    onChange={e => setQuestionForm({ ...questionForm, topic_ar: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder={t('الموضوع (إنجليزي)', 'Topic (English)')}
                                    value={questionForm.topic_en}
                                    onChange={e => setQuestionForm({ ...questionForm, topic_en: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <textarea
                                    className="textarea"
                                    placeholder={t('نص السؤال (عربي)', 'Question Text (Arabic)')}
                                    value={questionForm.question_text_ar}
                                    onChange={e => setQuestionForm({ ...questionForm, question_text_ar: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="textarea"
                                    placeholder={t('نص السؤال (إنجليزي)', 'Question Text (English)')}
                                    value={questionForm.question_text_en}
                                    onChange={e => setQuestionForm({ ...questionForm, question_text_en: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <textarea
                                    className="textarea"
                                    placeholder={t('الإجابة (عربي)', 'Answer (Arabic)')}
                                    value={questionForm.answer_text_ar}
                                    onChange={e => setQuestionForm({ ...questionForm, answer_text_ar: e.target.value })}
                                />
                                <textarea
                                    className="textarea"
                                    placeholder={t('الإجابة (إنجليزي)', 'Answer (English)')}
                                    value={questionForm.answer_text_en}
                                    onChange={e => setQuestionForm({ ...questionForm, answer_text_en: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                <div>
                                    <label className="block mb-sm">{t('الصعوبة', 'Difficulty')}</label>
                                    <select
                                        className="select"
                                        value={questionForm.difficulty}
                                        onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                                    >
                                        <option value="easy">{t('سهل', 'Easy')}</option>
                                        <option value="medium">{t('متوسط', 'Medium')}</option>
                                        <option value="hard">{t('صعب', 'Hard')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-sm">{t('صورة السؤال (اختيارية)', 'Question Image (Optional)')}</label>
                                    <input
                                        type="file"
                                        className="input"
                                        accept="image/*"
                                        onChange={e => setQuestionForm({ ...questionForm, image: e.target.files[0] })}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-sm">{t('صورة الإجابة (اختيارية)', 'Answer Image (Optional)')}</label>
                                    <input
                                        type="file"
                                        className="input"
                                        accept="image/*"
                                        onChange={e => setQuestionForm({ ...questionForm, answer_image: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <div className="mt-md">
                                <button type="submit" className="btn btn-primary w-full">
                                    {editingQuestionId ? t('تحديث السؤال', 'Update Question') : t('إضافة السؤال', 'Add Question')}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card fade-in">
                        <h3 className="text-xl font-bold mb-lg">{t('الأسئلة الحالية', 'Current Questions')}</h3>
                        <div className="space-y-md">
                            {questions.map(q => (
                                <div key={q.id} className="p-md border border-color rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
                                    <div className="truncate flex-1 w-full sm:w-auto">
                                        <div className="flex items-center gap-sm mb-xs">
                                            <span className="badge badge-primary">{q.subject_name_ar || q.subject_name_en}</span>
                                            <span className="text-xs text-tertiary">{q.topic_ar}</span>
                                        </div>
                                        <p className="font-medium truncate">{q.question_text_ar || q.question_text_en}</p>
                                    </div>
                                    <div className="flex gap-sm w-full sm:w-auto">
                                        <button
                                            className="btn btn-outline btn-sm flex-grow sm:flex-grow-0"
                                            onClick={() => {
                                                setEditingQuestionId(q.id);
                                                setQuestionForm({
                                                    subject_id: q.subject_id,
                                                    topic_ar: q.topic_ar || '',
                                                    topic_en: q.topic_en || '',
                                                    question_text_ar: q.question_text_ar || '',
                                                    question_text_en: q.question_text_en || '',
                                                    answer_text_ar: q.answer_text_ar || '',
                                                    answer_text_en: q.answer_text_en || '',
                                                    difficulty: q.difficulty || 'medium',
                                                    image: null,
                                                    answer_image: null
                                                });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            {t('تعديل', 'Edit')}
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm flex-grow sm:flex-grow-0"
                                            style={{ borderColor: 'var(--border-color)', opacity: 0.7 }}
                                            onClick={() => handleDeleteQuestion(q.id)}
                                        >
                                            {t('حذف', 'Delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {questions.length === 0 && <p className="text-center text-tertiary py-md">{t('لا توجد أسئلة', 'No questions')}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
