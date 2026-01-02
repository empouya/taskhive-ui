import React, { useState, useEffect } from 'react';
import { X, UserMinus, ShieldCheck, Loader2 } from 'lucide-react';
import { useTeam } from '../../../app/providers/TeamProvider';
import { useAuth } from '../../../app/providers/AuthProvider';
import { teamsApi } from '../teams.api';
import type { Member } from '../teams.types';

export const MembersDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeTeam } = useTeam();
  const { access, user: currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = activeTeam?.role === 'ADMIN';

  useEffect(() => {
    if (isOpen && activeTeam && access) {
      setLoading(true);
      teamsApi.getMembers(activeTeam.id, access)
        .then(setMembers)
        .finally(() => setLoading(false));
    }
  }, [isOpen, activeTeam, access]);

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?") || !activeTeam || !access) return;
    try {
      await teamsApi.removeMember(activeTeam.id, userId, access);
      setMembers(prev => prev.filter(m => m.id !== userId));
    } catch (err) {
      alert("Could not remove member.");
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold">Team Members</h2>
            <button onClick={onClose} className="p-2 cursor-pointer hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : (
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold uppercase">
                        {member.email.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate dark:text-white">{member.email}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                          {member.role === 'admin' && <ShieldCheck className="w-3 h-3 text-primary" />}
                          {member.role}
                        </p>
                      </div>
                    </div>
                    {isAdmin && member.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};