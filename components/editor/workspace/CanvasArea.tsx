'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditorStickyCanvas from '../EditorStickyCanvas';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';
import { EditorState, PaintStroke } from '@/types/editor';

interface CanvasAreaProps {
  state: EditorState;
  editTrigger: number;
  activeTool: string;
  onSelectTextLayer: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: any) => void;
  onPaintStrokeStart: (stroke: PaintStroke) => void;
  onPaintStrokeUpdate: (id: string, points: { x: number; y: number }[]) => void;
  onPaintStrokeCommit: () => void;
}

export default function CanvasArea({
  state,
  editTrigger,
  activeTool,
  onSelectTextLayer,
  onUpdateTextLayer,
  onPaintStrokeStart,
  onPaintStrokeUpdate,
  onPaintStrokeCommit,
}: CanvasAreaProps) {
  const {
    documents,
    activeDocumentId,
    setActiveDocument,
    closeDocument,
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    showRulers,
    showGrid,
    showGuides,
  } = useWorkspaceStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Keyboard zoom (Ctrl+scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoomIn, zoomOut]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'hand') return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    if (scrollRef.current) {
      setScrollStart({ left: scrollRef.current.scrollLeft, top: scrollRef.current.scrollTop });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning && scrollRef.current) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      scrollRef.current.scrollLeft = scrollStart.left - dx;
      scrollRef.current.scrollTop = scrollStart.top - dy;
    }
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  const fitToScreen = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setZoomLevel(Math.min(el.clientWidth / 640, el.clientHeight / 480));
  }, [setZoomLevel]);

  return (
    <div className="flex flex-col h-full min-w-0 bg-[#05050A]">
      {/* Document Tabs */}
      <div className="flex items-center gap-1 px-2 pt-2 overflow-x-auto bg-white/[0.03] border-b border-white/10">
        {documents.map(doc => (
          <div
            key={doc.id}
            onClick={() => setActiveDocument(doc.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer transition-all whitespace-nowrap border ${
              activeDocumentId === doc.id
                ? 'bg-[#0F1222]/80 border-white/10 border-b-transparent text-textPrimary shadow-[inset_0_2px_0_#00E5FF]'
                : 'bg-transparent border-transparent text-textMuted hover:text-white'
            }`}
          >
            {doc.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.thumbnail} alt="" className="w-4 h-4 rounded-sm object-cover border border-white/10" />
            ) : (
              <span className="w-4 h-4 rounded-sm bg-gradient-to-br from-glowViolet/40 to-glowCyan/40 border border-white/10" />
            )}
            <span>{doc.name}</span>
            {doc.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-glowMagenta" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeDocument(doc.id);
              }}
              className="text-textMuted/50 hover:text-glowMagenta transition-colors ml-0.5"
              aria-label={`Close ${doc.name}`}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="px-2 py-1.5 text-textMuted hover:text-glowCyan text-xs ml-1"
          title="New document"
          aria-label="New document"
        >
          +
        </button>
      </div>

      {/* Canvas Scroll Area */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 overflow-auto relative ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        {/* Checkerboard background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%), linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Grid overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* Centered canvas */}
        <div className="min-h-full min-w-full flex items-center justify-center p-8">
          <motion.div
            style={{ scale: zoomLevel }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="relative"
          >
            <EditorStickyCanvas
              state={state}
              activeTool={activeTool}
              editTrigger={editTrigger}
              onSelectTextLayer={onSelectTextLayer}
              onUpdateTextLayer={onUpdateTextLayer}
              onPaintStrokeStart={onPaintStrokeStart}
              onPaintStrokeUpdate={onPaintStrokeUpdate}
              onPaintStrokeCommit={onPaintStrokeCommit}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating zoom controls (bottom-right of canvas) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#0F1222]/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 z-20">
        <button
          onClick={zoomOut}
          className="px-2 py-1 text-textMuted hover:text-white text-sm rounded-lg hover:bg-white/5"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="text-[10px] font-mono text-textPrimary px-1 w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="px-2 py-1 text-textMuted hover:text-white text-sm rounded-lg hover:bg-white/5"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={fitToScreen}
          className="px-2 py-1 text-textMuted hover:text-glowCyan text-[10px] font-mono rounded-lg hover:bg-white/5 ml-1 border-l border-white/10"
          title="Fit on screen"
        >
          Fit
        </button>
      </div>

      {/* Compare toggle indicator */}
      {showGuides && state.textLayers.length === 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[10px] font-heading uppercase tracking-widest text-textMuted/40 pointer-events-none">
          {activeTool === 'crop' ? 'Crop: drag handles / set aspect in Properties' : ''}
        </div>
      )}
    </div>
  );
}