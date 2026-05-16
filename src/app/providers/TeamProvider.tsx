import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { access, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(() => {
    try {
      const saved = localStorage.getItem('activeTeam');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const fetchTeams = useCallback(async () => {
    if (authLoading) return;
    if (!access) {
      setTeams([]);
      setActiveTeamState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await teamsApi.getTeams();
      setTeams(data);

      if (activeTeam) {
        const exists = data.find((t: Team) => t.id === activeTeam.id);
        if (!exists) {
          setActiveTeamState(null);
          localStorage.removeItem('activeTeam');
        }
      } else if (data.length === 1) {
        const firstTeam = data[0];
        setActiveTeamState(firstTeam);
        localStorage.setItem('activeTeam', JSON.stringify(firstTeam));
      }
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setIsLoading(false);
    }
  }, [access, authLoading, activeTeam]);


  // Fetch teams when authenticated
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSetActiveTeam = (team: Team) => {
    setActiveTeamState(team);
    localStorage.setItem('activeTeam', JSON.stringify(team));
  };

  const requiresSelection = useMemo(() => {
    return (teams.length > 1 || teams.length == 0) && !activeTeam;
  }, [teams, activeTeam]);

  return (
    <TeamContext.Provider value={{
      teams,
      activeTeam,
      setActiveTeam: handleSetActiveTeam,
      isLoading,
      requiresSelection,
      refreshTeams: fetchTeams
    }}>
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