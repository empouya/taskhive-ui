import React, { useEffect, useState } from 'react';
import { X, Layout, AlignLeft, Loader2 } from 'lucide-react';
import { useProjects } from '../../../app/providers/ProjectProvider';
import { getErrorMessage } from '../../../lib/apiError';
import type { ProjectFormValues } from '../projects.types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialForm: ProjectFormValues = {
  name: '',
  description: '',
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();

  const [formData, setFormData] = useState<ProjectFormValues>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      onClose();
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to create project. Check your permissions.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Project</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Layout className="w-4 h-4" /> Project Name
            </label>
            <input
              required
              autoFocus
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="e.g. Q4 Product Roadmap"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <AlignLeft className="w-4 h-4" /> Description
            </label>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
              placeholder="What is this project about?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {error && (
            <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-[2] h-11 px-4 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};