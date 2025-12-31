import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/routes';
import useAxiosInterceptors from './hooks/useAxiosInterceptors'

function App() {

  useAxiosInterceptors();
  return <RouterProvider router={router} />;
}

export default App;