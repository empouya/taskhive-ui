import type { Team, Invitation, Member } from './teams.types';
import { apiClient } from '../../lib/apiClient';


export const teamsApi = {
  create: async (name: string, description: string): Promise<Team> => {
    const { data } = await apiClient.post('/teams/', { name, description });
    return data;
  },

  getTeams: async () => {
    const { data } = await apiClient.get('/teams/');
    return data;
  },

  getMembers: async (teamId: string): Promise<Member[]> => {
    const { data } = await apiClient.get(`/teams/${teamId}/members/`);
    return data;
  },

  removeMember: async (teamId: string, userId: string) => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  listInvitations: async (teamId: string): Promise<Invitation[]> => {
    const { data } = await apiClient.get(`/teams/${teamId}/invites/`);
    return data;
  },

  createInvitation: async (teamId: string, email: string): Promise<Invitation> => {
    const { data } = await apiClient.post(`/teams/${teamId}/invites/`, { email });
    return data;
  },

  deleteInvitation: async (teamId: string, inviteId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/invites/${inviteId}/`);
  },

  acceptInvitation: async (token: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/invites/${token}/accept/`, {});
    return data;
  },
};