import { apiClient } from '../../lib/apiClient';
import type { ApiProjectDto } from '../../lib/contracts';
import { normalizeProject } from '../../lib/normalizers';
import type { CreateProjectPayload, Project } from './projects.types';

export const projectsApi = {
  list: async (teamId: number | string): Promise<Project[]> => {
    const { data } = await apiClient.get<ApiProjectDto[]>(`/teams/${teamId}/projects/`);
    console.log(data);
    return data.map(normalizeProject);
  },

  create: async (
    teamId: number | string,
    payload: CreateProjectPayload,
  ): Promise<Project> => {
    const { data } = await apiClient.post<ApiProjectDto>(`/teams/${teamId}/projects/`, payload);
    return normalizeProject(data);
  },

  archive: async (projectId: number | string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/archive/`, {});
  },

  restore: async (projectId: number | string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/restore/`, {});
  },
};