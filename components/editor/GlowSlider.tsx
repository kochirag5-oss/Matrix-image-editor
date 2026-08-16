'use client';

import React from 'react';

interface GlowSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  onCommit?: () => void;
  accent?: 'cyan' | 'violet' | 'magenta' | 'mint';
}

export default function GlowSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  onCommit,
  accent = 'cyan',
}: GlowSliderProps) {
  // Percentage for gradient fill track
  const percentage = ((value - min) / (max - min)) * 100;

  const accentClasses = {
    cyan: 'accent-[#00E5FF]',
    violet: 'accent-[#7B5CFF]',
    magenta: 'accent-[#FF3DBB]',
    mint: 'accent-[#39FFB0]',
  }[accent];

  const glowStyles = {
    cyan: 'from-[#7B5CFF] to-[#00E5FF]',
    violet: 'from-[#FF3DBB] to-[#7B5CFF]',
    magenta: 'from-[#7B5CFF] to-[#FF3DBB]',
    mint: 'from-[#00E5FF] to-[#39FFB0]',
  }[accent];

  return (
    <div className="flex flex-col gap-1.5 w-full select-none">
      <div className="flex justify-between items-center text-xs">
        <span className="text-textMuted font-medium tracking-wide">{label}</span>
        <span className="font-mono text-textPrimary font-semibold text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
          {value > 0 && min < 0 ? `+${value}` : value}
          {unit}
        </span>
      </div>

      <div className="relative flex items-center h-5">
        {/* Visual Gradient Track */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/10 overflow-hidden pointer-events-none">
          <div
            className={`h-full bg-gradient-to-r ${glowStyles} rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Range Input with Custom Styling */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          className={`w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 glow-range ${accentClasses} focus:outline-none`}
          style={{
            WebkitAppearance: 'none',
          }}
        />
      </div>
    </div>
  );
}
