import React, { useState } from 'react';
import { Bell, LogOut, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useTeam } from '../providers/TeamProvider';
import { MembersDrawer } from '../../features/teams/components/MembersDrawer';
import { InviteManagerDrawer } from '../../features/teams/components/InviteManagementDrawer';
import { NotificationDrawer } from '../../features/notifications/components/NotificationDrawer';

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeTeam } = useTeam();

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isInvitesOpen, setIsInvitesOpen] = useState(false);

  const isAdmin = activeTeam?.role === 'ADMIN';
  const displayRole = isAdmin ? 'Team Admin' : 'Team Member';

  return (
    <header className="h-21 flex-shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30">
      {/* CONTEXTUAL PAGE TITLE */}
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
        Dashboard
      </h2>

      {/* USER ACTIONS */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={() => setIsInvitesOpen(true)}
            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-sm font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden lg:inline">Manage Invites</span>
          </button>
        )}

        <button
          onClick={() => setIsMembersOpen(true)}
          className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Members</span>
        </button>

        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative cursor-pointer p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.email}</p>
            <p className={`text-[10px] font-bold uppercase tracking-wide ${activeTeam?.role === 'admin' ? 'text-primary' : 'text-slate-400'}`}>
              {displayRole}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 cursor-pointer bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <MembersDrawer isOpen={isMembersOpen} onClose={() => setIsMembersOpen(false)} />
      <InviteManagerDrawer isOpen={isInvitesOpen} onClose={() => setIsInvitesOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </header>
  );
};