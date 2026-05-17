import { apiClient } from '../../lib/apiClient';
import type { ApiNotificationDto } from '../../lib/contracts';
import { normalizeNotification } from '../../lib/normalizers';
import type { Notification } from './notifications.types';

export const notificationsApi = {
    list: async (): Promise<Notification[]> => {
        const { data } = await apiClient.get<ApiNotificationDto[]>('/notifications/');
        return data.map(normalizeNotification);
    },

    markAsRead: async (notificationId: number | string): Promise<void> => {
        await apiClient.patch(`/notifications/${notificationId}/read/`, { unread: false });
    },

    markAllAsRead: async (notifications: Notification[]): Promise<void> => {
        await Promise.all(
            notifications.map((notification) =>
                apiClient.patch(`/notifications/${notification.id}/read/`, { unread: false }),
            ),
        );
    },
};