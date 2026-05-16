export type ApiId = number;
export type ApiRole = 'ADMIN' | 'MEMBER' | 'admin' | 'member';
export type ApiTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type ApiTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ApiErrorPayload {
    detail?: string;
    message?: string;
    error?: string;
    [key: string]: unknown;
}

export interface ApiUserDto {
    id: ApiId | string;
    email: string;
}

export interface ApiAuthResponseDto {
    access: string;
    user: ApiUserDto;
}

export interface ApiTeamDto {
    id: ApiId | string;
    name: string;
    description?: string | null;
    role: ApiRole;
}

export interface ApiMemberDto {
    id: ApiId | string;
    email: string;
    role: ApiRole;
}

export interface ApiInvitationDto {
    id: ApiId | string;
    email: string;
    token: string;
    created_at: string;
}

export interface ApiProjectDto {
    id: ApiId | string;
    name: string;
    description?: string | null;
    is_archived: boolean;
    team_id: ApiId | string;
    created_at: string;
}

export interface ApiTaskDto {
    id: ApiId | string;
    project_id: ApiId | string;
    title: string;
    description?: string | null;
    status: ApiTaskStatus;
    priority: ApiTaskPriority;
    due_date?: string | null;
    position?: number | null;
    order?: number | null;
    assignee_id?: ApiId | string | null;
}

export interface ApiCommentDto {
    id: ApiId | string;
    author: ApiUserDto;
    content: string;
    created_at: string;
}

export interface ApiNotificationDto {
    id: ApiId | string;
    actor_email?: string | null;
    actor?: {
        email?: string | null;
    } | null;
    verb: string;
    target_task_title?: string | null;
    task_title?: string | null;
    unread?: boolean;
    is_read?: boolean;
    created_at: string;
}

export interface CreateTaskRequestDto {
    title: string;
    description: string;
    status: ApiTaskStatus;
    priority: ApiTaskPriority;
    position: number;
}

export interface UpdateTaskRequestDto {
    title?: string;
    description?: string;
    status?: ApiTaskStatus;
    priority?: ApiTaskPriority;
    due_date?: string | null;
}

export interface AssignTaskRequestDto {
    assignee_id: ApiId;
}