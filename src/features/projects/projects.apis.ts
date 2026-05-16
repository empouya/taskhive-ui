import type { Project, CreateProjectPayload } from './projects.types';
import { apiClient } from '../../lib/apiClient';


export const projectsApi = {
  list: async (teamId: string): Promise<Project[]> => {
    const { data } = await apiClient.get(`/teams/${teamId}/projects/`);
    return data;
  },

  create: async (teamId: string, payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post(`/teams/${teamId}/projects/`, payload);
    return data;
  },

  archive: async (projectId: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/archive/`, {});
  },
};