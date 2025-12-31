export interface Team {
  id: string;
  name: string;
  role: 'admin' | 'member';
}

export interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
}