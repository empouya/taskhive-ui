import { apiClient } from '../../lib/apiClient';


export interface Notification {
    id: string;
    actor_email: string;
    verb: string;
    target_task_title: string;
    unread: boolean;
    created_at: string;
}

export const notificationsApi = {
    list: async (): Promise<Notification[]> => {
        const { data } = await apiClient.get('/notifications/');
        return data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await apiClient.patch(`/notifications/${notificationId}/read/`, { unread: false });
    },

    markAllAsRead: async (): Promise<void> => {
        await apiClient.post('/notifications/mark-all-read/', {});
    },
};