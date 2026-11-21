import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { XIcon } from './icons/XIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
  generatedImage: string | null;
  t: any;
}

// Helper to convert base64 data URL to a Blob, needed for clipboard API
const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    const blob = await response.blob();
    return blob;
};

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result, generatedImage, t }) => {
  const [copyImageButtonText, setCopyImageButtonText] = useState(t.copyImage);
  const [copyTextButtonText, setCopyTextButtonText] = useState(t.copyTextAndLink);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const shareText = `Check out my new AI-styled look from ChicSync! My verdict: "${result.verdict}". What do you think?`;
  const appUrl = window.location.href;
  const fullTextToCopy = `${shareText}\n\n${result.feedback}\n\nCreate your own look here: ${appUrl}`;

  const handleCopyImage = async () => {
    if (!generatedImage || !navigator.clipboard?.write) {
      setCopyImageButtonText(t.copyImageError);
      setTimeout(() => setCopyImageButtonText(t.copyImage), 2000);
      return;
    }
    try {
      const blob = await base64ToBlob(generatedImage);
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopyImageButtonText(t.copyImageSuccess);
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      setCopyImageButtonText(t.copyImageError);
    } finally {
      setTimeout(() => setCopyImageButtonText(t.copyImage), 2500);
    }
  };
  
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopyTextButtonText(t.copyTextSuccess);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
        setTimeout(() => setCopyTextButtonText(t.copyTextAndLink), 2500);
    }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + appUrl)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 animate-pop-in text-slate-800 dark:text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="share-modal-title" className="text-xl font-bold">{t.shareYourLook}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700/70"
            aria-label={t.close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {generatedImage && (
          <div className="mb-4">
            <img src={generatedImage} alt={t.virtualTryOn} className="w-full rounded-lg shadow-md" />
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-slate-600 dark:text-slate-300">
             "{result.verdict}"
          </p>
          
          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleCopyImage} className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 transition-colors duration-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift">
                {copyImageButtonText}
            </button>
            <button onClick={handleCopyText} className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-300 transition-colors duration-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift">
                {copyTextButtonText}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors interactive-lift">
                <XIcon className="w-5 h-5" />
                <span>{t.shareOnX}</span>
            </a>
            <a href={whatsAppShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#1DAE52] transition-colors interactive-lift">
                <WhatsAppIcon className="w-5 h-5" />
                <span>{t.shareOnWhatsApp}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;