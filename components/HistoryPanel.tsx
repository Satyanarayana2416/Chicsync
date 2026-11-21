
import React from 'react';
import type { HistoryItem } from '../App';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClear: () => void;
  onViewItem: (item: HistoryItem) => void;
  t: any;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onClear, onViewItem, t }) => {
  const panelClasses = isOpen 
    ? 'translate-x-0' 
    : 'translate-x-full';

  return (
    <div 
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-slate-50 dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${panelClasses} flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
          <h2 id="history-panel-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.history}</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-700/70 dark:hover:text-slate-200"
            aria-label={t.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
               <SparklesIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <p className="font-semibold">{t.noHistory}</p>
            </div>
          ) : (
            history.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onViewItem(item)}
                aria-label={t.historyItemCTA}
                className="w-full text-left bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-slide-up transition-all duration-200 hover:shadow-md hover:border-indigo-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-indigo-500"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {item.generatedImage && (
                  <img 
                    src={item.generatedImage} 
                    alt="Generated outfit" 
                    className="w-full rounded-lg mb-3 aspect-[4/5] object-cover" 
                  />
                )}
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center mt-0.5">
                        <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300">{item.result.verdict}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {t.historyItemDate} {new Date(item.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
            <footer className="p-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <button
                    onClick={onClear}
                    className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 font-bold py-2.5 px-4 rounded-lg hover:bg-red-200/70 transition-colors dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
                >
                    <TrashIcon className="w-5 h-5" />
                    {t.clearHistory}
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;