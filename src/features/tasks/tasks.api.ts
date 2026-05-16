import { apiClient } from '../../lib/apiClient';
import type {
  ApiCommentDto,
  ApiTaskDto,
} from '../../lib/contracts';
import {
  normalizeComment,
  normalizeTask,
  toAssignTaskRequest,
  toCreateTaskRequest,
  toUpdateTaskRequest,
} from '../../lib/normalizers';
import type {
  Comment,
  CreateTaskInput,
  Task,
  UpdateTaskPayload,
} from './tasks.types';

export const tasksApi = {
  listByProject: async (projectId: number | string): Promise<Task[]> => {
    const { data } = await apiClient.get<ApiTaskDto[]>(`/projects/${projectId}/tasks/`);
    return data.map(normalizeTask);
  },

  update: async (
    taskId: number | string,
    payload: UpdateTaskPayload,
  ): Promise<Task> => {
    const { data } = await apiClient.patch<ApiTaskDto>(
      `/tasks/${taskId}/`,
      toUpdateTaskRequest(payload),
    );
    return normalizeTask(data);
  },

  create: async (projectId: number | string, payload: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post<ApiTaskDto>(
      `/projects/${projectId}/tasks/`,
      toCreateTaskRequest(payload),
    );
    return normalizeTask(data);
  },

  assign: async (taskId: number | string, assigneeId: number): Promise<Task> => {
    const { data } = await apiClient.patch<ApiTaskDto>(
      `/tasks/${taskId}/assign/`,
      toAssignTaskRequest(assigneeId),
    );
    return normalizeTask(data);
  },

  delete: async (taskId: number | string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/`);
  },
};

export const taskCommentsApi = {
  list: async (taskId: number | string): Promise<Comment[]> => {
    const { data } = await apiClient.get<ApiCommentDto[]>(`/tasks/${taskId}/comments/`);
    return data.map(normalizeComment);
  },

  create: async (taskId: number | string, content: string): Promise<Comment> => {
    const { data } = await apiClient.post<ApiCommentDto>(`/tasks/${taskId}/comments/`, {
      content,
    });
    return normalizeComment(data);
  },
};