import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CreateTaskForm } from '../components/CreateTaskForm';
import { tasksApi } from '../tasks.api';
import { useAuth } from '../../../app/providers/AuthProvider';

export const CreateTaskPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { access } = useAuth();
  const [nextPosition, setNextPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId || !access) {
      return;
    }

    let isCancelled = false;

    const loadNextPosition = async () => {
      try {
        const tasks = await tasksApi.listByProject(projectId);
        const maxPosition = tasks.reduce((max, task) => Math.max(max, task.position), 0);

        if (!isCancelled) {
          setNextPosition(maxPosition + 1);
        }
      } catch {
        if (!isCancelled) {
          setNextPosition(1);
        }
      }
    };

    void loadNextPosition();

    return () => {
      isCancelled = true;
    };
  }, [projectId, access]);

  if (!projectId) return null;

  if (nextPosition === null) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <CreateTaskForm
        projectId={projectId}
        nextPosition={nextPosition}
        onSuccess={() => navigate(`/projects/${projectId}/tasks`)}
        onCancel={() => navigate(-1)}
      />
    </main>
  );
};