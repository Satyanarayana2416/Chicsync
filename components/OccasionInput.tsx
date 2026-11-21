import React from 'react';
import OccasionSelector from './OccasionSelector';

interface OccasionInputProps {
  occasion: string;
  setOccasion: (occasion: string) => void;
  disabled: boolean;
  t: any;
  style?: React.CSSProperties;
  placeholder?: string;
}

const OccasionInput: React.FC<OccasionInputProps> = ({ occasion, setOccasion, disabled, t, style, placeholder }) => {
  return (
    <div className="w-full" style={style}>
      <div>
        <label htmlFor="occasion-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {t.occasionLabel}
        </label>
        <input
          id="occasion-input"
          type="text"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || t.occasionPlaceholder}
          className="block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm py-2.5 px-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <OccasionSelector onSelect={setOccasion} t={t} />
    </div>
  );
};

export default OccasionInput;