import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { AnalysisResult, ProductSuggestion } from '../services/geminiService';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { PersonIcon } from './icons/PersonIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { BagIcon } from './icons/BagIcon';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';
import { AmazonIcon } from './icons/AmazonIcon';
import { FlipkartIcon } from './icons/FlipkartIcon';
import { ShareIcon } from './icons/ShareIcon';
import ShareModal from './ShareModal';
import { HangerIcon } from './icons/HangerIcon';
import { LipstickIcon } from './icons/LipstickIcon';
import type { Mode } from '../App';
import { ShuffleIcon } from './icons/ShuffleIcon';

interface ResultCardProps {
  result: AnalysisResult;
  generatedImage?: string | null;
  t: any;
  mode: Mode | null;
  onRegenerate: () => void;
}

const ScoreDisplay: React.FC<{ score: number, t: any }> = ({ score, t }) => {
    const scoreColor = score > 7 ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20' : score > 4 ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/20' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20';
    return (
        <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{t.compatibility}</span>
            <span className={`text-lg font-bold px-3 py-1 rounded-full ${scoreColor}`}>{score} / 10</span>
        </div>
    );
};

const Section: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    delay: number;
}> = ({ icon, title, children, delay }) => (
    <div className="pt-5" style={{ animationDelay: `${delay}ms`}}>
        <div className="flex items-center gap-3">
            {icon}
            <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h4>
        </div>
        <div className="text-slate-600 dark:text-slate-300 mt-2 pl-10">{children}</div>
    </div>
);

