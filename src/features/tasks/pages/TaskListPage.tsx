import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ListFilter, Loader2, Plus, Search } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { getErrorMessage } from '../../../lib/apiError';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { TaskRow } from '../components/TaskRow';
import { tasksApi } from '../tasks.api';
import type { Task, UpdateTaskPayload } from '../tasks.types';

export const TaskListPage: React.FC = () => {
  const { projectId } = useParams();
  const { access } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!projectId || !access) {
      return;
    }

    let isCancelled = false;

    const loadTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await tasksApi.listByProject(projectId);
        if (!isCancelled) {
          setTasks(data);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setError(getErrorMessage(error, 'Failed to load tasks.'));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void loadTasks();

    return () => {
      isCancelled = true;
    };
  }, [projectId, access]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((left, right) => left.position - right.position),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedTasks;
    }

    return sortedTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery),
    );
  }, [query, sortedTasks]);

  const handleUpdate = async (taskId: number, payload: UpdateTaskPayload) => {
    if (!access) return null;

    const previousTasks = tasks;
    setError(null);

    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...payload } : task)));

    try {
      const updatedTask = await tasksApi.update(taskId, payload);

      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updatedTask : prev));

      return updatedTask;
    } catch (error: unknown) {
      setTasks(previousTasks);
      setError(getErrorMessage(error, 'Failed to update task.'));
      return null;
    }
  };

  const handleAssign = async (taskId: number, assigneeId: number) => {
    if (!access) return null;

    const previousTasks = tasks;
    setError(null);

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, assignee_id: assigneeId } : task,
      ),
    );

    try {
      const updatedTask = await tasksApi.assign(taskId, assigneeId);

      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      setSelectedTask((prev) => (prev && prev.id === taskId ? updatedTask : prev));

      return updatedTask;
    } catch (error: unknown) {
      setTasks(previousTasks);
      setError(getErrorMessage(error, 'Failed to assign task.'));
      return null;
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!access) return false;

    const previousTasks = tasks;
    setError(null);

    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setSelectedTask((prev) => (prev?.id === taskId ? null : prev));
    setIsDrawerOpen((prev) => (selectedTask?.id === taskId ? false : prev));

    try {
      await tasksApi.delete(taskId);
      return true;
    } catch (error: unknown) {
      setTasks(previousTasks);
      setError(getErrorMessage(error, 'Failed to delete task.'));
      return false;
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    window.setTimeout(() => setSelectedTask(null), 300);
  };

  if (!projectId) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search tasks..."
          />
        </div>

        <div className="flex gap-2">
          <Link
            to={`/projects/${projectId}/tasks/create`}
            className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Task
          </Link>
          <button
            type="button"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            title="Task filters are not available yet"
          >
            <ListFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 pt-4">
          <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6">
            <p className="text-sm font-medium">
              {query.trim() ? 'No tasks match your search.' : 'No tasks found in this project.'}
            </p>
            {!query.trim() && (
              <Link
                to={`/projects/${projectId}/tasks/create`}
                className="mt-2 text-primary text-xs font-bold hover:underline"
              >
                Create your first task
              </Link>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isSelected={selectedTask?.id === task.id}
              onUpdate={handleUpdate}
              onSelect={handleSelectTask}
            />
          ))
        )}
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdateTask={handleUpdate}
        onAssignTask={handleAssign}
        onDeleteTask={handleDelete}
      />
    </div>
  );
};