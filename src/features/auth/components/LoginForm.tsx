import React, { useState } from 'react';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { authApi } from '../auth.api';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(formData);

      login(response);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-base border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
          <LogIn className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-2">Enter your credentials to access TaskHive</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-base border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">Password</label>
            <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="flex h-10 w-full rounded-base border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs text-red-500 bg-red-50 dark:bg-red-900/10 rounded-base border border-red-100 dark:border-red-900/20">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-base hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{' '}
          <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">Register</button>
        </p>
      </form>
    </div>
  );
};