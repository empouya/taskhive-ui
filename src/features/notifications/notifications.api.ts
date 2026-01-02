import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Notification {
    id: string;
    actor_email: string;
    verb: string;
    target_task_title: string;
    unread: boolean;
    created_at: string;
}

export const notificationsApi = {
    list: async (access: string): Promise<Notification[]> => {
        const { data } = await axios.get(`${API_BASE}/notifications/`, {
            headers: { Authorization: `Bearer ${access}` },
            withCredentials: true
        });
        return data;
    },

    markAsRead: async (notificationId: string, access: string): Promise<void> => {
        await axios.patch(`${API_BASE}/notifications/${notificationId}/read/`,
            { unread: false },
            { headers: { Authorization: `Bearer ${access}` }, withCredentials: true }
        );
    },

    markAllAsRead: async (access: string): Promise<void> => {
        await axios.post(`${API_BASE}/notifications/mark-all-read/`,
            {},
            { headers: { Authorization: `Bearer ${access}` }, withCredentials: true }
        );
    }
};