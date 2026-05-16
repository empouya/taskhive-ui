import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../../app/providers/TeamProvider';
import { Users, ChevronRight, Loader2, Check } from 'lucide-react';
import type { Team } from '../teams.types';

export const TeamSelectionPage: React.FC = () => {
  const { teams, activeTeam, setActiveTeam, isLoading } = useTeam();
  const navigate = useNavigate();

  const handleSelect = (team: Team) => {
    setActiveTeam(team);
    navigate('/projects', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasTeams = teams.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {hasTeams ? 'Choose your workspace' : 'Create your first workspace'}
          </h1>
          <p className="text-slate-500 mt-2">
            {hasTeams
              ? 'Select a team to continue to your projects.'
              : 'You are signed in, but you do not belong to any team yet.'}
          </p>
        </div>

        {hasTeams && (
          <div className="space-y-3">
            {teams.map((team) => {
              const isCurrent = activeTeam?.id === team.id;

              return (
                <button
                  key={team.id}
                  onClick={() => handleSelect(team)}
                  className={`group cursor-pointer w-full flex items-center justify-between p-4 border rounded-2xl transition-all text-left ${isCurrent
                      ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white'
                      }`}>
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{team.name}</h3>
                      <p className="text-xs text-slate-500 capitalize">{team.role.toLowerCase()}</p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => navigate('/teams/create')}
          disabled={isLoading}
          className="w-full cursor-pointer py-3 text-sm font-semibold text-slate-500 hover:text-primary transition-colors border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
        >
          + Create a new team
        </button>
      </div>
    </div>
  );
};