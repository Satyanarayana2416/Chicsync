
import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CaptureIcon } from './icons/CaptureIcon';

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onCameraCapture?: (file: File | null) => void;
  disabled: boolean;
  placeholder?: string;
  t: any;
  style?: React.CSSProperties;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imagePreview, onImageChange, onCameraCapture, disabled, placeholder = "Click to upload or drag and drop", t, style }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const handleAreaClick = () => {
    if (!disabled && !isCameraOpen) {
      fileInputRef.current?.click();
    }
  };

  const processFile = (file: File | null) => {
    if (!file) return;
    onImageChange(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    processFile(file);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !isCameraOpen) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isCameraOpen) return;
    const file = event.dataTransfer.files?.[0] || null;
    processFile(file);
  };

  // --- Camera Logic ---
  
  const handleOpenCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported on this browser.");
      return;
    }
    // This will trigger the useEffect to start the camera
    setIsCameraOpen(true);
  };

  const handleCloseCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCameraOpen(false); // This will trigger the useEffect cleanup
  };

  // This effect handles starting and stopping the camera stream.
  useEffect(() => {
    let stream: MediaStream | null = null;
  
    const stopStream = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  
    if (isCameraOpen) {
      const startCamera = async () => {
        try {
          // This check is crucial. We wait for the video element to be available.
          if (!videoRef.current) {
            // This can happen in a fast re-render. We'll wait for the next render cycle.
            return;
          }

          const constraints: MediaStreamConstraints = { video: { facingMode: 'user' } };
          stream = await navigator.mediaDevices.getUserMedia(constraints);
  
          // Check ref again in case the component unmounted during the async call
          if (videoRef.current) {
            const videoTrack = stream.getVideoTracks()[0];
            if (!videoTrack) throw new Error("No video track found in the stream.");
            
            const settings = videoTrack.getSettings();
            setFacingMode((settings.facingMode as 'user' | 'environment') || 'user');
            
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          } else {
             // If the component unmounted, stop the acquired stream.
             stopStream();
          }
        } catch (err) {
          let message: string;
          const deniedMessage = "Camera permission denied. To use the camera, please grant permission in your browser settings. You can typically do this by clicking the lock icon next to the website address and changing the Camera setting to 'Allow'.";
          
          const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
          const errorName = err instanceof DOMException ? err.name : '';
    
          if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorMessage.includes('permission denied')) {
            message = deniedMessage;
          } else if (errorName === 'NotFoundError' || errorName === 'OverconstrainedError') {
            message = "No camera was found on your device, or the selected camera is not available.";
          } else if (errorMessage.includes('permission dismissed')) {
            message = "Camera prompt was dismissed. Click 'Use Camera' again and grant permission when asked.";
          } else {
            console.error("Camera start error:", err);
            message = "Could not start camera. It might be in use by another application.";
          }
    
          setCameraError(message);
          setIsCameraOpen(false); // Close UI on error
        }
      };
  
      startCamera();
  
      return () => {
        stopStream();
      };
    }
  }, [isCameraOpen]); // This effect re-runs whenever isCameraOpen changes.


  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // If the preview is mirrored (for front-facing 'user' cameras),
        // we must flip the canvas context horizontally before drawing to get
        // a correct, un-mirrored final image.
        if (facingMode === 'user') {
            context.save();
            context.translate(video.videoWidth, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            context.restore();
        } else {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        }
      }
      
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
          if (onCameraCapture) {
            onCameraCapture(file);
          } else {
            processFile(file);
          }
        }
        setIsCameraOpen(false); // Triggers useEffect cleanup
      }, 'image/jpeg');
    }
  };

  const handleTakePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    takePicture();
  };


  return (
    <div style={style}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
      <canvas ref={canvasRef} className="hidden" />

      <div
        onClick={handleAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-[4/3] bg-slate-100/80 dark:bg-slate-800/80 border-2 rounded-xl flex flex-col justify-center items-center transition-all duration-300 overflow-hidden group ${
          isDragging
            ? 'border-solid border-indigo-500 scale-105 bg-indigo-50 dark:bg-indigo-900/40'
            : imagePreview 
              ? 'border-solid border-indigo-500' 
              : `border-dashed ${disabled ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600'}`
        } ${
          !imagePreview && !isCameraOpen && !disabled ? 'hover:border-indigo-500 hover:bg-indigo-50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/40 cursor-pointer' : ''
        }`}
      >
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Outfit preview" className="object-contain h-full w-full" />
            <div className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg pointer-events-none animate-pop-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </>
        ) : isCameraOpen ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-1' : ''}`}
            />
            <div className="absolute inset-0 bg-black/20 flex justify-center items-end p-4">
               <button
                 onClick={handleTakePicture}
                 className="w-20 h-20 transition-transform duration-200 ease-in-out hover:scale-110 active:scale-100 focus:outline-none"
                 aria-label={t.takePicture}
               >
                <CaptureIcon />
               </button>
            </div>
            <button 
               onClick={handleCloseCamera}
               className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition"
               aria-label={t.close}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-colors dark:text-slate-500 dark:group-hover:text-indigo-400" />
            <p className="mt-2 font-semibold text-slate-600 dark:text-slate-300">{placeholder}</p>
            <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{t.fileTypes}</p>
            
            <div className="my-4 w-full max-w-xs relative flex items-center">
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm dark:text-slate-500">{t.or}</span>
                <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
            </div>

            <button
                type="button"
                onClick={handleOpenCamera}
                disabled={disabled}
                className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 interactive-lift"
            >
              <CameraIcon className="w-5 h-5" />
              {t.useCamera}
            </button>
            {cameraError && <p className="text-red-500 text-xs mt-2 max-w-xs mx-auto">{cameraError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
