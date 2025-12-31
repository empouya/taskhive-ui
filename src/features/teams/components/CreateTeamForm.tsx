import React, { useState } from 'react';
import { Users, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { teamsApi } from '../teams.api';

export const CreateTeamForm: React.FC = () => {
  const { access } = useAuth();
  const { setActiveTeam } = useTeam();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!access) {
        alert("You are not logged in yet");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const newTeam = await teamsApi.create(name, access);
      setActiveTeam(newTeam);
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create team. Name might be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create a new team</h1>
        <p className="text-slate-500 text-sm mt-2">Bring your projects and members together.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Team Name</label>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="e.g. Marketing Titans"
          />
          
        </div>

        {error && (
          <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="group relative w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Team
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};