import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './app/providers/AuthProvider';
import { NotificationProvider } from './app/providers/NotificationProvider';
import { TeamProvider } from './app/providers/TeamProvider';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TeamProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </TeamProvider>
    </AuthProvider>
  </StrictMode>,
);