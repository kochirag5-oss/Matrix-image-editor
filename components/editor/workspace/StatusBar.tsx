'use client';

import React from 'react';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';
import { EditorState } from '@/types/editor';

interface StatusBarProps {
  state: EditorState;
  zoomLevel: number;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  isSaving?: boolean;
  saveState?: 'saved' | 'dirty' | 'saving';
}

export default function StatusBar({
  state,
  zoomLevel,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onFit,
  isSaving = false,
  saveState = 'dirty',
}: StatusBarProps) {
  const activeTool = useWorkspaceStore(s => s.activeTool);
  const showRulers = useWorkspaceStore(s => s.showRulers);
  const setShowRulers = useWorkspaceStore(s => s.setShowRulers);
  const showGrid = useWorkspaceStore(s => s.showGrid);
  const setShowGrid = useWorkspaceStore(s => s.setShowGrid);
  const showGuides = useWorkspaceStore(s => s.showGuides);
  const setShowGuides = useWorkspaceStore(s => s.setShowGuides);

  const toolHint: Record<string, string> = {
    move: 'Move layers · Space drag to pan',
    brush: 'Paint with foreground color',
    pencil: 'Hard-edged painting',
    eraser: 'Remove pixels',
    crop: 'Drag to crop · set aspect in Properties',
    text: 'Click canvas to add a text layer',
    hand: 'Drag to pan the canvas',
    zoom: 'Click to zoom in · Ctrl+click to zoom out',
  };

  const hint = toolHint[activeTool] || 'Ready';

  return (
    <div className="h-7 shrink-0 flex items-center justify-between px-3 bg-[#0F1222]/90 backdrop-blur-xl border-t border-white/10 text-[10px] font-mono text-textMuted select-none">
      {/* Left: zoom + save state */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onZoomOut}
            className="px-1.5 hover:text-white hover:bg-white/5 rounded"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-11 text-center text-textPrimary">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={onZoomIn}
            className="px-1.5 hover:text-white hover:bg-white/5 rounded"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={onFit}
            className="px-1.5 hover:text-glowCyan hover:bg-white/5 rounded"
            title="Fit on screen"
          >
            Fit
          </button>
        </div>

        <span className="text-textMuted/40">|</span>

        {/* Save state */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSaving
                ? 'bg-glowViolet animate-pulse'
                : saveState === 'saved'
                ? 'bg-glowMint'
                : 'bg-glowMagenta'
            }`}
          />
          <span>
            {isSaving ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Unsaved changes'}
          </span>
        </div>
      </div>

      {/* Center: tool hint */}
      <div className="hidden md:block text-textMuted/70 truncate px-2">{hint}</div>

      {/* Right: undo state + toggles */}
      <div className="flex items-center gap-3">
        <span className="text-textMuted/50">
          {canUndo ? '•' : '·'} {canRedo ? '•' : '·'}
        </span>

        <span className="text-textMuted/40">|</span>

        {[
          { key: 'rulers', label: 'Rulers', value: showRulers, set: setShowRulers },
          { key: 'grid', label: 'Grid', value: showGrid, set: setShowGrid },
          { key: 'guides', label: 'Guides', value: showGuides, set: setShowGuides },
        ].map(({ key, label, value, set }) => (
          <button
            key={key}
            onClick={() => set(!value)}
            className={`px-1.5 py-0.5 rounded transition-all ${
              value ? 'text-glowCyan bg-glowCyan/10' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}

        <span className="text-textMuted/40">|</span>

        <span>{state.originalImage ? '1024 × 1024' : '— × —'}</span>
      </div>
    </div>
  );
}