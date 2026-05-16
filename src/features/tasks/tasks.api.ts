import type { Task, UpdateTaskPayload } from './tasks.types';
import { apiClient } from '../../lib/apiClient';


export const tasksApi = {
  listByProject: async (projectId: string): Promise<Task[]> => {
    const { data } = await apiClient.get(`/projects/${projectId}/tasks/`);
    return data;
  },

  update: async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${taskId}/`, payload);
    return data;
  },

  create: async (projectId: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.post(`/projects/${projectId}/tasks/`, payload);
    return data;
  },
};