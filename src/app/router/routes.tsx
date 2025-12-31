import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Default redirect or landing can be added here
]);