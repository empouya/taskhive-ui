import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Mail, UserPlus, Copy, Check, Loader2, LinkIcon } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { teamsApi } from '../teams.api';
import type { Invitation } from '../teams.types';

export const InviteManagerDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { access } = useAuth();
  const { activeTeam } = useTeam();

  const [invites, setInvites] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvites = useCallback(async () => {
    if (!activeTeam || !access) return;
    setIsLoading(true);
    try {
      const data = await teamsApi.listInvitations(activeTeam.id, access);
      setInvites(data);
    } catch (err) {
      console.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, access]);

  useEffect(() => {
    if (isOpen) fetchInvites();
  }, [isOpen, fetchInvites]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !activeTeam || !access) return;

    setIsSubmitting(true);
    try {
      const newInvite = await teamsApi.createInvitation(activeTeam.id, email, access);
      setInvites(prev => [newInvite, ...prev]);
      setEmail('');
    } catch (err) {
      alert("Failed to create invitation. Email might already be invited.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (inviteId: string) => {
    if (!activeTeam || !access) return;
    try {
      await teamsApi.deleteInvitation(activeTeam.id, inviteId, access);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) {
      alert("Failed to delete invitation");
    }
  };

  const copyToClipboard = (invite: Invitation) => {
    const fullInviteLink = `${window.location.origin}/accept-invite/${invite.token}`;

    navigator.clipboard.writeText(fullInviteLink);
    setCopiedId(invite.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Manage Invites
            </h2>
            <button onClick={onClose} className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Invitation Form */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
            <form onSubmit={handleSendInvite} className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invite New Member</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button
                  disabled={isSubmitting || !email}
                  className="bg-primary cursor-pointer text-white px-4 rounded-xl hover:bg-primary/90 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* Pending List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Links</h3>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : invites.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">No pending invitations.</p>
            ) : (
              invites.map(invite => (
                <div key={invite.id} className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Mail className="w-4 h-4" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{invite.email}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">Sent on {new Date(invite.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(invite.id)}
                      className="p-1.5 cursor-pointer text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Invite Link Display */}
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <LinkIcon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <p className="text-[11px] text-slate-500 truncate flex-1 font-mono">{invite.token}</p>
                    <button
                      onClick={() => copyToClipboard(invite)}
                      className="p-1.5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 rounded shadow-sm transition-all"
                    >
                      {copiedId === invite.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};