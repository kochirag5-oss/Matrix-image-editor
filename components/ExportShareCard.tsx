'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeforeAfterSlider from './BeforeAfterSlider';
import GlassPanel from './GlassPanel';
import GlowButton from './GlowButton';

interface ExportShareCardProps {
  originalImage: string;
  editedImage: string;
  onBack: () => void;
  onStartOver?: () => void;
}

export default function ExportShareCard({
  originalImage,
  editedImage,
  onBack,
  onStartOver,
}: ExportShareCardProps) {
  const [showToast, setShowToast] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nebula-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 2500);
          }
        }, 'image/png');
      }
    };
    img.src = editedImage;
  };

  const handleShare = (platform: string) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.12, duration: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Before / After Slider Comparison */}
      <motion.div variants={itemVariants} className="w-full">
        <BeforeAfterSlider beforeImage={originalImage} afterImage={editedImage} />
      </motion.div>

      {/* Export & Share Panel */}
      <motion.div variants={itemVariants} className="w-full max-w-2xl">
        <GlassPanel className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Export Section */}
            <div className="flex flex-col gap-3 justify-center">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-heading uppercase tracking-widest text-textMuted font-semibold">
                  Direct Render
                </h3>
                <p className="text-xs text-textMuted/70 mt-0.5">High resolution lossless PNG</p>
              </div>
              <GlowButton
                variant="primary"
                onClick={handleDownload}
                fullWidth
                className="relative mt-1"
              >
                {downloaded ? 'Saved to Device ✓' : 'Export PNG'}
              </GlowButton>
            </div>

            {/* Share Section */}
            <div className="flex flex-col gap-3 justify-center relative sm:border-l sm:border-white/10 sm:pl-6">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-heading uppercase tracking-widest text-textMuted font-semibold">
                  Holo-Broadcast
                </h3>
                <p className="text-xs text-textMuted/70 mt-0.5">Share with your collective</p>
              </div>

              <div className="flex gap-3 justify-center sm:justify-start mt-1">
                {[
                  { icon: '𝕏', name: 'X / Twitter' },
                  { icon: '📸', name: 'Instagram' },
                  { icon: '🔗', name: 'Copy Link' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleShare(item.name)}
                    title={item.name}
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base hover:bg-white/10 hover:border-glowCyan hover:text-glowCyan transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.25)] text-textPrimary active:scale-95"
                  >
                    {item.icon}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-glowViolet to-glowCyan text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg z-30"
                  >
                    Broadcast link generated!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <GlowButton variant="secondary" onClick={onBack}>
              ← Edit Filters
            </GlowButton>
            {onStartOver && (
              <button
                onClick={onStartOver}
                className="text-xs text-textMuted hover:text-white transition-colors underline decoration-white/20 underline-offset-4 tracking-wider uppercase font-semibold"
              >
                Start New Project
              </button>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
