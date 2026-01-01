import axios from 'axios';
import type { Task, UpdateTaskPayload } from './tasks.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const tasksApi = {
  listByProject: async (projectId: string, access: string): Promise<Task[]> => {
    const { data } = await axios.get(`${API_BASE}/projects/${projectId}/tasks/`, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data
  },

  update: async (taskId: string, payload: UpdateTaskPayload, access: string): Promise<Task> => {
    const { data } = await axios.patch(`${API_BASE}/tasks/${taskId}/`, payload, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data;
  },

  create: async (projectId: string, payload: Partial<Task>, access: string): Promise<Task> => {
    const { data } = await axios.post(
      `${API_BASE}/projects/${projectId}/tasks/`, 
      payload, 
      {
        headers: { Authorization: `Bearer ${access}` },
        withCredentials: true
      }
    );
    return data;
  }
};