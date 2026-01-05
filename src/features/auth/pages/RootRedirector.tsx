import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';

export const RootRedirector = () => {
    const { user, isLoading: authLoading } = useAuth();
    const { activeTeam, isLoading: teamLoading } = useTeam();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading || teamLoading) return;

        if (!user) {
            navigate('/login', { replace: true });
        } else if (!activeTeam) {
            navigate('/teams/select', { replace: true });
        } else {
            navigate('/projects', { replace: true });
        }
    }, [user, authLoading, activeTeam, teamLoading, navigate]);

    return null;
};