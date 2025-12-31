import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './app/providers/AuthProvider.tsx'
import App from './App.tsx'
import './styles/globals.css'
import { TeamProvider } from './app/providers/TeamProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TeamProvider>
        <App />
      </TeamProvider>
    </AuthProvider>
  </StrictMode>,
)
