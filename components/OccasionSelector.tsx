import React from 'react';

interface OccasionSelectorProps {
  onSelect: (occasion: string) => void;
  t: any;
}

const suggestions = [
  { key: 'suggestionWedding' },
  { key: 'suggestionParty' },
  { key: 'suggestionCasual' },
  { key: 'suggestionFormal' },
  { key: 'suggestionCultural' },
  { key: 'suggestionWork' },
];

const OccasionSelector: React.FC<OccasionSelectorProps> = ({ onSelect, t }) => {
  return (
    <div className="mt-4">
      <div className="relative flex items-center mb-3">
          <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm dark:text-slate-500">{t.occasionSuggestionsTitle}</span>
          <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(t[suggestion.key])}
            className="px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border-2 bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 interactive-lift"
          >
            {t[suggestion.key]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OccasionSelector;