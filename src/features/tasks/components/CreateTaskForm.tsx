import React, { useEffect, useMemo, useState } from 'react';
import { ListTodo, AlignLeft, Flag, User, Layers, Loader2, CheckCircle } from 'lucide-react';
import type { CreateTaskInput, TaskPriority, TaskStatus } from '../tasks.types';
import { tasksApi } from '../tasks.api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { teamsApi } from '../../teams/teams.api';
import type { Member } from '../../teams/teams.types';
import { getErrorMessage } from '../../../lib/apiError';

interface CreateTaskFormProps {
  projectId: string;
  nextPosition: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  projectId,
  nextPosition,
  onSuccess,
  onCancel,
}) => {
  const { access } = useAuth();
  const { activeTeam } = useTeam();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assignee_id: null,
    position: nextPosition,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, position: nextPosition }));
  }, [nextPosition]);

  useEffect(() => {
    if (!activeTeam || !access) {
      setMembers([]);
      return;
    }

    let isCancelled = false;

    const loadMembers = async () => {
      setIsLoadingMembers(true);

      try {
        const data = await teamsApi.getMembers(activeTeam.id);
        if (!isCancelled) {
          setMembers(data);
        }
      } catch {
        if (!isCancelled) {
          setMembers([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMembers(false);
        }
      }
    };

    void loadMembers();

    return () => {
      isCancelled = true;
    };
  }, [activeTeam, access]);

  const hasMembers = useMemo(() => members.length > 0, [members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!access) return;

    setIsLoading(true);
    setError(null);

    try {
      const createdTask = await tasksApi.create(projectId, formData);

      if (formData.assignee_id !== null) {
        await tasksApi.assign(createdTask.id, formData.assignee_id);
      }

      onSuccess();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to create task.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6 w-full max-w-2xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <input
            required
            autoFocus
            className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 p-0"
            placeholder="Task title..."
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="flex items-start gap-2 text-slate-400 focus-within:text-primary">
          <AlignLeft className="w-5 h-5 mt-1" />
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 min-h-[100px] p-0 resize-none"
            placeholder="Add a detailed description..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> Status
          </label>
          <select
            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Flag className="w-3 h-3" /> Priority
          </label>
          <select
            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20"
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <User className="w-3 h-3" /> Assignee
          </label>
          <select
            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20"
            value={formData.assignee_id ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                assignee_id: e.target.value ? Number(e.target.value) : null,
              }))
            }
            disabled={isLoadingMembers || !hasMembers}
          >
            <option value="">
              {isLoadingMembers ? 'Loading members...' : hasMembers ? 'Unassigned' : 'No members available'}
            </option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.email} ({member.role.toLowerCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3 h-3" /> Position
          </label>
          <input
            type="number"
            min={1}
            className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            value={formData.position}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                position: Number.isNaN(Number(e.target.value)) ? prev.position : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !formData.title.trim()}
          className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ListTodo className="w-4 h-4" /> Create Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};