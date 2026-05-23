import { useMemo } from 'react';
import type { TeamRole } from '../features/teams/teams.types';
import { useTeam } from '../app/providers/TeamProvider';

/**
 * Capability flags derived from the backend RBAC model.
 *
 * Role hierarchy (highest → lowest):
 *   OWNER > ADMIN > MANAGER > MEMBER > VIEWER
 *
 * Mapping against the API contract:
 *   OWNER  + ADMIN   → manage teams, invitations, members
 *   MANAGER          → manage projects, moderate workspace content
 *   MEMBER           → create and update tasks/comments
 *   VIEWER           → read-only
 */
export interface Permissions {
    // Team management
    canManageTeam: boolean;       // rename, update description
    canDeleteTeam: boolean;       // owner-only destructive action
    canManageMembers: boolean;    // remove members
    canManageInvites: boolean;    // create / delete invitations

    // Project management
    canManageProjects: boolean;   // create, archive, restore projects

    // Task management
    canCreateTasks: boolean;      // create new tasks
    canEditTasks: boolean;        // update existing tasks
    canDeleteTasks: boolean;      // soft-delete tasks
    canAssignTasks: boolean;      // assign / reassign tasks

    // Comments
    canCreateComments: boolean;

    // Derived helpers
    isOwner: boolean;
    isAtLeastAdmin: boolean;
    isAtLeastManager: boolean;
    isAtLeastMember: boolean;
    isViewer: boolean;

    // The raw role, null when no team is active
    role: TeamRole | null;
}

const PERMISSIONS_BY_ROLE: Record<TeamRole, Omit<Permissions, 'role'>> = {
    OWNER: {
        canManageTeam: true,
        canDeleteTeam: true,
        canManageMembers: true,
        canManageInvites: true,
        canManageProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
        canCreateComments: true,
        isOwner: true,
        isAtLeastAdmin: true,
        isAtLeastManager: true,
        isAtLeastMember: true,
        isViewer: false,
    },
    ADMIN: {
        canManageTeam: true,
        canDeleteTeam: false,
        canManageMembers: true,
        canManageInvites: true,
        canManageProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
        canCreateComments: true,
        isOwner: false,
        isAtLeastAdmin: true,
        isAtLeastManager: true,
        isAtLeastMember: true,
        isViewer: false,
    },
    MANAGER: {
        canManageTeam: false,
        canDeleteTeam: false,
        canManageMembers: false,
        canManageInvites: false,
        canManageProjects: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
        canCreateComments: true,
        isOwner: false,
        isAtLeastAdmin: false,
        isAtLeastManager: true,
        isAtLeastMember: true,
        isViewer: false,
    },
    MEMBER: {
        canManageTeam: false,
        canDeleteTeam: false,
        canManageMembers: false,
        canManageInvites: false,
        canManageProjects: false,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: false,
        canAssignTasks: true,
        canCreateComments: true,
        isOwner: false,
        isAtLeastAdmin: false,
        isAtLeastManager: false,
        isAtLeastMember: true,
        isViewer: false,
    },
    VIEWER: {
        canManageTeam: false,
        canDeleteTeam: false,
        canManageMembers: false,
        canManageInvites: false,
        canManageProjects: false,
        canCreateTasks: false,
        canEditTasks: false,
        canDeleteTasks: false,
        canAssignTasks: false,
        canCreateComments: false,
        isOwner: false,
        isAtLeastAdmin: false,
        isAtLeastManager: false,
        isAtLeastMember: false,
        isViewer: true,
    },
};

const NO_PERMISSIONS: Permissions = {
    ...PERMISSIONS_BY_ROLE.VIEWER,
    role: null,
};

export const usePermissions = (): Permissions => {
    const { activeTeam } = useTeam();

    return useMemo(() => {
        if (!activeTeam) {
            return NO_PERMISSIONS;
        }

        return {
            ...PERMISSIONS_BY_ROLE[activeTeam.role],
            role: activeTeam.role,
        };
    }, [activeTeam]);
};