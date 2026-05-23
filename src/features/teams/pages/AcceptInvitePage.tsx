import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { getErrorMessage } from '../../../lib/apiError';
import { teamsApi } from '../teams.api';

type AcceptStatus = 'loading' | 'success' | 'error' | 'invalid';

export const AcceptInvitePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { access } = useAuth();
    const { refreshTeams } = useTeam();
    const navigate = useNavigate();

    const [status, setStatus] = useState<AcceptStatus>(
        token ? 'loading' : 'invalid',
    );
    const [message, setMessage] = useState(
        token ? 'Joining the team...' : 'No invitation token was found in this link.',
    );

    useEffect(() => {
        if (!token || !access) {
            return;
        }

        let isCancelled = false;

        const accept = async () => {
            try {
                const response = await teamsApi.acceptInvitation(token);
                await refreshTeams();

                if (isCancelled) return;

                setStatus('success');
                setMessage(response.message);

                window.setTimeout(() => {
                    navigate('/', { replace: true });
                }, 1500);
            } catch (error: unknown) {
                if (isCancelled) return;

                setStatus('error');
                setMessage(
                    getErrorMessage(error, 'Failed to join team. The link may be expired or already used.'),
                );
            }
        };

        void accept();

        return () => {
            isCancelled = true;
        };
    }, [token, access, refreshTeams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center space-y-6">

                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Processing Invitation
                        </h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Welcome to the team!
                        </h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                        <p className="text-xs text-primary animate-pulse">
                            Redirecting to your workspace...
                        </p>
                    </div>
                )}

                {(status === 'error' || status === 'invalid') && (
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {status === 'invalid' ? 'Invalid Invitation Link' : 'Invitation Error'}
                        </h1>
                        <p className="text-slate-500 text-sm">{message}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/teams/select')}
                            className="mt-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            Go to Team Selection
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};