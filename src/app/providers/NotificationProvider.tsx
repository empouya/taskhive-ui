import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { notificationsApi } from '../../features/notifications/notifications.api';
import type { Notification } from '../../features/notifications/notifications.types';
import { getErrorMessage } from '../../lib/apiError';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { access } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshNotifications = useCallback(async () => {
        if (!access) {
            setNotifications([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await notificationsApi.list();
            setNotifications(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to load notifications.'));
        } finally {
            setIsLoading(false);
        }
    }, [access]);

    const markAsRead = useCallback(async (notificationId: number) => {
        await notificationsApi.markAsRead(notificationId);
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, unread: false }
                    : notification,
            ),
        );
    }, []);

    const markAllAsRead = useCallback(async () => {
        const unreadNotifications = notifications.filter((notification) => notification.unread);
        if (unreadNotifications.length === 0) {
            return;
        }

        await notificationsApi.markAllAsRead(unreadNotifications);
        setNotifications((prev) => prev.map((notification) => ({ ...notification, unread: false })));
    }, [notifications]);

    useEffect(() => {
        void refreshNotifications();
    }, [refreshNotifications]);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => notification.unread).length,
        [notifications],
    );

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                error,
                refreshNotifications,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};