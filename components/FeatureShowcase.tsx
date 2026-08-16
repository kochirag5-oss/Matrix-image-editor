'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface FeatureItem {
  step: string;
  tag: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
  details: string[];
}

const FEATURES: FeatureItem[] = [
  {
    step: '01',
    tag: 'PROJECTION DECK',
    title: 'Import & Live Canvas',
    description: 'Drop in any image and watch it materialize on the holographic canvas — rendered in real time with a full undo/redo history behind every edit.',
    icon: '⚡',
    gradient: 'from-[#7B5CFF] to-[#00E5FF]',
    accentColor: '#00E5FF',
    details: ['Drag & drop or browse', 'Real-time canvas preview', 'Full undo / redo history'],
  },
  {
    step: '02',
    tag: 'GRADE MATRIX',
    title: 'Pro-Grade Edit Suite',
    description: 'Eight live color & light controls, five cinematic filter presets, film grain and vignette — plus editable text layers and a full crop & transform toolkit.',
    icon: '🎛️',
    gradient: 'from-[#FF3DBB] to-[#7B5CFF]',
    accentColor: '#FF3DBB',
    details: ['Color & light sliders', '5 cinematic presets', 'Text + crop & transform'],
  },
  {
    step: '03',
    tag: 'DIRECT RENDER',
    title: 'Export & Compare',
    description: 'Inspect every edit with the draggable before/after split slider, then export clean PNG or JPEG files at exactly the quality you choose.',
    icon: '🚀',
    gradient: 'from-[#00E5FF] to-[#39FFB0]',
    accentColor: '#39FFB0',
    details: ['Before/after split slider', 'PNG & JPEG export', 'Quality control'],
  },
];

function FeatureCard({
  feature,
  index,
  scrollYProgress,
}: {
  feature: FeatureItem;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index * 0.33;
  const center = start + 0.16;
  const end = start + 0.33;

  const opacity = useTransform(
    scrollYProgress,
    [start, center - 0.05, center + 0.1, end + 0.05],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [start, center, end],
    [0.9, 1, 0.94]
  );

  const y = useTransform(
    scrollYProgress,
    [start, center, end],
    [40, 0, -30]
  );

  const filter = useTransform(
    scrollYProgress,
    [start, center, end],
    ['blur(6px)', 'blur(0px)', 'blur(6px)']
  );

  return (
    <motion.div
      style={{
        opacity,
        scale,
        y,
        filter,
      }}
      className="absolute inset-0 w-full"
    >
      <div className="relative h-full p-[1px] rounded-3xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 shadow-2xl shadow-black/80">
        <div className="w-full h-full bg-[#0F1222]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          
          {/* Card Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-2xl bg-gradient-to-r from-glowViolet to-glowCyan bg-clip-text text-transparent">
                {feature.step}
              </span>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-[11px] font-heading font-bold uppercase tracking-[0.2em] text-textMuted">
                {feature.tag}
              </span>
            </div>
            <span className="text-3xl">{feature.icon}</span>
          </div>

          {/* Card Content */}
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-textPrimary mb-2">
              {feature.title}
            </h3>
            <p className="text-textMuted text-xs sm:text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* Card Details / Pills */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
            {feature.details.map((detail, dIdx) => (
              <span
                key={dIdx}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-textPrimary flex items-center gap-1.5"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: feature.accentColor }}
                />
                {detail}
              </span>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const bloomOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0.25, 0.2]);
  const bloomScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 1]);

  return (
    <div ref={containerRef} className="relative h-[300vh] w-full">
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        
        {/* Dynamic Background Nebula Bloom based on Scroll */}
        <motion.div
          style={{
            opacity: bloomOpacity,
            scale: bloomScale,
          }}
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-glowViolet via-glowMagenta to-glowCyan blur-[140px] pointer-events-none z-0"
        />

        {/* Section Header */}
        <div className="relative z-10 text-center mb-10 max-w-2xl mx-auto">
          <p className="text-[11px] font-heading font-semibold uppercase tracking-[0.3em] text-glowCyan mb-2">
            The Nebula Pipeline
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-textPrimary tracking-tight">
            Engineered for Pure Flow
          </h2>
        </div>

        {/* 3 Scroll-Linked Holographic Cards with 3D Depth */}
        <div className="relative w-full max-w-2xl h-[360px] sm:h-[380px] z-10">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.step}
              feature={feature}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Scroll Track Progress Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full mt-10 overflow-hidden relative z-10">
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: 'left' }}
            className="h-full bg-gradient-to-r from-glowViolet via-glowMagenta to-glowCyan rounded-full"
          />
        </div>

      </div>
    </div>
  );
}
