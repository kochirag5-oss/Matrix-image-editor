'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FinalCTASectionProps {
  onLaunch: () => void;
}

export default function FinalCTASection({ onLaunch }: FinalCTASectionProps) {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-between text-center px-4 sm:px-6 pt-28 pb-12 overflow-hidden z-10">
      
      {/* Intense Climax Nebula Bloom */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-glowViolet via-glowMagenta to-glowCyan rounded-full blur-[160px] opacity-25 pointer-events-none" />

      {/* Main Climax Center */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto my-auto">
        
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
        >
          <span className="text-[11px] font-heading font-bold uppercase tracking-[0.3em] text-glowCyan">
            Ready to Create?
          </span>
        </motion.div>

        {/* Grand Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-textPrimary leading-[1.08] mb-6 max-w-3xl"
        >
          Step Into the{' '}
          <span className="bg-gradient-to-r from-glowViolet via-glowMagenta to-glowCyan bg-clip-text text-transparent">
            Holodeck.
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-xl text-textMuted max-w-xl mb-10 leading-relaxed font-normal"
        >
          Transform ordinary images into cinematic artifacts with instant filters, color grading, and typography — no account, no friction.
        </motion.p>

        {/* Grand CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group"
        >
          <motion.button
            onClick={onLaunch}
            whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,229,255,0.5), 0 0 30px rgba(123,92,255,0.6)' }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-5 rounded-full font-heading font-black uppercase tracking-widest text-base bg-gradient-to-r from-glowViolet via-[#9844FC] to-glowCyan text-white shadow-[0_0_35px_rgba(123,92,255,0.45)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] animate-shimmer" />
            <span className="relative z-10 flex items-center gap-3">
              Launch Nebula Holodeck <span>⚡</span>
            </span>
          </motion.button>
        </motion.div>

      </div>

      {/* Footer Strip */}
      <footer className="w-full max-w-6xl mx-auto pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textMuted/70">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-textPrimary tracking-widest uppercase">NEBULA</span>
          <span>—</span>
          <span>Next-Gen Holographic Image Editor</span>
        </div>
        <div>
          Built for Hackathon MVP • Powered by Next.js
        </div>
      </footer>

    </section>
  );
}
