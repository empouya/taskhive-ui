import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { RootRedirector } from './features/auth/pages/RootRedirector';
import { ProtectedRoute } from './app/providers/ProtectedRoute';
import { TeamGuard } from './app/providers/TeamGuard';

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
            <Route
              path="/teams/select"
              element={<ProtectedRoute><TeamSelectionPage /></ProtectedRoute>} />

            <Route
              path="/teams/create"
              element={<ProtectedRoute><CreateTeamPage /></ProtectedRoute>} />

            <Route
              path="/accept-invite/:token"
              element={<ProtectedRoute><AcceptInvitePage /></ProtectedRoute>} />

            {/* FULLY PROTECTED ROUTES (Needs Login AND a Team) */}
            <Route element={<AuthLayout />}>
              <Route
                path="/projects"
                element={<ProtectedRoute><TeamGuard><ProjectsPage /></TeamGuard></ProtectedRoute>} />

              <Route
                path="/projects/:projectId/tasks/"
                element={<ProtectedRoute><TeamGuard><TaskListPage /></TeamGuard></ProtectedRoute>} />

              <Route
                path="/projects/:projectId/tasks/create"
                element={<ProtectedRoute><TeamGuard><CreateTaskPage /></TeamGuard></ProtectedRoute>} />

              {/* DEFAULT REDIRECT */}
              <Route path="/" element={<RootRedirector />} />
            </Route>
          </Routes>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter >
  );
}