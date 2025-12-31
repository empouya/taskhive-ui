import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { CreateTeamPage } from '../../features/teams/pages/CreateTeamPage';
import { ProjectsPage } from '../../features/projects/pages/ProjectsPage';

export const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/teams/create',
    element: <CreateTeamPage />,
  },
  {
    path: '/team/projects',
    element: <ProjectsPage />,
  },
  // Default redirect or landing can be added here
]);