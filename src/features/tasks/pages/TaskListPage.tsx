import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { tasksApi } from '../tasks.api';
import type { Task } from '../tasks.types';
import { TaskRow } from '../components/TaskRow';
import { ListFilter, Search, Plus } from 'lucide-react';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';

export const TaskListPage: React.FC = () => {
  const { projectId } = useParams();
  const { access } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (projectId && access) {
      tasksApi.listByProject(projectId, access).then(setTasks).finally(() => setLoading(false));
    }
  }, [projectId, access]);

  const handleUpdate = async (taskId: string, payload: any) => {
    if (!access) return;
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...payload } : t));
    try {
      await tasksApi.update(taskId, payload, access);
    } catch (err) {
      console.log(err)
      const original = await tasksApi.listByProject(projectId!, access);
      setTasks(original);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search tasks..." />
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${projectId}/tasks/new`}
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Task
          </Link>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"><ListFilter className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-sm font-medium">No tasks found in this project.</p>
            <Link
              to={`/projects/${projectId}/tasks/new`}
              className="mt-2 text-primary text-xs font-bold hover:underline"
            >
              Create your first task
            </Link>
          </div>
        ) : (
          tasks.map(task => <TaskRow 
            key={task.id} 
            task={task} 
            isSelected={selectedTask?.id === task.id}
            onUpdate={handleUpdate} 
            onSelect={handleSelectTask} />)
        )}
      </div>
      <TaskDetailDrawer 
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};