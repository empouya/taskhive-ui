import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTeam } from '../../../app/providers/TeamProvider';

export const TeamSwitcher: React.FC = () => {
  const { teams, activeTeam, setActiveTeam } = useTeam();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeTeam) return null;

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">
            {activeTeam.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {activeTeam.name}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 overflow-hidden">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Your Teams
            </div>
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  setActiveTeam(team);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {team.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={activeTeam.id === team.id ? 'font-semibold' : ''}>
                    {team.name}
                  </span>
                </div>
                {activeTeam.id === team.id && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};