export interface Team {
  id: number;
  name: string;
  description: string;
  role: 'ADMIN' | 'MEMBER';
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
  role: 'ADMIN' | 'MEMBER';
}

export interface Invitation {
  id: number;
  email: string;
  token: string;
  created_at: string;
}