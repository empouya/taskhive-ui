import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Team } from '../../features/teams/teams.types';
import { teamsApi } from '../../features/teams/teams.api';
import { useAuth } from './AuthProvider';

interface TeamContextType {
  teams: Team[];
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  isLoading: boolean;
  requiresSelection: boolean;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const areTeamsEqual = (left: Team | null, right: Team | null) => {
  if (!left || !right) return left === right;

  return (
    left.id === right.id &&
    left.name === right.name &&
    left.description === right.description &&
    left.role === right.role
  );
};

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { access, isLoading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(() => {
    try {
      const saved = localStorage.getItem('activeTeam');
      return saved ? (JSON.parse(saved) as Team) : null;
    } catch {
      return null;
    }
  });

  const clearActiveTeam = useCallback(() => {
    setActiveTeamState((prev) => {
      if (prev !== null) {
        localStorage.removeItem('activeTeam');
      }
      return null;
    });
  }, []);

  const handleSetActiveTeam = useCallback((team: Team) => {
    setActiveTeamState((prev) => {
      if (areTeamsEqual(prev, team)) {
        return prev;
      }

      localStorage.setItem('activeTeam', JSON.stringify(team));
      return team;
    });
  }, []);

  const activeTeamId = activeTeam?.id ?? null;

  const fetchTeams = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!access) {
      setTeams([]);
      clearActiveTeam();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextTeams = await teamsApi.getTeams();
      setTeams(nextTeams);

      if (nextTeams.length === 0) {
        clearActiveTeam();
        return;
      }

      if (activeTeamId !== null) {
        const matchingTeam = nextTeams.find((team) => team.id === activeTeamId);

        if (matchingTeam) {
          handleSetActiveTeam(matchingTeam);
          return;
        }
      }

      if (nextTeams.length === 1) {
        handleSetActiveTeam(nextTeams[0]);
        return;
      }

      clearActiveTeam();
    } catch (error) {
      console.error('Failed to fetch teams', error);
    } finally {
      setIsLoading(false);
    }
  }, [access, activeTeamId, authLoading, clearActiveTeam, handleSetActiveTeam]);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const requiresSelection = useMemo(() => {
    return teams.length > 1 && !activeTeam;
  }, [teams, activeTeam]);

  return (
    <TeamContext.Provider
      value={{
        teams,
        activeTeam,
        setActiveTeam: handleSetActiveTeam,
        isLoading,
        requiresSelection,
        refreshTeams: fetchTeams,
      }}
    >
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