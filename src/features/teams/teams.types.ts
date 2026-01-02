export interface Team {
  id: string;
  name: string;
  description: string;
  role: 'admin' | 'member';
}

export interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
}

export interface Member {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Invitation {
  id: string;
  email: string;
  token: string;
  created_at: string;
}