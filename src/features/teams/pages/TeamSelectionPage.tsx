import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../../app/providers/TeamProvider';
import { Users, ChevronRight, Loader2 } from 'lucide-react';
import type { Team } from '../teams.types';

export const TeamSelectionPage: React.FC = () => {
  const { teams, setActiveTeam, isLoading } = useTeam();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && teams.length === 1) {
      handleSelect(teams[0]);
    }
  }, [teams, isLoading]);

  const handleSelect = (team: any) => {
    setActiveTeam(team);
    navigate('/projects');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Choose your workspace</h1>
          <p className="text-slate-500 mt-2">Select a team to continue to your projects.</p>
        </div>

        <div className="space-y-3">
          {teams.map((team: Team) => (
            <button
              key={team.id}
              onClick={() => handleSelect(team)}
              className="group cursor-pointer w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  {team.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{team.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{team.role}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate('/teams/create')}
          className="w-full cursor-pointer py-3 text-sm font-semibold text-slate-500 hover:text-primary transition-colors border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
        >
          + Create a new team
        </button>
      </div>
    </div>
  );
};