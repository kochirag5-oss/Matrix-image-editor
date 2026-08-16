'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowSlider from './GlowSlider';
import GlowButton from '../GlowButton';
import BeforeAfterSlider from '../BeforeAfterSlider';
import { exportEditorState } from '@/lib/editor/canvasRenderer';
import { EditorState } from '@/types/editor';

interface StageExportProps {
  state: EditorState;
  onStartOver: () => void;
}

export default function StageExport({ state, onStartOver }: StageExportProps) {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState(92);
  const [downloaded, setDownloaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [previewAfter, setPreviewAfter] = useState<string>('');

  React.useEffect(() => {
    if (!state.originalImage) return;
    exportEditorState(state, 'png')
      .then((blob) => {
        if (blob) setPreviewAfter(URL.createObjectURL(blob));
      })
      .catch(() => {
        // Preview is best-effort; the export button will surface real errors
      });
    return () => {
      if (previewAfter) URL.revokeObjectURL(previewAfter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleExport = async () => {
    try {
      const blob = await exportEditorState(state, format, quality / 100);
      if (!blob) {
        setSaveMessage('Upload an image before exporting.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nebula-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setSaveMessage(msg);
    }
  };

  const handleSaveToProjects = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const blob = await exportEditorState(state, 'png');
      if (!blob) throw new Error('Export failed');

      const fileName = `nebula-${Date.now()}.png`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveMessage('Project saved ✓');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setSaveMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-glowCyan">
            Stage 07
          </span>
          <h3 className="text-xl font-heading font-bold text-textPrimary">
            Export & Share
          </h3>
        </div>
        <span className="text-2xl">🚀</span>
      </div>

      {state.originalImage && previewAfter && (
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <BeforeAfterSlider beforeImage={state.originalImage} afterImage={previewAfter} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
          <span className="text-[10px] font-heading uppercase tracking-wider text-textMuted">
            Format
          </span>
          <div className="flex gap-2">
            {(['png', 'jpeg'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 rounded-xl text-xs font-heading uppercase tracking-wider border transition-all ${
                  format === f
                    ? 'border-glowCyan bg-glowCyan/15 text-glowCyan'
                    : 'border-white/10 bg-white/5 text-textMuted'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          {format === 'jpeg' && (
            <GlowSlider
              label="Quality"
              value={quality}
              min={50}
              max={100}
              unit="%"
              onChange={setQuality}
              accent="cyan"
            />
          )}
          <GlowButton variant="primary" onClick={handleExport} fullWidth>
            {downloaded ? 'Downloaded ✓' : 'Export Image'}
          </GlowButton>
        </div>

        <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 relative">
          <span className="text-[10px] font-heading uppercase tracking-wider text-textMuted">
            Holo-Broadcast
          </span>
          <div className="flex gap-2">
            {['𝕏', '📸', '🔗'].map((icon) => (
              <button
                key={icon}
                onClick={handleShare}
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-glowCyan hover:text-glowCyan transition-all"
              >
                {icon}
              </button>
            ))}
          </div>
          <GlowButton
            variant="secondary"
            onClick={handleSaveToProjects}
            fullWidth
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Project (PNG)'}
          </GlowButton>
          {saveMessage && (
            <p className="text-[11px] text-glowMint">{saveMessage}</p>
          )}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0F1222] border border-glowViolet/40 text-textPrimary px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg"
              >
                Sharing coming soon ✨
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={onStartOver}
        className="text-xs text-textMuted hover:text-white transition-colors underline decoration-white/20 underline-offset-4 tracking-wider uppercase font-semibold self-center"
      >
        Start New Project
      </button>
    </div>
  );
}
