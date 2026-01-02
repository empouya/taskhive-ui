import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { teamsApi } from '../teams.api';

export const AcceptInvitePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { access } = useAuth();
    const { fetchTeams } = useTeam();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Joining the team...');

    useEffect(() => {
        const accept = async () => {
            if (!token || !access) return;
            try {
                const response = await teamsApi.acceptInvitation(token, access);
                if (fetchTeams) await fetchTeams();
                setStatus('success');
                setMessage(response.message);
                setTimeout(() => navigate('/teams/select'), 2000);
            } catch (err: any) {
                console.log(err)
                setStatus('error');
                setMessage(err.response?.data?.error || "Failed to join team. The link may be expired.");
            }
        };

        accept();
    }, [token, access, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center space-y-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <h1 className="text-xl font-bold">Processing Invitation</h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        <h1 className="text-xl font-bold">Welcome to the team!</h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                        <p className="text-xs text-primary animate-pulse">Redirecting to team selection ...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold">Invitation Error</h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                        <button
                            onClick={() => navigate('/teams/select')}
                            className="cursor-pointer mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold"
                        >
                            Team Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};