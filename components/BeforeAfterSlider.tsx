'use client';

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', stopDragging);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging]);

  const onContainerMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const onContainerTouchStart = (e: ReactTouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-full"
    >
      <GlassPanel className="p-2 h-full">
        <div 
          ref={containerRef}
          className="relative w-full h-[60vh] max-h-[600px] overflow-hidden rounded cursor-ew-resize select-none"
          onMouseDown={onContainerMouseDown}
          onTouchStart={onContainerTouchStart}
        >
          {/* Before Image (Background) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={beforeImage} alt="Original" className="w-full h-full object-contain" />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-textMuted text-xs uppercase tracking-wider font-semibold z-10">
              Original
            </div>
          </div>

          {/* After Image (Clipped) */}
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={afterImage} alt="Edited" className="w-full h-full object-contain" />
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-textMuted text-xs uppercase tracking-wider font-semibold z-10">
              Edited
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-glowCyan shadow-[0_0_10px_2px_rgba(0,255,255,0.4)] pointer-events-none z-20"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1A1A24] border border-glowCyan flex items-center justify-center shadow-lg pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="cyan" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
