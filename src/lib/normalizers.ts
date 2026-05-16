import type {
    ApiAuthResponseDto,
    ApiCommentDto,
    ApiId,
    ApiInvitationDto,
    ApiMemberDto,
    ApiNotificationDto,
    ApiProjectDto,
    ApiRole,
    ApiTaskDto,
    ApiTeamDto,
    ApiUserDto,
    AssignTaskRequestDto,
    CreateTaskRequestDto,
    UpdateTaskRequestDto,
} from './contracts';
import type { AuthResponse, User } from '../features/auth/auth.types';
import type { Invitation, Member, Team } from '../features/teams/teams.types';
import type { Project } from '../features/projects/projects.types';
import type {
    Comment,
    CreateTaskInput,
    Task,
    UpdateTaskPayload,
} from '../features/tasks/tasks.types';
import type { Notification } from '../features/notifications/notifications.types';

const toNumberId = (value: ApiId | string): number => Number(value);

const normalizeRole = (role: ApiRole | null | undefined): 'ADMIN' | 'MEMBER' => {
    if (typeof role !== 'string') {
        return 'MEMBER';
    }

    return role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'MEMBER';
};

export const normalizeUser = (user: ApiUserDto): User => ({
    id: toNumberId(user.id),
    email: user.email,
});

export const normalizeAuthResponse = (payload: ApiAuthResponseDto): AuthResponse => ({
    access: payload.access,
    user: normalizeUser(payload.user),
});

export const normalizeTeam = (team: ApiTeamDto): Team => ({
    id: toNumberId(team.id),
    name: team.name,
    description: team.description ?? '',
    role: normalizeRole(team.role),
});

export const normalizeMember = (member: ApiMemberDto): Member => ({
    id: toNumberId(member.id),
    email: member.email,
    role: normalizeRole(member.role),
});

export const normalizeInvitation = (invite: ApiInvitationDto): Invitation => ({
    id: toNumberId(invite.id),
    email: invite.email,
    token: invite.token,
    created_at: invite.created_at,
});

export const normalizeProject = (project: ApiProjectDto): Project => ({
    id: toNumberId(project.id),
    name: project.name,
    description: project.description ?? '',
    is_archived: project.is_archived,
    team_id: toNumberId(project.team_id),
    created_at: project.created_at,
});

export const normalizeTask = (task: ApiTaskDto): Task => ({
    id: toNumberId(task.id),
    project_id: toNumberId(task.project_id),
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? null,
    position: task.position ?? task.order ?? 0,
    assignee_id: task.assignee_id == null ? null : toNumberId(task.assignee_id),
});

export const normalizeComment = (comment: ApiCommentDto): Comment => ({
    id: toNumberId(comment.id),
    author: normalizeUser(comment.author),
    content: comment.content,
    created_at: comment.created_at,
});

export const normalizeNotification = (notification: ApiNotificationDto): Notification => ({
    id: toNumberId(notification.id),
    actor_email: notification.actor_email ?? notification.actor?.email ?? 'Unknown user',
    verb: notification.verb,
    target_task_title:
        notification.target_task_title ?? notification.task_title ?? 'Unknown task',
    unread:
        typeof notification.unread === 'boolean'
            ? notification.unread
            : !notification.is_read,
    created_at: notification.created_at,
});

export const toCreateTaskRequest = (
    input: CreateTaskInput,
): CreateTaskRequestDto => ({
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    position: input.position,
});

export const toUpdateTaskRequest = (
    payload: UpdateTaskPayload,
): UpdateTaskRequestDto => ({
    title: payload.title,
    description: payload.description,
    status: payload.status,
    priority: payload.priority,
    due_date: payload.due_date,
});

export const toAssignTaskRequest = (assigneeId: number): AssignTaskRequestDto => ({
    assignee_id: assigneeId,
});