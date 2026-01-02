import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { TeamProvider } from './app/providers/TeamProvider';
import { AuthLayout } from './app/layouts/AuthLayout';
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
            <Route path="/teams/select" element={<TeamSelectionPage />} />

            {/* AUTHENTICATED ROUTES (Wrapped in Global UX) */}
            <Route element={<AuthLayout />}>
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:projectId/tasks/" element={<TaskListPage />} />
              <Route path="/projects/:projectId/tasks/create" element={<CreateTaskPage />} />
              <Route path="/teams/create" element={<CreateTeamPage />} />
              <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/projects" replace />} />
            </Route>
          </Routes>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}