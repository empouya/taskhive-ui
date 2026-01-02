import React, { useState } from 'react';
import { Trash2, Mail, UserPlus } from 'lucide-react';

export const InviteManagerDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [invites] = useState([{ id: '1', email: 'pending-user@example.com', created_at: '2026-01-01' }]);
  const [email, setEmail] = useState('');

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/40 z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b dark:border-slate-800">
            <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Manage Invites</h2>
          </div>

          {/* Invitation Form */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Invite New Member</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="bg-primary text-white p-2 px-4 rounded-xl hover:bg-primary/90 transition-all font-bold text-sm">Send</button>
            </div>
          </div>

          {/* Pending List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Invitations</h3>
            {invites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">{invite.email}</p>
                    <p className="text-[10px] text-slate-400">Sent {invite.created_at}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Cancel Invitation">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};