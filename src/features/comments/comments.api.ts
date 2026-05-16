import type { Comment } from '../tasks/tasks.types';
import { apiClient } from '../../lib/apiClient';


export const commentsApi = {
  create: async (taskId: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/tasks/${taskId}/comments/`, { content });
    return data;
  },

  list: async (taskId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get(`/tasks/${taskId}/comments/`);
    return data;
  },
};