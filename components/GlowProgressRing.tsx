'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlowProgressRingProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function GlowProgressRing({ size = 64, className = '', showText = true }: GlowProgressRingProps) {
  const center = size / 2;
  const strokeWidth = Math.max(2, size * 0.08);
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 2,
        }}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`glowGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B5CFF" />
            <stop offset="50%" stopColor="#FF3DBB" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#glowGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          filter={`url(#glow-${size})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: [circumference, circumference / 4, circumference] }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: 2,
          }}
        />
      </motion.svg>
      {showText && size >= 32 && (
        <span className="text-[#9CA3C7] text-xs tracking-widest uppercase mt-1 animate-pulse">
          Processing...
        </span>
      )}
    </div>
  );
}

export { GlowProgressRing };
