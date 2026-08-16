'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EditorState, TextLayer, ColorAdjustments, DetailFX, TransformSettings } from '@/types/editor';
import { createInitialEditorState, DEFAULT_ADJUSTMENTS, DEFAULT_DETAIL_FX, DEFAULT_TRANSFORM } from '@/lib/editor/defaults';

interface Document {
  id: string;
  name: string;
  state: EditorState;
  thumbnail?: string;
  isDirty: boolean;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  documents: Document[];
  activeDocumentId: string | null;
  activeTool: string;
  activeDockTab: string;
  rightDockWidth: number;
  isRightDockCollapsed: boolean;
  zoomLevel: number;
  showRulers: boolean;
  showGrid: boolean;
  showGuides: boolean;
  fgColor: string;
  bgColor: string;
  paintSize: number;
  
  createDocument: (name?: string, initialState?: Partial<EditorState>) => string;
  closeDocument: (id: string) => void;
  setActiveDocument: (id: string) => void;
  updateDocumentState: (id: string, state: Partial<EditorState>) => void;
  markDocumentDirty: (id: string, dirty: boolean) => void;
  updateDocumentThumbnail: (id: string, thumbnail: string) => void;
  
  setActiveTool: (tool: string) => void;
  setActiveDockTab: (tab: string) => void;
  setRightDockWidth: (width: number) => void;
  toggleRightDockCollapse: () => void;
  setRightDockCollapsed: (collapsed: boolean) => void;
  
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: (canvasRect: DOMRect, imageRect: { w: number; h: number }) => void;
  
  toggleRulers: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setShowRulers: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowGuides: (show: boolean) => void;

  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
  swapColors: () => void;
  setPaintSize: (size: number) => void;
}

const MIN_DOCK_WIDTH = 240;
const MAX_DOCK_WIDTH = 480;
const DEFAULT_DOCK_WIDTH = 300;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      documents: [],
      activeDocumentId: null,
      activeTool: 'move',
      activeDockTab: 'layers',
      rightDockWidth: DEFAULT_DOCK_WIDTH,
      isRightDockCollapsed: false,
      zoomLevel: 1,
      showRulers: true,
      showGrid: false,
      showGuides: true,
      fgColor: '#7B5CFF',
      bgColor: '#00E5FF',
      paintSize: 14,
      
      createDocument: (name = 'Untitled', initialState) => {
        const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const baseState = createInitialEditorState();
        const document: Document = {
          id,
          name,
          state: { ...baseState, ...initialState },
          isDirty: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set(state => ({
          documents: [...state.documents, document],
          activeDocumentId: id,
        }));
        return id;
      },
      
      closeDocument: (id) => {
        set(state => {
          const docs = state.documents.filter(d => d.id !== id);
          let newActive = state.activeDocumentId;
          if (state.activeDocumentId === id) {
            newActive = docs.length > 0 ? docs[docs.length - 1].id : null;
          }
          return { documents: docs, activeDocumentId: newActive };
        });
      },
      
      setActiveDocument: (id) => {
        set({ activeDocumentId: id });
      },
      
      updateDocumentState: (id, partialState) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id
              ? { ...doc, state: { ...doc.state, ...partialState }, updatedAt: Date.now() }
              : doc
          ),
        }));
      },
      
      markDocumentDirty: (id, dirty) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, isDirty: dirty } : doc
          ),
        }));
      },
      
      updateDocumentThumbnail: (id, thumbnail) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, thumbnail } : doc
          ),
        }));
      },
      
      setActiveTool: (tool) => set({ activeTool: tool }),
      setActiveDockTab: (tab) => set({ activeDockTab: tab }),
      
      setRightDockWidth: (width) =>
        set({ rightDockWidth: Math.max(MIN_DOCK_WIDTH, Math.min(MAX_DOCK_WIDTH, width)) }),
      
      toggleRightDockCollapse: () =>
        set(state => ({ isRightDockCollapsed: !state.isRightDockCollapsed })),
      
      setRightDockCollapsed: (collapsed) => set({ isRightDockCollapsed: collapsed }),
      
      setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.1, Math.min(5, zoom)) }),
      
      zoomIn: () =>
        set(state => ({ zoomLevel: Math.min(5, state.zoomLevel * 1.2) })),
      
      zoomOut: () =>
        set(state => ({ zoomLevel: Math.max(0.1, state.zoomLevel / 1.2) })),
      
      fitToScreen: (canvasRect, imageRect) => {
        const scaleX = canvasRect.width / imageRect.w;
        const scaleY = canvasRect.height / imageRect.h;
        const fitScale = Math.min(scaleX, scaleY) * 0.95;
        set({ zoomLevel: Math.max(0.1, Math.min(5, fitScale)) });
      },
      
      toggleRulers: () => set(state => ({ showRulers: !state.showRulers })),
      toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
      toggleGuides: () => set(state => ({ showGuides: !state.showGuides })),
      setShowRulers: (show) => set({ showRulers: show }),
      setShowGrid: (show) => set({ showGrid: show }),
      setShowGuides: (show) => set({ showGuides: show }),

      setFgColor: (color) => set({ fgColor: color }),
      setBgColor: (color) => set({ bgColor: color }),
      swapColors: () => set(state => ({ fgColor: state.bgColor, bgColor: state.fgColor })),
      setPaintSize: (size) => set({ paintSize: Math.max(2, Math.min(80, size)) }),
    }),
    {
      name: 'nebula-workspace',
      partialize: state => ({
        rightDockWidth: state.rightDockWidth,
        isRightDockCollapsed: state.isRightDockCollapsed,
        showRulers: state.showRulers,
        showGrid: state.showGrid,
        showGuides: state.showGuides,
        fgColor: state.fgColor,
        bgColor: state.bgColor,
        paintSize: state.paintSize,
      }),
    }
  )
);

export function useActiveDocument() {
  const { documents, activeDocumentId, ...actions } = useWorkspaceStore();
  const activeDoc = documents.find(d => d.id === activeDocumentId) || null;
  return { activeDoc, documents, activeDocumentId, ...actions };
}