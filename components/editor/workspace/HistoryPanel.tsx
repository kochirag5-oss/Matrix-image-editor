'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowButton from '../../GlowButton';

interface HistoryPanelProps {
  editTrigger: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  upload: 'Import image',
  adjustment: 'Color adjustment',
  filter: 'Apply filter',
  text: 'Text edit',
  crop: 'Crop / transform',
  detail: 'Detail effect',
  reset: 'Reset',
};

export default function HistoryPanel({
  editTrigger,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: HistoryPanelProps) {
  // Track a lightweight chronological log keyed by edit events.
  const [log, setLog] = React.useState<{ entries: { id: number; label: string }[]; cursor: number }>({
    entries: [],
    cursor: -1,
  });
  const lastTrigger = React.useRef(editTrigger);
  const pendingAction = React.useRef<string>('edit');

  React.useEffect(() => {
    if (editTrigger === lastTrigger.current) return;
    const added = editTrigger - lastTrigger.current;
    lastTrigger.current = editTrigger;
    const label = ACTION_LABELS[pendingAction.current] || 'Edit';
    setLog((l) => {
      const base = l.entries.slice(0, l.cursor + 1);
      const appended = Array.from({ length: added }, (_, i) => ({
        id: Date.now() + Math.random() + i,
        label,
      }));
      const next = [...base, ...appended].slice(-50);
      return { entries: next, cursor: next.length - 1 };
    });
  }, [editTrigger]);

  const jumpTo = (index: number) => {
    const diff = index - log.cursor;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) onRedo();
    } else if (diff < 0) {
      for (let i = 0; i < -diff; i++) onUndo();
    }
    setLog((l) => ({ entries: l.entries, cursor: index }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <GlowButton variant="secondary" size="sm" onClick={onUndo} disabled={!canUndo}>
          ↩ Undo
        </GlowButton>
        <GlowButton variant="secondary" size="sm" onClick={onRedo} disabled={!canRedo}>
          Redo ↪
        </GlowButton>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {log.entries.length === 0 && (
          <div className="text-center text-textMuted/60 text-xs py-6">
            No history yet. Make an edit to see it here.
          </div>
        )}

        {log.entries.map((entry, index) => {
          const isPast = index <= log.cursor;
          const isFuture = index > log.cursor;
          const isCurrent = index === log.cursor;

          return (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => jumpTo(index)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs border transition-all ${
                isCurrent
                  ? 'border-glowCyan/60 bg-glowCyan/10 text-textPrimary'
                  : isFuture
                  ? 'border-white/5 bg-white/[0.02] text-textMuted/40 opacity-50'
                  : 'border-white/10 bg-white/5 text-textMuted hover:text-white hover:border-white/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-glowViolet/60" />
              <span className="flex-1 truncate">{entry.label}</span>
              <span className="text-[9px] font-mono text-textMuted/50">{index + 1}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}