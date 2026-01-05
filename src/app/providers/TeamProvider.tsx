import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Team } from '../../features/teams/teams.types';
import { useAuth } from './AuthProvider';
import { teamsApi } from '../../features/teams/teams.api';

interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
  requiresSelection: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { access, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(() => {
    try {
      const saved = localStorage.getItem('activeTeam');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);


  // Fetch teams when authenticated
  useEffect(() => {
    const fetchTeams = async () => {
      if (authLoading || !access) {
        setTeams([]);
        setActiveTeamState(null);
        return
      }
      setIsLoading(true);
      try {
        const data = await teamsApi.getTeams(access);
        setTeams(data);

        if (data.length === 1) {
          handleSetActiveTeam(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch teams", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [access]);

  const handleSetActiveTeam = (team: Team) => {
    setActiveTeamState(team);
    localStorage.setItem('activeTeam', JSON.stringify(team));
  };

  const requiresSelection = useMemo(() => {
    return (teams.length > 1 || teams.length == 0) && !activeTeam;
  }, [teams, activeTeam]);

  return (
    <TeamContext.Provider value={{ teams, activeTeam, setActiveTeam: handleSetActiveTeam, isLoading, requiresSelection }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};