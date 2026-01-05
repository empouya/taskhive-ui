import { Navigate } from 'react-router-dom';
import { useTeam } from './TeamProvider';
import { Loader2 } from 'lucide-react';

export const TeamGuard = ({ children }: { children: React.ReactNode }) => {
  const { activeTeam, isLoading } = useTeam();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeTeam) {
    return <Navigate to="/teams/select" replace />;
  }

  return <>{children}</>;
};