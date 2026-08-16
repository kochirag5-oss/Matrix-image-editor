'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GlowProgressRing from './GlowProgressRing';

interface FilterPresetCardProps {
  name: string;
  icon: string;
  description?: string;
  isActive: boolean;
  onClick: () => void;
  isProcessing?: boolean;
}

export default function FilterPresetCard({
  name,
  icon,
  description,
  isActive,
  onClick,
  isProcessing = false,
}: FilterPresetCardProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ease-out select-none
        ${
          isActive
            ? 'border-glowViolet bg-glowViolet/15 shadow-[0_0_25px_rgba(123,92,255,0.25)]'
            : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
        }
      `}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          {isProcessing ? (
            <GlowProgressRing size={22} showText={false} />
          ) : (
            <span className="text-xl">{icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-textPrimary text-sm font-heading font-semibold tracking-wide truncate">
              {name}
            </h4>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-glowCyan shadow-[0_0_8px_#00E5FF]" />
            )}
          </div>
          {description && (
            <p className="text-textMuted text-xs mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export { FilterPresetCard };
