import axios from 'axios';
import type { Team } from './teams.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const teamsApi = {
  create: async (name: string, access: string): Promise<Team> => {
    const { data } = await axios.post(
      `${API_BASE}/teams/`, 
      { name }, 
      {
        headers: { Authorization: `Bearer ${access}` },
        withCredentials: true
      }
    );
    return data;
  }
};