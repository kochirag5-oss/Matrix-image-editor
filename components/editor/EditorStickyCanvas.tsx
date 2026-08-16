'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { EditorState, TextLayer, PaintStroke } from '@/types/editor';
import { renderEditorToCanvas } from '@/lib/editor/canvasRenderer';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';

interface EditorStickyCanvasProps {
  state: EditorState;
  activeTool: string;
  onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  onSelectTextLayer: (id: string | null) => void;
  onPaintStrokeStart: (stroke: PaintStroke) => void;
  onPaintStrokeUpdate: (id: string, points: { x: number; y: number }[]) => void;
  onPaintStrokeCommit: () => void;
  editTrigger: number;
}

const TOOL_LABELS: Record<string, string> = {
  upload: 'Source',
  color: 'Color & Light',
  filters: 'Presets',
  text: 'Text',
  crop: 'Crop',
  detail: 'Detail FX',
  export: 'Export',
  move: 'Move',
  marquee: 'Marquee',
  lasso: 'Lasso',
  wand: 'Magic Wand',
  eyedropper: 'Eyedropper',
  healing: 'Spot Healing',
  brush: 'Brush',
  pencil: 'Pencil',
  clone: 'Clone Stamp',
  eraser: 'Eraser',
  gradient: 'Gradient',
  pen: 'Pen',
  shape: 'Shape',
  hand: 'Hand',
  zoom: 'Zoom',
};

const overlayEase = [0.16, 1, 0.3, 1] as const;

