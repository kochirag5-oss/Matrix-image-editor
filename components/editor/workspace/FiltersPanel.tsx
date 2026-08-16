'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPreviewThumb from '../FilterPreviewThumb';

interface FiltersPanelProps {
  activeFilterId: string | null;
  onSelectFilter: (id: string | null) => void;
  originalImage: string;
  onBgRemoved: (dataUrl: string) => void;
}

const PRESETS = [
  {
    id: 'enhance',
    name: 'Enhance',
    icon: '✨',
    desc: 'Vivid clarity & balanced saturation',
    badge: 'CANVAS',
    previewFilter: 'contrast(1.2) saturate(1.3) brightness(1.05)',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    desc: 'Warm moody film grade & sepia tones',
    badge: '35MM',
    previewFilter: 'contrast(1.15) saturate(0.85) sepia(0.2) brightness(0.95)',
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    icon: '💜',
    desc: 'High-voltage saturated tone',
    badge: 'CYBER',
    previewFilter: 'saturate(1.8) contrast(1.3) brightness(1.1)',
  },
  {
    id: 'dream',
    name: 'Dream Bloom',
    icon: '🌙',
    desc: 'Soft ethereal bloom & warm light',
    badge: 'GLOW',
    previewFilter: 'blur(0.5px) brightness(1.15) saturate(1.2)',
  },
  {
    id: 'noir',
    name: 'B&W Noir',
    icon: '🖤',
    desc: 'Dramatic high-contrast monochrome',
    badge: 'MONO',
    previewFilter: 'grayscale(1) contrast(1.4) brightness(0.9)',
  },
  {
    id: 'remove-bg',
    name: 'Remove BG',
    icon: '✂️',
    desc: 'Automatic subject cutout',
    badge: 'SOON',
    isAi: true,
    comingSoon: true,
  },
];

export default function FiltersPanel({
  activeFilterId,
  onSelectFilter,
  originalImage,
  onBgRemoved,
}: FiltersPanelProps) {
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFilterClick = async (presetId: string) => {
    setApiError(null);

    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset?.comingSoon) return;

    if (presetId === activeFilterId) {
      onSelectFilter(null);
      return;
    }

    if (presetId === 'remove-bg') {
      setIsProcessingBg(true);
      try {
        const response = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: originalImage }),
        });

        const data = await response.json();

        if (response.ok && data.image) {
          onBgRemoved(data.image);
          onSelectFilter('remove-bg');
        } else {
          const rawError = data.error || 'Failed to remove background';
          if (rawError.toLowerCase().includes('foreground')) {
            setApiError(
              'remove.bg could not detect a distinct foreground. For best results, use a photo with a clear person, product, car, or animal.'
            );
          } else {
            setApiError(rawError);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Network error';
        setApiError(`Background extraction error: ${message}`);
      } finally {
        setIsProcessingBg(false);
      }
    } else {
      onSelectFilter(presetId);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div>
          <p className="text-xs text-textMuted">
            Real-time cinematic grading.
          </p>
        </div>
        {activeFilterId && (
          <button
            onClick={() => onSelectFilter(null)}
            className="text-[10px] font-heading font-semibold uppercase tracking-wider text-glowCyan hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((preset) => {
            const isActive = activeFilterId === preset.id;
            const isProcessing = preset.id === 'remove-bg' && isProcessingBg;

            return (
              <motion.div
                key={preset.id}
                whileHover={preset.comingSoon ? undefined : { scale: 1.02 }}
                whileTap={preset.comingSoon ? undefined : { scale: 0.98 }}
                onClick={() => handleFilterClick(preset.id)}
                className={`
                  relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between select-none
                  ${
                    preset.comingSoon
                      ? 'border-white/5 bg-white/[0.02] opacity-60'
                      : isActive
                      ? 'border-glowViolet bg-glowViolet/20 shadow-[0_0_20px_rgba(123,92,255,0.35)]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer'
                  }
                `}
                aria-disabled={preset.comingSoon}
              >
                <div className="flex items-start gap-3">
                  <FilterPreviewThumb
                    imageSrc={originalImage}
                    presetId={preset.id}
                    isActive={isActive}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {isProcessing ? (
                          <span className="text-xs animate-spin">◌</span>
                        ) : (
                          <span className="text-lg">{preset.icon}</span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-textMuted border border-white/5">
                        {preset.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-heading font-bold text-textPrimary tracking-wide">
                      {preset.name}
                    </h4>
                    <p className="text-[10px] text-textMuted mt-0.5 leading-snug">
                      {preset.desc}
                    </p>
                  </div>
                </div>

                {preset.comingSoon && (
                  <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center gap-1">
                    <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-textMuted/70">
                      Coming soon
                    </span>
                  </div>
                )}

                {!preset.comingSoon && isActive && (
                  <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-glowCyan shadow-[0_0_6px_#00E5FF]" />
                    <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-glowCyan">
                      Active
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-[#FF3DBB]/15 border border-[#FF3DBB]/40 text-[#FF85D5] text-xs flex items-center justify-between gap-2 mx-3 mb-3"
          >
            <span>⚠️ {apiError}</span>
            <button onClick={() => setApiError(null)} className="text-xs font-bold px-1">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}