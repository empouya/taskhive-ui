import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useTeam } from '../../../app/providers/TeamProvider';
import { projectsApi } from '../projects.apis';
import type { Project } from '../projects.types';
import { ProjectCard } from '../components/ProjectCard';
import { Plus } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';

export const ProjectsPage: React.FC = () => {
    const { access } = useAuth();
    const { activeTeam } = useTeam();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isAdmin = activeTeam?.role === 'admin';
    const fetchProjects = useCallback(async () => {
        if (activeTeam && access) {
            const data = await projectsApi.list(activeTeam.id, access);
            setProjects(data);
        }
    }, [activeTeam, access]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);
    const handleArchive = async (id: string) => {
        if (!access || !window.confirm("Archive this project? It will become read-only.")) return;
        try {
            await projectsApi.archive(id, access);
            setProjects(prev => prev.map(p => p.id === id ? { ...p, is_archived: true } : p));
        } catch (err) {
            alert("Failed to archive project.");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-500">Manage work for {activeTeam?.name}</p>
                </div>

                <button onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                    <Plus className="w-5 h-5" /> New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        isAdmin={isAdmin}
                        onArchive={handleArchive}
                    />
                ))}
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
            />
        </div>
    );
};