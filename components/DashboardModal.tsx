import React from 'react';
import type { Mode } from '../App';
import { OutfitIcon } from './icons/OutfitIcon';
import { PairIcon } from './icons/PairIcon';
import { SareeIcon } from './icons/SareeIcon';
import { FamilyIcon } from './icons/FamilyIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: Mode) => void;
  t: any;
}

interface ModeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  delay: number;
}

const modeConfig = [
    { mode: 'outfit', icon: <OutfitIcon />, titleKey: 'outfitCardTitle', descriptionKey: 'outfitCardDescription' },
    { mode: 'pair', icon: <PairIcon />, titleKey: 'pairCardTitle', descriptionKey: 'pairCardDescription' },
    { mode: 'saree', icon: <SareeIcon />, titleKey: 'sareeCardTitle', descriptionKey: 'sareeCardDescription' },
    { mode: 'family', icon: <FamilyIcon />, titleKey: 'familyCardTitle', descriptionKey: 'familyCardDescription' },
    { mode: 'style', icon: <MagicWandIcon />, titleKey: 'styleCardTitle', descriptionKey: 'styleCardDescription' },
] as const;


const ModeCard: React.FC<ModeCardProps> = ({ icon, title, description, onClick, delay }) => (
  <button
    onClick={onClick}
    className="w-full h-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-start gap-4 transition-all duration-300 hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 interactive-lift animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
    </div>
  </button>
);


const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, onSelectMode, t }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-title"
    >
      <div
        className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl m-4 animate-pop-in text-slate-800 dark:text-slate-200 flex flex-col h-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
            <h2 id="dashboard-title" className="text-2xl font-bold">{t.dashboardTitle}</h2>
            <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700/70"
                aria-label={t.close}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </header>
        <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {modeConfig.map((item, index) => (
                    <ModeCard 
                        key={item.mode}
                        icon={item.icon}
                        title={t[item.titleKey]}
                        description={t[item.descriptionKey]}
                        onClick={() => onSelectMode(item.mode)}
                        delay={100 + index * 50}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;