export default function EditorStickyCanvas({
  state,
  activeTool,
  onUpdateTextLayer,
  onSelectTextLayer,
  onPaintStrokeStart,
  onPaintStrokeUpdate,
  onPaintStrokeCommit,
  editTrigger,
}: EditorStickyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const glowControls = useAnimation();
  const rafRef = useRef<number>();
  const paintingRef = useRef(false);
  const strokeIdRef = useRef<string | null>(null);
  const paintSize = useWorkspaceStore(s => s.paintSize);
  const fgColor = useWorkspaceStore(s => s.fgColor);
  const isPaintTool = activeTool === 'brush' || activeTool === 'pencil';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      renderEditorToCanvas(canvas, state, {
        showOriginal: showOriginalComparison,
      });
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, showOriginalComparison, editTrigger]);

  useEffect(() => {
    glowControls.start({
      boxShadow: [
        '0 0 35px rgba(123, 92, 255, 0.45), 0 0 60px rgba(0, 229, 255, 0.3)',
        '0 0 25px rgba(123, 92, 255, 0.2), 0 0 50px rgba(0, 229, 255, 0.1)',
      ],
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    });
  }, [editTrigger, glowControls]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (isPaintTool) {
      paintingRef.current = true;
      const id = `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      strokeIdRef.current = id;
      onPaintStrokeStart({
        id,
        points: [{ x: clickX, y: clickY }],
        size: paintSize,
        color: fgColor,
        opacity: 100,
        hard: activeTool === 'pencil',
      });
      return;
    }

    const clickedLayer = [...state.textLayers]
      .reverse()
      .find((layer) => Math.hypot(layer.x - clickX, layer.y - clickY) < 12);

    if (clickedLayer) {
      setIsDraggingText(true);
      setActiveDragId(clickedLayer.id);
      onSelectTextLayer(clickedLayer.id);
      setDragOffset({ x: clickX - clickedLayer.x, y: clickY - clickedLayer.y });
    } else {
      onSelectTextLayer(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    if (paintingRef.current && strokeIdRef.current) {
      onPaintStrokeUpdate(strokeIdRef.current, [{ x: currentX, y: currentY }]);
      return;
    }

    if (!isDraggingText || !activeDragId) return;
    onUpdateTextLayer(activeDragId, {
      x: Math.max(5, Math.min(95, currentX - dragOffset.x)),
      y: Math.max(5, Math.min(95, currentY - dragOffset.y)),
    });
  };

  const handleMouseUp = () => {
    if (paintingRef.current) {
      paintingRef.current = false;
      strokeIdRef.current = null;
      onPaintStrokeCommit();
      return;
    }
    setIsDraggingText(false);
    setActiveDragId(null);
  };

  // Crop overlay shows whenever the Crop tool is in focus (or an aspect ratio is set)
  const showCropGrid =
    (activeTool === 'crop' || state.transform.aspectRatio !== 'free') &&
    !!state.originalImage;

  return (
    <div className="w-full flex flex-col items-center select-none">
      <motion.div
        animate={glowControls}
        initial={{
          boxShadow:
            '0 0 25px rgba(123, 92, 255, 0.2), 0 0 50px rgba(0, 229, 255, 0.1)',
        }}
        className="relative p-[1px] rounded-3xl bg-gradient-to-br from-glowViolet/50 via-glowCyan/30 to-glowMagenta/40 w-full max-w-[540px] shadow-2xl"
      >
        <div className="relative w-full bg-[#0F1222]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 sm:p-5 flex flex-col items-center overflow-hidden">
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-glowCyan animate-pulse" />
              <span className="font-heading font-semibold uppercase tracking-wider text-textPrimary text-[11px]">
                Live Holo-Deck
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-heading uppercase tracking-wider text-glowCyan">
                <motion.span
                  key={activeTool}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: overlayEase }}
                  className="font-bold"
                >
                  {TOOL_LABELS[activeTool] ?? activeTool}
                </motion.span>
              </span>
              <button
                onMouseDown={() => setShowOriginalComparison(true)}
                onMouseUp={() => setShowOriginalComparison(false)}
                onMouseLeave={() => setShowOriginalComparison(false)}
                onTouchStart={() => setShowOriginalComparison(true)}
                onTouchEnd={() => setShowOriginalComparison(false)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
                  showOriginalComparison
                    ? 'bg-glowCyan text-black border-glowCyan font-bold shadow-[0_0_10px_#00E5FF]'
                    : 'bg-white/5 border-white/10 text-textMuted hover:text-white'
                }`}
              >
                Hold Original
              </button>
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                  className="px-1.5 py-0.5 text-textMuted hover:text-white text-xs font-mono"
                >
                  -
                </button>
                <span className="text-[10px] font-mono text-textPrimary px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                  className="px-1.5 py-0.5 text-textMuted hover:text-white text-xs font-mono"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="relative w-full min-h-[240px] max-h-[320px] sm:min-h-[320px] sm:max-h-[460px] flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/5">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            />

            {!state.originalImage ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-textMuted">
                <span className="text-4xl mb-2 animate-bounce">⚡</span>
                <p className="font-heading font-semibold text-sm text-textPrimary uppercase tracking-wider">
                  No Image Projected
                </p>
                <p className="text-xs mt-1">Upload an image to begin editing</p>
              </div>
            ) : (
              <motion.div
                style={{ scale: zoomLevel }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="relative flex items-center justify-center max-w-full max-h-full p-2"
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`max-w-full max-h-[280px] sm:max-h-[420px] object-contain rounded-xl shadow-2xl ${isPaintTool ? 'cursor-crosshair' : 'cursor-default'}`}
                />
                <AnimatePresence>
                  {showCropGrid && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: overlayEase }}
                      className="absolute inset-2 pointer-events-none rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-glowCyan/25" />
                        ))}
                      </div>
                      <div className="absolute inset-0 border-2 border-glowCyan/40 rounded-xl shadow-[inset_0_0_20px_rgba(0,229,255,0.15)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {state.textLayers.length > 0 && (
            <p className="text-[10px] text-textMuted/70 mt-2.5 tracking-wider uppercase">
              ✦ Drag text on canvas to reposition
            </p>
          )}

          {isPaintTool && (
            <p className="text-[10px] text-textMuted/70 mt-2.5 tracking-wider uppercase">
              ✦ Drag on canvas to paint with the foreground color
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
