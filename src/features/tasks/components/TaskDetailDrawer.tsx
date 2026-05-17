import React, { useEffect, useMemo, useState } from 'react';
import { X, MessageSquare, Send, Clock, ShieldAlert, Save, Trash2 } from 'lucide-react';
import type { Comment, Task, TaskPriority, TaskStatus, UpdateTaskPayload } from '../tasks.types';
import { commentsApi } from '../../comments/comments.api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { teamsApi } from '../../teams/teams.api';
import type { Member } from '../../teams/teams.types';
import { getErrorMessage } from '../../../lib/apiError';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: number, payload: UpdateTaskPayload) => Promise<Task | null>;
  onAssignTask: (taskId: number, assigneeId: number) => Promise<Task | null>;
  onDeleteTask: (taskId: number) => Promise<boolean>;
}

type TaskEditorState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assignee_id: number | null;
};

const buildEditorState = (task: Task): TaskEditorState => ({
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  due_date: task.due_date ? task.due_date.slice(0, 10) : '',
  assignee_id: task.assignee_id,
});

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onAssignTask,
  onDeleteTask,
}) => {
  const { access } = useAuth();
  const { activeTeam } = useTeam();

  const [comments, setComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editorState, setEditorState] = useState<TaskEditorState | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setEditorState(buildEditorState(task));
      setSaveError(null);
    } else {
      setEditorState(null);
    }
  }, [task]);

  useEffect(() => {
    if (!task || !access) {
      setComments([]);
      return;
    }

    let isCancelled = false;

    const loadComments = async () => {
      try {
        const data = await commentsApi.list(task.id);
        if (!isCancelled) {
          setComments(data);
        }
      } catch {
        if (!isCancelled) {
          setComments([]);
        }
      }
    };

    void loadComments();

    return () => {
      isCancelled = true;
    };
  }, [task, access]);

  useEffect(() => {
    if (!activeTeam || !access || !isOpen) {
      setMembers([]);
      return;
    }

    let isCancelled = false;

    const loadMembers = async () => {
      try {
        const data = await teamsApi.getMembers(activeTeam.id);
        if (!isCancelled) {
          setMembers(data);
        }
      } catch {
        if (!isCancelled) {
          setMembers([]);
        }
      }
    };

    void loadMembers();

    return () => {
      isCancelled = true;
    };
  }, [activeTeam, access, isOpen]);

  const currentAssigneeEmail = useMemo(() => {
    if (!task?.assignee_id) return 'Unassigned';
    return members.find((member) => member.id === task.assignee_id)?.email ?? `User #${task.assignee_id}`;
  }, [members, task]);

  if (!task || !editorState) return null;

  const handleSaveTask = async () => {
    setIsSavingTask(true);
    setSaveError(null);

    try {
      const updatePayload: UpdateTaskPayload = {};

      if (editorState.title !== task.title) {
        updatePayload.title = editorState.title.trim();
      }

      if (editorState.description !== task.description) {
        updatePayload.description = editorState.description;
      }

      if (editorState.status !== task.status) {
        updatePayload.status = editorState.status;
      }

      if (editorState.priority !== task.priority) {
        updatePayload.priority = editorState.priority;
      }

      const normalizedDueDate = editorState.due_date ? editorState.due_date : null;
      if (normalizedDueDate !== task.due_date) {
        updatePayload.due_date = normalizedDueDate;
      }

      let latestTask: Task | null = task;

      if (Object.keys(updatePayload).length > 0) {
        latestTask = await onUpdateTask(task.id, updatePayload);
        if (!latestTask) {
          return;
        }
      }

      if (editorState.assignee_id !== task.assignee_id) {
        if (editorState.assignee_id === null) {
          setSaveError('Clearing an assignee is not supported yet by the current backend contract.');
          return;
        }

        latestTask = await onAssignTask(task.id, editorState.assignee_id);
        if (!latestTask) {
          return;
        }
      }

      if (latestTask) {
        setEditorState(buildEditorState(latestTask));
      }
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Delete this task permanently?')) {
      return;
    }

    setIsDeletingTask(true);
    setSaveError(null);

    try {
      const deleted = await onDeleteTask(task.id);
      if (deleted) {
        onClose();
      }
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !access) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const comment = await commentsApi.create(task.id, newComment);
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (error: unknown) {
      setCommentError(getErrorMessage(error, 'Failed to post comment.'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-4">
              Task Details
            </h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                <input
                  value={editorState.title}
                  onChange={(e) => setEditorState((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                  className="w-full text-xl font-bold bg-transparent border-none rounded-xl px-0 py-0 focus:ring-0 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  value={editorState.description}
                  onChange={(e) => setEditorState((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <select
                  value={editorState.status}
                  onChange={(e) =>
                    setEditorState((prev) =>
                      prev ? { ...prev, status: e.target.value as TaskStatus } : prev,
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                <select
                  value={editorState.priority}
                  onChange={(e) =>
                    setEditorState((prev) =>
                      prev ? { ...prev, priority: e.target.value as TaskPriority } : prev,
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignee</label>
                <select
                  value={editorState.assignee_id ?? ''}
                  onChange={(e) =>
                    setEditorState((prev) =>
                      prev
                        ? {
                          ...prev,
                          assignee_id: e.target.value ? Number(e.target.value) : null,
                        }
                        : prev,
                    )
                  }
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">
                    {task.assignee_id === null ? 'Unassigned' : `Current: ${currentAssigneeEmail}`}
                  </option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.email} ({member.role.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
                <input
                  type="date"
                  value={editorState.due_date}
                  onChange={(e) =>
                    setEditorState((prev) => (prev ? { ...prev, due_date: e.target.value } : prev))
                  }
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </section>

            {saveError && (
              <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
                {saveError}
              </div>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-bold">Activity Log</h3>
              </div>

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 italic">
                      No activity yet. Start the conversation below.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {comment.author.email?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {comment.author.email}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleSaveTask()}
                disabled={isSavingTask || isDeletingTask || !editorState.title.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSavingTask ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => void handleDeleteTask()}
                disabled={isSavingTask || isDeletingTask}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeletingTask ? <Clock className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>

            <form onSubmit={handlePostComment} className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pr-12 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                rows={2}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="absolute right-2 bottom-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-all"
              >
                {isSubmittingComment ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

            {commentError && (
              <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
                {commentError}
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <ShieldAlert className="w-3 h-3" />
              <span>Comments are permanent and cannot be edited.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};