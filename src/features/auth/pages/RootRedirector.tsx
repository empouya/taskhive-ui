import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';

export const RootRedirector = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { teams, activeTeam, isLoading: teamLoading } = useTeam();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading || teamLoading) {
            return;
        }

        if (!user) {
            navigate('/login', { replace: true });
            return;
        }

        if (activeTeam) {
            navigate('/projects', { replace: true });
            return;
        }

        if (teams.length === 1) {
            navigate('/projects', { replace: true });
            return;
        }

        navigate('/teams/select', { replace: true });
    }, [user, authLoading, teams, activeTeam, teamLoading, navigate]);

    return null;
};