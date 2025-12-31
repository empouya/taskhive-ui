import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Team } from '../../features/teams/teams.types';
import { useAuth } from './AuthProvider';
import axios from 'axios';

const TeamContext = createContext<any>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { access, user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeamState] = useState<Team | null>(() => {
    const saved = localStorage.getItem('activeTeam');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch teams when authenticated
  useEffect(() => {
    const fetchTeams = async () => {
      if (!access) return;
      setIsLoading(true);
      try {
        const { data } = await axios.get('http://localhost:8000/api/v1/teams/', {
          headers: { Authorization: `Bearer ${access}` },
          withCredentials: true
        });
        setTeams(data);
        
        // If no active team is set, or current active team isn't in the list, set the first one
        if (!activeTeam || !data.find((t: Team) => t.id === activeTeam.id)) {
          if (data.length > 0) handleSetActiveTeam(data[0]);
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
    // Implementation Detail: In Step 3, we will trigger a state reset across project/task stores here
  };

  return (
    <TeamContext.Provider value={{ teams, activeTeam, setActiveTeam: handleSetActiveTeam, isLoading }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);