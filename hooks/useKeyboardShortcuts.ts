'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWorkspaceStore } from './useWorkspaceState';

interface ShortcutHandler {
  (e: KeyboardEvent): void;
}

interface ShortcutMap {
  [key: string]: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handlersRef = useRef(shortcuts);
  handlersRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const isInput = e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement ||
                    (e.target as HTMLElement)?.isContentEditable;
    
    if (isInput && !['Space', 'Escape'].includes(e.key)) return;

    const keyParts: string[] = [];
    if (e.ctrlKey || e.metaKey) keyParts.push('Ctrl');
    if (e.shiftKey) keyParts.push('Shift');
    if (e.altKey) keyParts.push('Alt');
    
    let key = e.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = 'Up';
    if (key === 'ArrowDown') key = 'Down';
    if (key === 'ArrowLeft') key = 'Left';
    if (key === 'ArrowRight') key = 'Right';
    if (key === 'Control') return;
    if (key === 'Shift') return;
    if (key === 'Alt') return;
    if (key === 'Meta') return;
    
    keyParts.push(key);
    const shortcut = keyParts.join('+');
    
    const handler = handlersRef.current[shortcut];
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useGlobalShortcuts() {
  const {
    setActiveTool,
    zoomIn,
    zoomOut,
    setZoomLevel,
    toggleRulers,
    toggleGrid,
    toggleGuides,
    setActiveDockTab,
  } = useWorkspaceStore();

  const shortcuts: Record<string, () => void> = {
    'V': () => setActiveTool('move'),
    'B': () => setActiveTool('brush'),
    'C': () => setActiveTool('crop'),
    'H': () => setActiveTool('hand'),
    'Space': () => setActiveTool('hand'),
    'Ctrl+=': zoomIn,
    'Ctrl+-': zoomOut,
    'Ctrl+0': () => setZoomLevel(1),
    'Ctrl+R': () => toggleRulers(),
    'Ctrl+\'': () => toggleGrid(),
    'Ctrl+;': () => toggleGuides(),
    'Ctrl+1': () => setActiveDockTab('layers'),
    'Ctrl+2': () => setActiveDockTab('history'),
    'Ctrl+3': () => setActiveDockTab('adjust'),
    'Ctrl+4': () => setActiveDockTab('filters'),
    'Ctrl+5': () => setActiveDockTab('ai'),
    'Ctrl+6': () => setActiveDockTab('props'),
    'Ctrl+Shift+A': () => setActiveDockTab('ai'),
    'Escape': () => setActiveTool('move'),
  };

  useKeyboardShortcuts(shortcuts);
}