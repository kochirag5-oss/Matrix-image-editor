'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export default function GlassPanel({ children, className = '', ...motionProps }: GlassPanelProps) {
  return (
    <motion.div
      className={`relative p-[1px] rounded-3xl bg-gradient-to-br from-glowViolet to-glowCyan shadow-2xl shadow-black/40 ${className}`}
      {...motionProps}
    >
      <div className="w-full h-full bg-panel/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}
