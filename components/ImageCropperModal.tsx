import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop } from 'react-image-crop';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (file: File) => void;
  t: any;
}

// Function to generate the cropped image file
async function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<File> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: blob.type });
        resolve(file);
      },
      'image/jpeg',
      0.95 // High quality
    );
  });
}

const AspectButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 border-2 ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:border-indigo-500'
    }`}
  >
    {children}
  </button>
);


const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imageSrc, onCropComplete, t }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(1); // Default to 1:1 square

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      {
        unit: '%',
        width: 90,
        height: 90,
      },
      width,
      height
    );
    setCrop(newCrop);
    setCompletedCrop(newCrop); // Also set completed crop initially
  }

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    // When changing aspect, reset the crop to a centered version for better UX.
    if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop({ unit: '%', width: 90, height: 90 }, width, height);
        setCrop(newCrop);
        setCompletedCrop(newCrop);
    }
  };

  const handleConfirmCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }
    setIsProcessing(true);
    try {
        const croppedFile = await getCroppedImg(
            imgRef.current,
            completedCrop,
            'cropped-image.jpg'
        );
        onCropComplete(croppedFile);
    } catch (e) {
        console.error("Error cropping image:", e);
    } finally {
        setIsProcessing(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4 p-6 animate-pop-in text-slate-800 dark:text-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="crop-modal-title" className="text-xl font-bold">{t.cropImage}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-700/70"
            aria-label={t.close}
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.adjustSelection}</p>
        
        <div className="w-full max-h-[50vh] flex justify-center items-center bg-slate-100 dark:bg-slate-900/50 rounded-lg overflow-hidden">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
            >
                <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    style={{ maxHeight: '50vh' }}
                />
            </ReactCrop>
        </div>
        
        <div className="my-4">
            <label className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.aspectRatio}
            </label>
            <div className="flex flex-wrap justify-center gap-2">
                <AspectButton active={aspect === undefined} onClick={() => handleAspectChange(undefined)}>{t.aspectFree}</AspectButton>
                <AspectButton active={aspect === 1} onClick={() => handleAspectChange(1)}>1:1</AspectButton>
                <AspectButton active={aspect === 4/3} onClick={() => handleAspectChange(4/3)}>4:3</AspectButton>
                <AspectButton active={aspect === 3/4} onClick={() => handleAspectChange(3/4)}>3:4</AspectButton>
                <AspectButton active={aspect === 16/9} onClick={() => handleAspectChange(16/9)}>16:9</AspectButton>
            </div>
        </div>

        <button
            onClick={handleConfirmCrop}
            disabled={!completedCrop || isProcessing}
            className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 interactive-lift"
        >
            {isProcessing ? 'Processing...' : t.cropAndConfirm}
        </button>

      </div>
    </div>
  );
};

export default ImageCropperModal;