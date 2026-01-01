import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-21 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
      {/* CONTEXTUAL PAGE TITLE */}
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
        Dashboard
      </h2>

      {/* USER ACTIONS */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.email}</p>
            <p className="text-[10px] text-slate-400 capitalize">Team Member</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};