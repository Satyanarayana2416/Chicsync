import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSave: (updatedProfile: UserProfile) => void;
  t: any;
}

const OptionButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border-2 ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:border-indigo-500'
    }`}
  >
    {children}
  </button>
);

const BODY_TYPE_OPTIONS = ['bodyTypeSlim', 'bodyTypeAthletic', 'bodyTypeAverage', 'bodyTypeCurvy', 'bodyTypePlusSize'];
const FIT_PREFERENCE_OPTIONS = ['fitSlim', 'fitRegular', 'fitLoose'];
const STYLE_PREFERENCE_OPTIONS = ['styleTrending', 'styleCultural', 'styleClassic', 'styleMinimalist'];


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userProfile, onSave, t }) => {
  // Personal Info
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  
  // Body Measurements
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [bodyType, setBodyType] = useState('');
  
  // Style Preferences
  const [favoriteColors, setFavoriteColors] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [preferredFit, setPreferredFit] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(userProfile?.name || '');
      setAge(userProfile?.age || '');
      setLocation(userProfile?.location || '');
      setFavoriteColors(userProfile?.favoriteColors || '');
      setStylePreference(userProfile?.stylePreference || '');
      setHeight(userProfile?.height || '');
      setWeight(userProfile?.weight || '');
      setBodyType(userProfile?.bodyType || '');
      setPreferredFit(userProfile?.preferredFit || '');
      setFeedbackMessage(null); // Clear feedback on open
    }
  }, [userProfile, isOpen]);
  
  if (!isOpen) {
    return null;
  }
  
  const showFeedback = (text: string) => {
    setFeedbackMessage(text);
    setTimeout(() => {
        setFeedbackMessage(null);
        onClose();
    }, 1500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      age: age ? Number(age) : null,
      location,
      favoriteColors,
      stylePreference,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      bodyType,
      preferredFit,
    });
    showFeedback(t.profileSaved);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 animate-pop-in text-slate-800 dark:text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 id="settings-modal-title" className="text-xl font-bold">{t.userProfile}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700/70"
            aria-label={t.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.personalizeExperience}</p>

        <form onSubmit={handleSave} className="flex-grow space-y-5 overflow-y-auto max-h-[60vh] pr-2 -mr-2">
            {/* --- Personal Info --- */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.fullName}</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.age}</label>
                        <input id="age" type="number" value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.location}</label>
                    <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </div>

            {/* --- Body Measurements --- */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{t.bodyMeasurements}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="height" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.height}</label>
                        <input id="height" type="number" value={height} placeholder={t.heightPlaceholderCm} onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.weight}</label>
                        <input id="weight" type="number" value={weight} placeholder={t.weightPlaceholderKg} onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.bodyType}</label>
                    <div className="flex flex-wrap gap-2">
                        {BODY_TYPE_OPTIONS.map(key => (
                           <OptionButton key={key} active={bodyType === t[key]} onClick={() => setBodyType(t[key])}>{t[key]}</OptionButton>
                        ))}
                    </div>
                </div>
            </div>

             {/* --- Style Preferences --- */}
             <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                 <div>
                    <label htmlFor="colors" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.favoriteColors}</label>
                    <input id="colors" type="text" value={favoriteColors} onChange={e => setFavoriteColors(e.target.value)} placeholder={t.favoriteColorsPlaceholder} className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.preferredFit}</label>
                    <div className="flex flex-wrap gap-2">
                       {FIT_PREFERENCE_OPTIONS.map(key => (
                           <OptionButton key={key} active={preferredFit === t[key]} onClick={() => setPreferredFit(t[key])}>{t[key]}</OptionButton>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.stylePreference}</label>
                    <div className="flex flex-wrap gap-2">
                        {STYLE_PREFERENCE_OPTIONS.map(key => (
                           <OptionButton key={key} active={stylePreference === t[key]} onClick={() => setStylePreference(t[key])}>{t[key]}</OptionButton>
                        ))}
                    </div>
                </div>
            </div>


             {feedbackMessage && (
                <div className={`mt-4 p-3 rounded-md text-sm font-medium text-center animate-pop-in bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300`}>
                    {feedbackMessage}
                </div>
            )}

            <div className="pt-4">
                 <button type="submit" className="w-full justify-center py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors interactive-lift shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30">{t.saveProfile}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;