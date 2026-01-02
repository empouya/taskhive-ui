import React, { useState, useEffect, useCallback } from 'react';
import { X, BellOff, Check, Circle, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { notificationsApi } from '../notifications.api';
import type { Notification } from '../notifications.api';

export const NotificationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { access } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!access) return;
        setLoading(true);
        try {
            const data = await notificationsApi.list(access);
            setNotifications(data);
        } catch (err) {
            console.log(err)
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, [access]);

    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    const handleMarkRead = async (id: string) => {
        if (!access) return;
        try {
            await notificationsApi.markAsRead(id, access);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
        } catch (err) {
            console.error("Failed to mark as read");
        }
    };

    // Action: Mark All
    const handleMarkAllRead = async () => {
        if (!access || notifications.every(n => !n.unread)) return;
        try {
            await notificationsApi.markAllAsRead(access);
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        } catch (err) {
            console.error("Failed to mark all as read");
        }
    };

    const formatNotificationText = (n: Notification) => (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
            <span className="font-bold text-slate-900 dark:text-white">{n.actor_email}</span>
            {" "}{n.verb}{" "}
            <span className="font-semibold text-primary">"{n.target_task_title}"</span>
        </p>
    );

    return (
        <>
            <div className={`fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                        <div>
                            <h2 className="text-lg font-bold dark:text-white">Activity</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Notifications</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleMarkAllRead}
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                title="Mark all as read"
                            >
                                <CheckCheck className="w-5 h-5" />
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center">
                                <BellOff className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm font-medium">No activity yet</p>
                                <p className="text-xs opacity-70">When tasks change, you'll see them here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-5 flex gap-4 items-start transition-colors ${n.unread ? 'bg-primary/[0.03] dark:bg-primary/[0.05]' : ''}`}
                                    >
                                        <div className="mt-1.5">
                                            {n.unread ? (
                                                <Circle className="w-2 h-2 fill-primary text-primary" />
                                            ) : (
                                                <div className="w-2 h-2" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            {formatNotificationText(n)}
                                            <p className="text-[10px] text-slate-400 font-medium italic">
                                                {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>

                                        {n.unread && (
                                            <button
                                                onClick={() => handleMarkRead(n.id)}
                                                className="flex-shrink-0 p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};