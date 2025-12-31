import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-slate-950 px-4">
      <RegisterForm />
    </main>
  );
};