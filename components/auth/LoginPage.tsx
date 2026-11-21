import React, { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
  switchToSignup: () => void;
  t: any;
  signupSuccess?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ switchToSignup, t, signupSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6 animate-slide-in">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-500 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-4">{t.headerTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back! Please login to your account.</p>
        </div>

        {signupSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-sm animate-pop-in" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Account created. Please log in.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 interactive-lift"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <button onClick={switchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;