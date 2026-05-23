import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, Trash2, Copy, Check, LinkIcon, UserMinus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../../app/providers/TeamProvider';
import { useAuth } from '../../../app/providers/AuthProvider';
import { usePermissions } from '../../../hooks/usePermissions';
import { useConfirm } from '../../../app/providers/ConfirmProvider';
import { teamsApi } from '../teams.api';
import { getErrorMessage } from '../../../lib/apiError';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import type { Invitation, Member } from '../teams.types';

// ---------------------------------------------------------------------------
// General Settings Section
// ---------------------------------------------------------------------------

const GeneralSection: React.FC = () => {
    const { activeTeam, updateTeam } = useTeam();
    const [name, setName] = useState(activeTeam?.name ?? '');
    const [description, setDescription] = useState(activeTeam?.description ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (activeTeam) {
            setName(activeTeam.name);
            setDescription(activeTeam.description);
        }
    }, [activeTeam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTeam) return;

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await updateTeam(activeTeam.id, {
                name: name.trim(),
                description: description.trim(),
            });
            setSuccess(true);
            window.setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to update team.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">General</h2>
                <p className="text-sm text-slate-500 mt-0.5">Update your team's name and description.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Team Name
                    </label>
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Team name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Description{' '}
                        <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none h-24"
                        placeholder="What is this team working on?"
                    />
                </div>

                {error && <InlineNotice tone="error">{error}</InlineNotice>}
                {success && <InlineNotice tone="success">Team updated successfully.</InlineNotice>}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className="h-10 px-6 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    );
};

// ---------------------------------------------------------------------------
// Members Section
// ---------------------------------------------------------------------------

const MembersSection: React.FC = () => {
    const { activeTeam } = useTeam();
    const { user: currentUser } = useAuth();
    const { canManageMembers } = usePermissions();
    const { confirm } = useConfirm();

    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        if (!activeTeam) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await teamsApi.getMembers(activeTeam.id);
            setMembers(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load members.'));
        } finally {
            setIsLoading(false);
        }
    }, [activeTeam]);

    useEffect(() => {
        void fetchMembers();
    }, [fetchMembers]);

    const handleRemove = async (memberId: number, memberEmail: string) => {
        if (!activeTeam) return;

        const confirmed = await confirm({
            title: 'Remove Member',
            description: `Remove ${memberEmail} from ${activeTeam.name}? They will lose access to all projects.`,
            confirmLabel: 'Remove Member',
            cancelLabel: 'Cancel',
            tone: 'danger',
        });

        if (!confirmed) return;

        try {
            await teamsApi.removeMember(activeTeam.id, memberId);
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to remove member.'));
        }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Members</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    {members.length} {members.length === 1 ? 'member' : 'members'} in this team.
                </p>
            </div>

            <div className="p-6">
                {error && <div className="mb-4"><InlineNotice tone="error">{error}</InlineNotice></div>}

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary uppercase">
                                        {member.email.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {member.email}
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400 flex items-center gap-1">
                                            {(member.role === 'OWNER' || member.role === 'ADMIN') && (
                                                <ShieldCheck className="w-3 h-3 text-primary" />
                                            )}
                                            {member.role}
                                        </p>
                                    </div>
                                </div>

                                {canManageMembers && member.id !== currentUser?.id && member.role !== 'OWNER' && (
                                    <button
                                        type="button"
                                        onClick={() => void handleRemove(member.id, member.email)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove member"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// ---------------------------------------------------------------------------
// Invitations Section
// ---------------------------------------------------------------------------

const InvitationsSection: React.FC = () => {
    const { activeTeam } = useTeam();
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchInvites = useCallback(async () => {
        if (!activeTeam) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await teamsApi.listInvitations(activeTeam.id);
            setInvites(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to load invitations.'));
        } finally {
            setIsLoading(false);
        }
    }, [activeTeam]);

    useEffect(() => {
        void fetchInvites();
    }, [fetchInvites]);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !activeTeam) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newInvite = await teamsApi.createInvitation(activeTeam.id, email.trim());
            setInvites((prev) => [newInvite, ...prev]);
            setEmail('');
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to send invitation.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (inviteId: number) => {
        if (!activeTeam) return;
        try {
            await teamsApi.deleteInvitation(activeTeam.id, inviteId);
            setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to delete invitation.'));
        }
    };

    const copyLink = async (invite: Invitation) => {
        const link = `${window.location.origin}/accept-invite/${invite.token}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedId(invite.id);
            window.setTimeout(() => setCopiedId(null), 2000);
        } catch {
            setError('Failed to copy link to clipboard.');
        }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Invitations</h2>
                <p className="text-sm text-slate-500 mt-0.5">Invite new members by email.</p>
            </div>

            <div className="p-6 space-y-6">
                <form onSubmit={handleSendInvite} className="flex gap-3">
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1 h-11 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !email.trim()}
                        className="h-11 px-5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                    </button>
                </form>

                {error && <InlineNotice tone="error">{error}</InlineNotice>}

                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                    </div>
                ) : invites.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">
                        No pending invitations.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {invites.map((invite) => (
                            <div
                                key={invite.id}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Mail className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {invite.email}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            Sent {new Date(invite.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                                    <button
                                        type="button"
                                        onClick={() => void copyLink(invite)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                        title="Copy invite link"
                                    >
                                        {copiedId === invite.id ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <LinkIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleDelete(invite.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Revoke invitation"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// ---------------------------------------------------------------------------
// Danger Zone Section
// ---------------------------------------------------------------------------

const DangerZoneSection: React.FC = () => {
    const { activeTeam, deleteTeam } = useTeam();
    const { confirm } = useConfirm();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!activeTeam) return;

        const confirmed = await confirm({
            title: 'Delete Team',
            description: `Permanently delete "${activeTeam.name}"? All projects, tasks, and member associations will be removed. This cannot be undone.`,
            confirmLabel: 'Delete Team',
            cancelLabel: 'Cancel',
            tone: 'danger',
        });

        if (!confirmed) return;

        setIsDeleting(true);
        setError(null);

        try {
            await deleteTeam(activeTeam.id);
            navigate('/teams/select', { replace: true });
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to delete team.'));
            setIsDeleting(false);
        }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/40 overflow-hidden">
            <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/30">
                <h2 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Irreversible actions that affect the entire team.
                </p>
            </div>

            <div className="p-6 flex items-center justify-between gap-6">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Delete this team
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Once deleted, all projects and tasks are permanently removed.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                    Delete Team
                </button>
            </div>

            {error && (
                <div className="px-6 pb-6">
                    <InlineNotice tone="error">{error}</InlineNotice>
                </div>
            )}
        </section>
    );
};

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export const TeamSettingsPage: React.FC = () => {
    const { activeTeam } = useTeam();
    const { canManageTeam, canManageInvites, canDeleteTeam } = usePermissions();

    if (!activeTeam) return null;

    const showSettings = canManageTeam || canManageInvites || canDeleteTeam;

    if (!showSettings) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <InlineNotice tone="warning">
                    You do not have permission to manage team settings.
                </InlineNotice>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Team Settings
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Manage {activeTeam.name}'s configuration and members.
                </p>
            </div>

            {canManageTeam && <GeneralSection />}
            {canManageInvites && <InvitationsSection />}
            {canManageInvites && <MembersSection />}
            {canDeleteTeam && <DangerZoneSection />}
        </div>
    );
};