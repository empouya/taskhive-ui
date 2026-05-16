import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useTeam } from './TeamProvider';
import type { Project, CreateProjectPayload } from '../../features/projects/projects.types';
import { projectsApi } from '../../features/projects/projects.apis';
import { Outlet } from 'react-router-dom';
import { getErrorMessage } from '../../lib/apiError';

interface ProjectContextType {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
    createProject: (payload: CreateProjectPayload) => Promise<Project>;
    archiveProject: (projectId: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = () => {
    const { access } = useAuth();
    const { activeTeam } = useTeam();
    const activeTeamId = activeTeam?.id ?? null;

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!access || activeTeamId === null) {
            setProjects([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await projectsApi.list(activeTeamId);
            setProjects(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to load projects'));
        } finally {
            setIsLoading(false);
        }
    }, [access, activeTeamId]);

    // 2. Create logic - Automatically updates the local list (Optimistic UI sync)
    const createProject = useCallback(async (payload: CreateProjectPayload) => {
        if (!access || activeTeamId === null) {
            throw new Error('Not authenticated or no team selected');
        }

        const newProject = await projectsApi.create(activeTeamId, payload);
        setProjects((prev) => [newProject, ...prev]);
        return newProject;
    }, [access, activeTeamId]);

    // 3. Archive logic - Locally filters out the archived project
    const archiveProject = useCallback(async (projectId: number) => {
        if (!access) return;

        try {
            await projectsApi.archive(projectId);
            // Remove or update the project in the local state
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error: unknown) {
            setError(getErrorMessage(error, 'Failed to archive the project'));
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