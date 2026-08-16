'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StageUploadProps {
  onImageLoaded: (dataUrl: string) => void;
  currentImage: string;
}

// Sample presets generated as high quality demo SVG data URLs
const SAMPLE_IMAGES = [
  {
    name: 'Cyber Portrait',
    icon: '👤',
    // Futuristic neon cyberpunk vector portrait
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230F1222"/><stop offset="100%" stop-color="%2305050A"/></linearGradient><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237B5CFF"/><stop offset="100%" stop-color="%2300E5FF"/></linearGradient><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23FF3DBB"/><stop offset="100%" stop-color="%237B5CFF"/></linearGradient></defs><rect width="600" height="600" fill="url(%23bg)"/><circle cx="300" cy="250" r="140" fill="url(%23g1)" opacity="0.85"/><rect x="180" y="380" width="240" height="200" rx="40" fill="url(%23g2)" opacity="0.9"/><circle cx="250" cy="230" r="18" fill="%2300E5FF"/><circle cx="350" cy="230" r="18" fill="%2300E5FF"/><path d="M260 290 Q300 330 340 290" stroke="%23FFF" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="300" cy="300" r="260" stroke="url(%23g1)" stroke-width="4" fill="none" stroke-dasharray="15 15"/></svg>`,
  },
  {
    name: 'Neon Cityscape',
    icon: '🏙️',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%230A0E2A"/><stop offset="100%" stop-color="%237B5CFF"/></linearGradient><linearGradient id="sun" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23FF3DBB"/><stop offset="100%" stop-color="%23FF9E00"/></linearGradient></defs><rect width="600" height="400" fill="url(%23sky)"/><circle cx="300" cy="220" r="90" fill="url(%23sun)"/><rect x="60" y="180" width="70" height="220" fill="%2305050A"/><rect x="150" y="120" width="90" height="280" fill="%230F1222"/><rect x="260" y="160" width="80" height="240" fill="%2305050A"/><rect x="360" y="100" width="100" height="300" fill="%230F1222"/><rect x="480" y="190" width="70" height="210" fill="%2305050A"/><line x1="0" y1="360" x2="600" y2="360" stroke="%2300E5FF" stroke-width="4"/><line x1="0" y1="380" x2="600" y2="380" stroke="%23FF3DBB" stroke-width="2"/></svg>`,
  },
  {
    name: 'Cyber Sphere',
    icon: '🔮',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><defs><radialGradient id="sphere" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="%2300E5FF"/><stop offset="50%" stop-color="%237B5CFF"/><stop offset="100%" stop-color="%2305050A"/></radialGradient></defs><rect width="500" height="500" fill="%2305050A"/><circle cx="250" cy="250" r="170" fill="url(%23sphere)"/><ellipse cx="250" cy="250" rx="220" ry="60" stroke="%2339FFB0" stroke-width="3" fill="none" transform="rotate(-25 250 250)"/></svg>`,
  },
];

export default function StageUpload({ onImageLoaded, currentImage }: StageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          onImageLoaded(result);
        }, 700);
      }
    };
    reader.readAsDataURL(file);
  };

  const loadSample = (dataUrl: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onImageLoaded(dataUrl);
    }, 700);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-glowCyan">
            Stage 01
          </span>
          <h3 className="text-xl font-heading font-bold text-textPrimary">
            Source Projection
          </h3>
        </div>
        <span className="text-2xl">⚡</span>
      </div>

      <p className="text-xs text-textMuted leading-relaxed">
        Upload an image from your device or pick a demo projection to start editing.
      </p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
        }}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div className="relative">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative w-full h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
            ${
              isDragging
                ? 'border-glowCyan bg-glowCyan/10 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                : 'border-white/15 bg-white/5 hover:border-glowViolet hover:bg-white/8 hover:shadow-[0_0_15px_rgba(123,92,255,0.2)]'
            }
          `}
        >
          {currentImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt="Current"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <svg className="w-8 h-8 mb-2 text-glowCyan relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-heading font-semibold text-textPrimary uppercase tracking-wider relative z-10">
            Click or Drop Image Here
          </p>
          <p className="text-[10px] text-textMuted mt-0.5 relative z-10">Supports PNG, JPG, WebP, SVG</p>

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'linear' }}
                className="absolute left-0 w-full h-[2px] bg-glowCyan opacity-80 shadow-[0_0_12px_2px_rgba(0,229,255,0.6)] pointer-events-none z-20"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Demo Samples */}
      <div>
        <span className="text-[10px] font-heading uppercase tracking-wider text-textMuted font-semibold block mb-2">
          Or try a demo sample:
        </span>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.name}
              onClick={() => loadSample(sample.dataUrl)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-glowCyan/50 hover:bg-white/10 transition-all flex flex-col items-center text-center group"
            >
              <span className="text-lg mb-1 group-hover:scale-110 transition-transform">
                {sample.icon}
              </span>
              <span className="text-[10px] font-heading font-semibold text-textPrimary group-hover:text-glowCyan truncate w-full">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
