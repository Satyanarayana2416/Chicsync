import React, { useState } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { useAuth } from '../../contexts/AuthContext';

interface SignupPageProps {
  switchToLogin: () => void;
  onSignupSuccess: () => void;
  t: any;
}

const SignupPage: React.FC<SignupPageProps> = ({ switchToLogin, onSignupSuccess, t }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    age: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setIsLoading(true);
    
    const result = await signup(formData);
    
    if (result.success) {
      onSignupSuccess();
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6 animate-slide-in">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-500 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-4">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join {t.headerTitle} to get personalized fashion advice.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Name" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
            <input name="age" type="number" placeholder="Age" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
          </div>
          <input name="email" type="email" autoComplete="email" placeholder="Email Address" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
          <input name="city" placeholder="City" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
          <input name="password" type="password" autoComplete="new-password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
          <input name="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm Password" onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white" />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 interactive-lift">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={switchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;