const ProductGrid: React.FC<{ suggestions: ProductSuggestion[], t: any }> = ({ suggestions, t }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((product, pIndex) => (
            <div key={pIndex} className="bg-white dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-600/80">
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{product.itemName}</p>
                <div className="flex items-center gap-2 mt-2">
                    <a href={`https://www.amazon.in/s?k=${encodeURIComponent(product.amazonSearchQuery)}`} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold py-2 px-2 rounded-md hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift">
                        <AmazonIcon className="w-4 h-4" /> {t.onAmazon}
                    </a>
                    <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(product.flipkartSearchQuery)}`} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold py-2 px-2 rounded-md hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift">
                        <FlipkartIcon className="w-4 h-4" /> {t.onFlipkart}
                    </a>
                </div>
            </div>
        ))}
    </div>
);


const ResultCard: React.FC<ResultCardProps> = ({ result, generatedImage, t, mode, onRegenerate }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'style-match-ai-virtual-try-on.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to render suggestion which might be a string or an object
  const renderSuggestion = (suggestion: any) => {
    if (typeof suggestion === 'string') {
      return <p className="whitespace-pre-wrap">{suggestion}</p>;
    }
    if (typeof suggestion === 'object' && suggestion !== null && !Array.isArray(suggestion)) {
      return (
        <ul className="space-y-3 list-none p-0">
          {Object.entries(suggestion).map(([key, value]) => (
            <li key={key} className="flex flex-col">
              <strong className="font-semibold text-slate-800 dark:text-slate-100">{key}:</strong>
              <span className="pl-2 text-slate-600 dark:text-slate-300">{String(value)}</span>
            </li>
          ))}
        </ul>
      );
    }
    // Fallback for any other type
    return <p className="whitespace-pre-wrap">{String(suggestion)}</p>;
  };

  return (
    <>
      <div className="relative bg-white/80 dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mt-6 animate-slide-up">
          {/* Gradient Border */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" style={{ zIndex: -1, filter: 'blur(10px)', opacity: 0.5 }}></div>
          
          <div className="space-y-4 divide-y divide-slate-200/80 dark:divide-slate-700/80 animate-stagger-children">

            {generatedImage && (
              <div style={{ animationDelay: '100ms' }}>
                  <Section 
                      icon={<div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center"><PersonIcon className="w-5 h-5" /></div>} 
                      title={t.virtualTryOn}
                      delay={100}
                  >
                      <div className="relative group mt-2">
                        <img 
                            src={generatedImage} 
                            alt="AI generated try-on" 
                            className="w-full rounded-lg shadow-md"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="bg-black/40 text-white rounded-full p-2.5 hover:bg-black/60 transition-all interactive-lift"
                            aria-label={t.share}
                            title={t.share}
                          >
                            <ShareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleDownload}
                            className="bg-black/40 text-white rounded-full p-2.5 hover:bg-black/60 transition-all interactive-lift"
                            aria-label={t.downloadImage}
                            title={t.downloadImage}
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                  </Section>
              </div>
            )}

            <div className="pt-4 first:pt-0" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center"><SparklesIcon className="w-5 h-5" /></div>
                  <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-300">{result.verdict}</h3>
              </div>
              {result.compatibilityScore !== undefined && (
                  <div className="mt-3 pl-10">
                      <ScoreDisplay score={result.compatibilityScore} t={t} />
                  </div>
              )}
               <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mt-3 pl-10">{result.feedback}</p>
            </div>
            
            {result.stylingTips && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center"><HangerIcon className="w-5 h-5" /></div>}
                  title={t.stylingTips}
                  delay={300}
              >
                  <p className="whitespace-pre-wrap">{result.stylingTips}</p>
              </Section>
            )}

            {result.accessoryAdvice && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 flex items-center justify-center"><BagIcon className="w-5 h-5" /></div>}
                  title={t.accessoryAdvice}
                  delay={400}
              >
                  <p className="whitespace-pre-wrap">{result.accessoryAdvice}</p>
              </Section>
            )}

            {result.beautyTips && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center"><LipstickIcon className="w-5 h-5" /></div>}
                  title={t.beautyTips}
                  delay={500}
              >
                  <p className="whitespace-pre-wrap">{result.beautyTips}</p>
              </Section>
            )}

            {result.familyOutfitSuggestions && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center"><PersonIcon className="w-5 h-5" /></div>}
                  title={t.familyOutfitPlan}
                  delay={300}
              >
                <div className="space-y-6">
                  {result.familyOutfitSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100">{suggestion.personDescription}</h5>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{suggestion.outfitDescription}</p>
                      {suggestion.productSuggestions && suggestion.productSuggestions.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            <h6 className="font-semibold text-slate-600 dark:text-slate-300 text-sm">{t.shopTheLook}</h6>
                          </div>
                           <div className="mt-2">
                              <ProductGrid suggestions={suggestion.productSuggestions} t={t} />
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.productSuggestions && result.productSuggestions.length > 0 && !result.familyOutfitSuggestions && (
                <Section 
                    icon={<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 flex items-center justify-center"><ShoppingBagIcon className="w-5 h-5" /></div>}
                    title={t.shopTheLook}
                    delay={300}
                >
                    <ProductGrid suggestions={result.productSuggestions} t={t} />
                </Section>
            )}
            
            {result.accessorySuggestions && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 flex items-center justify-center"><BagIcon className="w-5 h-5" /></div>}
                  title={t.accessoryRecommendations}
                  delay={300}
              >
                  <p className="whitespace-pre-wrap">{result.accessorySuggestions}</p>
              </Section>
            )}

            {result.colorSuggestions && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 flex items-center justify-center"><PaletteIcon className="w-5 h-5" /></div>}
                  title={t.colorSuggestions}
                  delay={400}
              >
                  <p>{result.colorSuggestions}</p>
              </Section>
            )}

            {result.suggestion && (
              <Section 
                  icon={<div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 flex items-center justify-center"><LightbulbIcon className="w-5 h-5" /></div>}
                  title={t.stylistSuggestion}
                  delay={500}
              >
                   {renderSuggestion(result.suggestion)}
              </Section>
            )}
          </div>

          {(mode === 'family' || mode === 'style') && (
            <div className="pt-5 mt-5 border-t border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={onRegenerate}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors duration-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift"
              >
                <ShuffleIcon className="w-5 h-5" />
                {t.regenerate}
              </button>
            </div>
          )}
      </div>
      {isShareModalOpen && (
        <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            result={result}
            generatedImage={generatedImage}
            t={t}
        />
      )}
    </>
  );
};


export default ResultCard;