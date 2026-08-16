'use client';

import React, { useEffect, useRef } from 'react';
import { getPresetPreviewFilter } from '@/lib/editor/canvasRenderer';

interface FilterPreviewThumbProps {
  imageSrc: string;
  presetId: string;
  isActive: boolean;
}

export default function FilterPreviewThumb({
  imageSrc,
  presetId,
  isActive,
}: FilterPreviewThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc || presetId === 'remove-bg') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const aspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      if (aspect > 1) drawH = size / aspect;
      else drawW = size * aspect;
      const ox = (size - drawW) / 2;
      const oy = (size - drawH) / 2;
      ctx.clearRect(0, 0, size, size);
      ctx.filter = getPresetPreviewFilter(presetId);
      ctx.drawImage(img, ox, oy, drawW, drawH);
    };
    img.src = imageSrc;
  }, [imageSrc, presetId]);

  if (!imageSrc || presetId === 'remove-bg') {
    return (
      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
        ✂️
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-16 h-16 rounded-xl border object-cover ${
        isActive ? 'border-glowCyan shadow-[0_0_12px_rgba(0,229,255,0.4)]' : 'border-white/10'
      }`}
    />
  );
}
