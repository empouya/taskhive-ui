import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useTeam } from './TeamProvider';
import type { Project, CreateProjectPayload } from '../../features/projects/projects.types';
import { projectsApi } from '../../features/projects/projects.apis';
import { Outlet } from 'react-router-dom';

interface ProjectContextType {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
    createProject: (payload: CreateProjectPayload) => Promise<Project>;
    archiveProject: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = () => {
    const { access } = useAuth();
    const { activeTeam } = useTeam();

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!access || !activeTeam) {
            setProjects([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await projectsApi.list(activeTeam.id, access);
            setProjects(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    }, [access, activeTeam]);

    // 2. Create logic - Automatically updates the local list (Optimistic UI sync)
    const createProject = useCallback(async (payload: CreateProjectPayload) => {
        if (!access || !activeTeam) throw new Error('Not authenticated or no team selected');

        try {
            const newProject = await projectsApi.create(activeTeam.id, payload, access);
            // Append new project to list so UI updates instantly
            setProjects(prev => [newProject, ...prev]);
            return newProject;
        } catch (err: any) {
            throw err;
        }
    }, [access, activeTeam]);

    // 3. Archive logic - Locally filters out the archived project
    const archiveProject = useCallback(async (projectId: string) => {
        if (!access) return;

        try {
            await projectsApi.archive(projectId, access);
            // Remove or update the project in the local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err: any) {
            throw err;
        }
    }, [access]);

    // Trigger fetch whenever the active team changes
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <ProjectContext.Provider
            value={{
                projects,
                isLoading,
                error,
                refreshProjects: fetchProjects,
                createProject,
                archiveProject
            }}
        >
            <Outlet />
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProjects must be used within a ProjectProvider');
    return context;
};