export type TeamRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface Team {
  id: number;
  name: string;
  description: string;
  role: TeamRole;
}

export interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
}

export interface Member {
  id: number;
  email: string;
  role: TeamRole;
}

export interface Invitation {
  id: number;
  email: string;
  token: string;
  created_at: string;
}