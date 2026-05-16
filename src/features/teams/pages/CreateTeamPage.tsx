import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateTeamForm } from '../components/CreateTeamForm';

export const CreateTeamPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <CreateTeamForm />

      <button
        type="button"
        onClick={() => navigate('/teams/select')}
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        Cancel and go back
      </button>
    </main>
  );
};