'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowSlider from '../GlowSlider';
import { ColorAdjustments, DetailFX } from '@/types/editor';
import { DEFAULT_ADJUSTMENTS, DEFAULT_DETAIL_FX } from '@/lib/editor/defaults';

interface AdjustmentsPanelProps {
  adjustments: ColorAdjustments;
  detailFX: DetailFX;
  onChange: (updates: Partial<ColorAdjustments>) => void;
  onDetailChange: (updates: Partial<DetailFX>) => void;
  onCommit: () => void;
}

export default function AdjustmentsPanel({
  adjustments,
  detailFX,
  onChange,
  onDetailChange,
  onCommit,
}: AdjustmentsPanelProps) {
  const [activeSection, setActiveSection] = React.useState<'color' | 'detail'>('color');

  const handleAutoEnhance = () => {
    onChange({
      brightness: 8,
      contrast: 18,
      saturation: 22,
      exposure: 5,
      temperature: 4,
      vibrance: 15,
      hue: 0,
      sharpness: 12,
    });
    onCommit();
  };

  const isAdjusted = JSON.stringify(adjustments) !== JSON.stringify(DEFAULT_ADJUSTMENTS);
  const isDetailed = JSON.stringify(detailFX) !== JSON.stringify(DEFAULT_DETAIL_FX);

  const resetAll = () => {
    Object.entries(DEFAULT_ADJUSTMENTS).forEach(([k, v]) => onChange({ [k]: v } as any));
    Object.entries(DEFAULT_DETAIL_FX).forEach(([k, v]) => onDetailChange({ [k]: v } as any));
    onCommit();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section toggle */}
      <div className="flex items-center gap-1 p-2.5 border-b border-white/10">
        {([
          { id: 'color', label: 'Color & Light' },
          { id: 'detail', label: 'Detail FX' },
        ] as const).map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-heading font-semibold uppercase tracking-wider border transition-all ${
              activeSection === section.id
                ? 'border-glowCyan/50 bg-glowCyan/10 text-glowCyan'
                : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
            }`}
          >
            {section.label}
          </button>
        ))}
        <button
          onClick={handleAutoEnhance}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-heading uppercase tracking-wider bg-glowViolet/20 border border-glowViolet text-white hover:bg-glowViolet/30 transition-all font-semibold shadow-[0_0_10px_rgba(123,92,255,0.3)] ml-1"
          title="Auto enhance"
        >
          Auto ✨
        </button>
        <button
          onClick={resetAll}
          className="px-2 py-1.5 rounded-lg text-[10px] font-heading uppercase tracking-wider bg-white/5 border border-white/10 text-textMuted hover:text-white hover:border-white/20 transition-all font-semibold"
          title="Reset all adjustments"
        >
          Reset
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
        >
          {activeSection === 'color' ? (
            <>
              <GlowSlider
                label="Exposure"
                value={adjustments.exposure}
                min={-100}
                max={100}
                onChange={(val) => onChange({ exposure: val })}
                onCommit={onCommit}
                accent="cyan"
              />
              <GlowSlider
                label="Brightness"
                value={adjustments.brightness}
                min={-100}
                max={100}
                onChange={(val) => onChange({ brightness: val })}
                onCommit={onCommit}
                accent="cyan"
              />
              <GlowSlider
                label="Contrast"
                value={adjustments.contrast}
                min={-100}
                max={100}
                onChange={(val) => onChange({ contrast: val })}
                onCommit={onCommit}
                accent="violet"
              />
              <GlowSlider
                label="Saturation"
                value={adjustments.saturation}
                min={-100}
                max={100}
                onChange={(val) => onChange({ saturation: val })}
                onCommit={onCommit}
                accent="magenta"
              />
              <GlowSlider
                label="Temperature (Cool / Warm)"
                value={adjustments.temperature}
                min={-100}
                max={100}
                onChange={(val) => onChange({ temperature: val })}
                onCommit={onCommit}
                accent="mint"
              />
              <GlowSlider
                label="Vibrance"
                value={adjustments.vibrance}
                min={-100}
                max={100}
                onChange={(val) => onChange({ vibrance: val })}
                onCommit={onCommit}
                accent="magenta"
              />
              <GlowSlider
                label="Hue Rotation"
                value={adjustments.hue}
                min={-180}
                max={180}
                unit="°"
                onChange={(val) => onChange({ hue: val })}
                onCommit={onCommit}
                accent="violet"
              />
              <GlowSlider
                label="Sharpness"
                value={adjustments.sharpness}
                min={0}
                max={100}
                onChange={(val) => onChange({ sharpness: val })}
                onCommit={onCommit}
                accent="mint"
              />
            </>
          ) : (
            <>
              <GlowSlider
                label="Blur / Soft Focus"
                value={detailFX.blur}
                min={0}
                max={20}
                unit="px"
                onChange={(val) => onDetailChange({ blur: val })}
                onCommit={onCommit}
                accent="violet"
              />
              <GlowSlider
                label="Vignette Intensity"
                value={detailFX.vignette}
                min={0}
                max={100}
                unit="%"
                onChange={(val) => onDetailChange({ vignette: val })}
                onCommit={onCommit}
                accent="magenta"
              />
              {detailFX.vignette > 0 && (
                <div>
                  <label className="text-[10px] font-heading uppercase tracking-wider text-textMuted block mb-2">
                    Vignette Tint
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { color: 'rgba(0,0,0,0.7)', label: 'Void' },
                      { color: 'rgba(123,92,255,0.5)', label: 'Violet' },
                      { color: 'rgba(0,229,255,0.35)', label: 'Cyan' },
                      { color: 'rgba(255,61,187,0.4)', label: 'Magenta' },
                    ].map(({ color, label }) => (
                      <button
                        key={label}
                        onClick={() => onDetailChange({ vignetteColor: color })}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-heading uppercase border transition-all ${
                          detailFX.vignetteColor === color
                            ? 'border-glowCyan text-glowCyan shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                            : 'border-white/10 text-textMuted'
                        }`}
                        style={{ background: `radial-gradient(circle, transparent, ${color})` }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs text-textMuted">Film Grain</span>
                  <p className="text-[10px] text-textMuted/70">Cinematic noise texture</p>
                </div>
                <button
                  onClick={() => onDetailChange({ grain: !detailFX.grain })}
                  className={`w-12 h-6 rounded-full relative transition-all ${
                    detailFX.grain ? 'bg-glowCyan/30 border border-glowCyan' : 'bg-white/10 border border-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                      detailFX.grain
                        ? 'left-[26px] bg-glowCyan shadow-[0_0_8px_#00E5FF]'
                        : 'left-0.5 bg-white/40'
                    }`}
                  />
                </button>
              </div>
              {detailFX.grain && (
                <GlowSlider
                  label="Grain Intensity"
                  value={detailFX.grainIntensity}
                  min={0}
                  max={100}
                  onChange={(val) => onDetailChange({ grainIntensity: val })}
                  onCommit={onCommit}
                  accent="mint"
                />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {(isAdjusted || isDetailed) && (
        <div className="p-2.5 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-textMuted/60">Adjustments applied</span>
          <button
            onClick={resetAll}
            className="text-[10px] font-heading font-semibold uppercase tracking-wider text-glowMagenta hover:text-white"
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
}