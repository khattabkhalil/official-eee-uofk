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
        image: null
    });

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

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...announcementForm, added_by: adminData.id })
            });
            if (res.ok) {
                alert(t('تم إضافة الإعلان بنجاح', 'Announcement added successfully'));
                fetchInitialData();
                setAnnouncementForm({ ...announcementForm, title_ar: '', title_en: '' });
            }
        } catch (error) {
            console.error('Error adding announcement:', error);
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(questionForm).forEach(key => {
            if (questionForm[key] !== null) formData.append(key, questionForm[key]);
        });
        formData.append('added_by', adminData.id);

        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert(t('تم إضافة السؤال بنجاح', 'Question added successfully'));
                fetchInitialData();
                setQuestionForm({ ...questionForm, question_text_ar: '', question_text_en: '' });
            }
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    if (loading) return <div className="p-xl text-center"><div className="spinner"></div></div>;

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg fade-in">
            <div className="card p-lg text-center">
                <h3 className="text-3xl font-bold text-primary">{stats.totalSubjects || 0}</h3>
                <p className="text-secondary">{t('المواد', 'Subjects')}</p>
            </div>
            <div className="card p-lg text-center">
                <h3 className="text-3xl font-bold text-success">{stats.totalLectures || 0}</h3>
                <p className="text-secondary">{t('المحاضرات', 'Lectures')}</p>
            </div>
            <div className="card p-lg text-center">
                <h3 className="text-3xl font-bold text-warning">{stats.totalAssignments || 0}</h3>
                <p className="text-secondary">{t('الواجبات', 'Assignments')}</p>
            </div>
            <div className="card p-lg text-center">
                <h3 className="text-3xl font-bold text-error">{stats.totalExams || 0}</h3>
                <p className="text-secondary">{t('الامتحانات', 'Exams')}</p>
            </div>
        </div>
    );

    const renderResourceForm = () => (
        <div className="card fade-in">
            <h3 className="text-xl font-bold mb-lg">{t('إضافة مورد جديد', 'Add New Resource')}</h3>
            <form onSubmit={handleResourceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="col-span-1 md:col-span-2">
                    <label className="block mb-sm">{t('المادة', 'Subject')}</label>
                    <select
                        className="select"
                        value={resourceForm.subject_id}
                        onChange={e => setResourceForm({ ...resourceForm, subject_id: e.target.value })}
                        required
                    >
                        <option value="">{t('اختر المادة', 'Select Subject')}</option>
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
    );

    const renderAnnouncementForm = () => (
        <div className="card fade-in">
            <h3 className="text-xl font-bold mb-lg">{t('إضافة إعلان جديد', 'Add New Announcement')}</h3>
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
                    <button type="submit" className="btn btn-primary w-full">{t('نشر الإعلان', 'Publish Announcement')}</button>
                </div>
            </form>
        </div>
    );


    return (
        <div className="container py-xl" style={{ paddingTop: '2rem' }}>
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="text-3xl font-bold">{t('لوحة تحكم المشرف', 'Admin Dashboard')}</h1>
                    <p className="text-secondary">{t('مرحباً', 'Welcome')}, {adminData?.username}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                    {t('تسجيل خروج', 'Logout')}
                </button>
            </div>

            <div className="flex flex-wrap gap-md mb-xl">
                {['overview', 'resources', 'announcements', 'questions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'} flex-grow`}
                        style={{ minWidth: '120px' }}
                    >
                        {t(tab.charAt(0).toUpperCase() + tab.slice(1), tab.charAt(0).toUpperCase() + tab.slice(1))}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'resources' && renderResourceForm()}
            {activeTab === 'announcements' && renderAnnouncementForm()}
            {activeTab === 'questions' && (
                <div className="card fade-in">
                    <h3 className="text-xl font-bold mb-lg">{t('إضافة سؤال جديد', 'Add New Question')}</h3>
                    <form onSubmit={handleQuestionSubmit} className="grid grid-cols-1 gap-md">
                        <div className="">
                            <label className="block mb-sm">{t('المادة', 'Subject')}</label>
                            <select
                                className="select"
                                value={questionForm.subject_id}
                                onChange={e => setQuestionForm({ ...questionForm, subject_id: e.target.value })}
                                required
                            >
                                <option value="">{t('اختر المادة', 'Select Subject')}</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name_ar}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            <textarea
                                className="textarea"
                                placeholder={t('نص السؤال (عربي)', 'Question Text (Arabic)')}
                                value={questionForm.question_text_ar}
                                onChange={e => setQuestionForm({ ...questionForm, question_text_ar: e.target.value })}
                            />
                            <textarea
                                className="textarea"
                                placeholder={t('نص السؤال (إنجليزي)', 'Question Text (English)')}
                                value={questionForm.question_text_en}
                                onChange={e => setQuestionForm({ ...questionForm, question_text_en: e.target.value })}
                            />
                        </div>
                        <div className="mt-md">
                            <button type="submit" className="btn btn-primary w-full">{t('إضافة السؤال', 'Add Question')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
