'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DemoTransform {
  title: string;
  preset: string;
  description: string;
  tag: string;
  beforeGrad: string;
  afterGrad: string;
  beforeFilter: string;
  afterFilter: string;
  icon: string;
}

const DEMOS: DemoTransform[] = [
  {
    title: 'Neon Cyberpunk Grade',
    preset: 'Neon Glow',
    description: 'Electrifying contrast boost with deep ultraviolet and cyan saturation.',
    tag: 'COLOR MATRIX',
    beforeGrad: 'from-slate-700 via-zinc-800 to-stone-900',
    afterGrad: 'from-purple-900 via-indigo-950 to-cyan-900',
    beforeFilter: 'contrast-100 saturate-100',
    afterFilter: 'contrast-125 saturate-200 hue-rotate-15',
    icon: '💜',
  },
  {
    title: 'Warm 35mm Cinema',
    preset: 'Cinematic',
    description: 'Subtle sepia undertones, crushed highlights, and velvety organic film grain.',
    tag: 'ATMOSPHERE',
    beforeGrad: 'from-blue-900 via-slate-800 to-zinc-900',
    afterGrad: 'from-amber-950 via-stone-900 to-teal-950',
    beforeFilter: 'sepia-0',
    afterFilter: 'sepia-[0.3] contrast-110 saturate-90',
    icon: '🎬',
  },
  {
    title: 'Dramatic B&W Noir',
    preset: 'B&W Noir',
    description: 'High-contrast monochrome with crushed blacks — one click in the Filters panel.',
    tag: 'MONO MATRIX',
    beforeGrad: 'from-slate-600 via-zinc-700 to-stone-800',
    afterGrad: 'from-zinc-900 via-neutral-900 to-black',
    beforeFilter: '',
    afterFilter: 'grayscale contrast-150 brightness-95',
    icon: '🖤',
  },
];

function InteractiveDemoCard({ demo }: { demo: DemoTransform }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm flex flex-col"
    >
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 shadow-2xl shadow-black/80">
        <div className="w-full bg-[#0F1222]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 flex flex-col overflow-hidden">
          
          {/* Top Label */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-glowCyan">
              {demo.tag}
            </span>
            <span className="text-xl">{demo.icon}</span>
          </div>

          {/* Interactive Visual Comparison Frame */}
          <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full h-52 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-white/10"
          >
            {/* Before Canvas */}
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${demo.beforeGrad} ${demo.beforeFilter} flex items-center justify-center`}>
              <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center">
                <span className="text-white/40 font-heading font-black text-2xl tracking-widest">ORIG</span>
              </div>
              <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] uppercase font-semibold text-textMuted">
                Original
              </span>
            </div>

            {/* After Canvas (Clipped) */}
            <div
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              className={`absolute inset-0 w-full h-full bg-gradient-to-br ${demo.afterGrad} ${demo.afterFilter} flex items-center justify-center`}
            >
              <div className="w-28 h-28 rounded-full border-2 border-glowCyan/50 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center">
                <span className="text-glowCyan font-heading font-black text-2xl tracking-widest">PROJ</span>
              </div>
              <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-glowViolet/80 backdrop-blur text-[10px] uppercase font-semibold text-white">
                {demo.preset}
              </span>
            </div>

            {/* Split Divider Line & Handle */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-[2px] bg-glowCyan shadow-[0_0_12px_2px_rgba(0,229,255,0.6)] pointer-events-none -translate-x-1/2 z-20"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#101323] border border-glowCyan flex items-center justify-center shadow-lg">
                <span className="text-[9px] text-glowCyan font-bold">‹ ›</span>
              </div>
            </div>

            {isHovered && (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] text-white/80 pointer-events-none">
                Drag to compare
              </div>
            )}
          </div>

          {/* Card Copy */}
          <div className="mt-5">
            <h4 className="font-heading font-bold text-lg text-textPrimary mb-1">
              {demo.title}
            </h4>
            <p className="text-textMuted text-xs leading-relaxed">
              {demo.description}
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default function VisualProofSection() {
  return (
    <section className="relative w-full py-28 px-4 sm:px-6 overflow-hidden z-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[11px] font-heading font-semibold uppercase tracking-[0.3em] text-glowCyan mb-2">
            Visual Proof
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-textPrimary tracking-tight">
            Cinematic Transformations
          </h2>
          <p className="text-textMuted text-sm sm:text-base mt-3">
            Drag the split slider — every transformation shown here is a live filter preset from the editor's Filters panel.
          </p>
        </div>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {DEMOS.map((demo, i) => (
            <InteractiveDemoCard key={i} demo={demo} />
          ))}
        </div>

      </div>
    </section>
  );
}
