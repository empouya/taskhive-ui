import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Clock, ShieldAlert } from 'lucide-react';
import type { Task, Comment } from '../tasks.types';
import { commentsApi } from '../../comments/comments.api';
import { useAuth } from '../../../app/providers/AuthProvider';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, isOpen, onClose }) => {
  const { access } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && access) {
      setComments([]);
      commentsApi.list(task.id, access)
        .then(setComments)
        .catch(() => console.error("Could not load comments"));
    }
  }, [task?.id, access]);

  if (!task) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !access) return;

    setIsSubmitting(true);
    try {
      const comment = await commentsApi.create(task.id, newComment, access);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-4">
              {task.title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Metadata Section */}
            <section className="grid grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize mt-1">{task.status.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize mt-1">{task.priority}</p>
              </div>
            </section>

            {/* Description */}
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {task.description || "No description provided."}
              </p>
            </section>

            {/* Comments Log */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-bold">Activity Log</h3>
              </div>

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 italic">No activity yet. Start the conversation below.</p>
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

          {/* Comment Input */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
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
                disabled={isSubmitting || !newComment.trim()}
                className="absolute right-2 bottom-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-all"
              >
                {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
              <ShieldAlert className="w-3 h-3" />
              <span>Comments are permanent and cannot be edited.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};