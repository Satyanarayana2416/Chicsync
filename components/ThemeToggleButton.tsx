
import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  t: any;
}

const ThemeToggleButton: React.FC<ThemeToggleProps> = ({ theme, setTheme, t }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors interactive-lift"
      aria-label={t.toggleTheme}
      title={t.toggleTheme}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      ) : (
        <SunIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      )}
    </button>
  );
};

export default ThemeToggleButton;