'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MenuBar from './MenuBar';
import ToolRail from './ToolRail';
import CanvasArea from './CanvasArea';
import RightDock from './RightDock';
import StatusBar from './StatusBar';
import StageUpload from '../StageUpload';
import StageExport from '../StageExport';
import { useEditorHistory } from '@/lib/editor/useEditorHistory';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { DEFAULT_ADJUSTMENTS, DEFAULT_DETAIL_FX } from '@/lib/editor/defaults';
import { TextLayer, ColorAdjustments, DetailFX, TransformSettings, PaintStroke } from '@/types/editor';

function createTextLayer(): TextLayer {
  return {
    id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: 'NEBULA',
    x: 50,
    y: 50,
    fontSize: 48,
    fontFamily: 'Orbitron',
    color: '#F4F5FF',
    bold: true,
    italic: false,
    glow: true,
    glowColor: '#00E5FF',
    opacity: 100,
    letterSpacing: 4,
  };
}

export default function PhotoshopWorkspace() {
  const {
    state,
    setState,
    previewState,
    commitPreview,
    undo,
    redo,
    canUndo,
    canRedo,
    editTrigger,
    resetAll,
  } = useEditorHistory();

  const activeTool = useWorkspaceStore(s => s.activeTool);
  const setActiveTool = useWorkspaceStore(s => s.setActiveTool);
  const activeDocumentId = useWorkspaceStore(s => s.activeDocumentId);
  const documents = useWorkspaceStore(s => s.documents);
  const createDocument = useWorkspaceStore(s => s.createDocument);
  const updateDocumentState = useWorkspaceStore(s => s.updateDocumentState);
  const markDocumentDirty = useWorkspaceStore(s => s.markDocumentDirty);
  const zoomLevel = useWorkspaceStore(s => s.zoomLevel);
  const zoomIn = useWorkspaceStore(s => s.zoomIn);
  const zoomOut = useWorkspaceStore(s => s.zoomOut);
  const setZoomLevel = useWorkspaceStore(s => s.setZoomLevel);
  const toggleRulers = useWorkspaceStore(s => s.toggleRulers);
  const toggleGrid = useWorkspaceStore(s => s.toggleGrid);
  const toggleGuides = useWorkspaceStore(s => s.toggleGuides);
  const setActiveDockTab = useWorkspaceStore(s => s.setActiveDockTab);

  const [showExport, setShowExport] = useState(false);

  useGlobalShortcuts();

  const hasImage = !!state.originalImage;

  // Keep the store's active document in sync with live editor state
  const syncActiveDocument = useCallback(
    (nextState: Parameters<typeof updateDocumentState>[1]) => {
      if (activeDocumentId) {
        updateDocumentState(activeDocumentId, nextState);
      }
    },
    [activeDocumentId, updateDocumentState]
  );

  const handleImageLoaded = useCallback(
    (dataUrl: string) => {
      const docId = createDocument('Untitled-1', {
        originalImage: dataUrl,
        bgRemovedImage: null,
        activeFilterId: null,
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        detailFX: { ...DEFAULT_DETAIL_FX },
        textLayers: [],
        selectedTextId: null,
        strokes: [],
      });
      setState((prev) => ({
        ...prev,
        originalImage: dataUrl,
        bgRemovedImage: null,
        activeFilterId: null,
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        detailFX: { ...DEFAULT_DETAIL_FX },
        textLayers: [],
        selectedTextId: null,
        strokes: [],
      }));
      void docId;
      syncActiveDocument({ originalImage: dataUrl });
    },
    [createDocument, setState, syncActiveDocument]
  );

  const handleAdjustmentChange = useCallback(
    (updates: Partial<ColorAdjustments>) => {
      previewState((prev) => ({
        ...prev,
        adjustments: { ...prev.adjustments, ...updates },
      }));
    },
    [previewState]
  );

  const handleDetailChange = useCallback(
    (updates: Partial<DetailFX>) => {
      previewState((prev) => ({
        ...prev,
        detailFX: { ...prev.detailFX, ...updates },
      }));
    },
    [previewState]
  );

  const handleAddTextLayer = useCallback(() => {
    setState((prev) => {
      const layer = createTextLayer();
      return {
        ...prev,
        textLayers: [...prev.textLayers, layer],
        selectedTextId: layer.id,
      };
    });
    setActiveTool('text');
  }, [setState, setActiveTool]);

  const handleSelectTextLayer = useCallback(
    (id: string | null) => {
      setState((prev) => ({ ...prev, selectedTextId: id }));
    },
    [setState]
  );

  const handleUpdateTextLayer = useCallback(
    (id: string, updates: Partial<TextLayer>) => {
      previewState((prev) => ({
        ...prev,
        textLayers: prev.textLayers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      }));
    },
    [previewState]
  );

  const handlePaintStrokeStart = useCallback(
    (stroke: PaintStroke) => {
      previewState((prev) => ({
        ...prev,
        strokes: [...prev.strokes, stroke],
      }));
    },
    [previewState]
  );

  const handlePaintStrokeUpdate = useCallback(
    (id: string, points: { x: number; y: number }[]) => {
      previewState((prev) => ({
        ...prev,
        strokes: prev.strokes.map((s) =>
          s.id === id ? { ...s, points: [...s.points, ...points] } : s
        ),
      }));
    },
    [previewState]
  );

  const handleDeleteTextLayer = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        textLayers: prev.textLayers.filter((l) => l.id !== id),
        selectedTextId: prev.selectedTextId === id ? null : prev.selectedTextId,
      }));
    },
    [setState]
  );

  const handleSelectFilter = useCallback(
    (id: string | null) => {
      setState((prev) => ({ ...prev, activeFilterId: id }));
    },
    [setState]
  );

  const handleBgRemoved = useCallback(
    (dataUrl: string) => {
      setState((prev) => ({
        ...prev,
        bgRemovedImage: dataUrl,
        activeFilterId: 'remove-bg',
      }));
    },
    [setState]
  );

  const handleTransformChange = useCallback(
    (updates: Partial<TransformSettings>) => {
      setState((prev) => ({
        ...prev,
        transform: { ...prev.transform, ...updates },
      }));
    },
    [setState]
  );

  const handleApplyAIText = useCallback(
    (text: string) => {
      const layer = createTextLayer();
      setState((prev) => ({
        ...prev,
        textLayers: [...prev.textLayers, { ...layer, text }],
        selectedTextId: layer.id,
      }));
    },
    [setState]
  );

  const handleSave = useCallback(() => {
    if (activeDocumentId) {
      markDocumentDirty(activeDocumentId, false);
    }
  }, [activeDocumentId, markDocumentDirty]);

  const handleFit = useCallback(() => {
    setZoomLevel(1);
  }, [setZoomLevel]);

  return (
    <main className="relative h-screen w-screen overflow-hidden flex flex-col selection:bg-glowViolet/30 selection:text-white bg-[#05050A]">
      <MenuBar
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSave}
        onExport={() => setShowExport(true)}
        onNew={() => {
          resetAll();
        }}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={handleFit}
        onResetZoom={() => setZoomLevel(1)}
        onToggleRulers={toggleRulers}
        onToggleGrid={toggleGrid}
        onToggleGuides={toggleGuides}
        onOpenAI={() => setActiveDockTab('ai')}
      />

      <div className="flex-1 flex min-h-0">
        {/* Left Tool Rail */}
        <ToolRail />

        {/* Center: Canvas */}
        <div className="flex-1 relative min-w-0">
          <AnimatePresence mode="wait">
            {!hasImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto p-6 flex items-start justify-center"
              >
                <div className="w-full max-w-xl py-8">
                  <StageUpload currentImage={state.originalImage} onImageLoaded={handleImageLoaded} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <CanvasArea
                  state={state}
                  editTrigger={editTrigger}
                  activeTool={activeTool}
                  onSelectTextLayer={handleSelectTextLayer}
                  onUpdateTextLayer={handleUpdateTextLayer}
                  onPaintStrokeStart={handlePaintStrokeStart}
                  onPaintStrokeUpdate={handlePaintStrokeUpdate}
                  onPaintStrokeCommit={commitPreview}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Dock */}
        <RightDock
          state={state}
          editTrigger={editTrigger}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onAddTextLayer={handleAddTextLayer}
          onSelectTextLayer={handleSelectTextLayer}
          onUpdateTextLayer={handleUpdateTextLayer}
          onDeleteTextLayer={handleDeleteTextLayer}
          onAdjustmentChange={handleAdjustmentChange}
          onDetailChange={handleDetailChange}
          onCommit={commitPreview}
          onSelectFilter={handleSelectFilter}
          onBgRemoved={handleBgRemoved}
          onApplyAIText={handleApplyAIText}
          zoomLevel={zoomLevel}
          onTransformChange={handleTransformChange}
        />
      </div>

      <StatusBar
        state={state}
        zoomLevel={zoomLevel}
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={handleFit}
        saveState={activeDocumentId ? 'saved' : 'dirty'}
      />

      {/* Export Overlay */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0F1222]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6"
            >
              <button
                onClick={() => setShowExport(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-textMuted hover:text-glowMagenta flex items-center justify-center z-10"
                aria-label="Close export"
              >
                ✕
              </button>
              <StageExport state={state} onStartOver={() => { setShowExport(false); resetAll(); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}