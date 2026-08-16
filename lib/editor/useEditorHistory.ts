'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorState } from '@/types/editor';
import { createInitialEditorState } from './defaults';

function cloneState(state: EditorState): EditorState {
  return JSON.parse(JSON.stringify(state));
}

interface EditorData {
  state: EditorState;
  trigger: number;
  past: EditorState[];
  future: EditorState[];
}

export function useEditorHistory(initial?: EditorState) {
  const [data, setData] = useState<EditorData>(() => ({
    state: initial ? cloneState(initial) : createInitialEditorState(),
    trigger: 0,
    past: [],
    future: [],
  }));
  const previewBaselineRef = useRef<EditorState | null>(null);

  const setState = useCallback(
    (updater: EditorState | ((prev: EditorState) => EditorState)) => {
      setData((d) => {
        const next = typeof updater === 'function' ? updater(d.state) : updater;
        previewBaselineRef.current = null;
        return {
          state: next,
          trigger: d.trigger + 1,
          past: [...d.past.slice(-49), cloneState(d.state)],
          future: [],
        };
      });
    },
    []
  );

  const previewState = useCallback((updater: (prev: EditorState) => EditorState) => {
    setData((d) => {
      if (!previewBaselineRef.current) {
        previewBaselineRef.current = cloneState(d.state);
      }
      return { ...d, state: updater(d.state), trigger: d.trigger + 1 };
    });
  }, []);

  const commitPreview = useCallback(() => {
    if (!previewBaselineRef.current) return;
    const baseline = previewBaselineRef.current;
    previewBaselineRef.current = null;
    setData((d) => ({
      ...d,
      past: [...d.past.slice(-49), cloneState(baseline)],
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setData((d) => {
      if (d.past.length === 0) return d;
      const previous = d.past[d.past.length - 1];
      previewBaselineRef.current = null;
      return {
        state: cloneState(previous),
        trigger: d.trigger + 1,
        past: d.past.slice(0, -1),
        future: [cloneState(d.state), ...d.future.slice(0, 49)],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setData((d) => {
      if (d.future.length === 0) return d;
      const next = d.future[0];
      previewBaselineRef.current = null;
      return {
        state: cloneState(next),
        trigger: d.trigger + 1,
        past: [...d.past.slice(-49), cloneState(d.state)],
        future: d.future.slice(1),
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    previewBaselineRef.current = null;
    setData((d) => ({
      state: createInitialEditorState(),
      trigger: d.trigger + 1,
      past: [],
      future: [],
    }));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  return {
    state: data.state,
    setState,
    previewState,
    commitPreview,
    undo,
    redo,
    canUndo: data.past.length > 0,
    canRedo: data.future.length > 0,
    editTrigger: data.trigger,
    resetAll,
  };
}