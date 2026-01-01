import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreateTaskForm } from '../components/CreateTaskForm';

export const CreateTaskPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  if (!projectId) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <CreateTaskForm 
        projectId={projectId}
        nextPosition={1}
        onSuccess={() => navigate(`/projects/${projectId}/tasks`)}
        onCancel={() => navigate(-1)}
      />
    </main>
  );
};