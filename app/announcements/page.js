'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function AnnouncementsPage() {
    const { t } = useApp();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch('/api/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data);
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

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
            <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container py-xl" style={{ paddingTop: '3rem' }}>
            <div className="mb-xl text-center">
                <h1 className="text-3xl font-bold mb-sm">{t('الإعلانات الأكاديمية', 'Academic Announcements')}</h1>
                <p className="text-secondary">{t('آخر التحديثات والأخبار المهمة للطلاب', 'Latest updates and important news for students')}</p>
            </div>

            <div className="grid grid-cols-1 gap-lg max-w-3xl mx-auto">
                {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement.id} className="card fade-in">
                            <div className="flex justify-between items-start mb-md">
                                <div className="flex items-center gap-sm">
                                    <span className={`badge ${getPriorityBadge(announcement.priority)}`}>
                                        {t(announcement.type.toUpperCase(), announcement.type.toUpperCase())}
                                    </span>
                                    <span className="text-sm text-tertiary">
                                        {new Date(announcement.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-md text-primary">
                                {t(announcement.title_ar, announcement.title_en)}
                            </h2>

                            <div className="text-secondary leading-relaxed whitespace-pre-line mb-lg">
                                {t(announcement.content_ar, announcement.content_en)}
                            </div>

                            <ReactionSection announcementId={announcement.id} />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-xl bg-secondary rounded-lg">
                        <p className="text-tertiary">{t('لا توجد إعلانات حالياً', 'No announcements yet')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReactionSection({ announcementId }) {
    const { t } = useApp();
    const [reactions, setReactions] = useState([]);
    const [reacted, setReacted] = useState(false);

    useEffect(() => {
        fetchReactions();
    }, [announcementId]);

    const fetchReactions = async () => {
        try {
            const res = await fetch(`/api/announcements/${announcementId}/reactions`);
            if (res.ok) {
                const data = await res.json();
                setReactions(data);
            }
        } catch (e) { }
    };

    const handleReact = async (type) => {
        if (reacted) return;
        try {
            const res = await fetch(`/api/announcements/${announcementId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reaction_type: type })
            });
            if (res.ok) {
                setReacted(true);
                fetchReactions();
            }
        } catch (e) { }
    };

    const reactionIcons = {
        like: '👍',
        love: '❤️',
        wow: '😮',
        sad: '😢'
    };

    return (
        <div className="border-t border-color pt-md flex flex-wrap gap-md items-center">
            <div className="flex gap-sm">
                {Object.entries(reactionIcons).map(([type, icon]) => (
                    <button
                        key={type}
                        onClick={() => handleReact(type)}
                        className={`reaction-btn ${reacted ? 'opacity-50 cursor-default' : 'hover:scale-125 transition-transform'}`}
                        title={t(type, type)}
                    >
                        {icon}
                    </button>
                ))}
            </div>
            <div className="flex gap-md ml-auto">
                {reactions.map(r => (
                    <span key={r.reaction_type} className="text-sm font-medium flex items-center gap-xs">
                        {reactionIcons[r.reaction_type]} {r.count}
                    </span>
                ))}
            </div>
            <style jsx>{`
                .reaction-btn {
                    font-size: 1.25rem;
                    background: none;
                    border: none;
                    padding: 0.25rem;
                }
            `}</style>
        </div>
    );
}
