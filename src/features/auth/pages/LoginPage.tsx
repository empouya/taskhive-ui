import React from 'react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-slate-950 px-4">
      <LoginForm />
    </main>
  );
};