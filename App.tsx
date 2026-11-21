import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import HistoryPanel from './components/HistoryPanel';
import OccasionInput from './components/OccasionInput';
import SettingsModal from './components/SettingsModal';
import ImageCropperModal from './components/ImageCropperModal';
import DashboardModal from './components/DashboardModal';
import { analyzeOutfitSuggestion, analyzePairCompatibility, analyzeSareeCompatibility, analyzeFamilyOutfit, analyzeStyleFromDescription } from './services/geminiService';
import type { AnalysisResult, UserProfile } from './services/geminiService';
import { translations, languages, LanguageCode } from './lib/translations';
import { useAuth } from './contexts/AuthContext';
import { db } from './lib/db';

export type Mode = 'outfit' | 'pair' | 'saree' | 'family' | 'style';
type Slot = 'face' | 1 | 2 | 'family' | 'person' | 'clothing';

export type HistoryItem = {
  id: number;
  timestamp: number;
  result: AnalysisResult;
  generatedImage: string | null;
  mode: Mode;
};

const App: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [mode, setMode] = useState<Mode | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('chicsync-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // State for single outfit mode
  const [outfitPersonImageFile, setOutfitPersonImageFile] = useState<File | null>(null);
  const [outfitPersonImagePreview, setOutfitPersonImagePreview] = useState<string | null>(null);
  const [outfitClothingImageFile, setOutfitClothingImageFile] = useState<File | null>(null);
  const [outfitClothingImagePreview, setOutfitClothingImagePreview] = useState<string | null>(null);

  // State for pair/saree/style matching mode
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [faceImagePreview, setFaceImagePreview] = useState<string | null>(null);
  const [itemImageFile1, setItemImageFile1] = useState<File | null>(null);
  const [itemImagePreview1, setItemImagePreview1] = useState<string | null>(null);
  const [itemImageFile2, setItemImageFile2] = useState<File | null>(null);
  const [itemImagePreview2, setItemImagePreview2] = useState<string | null>(null);

  // State for family/style mode
  const [familyImageFile, setFamilyImageFile] = useState<File | null>(null);
  const [familyImagePreview, setFamilyImagePreview] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Database-backed state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingSlot, setCroppingSlot] = useState<Slot | null>(null);

  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  // Load user-specific data from IndexedDB
  useEffect(() => {
    if (!user) return;
    
    const loadUserData = async () => {
      try {
        const [loadedProfile, loadedHistory] = await Promise.all([
          db.getUserProfile(user.id),
          db.getUserHistory(user.id)
        ]);
        setUserProfile(loadedProfile);
        setHistory(loadedHistory);
      } catch (err) {
        console.error("Failed to load user data from DB:", err);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleUpdateProfile = async (profile: UserProfile) => {
    if (!user) return;
    setUserProfile(profile);
    try {
      await db.saveUserProfile(user.id, profile);
    } catch (err) {
      console.error("Failed to save profile to DB:", err);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('chicsync-theme', theme);
  }, [theme]);

  useEffect(() => {
    const savedLang = localStorage.getItem('chicsync-lang') as LanguageCode;
    if (savedLang && languages[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('chicsync-lang', language);
  }, [language]);

  const t = translations[language];

  const addToHistory = async (analysisResult: AnalysisResult, image: string | null, analysisMode: Mode) => {
    if (!user || !analysisMode) return;
    
    try {
      const newItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
        result: analysisResult,
        generatedImage: image,
        mode: analysisMode,
      };
      // Add to DB
      const id = await db.addHistoryItem(user.id, newItem);
      
      // Update local state with the new item (including ID and current timestamp)
      const newItemWithId: HistoryItem = {
        ...newItem,
        id,
        timestamp: Date.now()
      };
      setHistory(prev => [newItemWithId, ...prev]);
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      await db.clearUserHistory(user.id);
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  };

  const handleViewHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setGeneratedImage(item.generatedImage);
    // Reset all inputs
    setOutfitPersonImageFile(null); setOutfitPersonImagePreview(null);
    setOutfitClothingImageFile(null); setOutfitClothingImagePreview(null);
    setFaceImageFile(null); setFaceImagePreview(null);
    setItemImageFile1(null); setItemImagePreview1(null);
    setItemImageFile2(null); setItemImagePreview2(null);
    setFamilyImageFile(null); setFamilyImagePreview(null);
    setOccasion('');
    setError(null);
    setIsLoading(false);
    setIsHistoryPanelOpen(false);
    setMode(item.mode);
  };

  const handleImageChange = (file: File | null, slot?: Slot) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (mode === 'outfit') {
        if (slot === 'person') {
          setOutfitPersonImageFile(file);
          setOutfitPersonImagePreview(result);
        } else if (slot === 'clothing') {
          setOutfitClothingImageFile(file);
          setOutfitClothingImagePreview(result);
        }
      } else if (mode === 'family') {
        setFamilyImageFile(file);
        setFamilyImagePreview(result);
      } else { // Handles 'pair', 'saree', and 'style' modes
        if (slot === 'face') {
          setFaceImageFile(file);
          setFaceImagePreview(result);
        } else if (slot === 1) {
          setItemImageFile1(file);
          setItemImagePreview1(result);
        } else { // slot === 2, only for 'pair' mode
          setItemImageFile2(file);
          setItemImagePreview2(result);
        }
      }
    };
    reader.readAsDataURL(file);
    setResult(null);
    setError(null);
    setGeneratedImage(null);
  };
  
  const handleFileSelectForCropping = (file: File | null, slot: Slot) => {
    if (!file) return;
    setCroppingSlot(slot);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile: File) => {
    if (croppingSlot) {
      handleImageChange(croppedFile, croppingSlot);
    }
    setImageToCrop(null);
    setCroppingSlot(null);
  };

  const handleCropperClose = () => {
    setImageToCrop(null);
    setCroppingSlot(null);
  };


  const handleAnalyzeClick = useCallback(async () => {
    if (!mode) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setGeneratedImage(null);

    try {
      let analysisResult: AnalysisResult | undefined;
      let b64Image: string | null = null;
      let finalGeneratedImage: string | null = null;
      
      const currentMode = mode;

      if (currentMode === 'outfit' && outfitPersonImageFile) {
        ({ analysis: analysisResult, generatedImage: b64Image } = await analyzeOutfitSuggestion(outfitPersonImageFile, outfitClothingImageFile, language, userProfile));
        setResult(analysisResult);
      } else if (currentMode === 'pair' && faceImageFile && itemImageFile1 && itemImageFile2) {
        ({ analysis: analysisResult, generatedImage: b64Image } = await analyzePairCompatibility(faceImageFile, itemImageFile1, itemImageFile2, language, userProfile));
        setResult(analysisResult);
      } else if (currentMode === 'saree' && faceImageFile && itemImageFile1) {
        ({ analysis: analysisResult, generatedImage: b64Image } = await analyzeSareeCompatibility(faceImageFile, itemImageFile1, language, userProfile));
        setResult(analysisResult);
      } else if (currentMode === 'family' && familyImageFile && occasion) {
        ({ analysis: analysisResult, generatedImage: b64Image } = await analyzeFamilyOutfit(familyImageFile, occasion, language, userProfile));
        setResult(analysisResult);
      } else if (currentMode === 'style' && faceImageFile && occasion) {
        ({ analysis: analysisResult, generatedImage: b64Image } = await analyzeStyleFromDescription(faceImageFile, occasion, language, userProfile));
        setResult(analysisResult);
      } else {
        setError(t.errorPrompt);
        setIsLoading(false);
        return;
      }

      if (b64Image) {
        finalGeneratedImage = `data:image/png;base64,${b64Image}`;
        setGeneratedImage(finalGeneratedImage);
      }
      
      if (analysisResult) {
        await addToHistory(analysisResult, finalGeneratedImage, currentMode);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [mode, outfitPersonImageFile, outfitClothingImageFile, faceImageFile, itemImageFile1, itemImageFile2, familyImageFile, occasion, language, userProfile, t.errorPrompt]);

  const handleReset = () => {
    setOutfitPersonImageFile(null); setOutfitPersonImagePreview(null);
    setOutfitClothingImageFile(null); setOutfitClothingImagePreview(null);
    setFaceImageFile(null); setFaceImagePreview(null);
    setItemImageFile1(null); setItemImagePreview1(null);
    setItemImageFile2(null); setItemImagePreview2(null);
    setFamilyImageFile(null); setFamilyImagePreview(null);
    setOccasion('');
    setResult(null);
    setError(null);
    setIsLoading(false);
    setGeneratedImage(null);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    handleReset();
  };

  const handleSelectModeFromDashboard = (newMode: Mode) => {
    handleModeChange(newMode);
    setIsDashboardOpen(false);
  };
  
  const isAnalyzeDisabled = (() => {
    if (isLoading) return true;
    switch (mode) {
      case 'outfit': return !outfitPersonImageFile;
      case 'pair': return !faceImageFile || !itemImageFile1 || !itemImageFile2;
      case 'saree': return !faceImageFile || !itemImageFile1;
      case 'family': return !familyImageFile || !occasion.trim();
      case 'style': return !faceImageFile || !occasion.trim();
      default: return true;
    }
  })();

  const getButtonText = () => {
    if (!mode) return '';
    switch (mode) {
      case 'outfit': return t.analyzeOutfit;
      case 'pair': return t.matchPair;
      case 'saree': return t.matchSaree;
      case 'family': return t.analyzeFamily;
      case 'style': return t.analyzeStyle;
    }
  };

  const getDescription = () => {
    if (!mode) return '';
    switch (mode) {
        case 'outfit': return t.outfitDescription;
        case 'pair': return t.pairDescription;
        case 'saree': return t.sareeDescription;
        case 'family': return t.familyDescription;
        case 'style': return t.styleDescription;
    }
  }

  const ModeButton: React.FC<{
    currentMode: Mode | null,
    targetMode: Mode,
    onClick: () => void,
    children: React.ReactNode
  }> = ({ currentMode, targetMode, onClick, children }) => (
    <button 
      onClick={onClick}
      className={`relative w-full py-2.5 px-4 rounded-lg font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 interactive-lift ${
        currentMode === targetMode 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-slate-600/60 dark:hover:text-slate-300'
      }`}
    >
      {currentMode === targetMode && (
        <span 
          style={{ borderRadius: 'inherit' }}
          className="absolute inset-0 bg-white dark:bg-slate-800 shadow-md"
        ></span>
      )}
       <span className="relative z-10">{children}</span>
    </button>
  );

  return (
    <>
      <div>
        <DashboardModal
          isOpen={isDashboardOpen}
          onClose={() => { if (mode) setIsDashboardOpen(false) }}
          onSelectMode={handleSelectModeFromDashboard}
          t={t}
        />
        {imageToCrop && (
          <ImageCropperModal
            isOpen={!!imageToCrop}
            onClose={handleCropperClose}
            imageSrc={imageToCrop}
            onCropComplete={handleCropComplete}
            t={t}
          />
        )}
        <HistoryPanel 
          isOpen={isHistoryPanelOpen} 
          onClose={() => setIsHistoryPanelOpen(false)}
          history={history}
          onClear={handleClearHistory}
          onViewItem={handleViewHistoryItem}
          t={t}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          userProfile={userProfile}
          onSave={handleUpdateProfile}
          t={t}
        />
        <div className="min-h-screen bg-transparent font-sans text-slate-800 dark:text-slate-200">
          <Header 
            language={language} 
            setLanguage={setLanguage} 
            onHistoryClick={() => setIsHistoryPanelOpen(true)}
            onProfileClick={() => setIsSettingsModalOpen(true)}
            onLogoClick={() => setIsDashboardOpen(true)}
            theme={theme}
            setTheme={setTheme}
            onLogout={logout}
            t={t} 
          />
          <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
            {mode ? (
              <>
              <div 
                className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-500 p-6 md:p-8 space-y-6 animate-slide-in"
                style={{'--animation-delay': '100ms'} as React.CSSProperties}
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t.getInstantFeedback}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-prose mx-auto">
                    {getDescription()}
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1.5 text-sm">
                  <ModeButton currentMode={mode} targetMode='outfit' onClick={() => handleModeChange('outfit')}>{t.analyzeOutfit}</ModeButton>
                  <ModeButton currentMode={mode} targetMode='pair' onClick={() => handleModeChange('pair')}>{t.matchAPair}</ModeButton>
                  <ModeButton currentMode={mode} targetMode='saree' onClick={() => handleModeChange('saree')}>{t.matchASaree}</ModeButton>
                  <ModeButton currentMode={mode} targetMode='family' onClick={() => handleModeChange('family')}>{t.familyMatch}</ModeButton>
                  <ModeButton currentMode={mode} targetMode='style' onClick={() => handleModeChange('style')}>{t.styleMe}</ModeButton>
                </div>
                
                <div key={mode} className="animate-fade-in">
                  {mode === 'outfit' && (
                    <div className="space-y-4 animate-stagger-children">
                      <ImageUploader style={{ animationDelay: '100ms' }} imagePreview={outfitPersonImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'person')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'person')} disabled={isLoading} placeholder={t.uploaderPlaceholderPerson} t={t} />
                      <ImageUploader style={{ animationDelay: '200ms' }} imagePreview={outfitClothingImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'clothing')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'clothing')} disabled={isLoading} placeholder={t.uploaderPlaceholderClothing} t={t} />
                    </div>
                  )}
                  
                  {mode === 'pair' && (
                    <div className="space-y-4 animate-stagger-children">
                      <ImageUploader style={{ animationDelay: '100ms' }} imagePreview={faceImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'face')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'face')} disabled={isLoading} placeholder={t.uploaderPlaceholderFace} t={t} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <ImageUploader style={{ animationDelay: '200ms' }} imagePreview={itemImagePreview1} onImageChange={(file) => handleFileSelectForCropping(file, 1)} onCameraCapture={(file) => handleFileSelectForCropping(file, 1)} disabled={isLoading} placeholder={t.uploaderPlaceholderItem1} t={t} />
                        <ImageUploader style={{ animationDelay: '300ms' }} imagePreview={itemImagePreview2} onImageChange={(file) => handleFileSelectForCropping(file, 2)} onCameraCapture={(file) => handleFileSelectForCropping(file, 2)} disabled={isLoading} placeholder={t.uploaderPlaceholderItem2} t={t} />
                      </div>
                    </div>
                  )}

                  {mode === 'saree' && (
                    <div className="space-y-4 animate-stagger-children">
                      <ImageUploader style={{ animationDelay: '100ms' }} imagePreview={faceImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'face')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'face')} disabled={isLoading} placeholder={t.uploaderPlaceholderFace} t={t} />
                      <ImageUploader style={{ animationDelay: '200ms' }} imagePreview={itemImagePreview1} onImageChange={(file) => handleFileSelectForCropping(file, 1)} onCameraCapture={(file) => handleFileSelectForCropping(file, 1)} disabled={isLoading} placeholder={t.uploaderPlaceholderSaree} t={t} />
                    </div>
                  )}

                  {mode === 'family' && (
                    <div className="space-y-4 animate-stagger-children">
                      <ImageUploader style={{ animationDelay: '100ms' }} imagePreview={familyImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'family')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'family')} disabled={isLoading} placeholder={t.uploaderPlaceholderFamily} t={t} />
                      <OccasionInput style={{ animationDelay: '200ms' }} occasion={occasion} setOccasion={setOccasion} disabled={isLoading} t={t} />
                    </div>
                  )}

                  {mode === 'style' && (
                    <div className="space-y-4 animate-stagger-children">
                      <ImageUploader style={{ animationDelay: '100ms' }} imagePreview={faceImagePreview} onImageChange={(file) => handleFileSelectForCropping(file, 'face')} onCameraCapture={(file) => handleFileSelectForCropping(file, 'face')} disabled={isLoading} placeholder={t.uploaderPlaceholderStyleFace} t={t} />
                      <OccasionInput style={{ animationDelay: '200ms' }} occasion={occasion} setOccasion={setOccasion} disabled={isLoading} t={t} placeholder={t.occasionPlaceholderStyle} />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-pop-in" role="alert">
                    <p className="font-bold">{t.errorTitle}</p>
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzeDisabled}
                    className="w-full flex-grow bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none interactive-lift"
                  >
                    {getButtonText()}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-300 transition-colors duration-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift"
                  >
                    {t.reset}
                  </button>
                </div>

                {isLoading && <Loader t={t} />}
                
                {result && !isLoading && <ResultCard result={result} generatedImage={generatedImage} t={t} mode={mode} onRegenerate={handleAnalyzeClick} />}
              </div>
              <footer className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
                  <p>&copy; 2025 ChicSync. All rights reserved.</p>
              </footer>
              </>
            ) : (
              <div className="text-center py-20 animate-fade-in">
                  <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t.welcomeTitle}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-prose mx-auto">{t.welcomeMessage}</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default App;