import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkspaceLayout } from './app/layouts/WorkspaceLayout';

// Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { TaskListPage } from './features/tasks/pages/TaskListPage';
import { CreateTeamPage } from './features/teams/pages/CreateTeamPage';
import { CreateTaskPage } from './features/tasks/pages/CreateTaskPage';
import { TeamSelectionPage } from './features/teams/pages/TeamSelectionPage';
import { AcceptInvitePage } from './features/teams/pages/AcceptInvitePage';
import { TeamSettingsPage } from './features/teams/pages/TeamSettingsPage';
import { RootRedirector } from './features/auth/pages/RootRedirector';
import { ProtectedRoute } from './app/providers/ProtectedRoute';
import { TeamGuard } from './app/providers/TeamGuard';
import { ProjectProvider } from './app/providers/ProjectProvider';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/teams/select" element={<TeamSelectionPage />} />
          <Route path="/teams/create" element={<CreateTeamPage />} />
          <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

          <Route element={<TeamGuard />}>
            <Route element={<ProjectProvider />}>
              <Route element={<WorkspaceLayout />}>
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId/tasks/" element={<TaskListPage />} />
                <Route path="/projects/:projectId/tasks/create" element={<CreateTaskPage />} />
                <Route path="/settings" element={<TeamSettingsPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<RootRedirector />} />
      </Routes>
    </BrowserRouter >
  );
}