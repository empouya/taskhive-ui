import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Folder, ChevronRight } from 'lucide-react';
import { useTeam } from '../../app/providers/TeamProvider';
import { useAuth } from '../../app/providers/AuthProvider';
import { projectsApi } from '../../features/projects/projects.apis';
import type { Project } from '../../features/projects/projects.types';
import { TeamSwitcher } from '../../features/teams/components/TeamSwitcher';

export const Sidebar: React.FC = () => {
  const { activeTeam } = useTeam();
  const { access } = useAuth();
  const { projectId } = useParams(); // To highlight active project
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (activeTeam && access) {
      projectsApi.list(activeTeam.id, access).then(data => {
        setProjects(data.filter(p => !p.is_archived));
      });
    }
  }, [activeTeam, access]);

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <TeamSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
            Active Projects
          </h3>
          <div className="space-y-1">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  projectId === project.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className={`w-4 h-4 ${projectId === project.id ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate w-32">{project.name}</span>
                </div>
                <ChevronRight className={`w-3 h-3 ${projectId === project.id ? 'opacity-100' : 'opacity-0'}`} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};