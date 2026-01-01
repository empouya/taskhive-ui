import axios from 'axios';
import type { Comment } from '../tasks/tasks.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const commentsApi = {
  create: async (taskId: string, content: string, access: string): Promise<Comment> => {
    const { data } = await axios.post(
      `${API_BASE}/tasks/${taskId}/comments/`,
      { content },
      { headers: { Authorization: `Bearer ${access}` }, withCredentials: true }
    );
    return data;
  },
  
  list: async (taskId: string, access: string): Promise<Comment[]> => {
    const { data } = await axios.get(
      `${API_BASE}/tasks/${taskId}/comments/`,
      { 
        headers: { Authorization: `Bearer ${access}` }, 
        withCredentials: true 
      }
    );
    return data; // This should be the array of comments
  },
};