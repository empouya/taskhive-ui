import axios from 'axios';
import type { Team, Invitation, Member } from './teams.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const teamsApi = {
  create: async (name: string, description: string, access: string): Promise<Team> => {
    const { data } = await axios.post(
      `${API_BASE}/teams/`, 
      { name, description }, 
      {
        headers: { Authorization: `Bearer ${access}` },
        withCredentials: true
      }
    );
    return data;
  },

  getMembers: async (teamId: string, access: string): Promise<Member> => {
    const { data } = await axios.get(`${API_BASE}/teams/${teamId}/members/`, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data;
  },

  removeMember: async (teamId: string, userId: string, access: string) => {
    return await axios.delete(`${API_BASE}/teams/${teamId}/members/${userId}`,
      {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
  },

  listInvitations: async (teamId: string, access: string): Promise<Invitation[]> => {
    const { data } = await axios.get(`${API_BASE}/teams/${teamId}/invites/`, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
    return data;
  },

  createInvitation: async (teamId: string, email: string, access: string): Promise<Invitation> => {
    const { data } = await axios.post(`${API_BASE}/teams/${teamId}/invites/`, 
      { email },
      { headers: { Authorization: `Bearer ${access}` }, withCredentials: true }
    );
    return data;
  },

  deleteInvitation: async (teamId: string, inviteId: string, access: string): Promise<void> => {
    await axios.delete(`${API_BASE}/teams/${teamId}/invites/${inviteId}/`, {
      headers: { Authorization: `Bearer ${access}` },
      withCredentials: true
    });
  },

  acceptInvitation: async (token: string, access: string) => {
  const { data } = await axios.post(`${API_BASE}/invites/${token}/accept/`, 
    {},
    { headers: { Authorization: `Bearer ${access}` }, withCredentials: true }
  );
  return data;
},
};