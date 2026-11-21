import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { languages, LanguageCode } from '../lib/translations';
import ThemeToggleButton from './ThemeToggleButton';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  t: any; // Simplified type for translations object
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, onHistoryClick, onProfileClick, onLogoClick, theme, setTheme, onLogout, t }) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  return (
    <header className="bg-white/60 backdrop-blur-lg shadow-sm sticky top-0 z-10 border-b border-slate-900/10 dark:bg-slate-800/60 dark:border-white/10">
      <div className="container mx-auto max-w-2xl px-4 py-4 flex justify-between items-center">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 rounded-lg"
          aria-label={t.dashboardTitle}
        >
          <SparklesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-500 group-hover:animate-pulse" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {t.headerTitle}
          </h1>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
           <button
            onClick={onHistoryClick}
            className="p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors interactive-lift"
            aria-label={t.viewHistory}
            title={t.viewHistory}
          >
            <HistoryIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          
           <button
            onClick={onProfileClick}
            className="p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors interactive-lift"
            aria-label={t.userProfile}
            title={t.userProfile}
          >
            <SettingsIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              onBlur={() => setTimeout(() => setIsLangMenuOpen(false), 200)} // Close on blur with a small delay
              className="p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors interactive-lift"
              aria-label="Select language"
            >
              <GlobeIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg border border-slate-200 py-1 animate-pop-in origin-top-right dark:bg-slate-800 dark:border-slate-700">
                {Object.entries(languages).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code as LanguageCode);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === code
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-700 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ThemeToggleButton theme={theme} setTheme={setTheme} t={t} />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

           <button
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/80 transition-colors interactive-lift"
            aria-label="Logout"
            title="Logout"
          >
            <LogoutIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
