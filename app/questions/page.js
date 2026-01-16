'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function QuestionsPage() {
    const { t } = useApp();
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [qRes, sRes] = await Promise.all([
                    fetch('/api/questions'),
                    fetch('/api/subjects')
                ]);

                if (qRes.ok) {
                    const data = await qRes.json();
                    setQuestions(data);
                    setFilteredQuestions(data);
                }
                if (sRes.ok) {
                    setSubjects(await sRes.json());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let result = questions;

        if (subjectFilter) {
            result = result.filter(q => q.subject_id === parseInt(subjectFilter));
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(q =>
                (q.question_text_ar && q.question_text_ar.toLowerCase().includes(lowerSearch)) ||
                (q.question_text_en && q.question_text_en.toLowerCase().includes(lowerSearch)) ||
                (q.topic_ar && q.topic_ar.toLowerCase().includes(lowerSearch))
            );
        }

        setFilteredQuestions(result);
    }, [search, subjectFilter, questions]);

    const toggleAnswer = (id) => {
        // Implement logic to toggle answer visibility per card if needed
        // For simplicity, we can just use details/summary html tag or a button
    };

    if (loading) return <div className="p-xl text-center"><div className="spinner"></div></div>;

    return (
        <div className="container py-xl" style={{ paddingTop: '3rem' }}>
            <div className="mb-xl text-center">
                <h1 className="text-3xl font-bold mb-sm">{t('بنك الأسئلة', 'Question Bank')}</h1>
                <p className="text-secondary">{t('مجموعة من الأسئلة والتمارين للمراجعة', 'Collection of questions and exercises for review')}</p>
            </div>

            <div className="card mb-xl p-lg bg-secondary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div>
                        <input
                            type="text"
                            className="input"
                            placeholder={t('بحث في الأسئلة...', 'Search questions...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="select"
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                            <option value="">{t('جميع المقررات', 'All Courses')}</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{t(s.name_ar, s.name_en)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-lg">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => (
                        <div key={q.id} className="card fade-in">
                            <div className="flex justify-between mb-md">
                                <span className="badge badge-primary">
                                    {subjects.find(s => s.id === q.subject_id)?.name_ar}
                                </span>
                                <span className={`badge ${q.difficulty === 'hard' ? 'badge-error' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                                    {t(q.difficulty, q.difficulty)}
                                </span>
                            </div>

                            <p className="text-lg font-medium mb-lg whitespace-pre-line">
                                {t(q.question_text_ar, q.question_text_en)}
                            </p>

                            {q.image_path && (
                                <div className="mb-lg rounded-lg border border-color overflow-hidden bg-white dark:bg-gray-800">
                                    <img
                                        src={q.image_path}
                                        alt="Question"
                                        className="w-full h-auto block cursor-zoom-in hover:opacity-95 transition-opacity"
                                        onClick={(e) => window.open(e.target.src, '_blank')}
                                    />
                                </div>
                            )}

                            <details className="bg-secondary p-md rounded-md cursor-pointer">
                                <summary className="font-bold text-primary select-none hover:text-primary-700">
                                    {t('عرض الإجابة', 'Show Answer')}
                                </summary>
                                <div className="mt-md pt-md border-t border-color text-secondary whitespace-pre-line">
                                    {t(q.answer_text_ar, q.answer_text_en)}
                                    {!q.answer_text_ar && !q.answer_text_en && !q.answer_image_path && t('لا توجد إجابة مسجلة', 'No answer recorded')}

                                    {q.answer_image_path && (
                                        <div className="mt-md rounded-lg border border-color overflow-hidden bg-white dark:bg-gray-800">
                                            <img
                                                src={q.answer_image_path}
                                                alt="Answer"
                                                className="w-full h-auto block cursor-zoom-in hover:opacity-95 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(e.target.src, '_blank');
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </details>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-xl">
                        <p className="text-tertiary">{t('لا توجد نتائج', 'No results found')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
