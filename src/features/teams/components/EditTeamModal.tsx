import React, { useEffect, useState } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { InlineNotice } from '../../../components/ui/InlineNotice';
import { getErrorMessage } from '../../../lib/apiError';
import { teamsApi } from '../teams.api';
import type { Team } from '../teams.types';

interface EditTeamModalProps {
    team: Team;
    isOpen: boolean;
    onClose: () => void;
    onSaved: (updated: Team) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
    team,
    isOpen,
    onClose,
    onSaved,
}) => {
    const [name, setName] = useState(team.name);
    const [description, setDescription] = useState(team.description);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(team.name);
            setDescription(team.description);
            setError(null);
        }
    }, [isOpen, team]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) return;

        setIsLoading(true);
        setError(null);

        try {
            const updated = await teamsApi.updateTeam(team.id, {
                name: trimmedName,
                description: trimmedDescription,
            });
            onSaved(updated);
            onClose();
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to update team.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Team">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Pencil className="w-4 h-4" /> Team Name
                    </label>
                    <input
                        required
                        autoFocus
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

                {error && <InlineNotice>{error}</InlineNotice>}

                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-11 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className="flex-[2] h-11 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};