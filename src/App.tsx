import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { TeamProvider } from './app/providers/TeamProvider';
import { WorkspaceLayout } from './app/layouts/WorkspaceLayout';
import useAxiosInterceptors from './hooks/useAxiosInterceptors'


// Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { TaskListPage } from './features/tasks/pages/TaskListPage';
import { CreateTeamPage } from './features/teams/pages/CreateTeamPage';
import { CreateTaskPage } from './features/tasks/pages/CreateTaskPage';
import { TeamSelectionPage } from './features/teams/pages/TeamSelectionPage';
import { AcceptInvitePage } from './features/teams/pages/AcceptInvitePage';
import { RootRedirector } from './features/auth/pages/RootRedirector';
import { ProtectedRoute } from './app/providers/ProtectedRoute';
import { TeamGuard } from './app/providers/TeamGuard';
import { ProjectProvider } from './app/providers/ProjectProvider';

export default function App() {

  useAxiosInterceptors();
  return (
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            {/* SEMI-PROTECTED (Needs Login, but doesn't need a Team yet) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/teams/select" element={<TeamSelectionPage />} />

              <Route path="/teams/create" element={<CreateTeamPage />} />

              <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

              {/* FULLY PROTECTED ROUTES (Needs Login AND a Team) */}
              <Route element={<TeamGuard />}>
                <Route element={<ProjectProvider />}>
                  <Route element={<WorkspaceLayout />}>
                    <Route path="/projects" element={<ProjectsPage />} />

                    <Route path="/projects/:projectId/tasks/" element={<TaskListPage />} />

                    <Route path="/projects/:projectId/tasks/create" element={<CreateTaskPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* DEFAULT REDIRECT */}
            <Route path="/" element={<RootRedirector />} />
          </Routes>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}