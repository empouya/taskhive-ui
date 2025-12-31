import axios from 'axios';
import type { Project, CreateProjectPayload } from './projects.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const projectsApi = {
  list: async (teamId: string, access: string): Promise<Project[]> => {
    const { data } = await axios.get(`${API_BASE}/teams/${teamId}/projects/`, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data;
  },

  create: async (teamId: string, payload: CreateProjectPayload, access: string): Promise<Project> => {
    const { data } = await axios.post(`${API_BASE}/teams/${teamId}/projects/`, payload, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data;
  },

  archive: async (projectId: string, access: string): Promise<void> => {
    await axios.post(`${API_BASE}/projects/${projectId}/archive/`, {}, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
  }
};