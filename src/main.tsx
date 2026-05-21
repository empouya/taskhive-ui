import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './app/providers/AuthProvider';
import { ConfirmProvider } from './app/providers/ConfirmProvider';
import { NotificationProvider } from './app/providers/NotificationProvider';
import { TeamProvider } from './app/providers/TeamProvider';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TeamProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </NotificationProvider>
      </TeamProvider>
    </AuthProvider>
  </StrictMode>,
);