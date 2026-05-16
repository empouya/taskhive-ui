import React, { useState } from 'react';
import { useTeam } from '../../../app/providers/TeamProvider';
import { ProjectCard } from '../components/ProjectCard';
import { Plus, Loader2, FolderPlus } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useProjects } from '../../../app/providers/ProjectProvider';

export const ProjectsPage: React.FC = () => {
    const { projects, archiveProject, isLoading } = useProjects();
    const { activeTeam } = useTeam();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isAdmin = activeTeam?.role === 'ADMIN';

    const handleArchive = async (id: string) => {
        if (!window.confirm("Archive this project? It will become read-only.")) return;
        try {
            await archiveProject(id);
        } catch (err) {
            console.log(err);
            alert("Failed to archive project.");
        }
    };

    const activeProjects = projects.filter(p => !p.is_archived);

    if (isLoading && projects.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <span className="text-xl font-bold text-primary uppercase">
                                {activeTeam?.name?.charAt(0) || 'T'}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Projects
                                </h1>
                                <span className="mt-2 ml-2 px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                    {activeTeam?.role}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {activeTeam?.name}
                                </span>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <span className="text-sm italic">
                                    {activeTeam?.description || "Collaborative workspace for your team tasks."}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex cursor-pointer items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" /> New Project
                    </button>
                )}
            </div>

            {activeProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4">
                        <FolderPlus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active projects</h3>
                    <p className="text-slate-500 mb-6 text-center max-w-xs">
                        {isAdmin
                            ? "Get started by creating your first project for the team."
                            : "Your team doesn't have any active projects yet."}
                    </p>
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-primary font-semibold hover:underline cursor-pointer"
                        >
                            Create a project now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isAdmin={isAdmin}
                            onArchive={handleArchive}
                        />
                    ))}
                </div>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};