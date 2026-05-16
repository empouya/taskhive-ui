import { apiClient } from '../../lib/apiClient';
import type {
  ApiInvitationDto,
  ApiMemberDto,
  ApiTeamDto,
} from '../../lib/contracts';
import {
  normalizeInvitation,
  normalizeMember,
  normalizeTeam,
} from '../../lib/normalizers';
import type { Invitation, Member, Team } from './teams.types';

export const teamsApi = {
  create: async (name: string, description: string): Promise<Team> => {
    const { data } = await apiClient.post<ApiTeamDto>('/teams/', { name, description });
    return normalizeTeam(data);
  },

  getTeams: async (): Promise<Team[]> => {
    const { data } = await apiClient.get<ApiTeamDto[]>('/teams/');
    return data.map(normalizeTeam);
  },

  getMembers: async (teamId: number | string): Promise<Member[]> => {
    const { data } = await apiClient.get<ApiMemberDto[]>(`/teams/${teamId}/members/`);
    return data.map(normalizeMember);
  },

  removeMember: async (teamId: number | string, userId: number | string) => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  listInvitations: async (teamId: number | string): Promise<Invitation[]> => {
    const { data } = await apiClient.get<ApiInvitationDto[]>(`/teams/${teamId}/invites/`);
    return data.map(normalizeInvitation);
  },

  createInvitation: async (
    teamId: number | string,
    email: string,
  ): Promise<Invitation> => {
    const { data } = await apiClient.post<ApiInvitationDto>(`/teams/${teamId}/invites/`, {
      email,
    });
    return normalizeInvitation(data);
  },

  deleteInvitation: async (teamId: number | string, inviteId: number | string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/invites/${inviteId}/`);
  },

  acceptInvitation: async (token: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message?: string; detail?: string }>(
      `/invites/${token}/accept/`,
      {},
    );

    return {
      message: data.message ?? data.detail ?? 'Invitation accepted successfully.',
    };
  },
};