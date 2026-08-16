'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';
import LayersPanel from './LayersPanel';
import HistoryPanel from './HistoryPanel';
import AdjustmentsPanel from './AdjustmentsPanel';
import FiltersPanel from './FiltersPanel';
import AIAssistantPanel from './AIAssistantPanel';
import PropertiesPanel from './PropertiesPanel';
import { EditorState, ColorAdjustments, DetailFX, TransformSettings } from '@/types/editor';

interface RightDockProps {
  state: EditorState;
  editTrigger: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddTextLayer: () => void;
  onSelectTextLayer: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: any) => void;
  onDeleteTextLayer: (id: string) => void;
  onAdjustmentChange: (updates: Partial<ColorAdjustments>) => void;
  onDetailChange: (updates: Partial<DetailFX>) => void;
  onCommit: () => void;
  onSelectFilter: (id: string | null) => void;
  onBgRemoved: (dataUrl: string) => void;
  onApplyAIText: (text: string) => void;
  zoomLevel: number;
  onTransformChange: (updates: Partial<TransformSettings>) => void;
}

const DOCK_TABS = [
  { id: 'layers', label: 'Layers', icon: '◫' },
  { id: 'history', label: 'History', icon: '↺' },
  { id: 'adjust', label: 'Adjust', icon: '◐' },
  { id: 'filters', label: 'Filters', icon: '✦' },
  { id: 'ai', label: 'Nebula AI', icon: '✦' },
  { id: 'props', label: 'Properties', icon: '◍' },
] as const;

export default function RightDock({
  state,
  editTrigger,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddTextLayer,
  onSelectTextLayer,
  onUpdateTextLayer,
  onDeleteTextLayer,
  onAdjustmentChange,
  onDetailChange,
  onCommit,
  onSelectFilter,
  onBgRemoved,
  onApplyAIText,
  zoomLevel,
  onTransformChange,
}: RightDockProps) {
  const {
    activeDockTab,
    setActiveDockTab,
    rightDockWidth,
    setRightDockWidth,
    isRightDockCollapsed,
    setRightDockCollapsed,
  } = useWorkspaceStore();

  const activeTool = useWorkspaceStore(s => s.activeTool);

  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = rightDockWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const delta = startXRef.current - e.clientX;
    const next = Math.min(520, Math.max(280, startWidthRef.current + delta));
    setRightDockWidth(next);
  }, [rightDockWidth, setRightDockWidth]);

  const stopResize = useCallback(() => {
    if (resizingRef.current) {
      resizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stopResize);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [onMouseMove, stopResize]);

  const renderPanel = () => {
    switch (activeDockTab) {
      case 'layers':
        return (
          <LayersPanel
            state={state}
            onAddTextLayer={onAddTextLayer}
            onSelectTextLayer={onSelectTextLayer}
            onUpdateTextLayer={onUpdateTextLayer}
            onDeleteTextLayer={onDeleteTextLayer}
          />
        );
      case 'history':
        return (
          <HistoryPanel
            editTrigger={editTrigger}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        );
      case 'adjust':
        return (
          <AdjustmentsPanel
            adjustments={state.adjustments}
            detailFX={state.detailFX}
            onChange={onAdjustmentChange}
            onDetailChange={onDetailChange}
            onCommit={onCommit}
          />
        );
      case 'filters':
        return (
          <FiltersPanel
            activeFilterId={state.activeFilterId}
            onSelectFilter={onSelectFilter}
            originalImage={state.originalImage}
            onBgRemoved={onBgRemoved}
          />
        );
      case 'ai':
        return (
          <AIAssistantPanel
            hasImage={!!state.originalImage}
            imageUrl={state.originalImage || undefined}
            onApplyText={onApplyAIText}
          />
        );
      case 'props':
        return (
          <PropertiesPanel
            activeTool={activeTool}
            state={state}
            zoomLevel={zoomLevel}
            onUpdateTextLayer={onUpdateTextLayer}
            onTransformChange={onTransformChange}
          />
        );
    }
  };

  return (
    <AnimatePresence initial={false}>
      {!isRightDockCollapsed ? (
        <motion.div
          key="dock"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: rightDockWidth, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col bg-[#0F1222]/90 backdrop-blur-xl border-l border-white/10 overflow-hidden shrink-0"
          style={{ width: rightDockWidth }}
        >
          {/* Resize handle */}
          <div
            onMouseDown={startResize}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-glowCyan/40 transition-colors z-20"
            title="Resize panel"
          />

          {/* Tab bar */}
          <div className="flex items-center gap-0.5 px-2 pt-2 overflow-x-auto border-b border-white/10 shrink-0">
            {DOCK_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDockTab(tab.id)}
                className={`px-2.5 py-2 rounded-t-lg text-[9px] font-heading font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                  activeDockTab === tab.id
                    ? 'border-white/10 border-b-transparent bg-white/[0.03] text-glowCyan shadow-[inset_0_2px_0_#7B5CFF]'
                    : 'border-transparent text-textMuted hover:text-white'
                }`}
                title={tab.label}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Collapse button */}
          <button
            onClick={() => setRightDockCollapsed(true)}
            className="absolute top-2 right-2 z-30 w-5 h-5 rounded-md bg-white/5 border border-white/10 text-textMuted hover:text-glowMagenta text-xs flex items-center justify-center"
            title="Collapse panel"
            aria-label="Collapse panel"
          >
            ›
          </button>

          {/* Panel body */}
          <div className="flex-1 min-h-0 overflow-hidden">{renderPanel()}</div>
        </motion.div>
      ) : (
        <motion.button
          key="dock-collapsed"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 36, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setRightDockCollapsed(false)}
          className="shrink-0 flex items-center justify-center bg-[#0F1222]/90 backdrop-blur-xl border-l border-white/10 text-textMuted hover:text-glowCyan text-sm"
          title="Expand panel"
          aria-label="Expand panel"
        >
          ‹
        </motion.button>
      )}
    </AnimatePresence>
  );
}