'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function GlowButton({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: GlowButtonProps) {
  const isPrimary = variant === 'primary';

  const sizeStyles = {
    sm: 'px-4 py-1.5 rounded-lg text-xs',
    md: 'px-8 py-3 rounded-2xl text-sm',
    lg: 'px-10 py-4 rounded-2xl text-base',
  }[size];

  const baseStyles = `font-semibold relative overflow-hidden transition-all duration-300 ${sizeStyles} ${fullWidth ? 'w-full' : ''}`;
  
  const primaryStyles = "bg-gradient-to-r from-glowViolet to-glowCyan text-white font-heading uppercase tracking-wider";
  const secondaryStyles = "bg-white/5 border border-white/10 text-textPrimary hover:bg-white/8";
  
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseStyles} ${isPrimary ? primaryStyles : secondaryStyles} ${disabledStyles} ${className}`}
      whileHover={!disabled ? { 
        scale: 1.02,
        boxShadow: isPrimary 
          ? "0 0 30px rgba(123,92,255,0.4), 0 0 60px rgba(0,229,255,0.15)" 
          : "0 0 20px rgba(255,255,255,0.05)"
      } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {!disabled && isPrimary && size !== 'sm' && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer" />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}