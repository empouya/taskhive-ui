import React from 'react';
import { Archive, Folder, Lock, ArrowRight } from 'lucide-react';
import type { Project } from '../projects.types';

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  onArchive: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isAdmin, onArchive }) => {
  const isArchived = project.is_archived;

  return (
    <div className={`group relative p-6 rounded-2xl border transition-all ${
      isArchived 
        ? 'bg-slate-50/50 border-slate-200 grayscale opacity-75' 
        : 'bg-white border-slate-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 shadow-sm'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isArchived ? 'bg-slate-200' : 'bg-primary/10'}`}>
          <Folder className={`w-5 h-5 ${isArchived ? 'text-slate-500' : 'text-primary'}`} />
        </div>
        
        {isAdmin && !isArchived && (
          <button
            onClick={() => onArchive(project.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Archive Project"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
      </div>

      <h3 className={`text-lg font-bold mb-1 ${isArchived ? 'text-slate-500 italic' : 'text-slate-900'}`}>
        {project.name}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-6">
        {project.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-auto">
        {isArchived ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Archived
          </span>
        ) : (
          <button className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
            Open Project <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};