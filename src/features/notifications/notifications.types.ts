export interface Notification {
    id: number;
    actor_email: string;
    verb: string;
    target_task_title: string;
    unread: boolean;
    created_at: string;
}