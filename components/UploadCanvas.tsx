'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from './GlassPanel';

interface UploadCanvasProps {
  onImageUpload: (file: File, dataUrl: string) => void;
}

export default function UploadCanvas({ onImageUpload }: UploadCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setIsScanning(true);
      
      // Simulate scan animation then call the callback
      setTimeout(() => {
        setIsScanning(false);
        onImageUpload(file, dataUrl);
      }, 800);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onClick = () => {
    if (!previewUrl && !isScanning) {
      fileInputRef.current?.click();
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassPanel>
        <div
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center w-full h-96 rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
            ${isDragging ? 'border-glowCyan bg-glowCyan/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-panel border-opacity-50 hover:border-glowCyan hover:bg-white/5'}
          `}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={onFileInput}
            className="hidden"
          />

          {!previewUrl ? (
            <motion.div 
              className="flex flex-col items-center pointer-events-none"
              animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
            >
              <svg 
                className={`w-16 h-16 mb-4 transition-colors ${isDragging ? 'text-glowCyan' : 'text-textPrimary'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v6m0-6l-3 3m3-3l3 3" />
              </svg>
              <p className="text-xl font-medium text-textPrimary mb-2">Drop your image here</p>
              <p className="text-sm text-textMuted">or click to browse</p>
            </motion.div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'linear' }}
                    className="absolute left-0 w-full h-[2px] bg-glowCyan opacity-60 shadow-[0_0_8px_2px_rgba(0,255,255,0.5)] pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
