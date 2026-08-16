'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HolographicObject3D from './HolographicObject3D';

interface LandingHeroProps {
  onLaunch: () => void;
  onScrollToFeatures: () => void;
}

export default function LandingHero({ onLaunch, onScrollToFeatures }: LandingHeroProps) {
  const headlineWords = ["Edit", "Images", "at", "the", "Speed", "of", "Light."];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20 pb-16 overflow-hidden">
      
      {/* 3D Holographic Floating Core */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <HolographicObject3D className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] opacity-70" />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Eyebrow Badge */}
        <motion.div
          variants={wordVariants}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(123,92,255,0.25)] mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-glowCyan animate-pulse shadow-[0_0_8px_#00E5FF]" />
          <span className="text-[11px] font-heading font-semibold uppercase tracking-[0.25em] text-textPrimary">
            Holographic Image Editor
          </span>
        </motion.div>

        {/* Staggered Blur-to-Focus Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight leading-[1.08] mb-6 max-w-3xl">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className={`inline-block mr-3 sm:mr-4 ${
                word === 'Speed' || word === 'Light.'
                  ? 'bg-gradient-to-r from-glowViolet via-glowMagenta to-glowCyan bg-clip-text text-transparent'
                  : 'text-textPrimary'
              }`}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          variants={wordVariants}
          className="text-base sm:text-lg md:text-xl text-textMuted max-w-2xl font-normal leading-relaxed mb-10"
        >
          Cinematic color grading, one-tap filter presets, typography layers, and lossless export —
          all rendered live on a holographic canvas. No account, no uploads, just editing.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={wordVariants}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            onClick={onLaunch}
            whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(0,229,255,0.4), 0 0 20px rgba(123,92,255,0.5)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-9 py-4 rounded-full font-heading font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-glowViolet via-[#9844FC] to-glowCyan text-white relative overflow-hidden shadow-[0_0_25px_rgba(123,92,255,0.35)] group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Launch Editor <span>→</span>
            </span>
          </motion.button>

          <motion.button
            onClick={onScrollToFeatures}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-7 py-4 rounded-full font-heading font-medium tracking-wider text-sm text-textPrimary bg-white/5 border border-white/10 backdrop-blur-xl transition-all"
          >
            Explore Holodeck ↓
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll-Hint Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
        }}
        onClick={onScrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-textMuted hover:text-white transition-colors z-10"
      >
        <span className="text-[10px] font-heading uppercase tracking-[0.25em]">Scroll to explore</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>

    </section>
  );
}
