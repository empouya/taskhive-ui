import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/register',
    element: <RegisterPage />,
  },
  // Default redirect or landing can be added here
]);