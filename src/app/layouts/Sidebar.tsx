import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Folder, ChevronRight, Loader2, Settings } from 'lucide-react';
import { TeamSwitcher } from '../../features/teams/components/TeamSwitcher';
import { useProjects } from '../providers/ProjectProvider';
import { usePermissions } from '../../hooks/usePermissions';

export const Sidebar: React.FC = () => {
  const { projects, isLoading } = useProjects();
  const { projectId } = useParams();
  const location = useLocation();
  const activeProjectId = projectId ? Number(projectId) : null;
  const { canManageTeam, canManageInvites, canDeleteTeam } = usePermissions();
  const showSettings = canManageTeam || canManageInvites || canDeleteTeam;

  const activeProjects = projects.filter(p => !p.is_archived);
  const archivedProjects = projects.filter(p => p.is_archived);

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="h-21 p-4 border-b border-slate-100 dark:border-slate-800">
        <TeamSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Lists Active Projects */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
            Active Projects
          </h3>

          <div className="space-y-1">
            {/* Handle Loading State inside Sidebar */}
            {isLoading && activeProjects.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </div>
            ) : (
              activeProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/tasks`}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${activeProjectId === project.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-4 h-4 ${activeProjectId === project.id ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate w-32">{project.name}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${activeProjectId === project.id ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
              ))
            )}

            {/* Empty State */}
            {!isLoading && activeProjects.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400 italic">
                No active projects found.
              </p>
            )}
          </div>
        </div>

        {/* Lists Archived Projects */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
            Archived Projects
          </h3>

          <div className="space-y-1">
            {/* Handle Loading State inside Sidebar */}
            {isLoading && archivedProjects.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </div>
            ) : (
              archivedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/tasks`}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${activeProjectId === project.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-4 h-4 ${activeProjectId === project.id ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate w-32">{project.name}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 ${activeProjectId === project.id ? 'opacity-100' : 'opacity-0'}`} />
                </Link>
              ))
            )}

            {/* Empty State */}
            {!isLoading && archivedProjects.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400 italic">
                No archived projects found.
              </p>
            )}
          </div>
        </div>
      </nav>

      {showSettings && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all ${location.pathname === '/settings'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <Settings className="w-4 h-4" />
            Team Settings
          </Link>
        </div>
      )}
    </aside>
  );
};