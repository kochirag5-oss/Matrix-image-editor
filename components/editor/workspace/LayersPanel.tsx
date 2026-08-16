'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlowSlider from '../GlowSlider';
import { TextLayer, EditorState } from '@/types/editor';
import { GLOW_SWATCHES } from '@/lib/editor/defaults';

interface LayersPanelProps {
  state: EditorState;
  onAddTextLayer: () => void;
  onSelectTextLayer: (id: string | null) => void;
  onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  onDeleteTextLayer: (id: string) => void;
}

export default function LayersPanel({
  state,
  onAddTextLayer,
  onSelectTextLayer,
  onUpdateTextLayer,
  onDeleteTextLayer,
}: LayersPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const selected = state.textLayers.find(l => l.id === state.selectedTextId);

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onUpdateTextLayer(id, { text: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Layer stack (top layer first) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {state.textLayers.length === 0 && (
          <div className="text-center text-textMuted/60 text-xs py-6 px-4">
            No layers yet. Add a text layer or upload an image to begin.
          </div>
        )}

        {/* Base image layer */}
        {state.originalImage && (
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-textMuted" aria-hidden="true">👁</span>
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-glowViolet/30 to-glowCyan/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.originalImage} alt="" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-textPrimary truncate">Background</p>
              <p className="text-[10px] text-textMuted">Base Image</p>
            </div>
          </div>
        )}

        {/* Text layers (reversed: top of stack = last) */}
        {[...state.textLayers].reverse().map(layer => (
          <div
            key={layer.id}
            onClick={() => onSelectTextLayer(layer.id)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition-all ${
              state.selectedTextId === layer.id
                ? 'border-glowCyan/60 bg-glowCyan/10 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateTextLayer(layer.id, { opacity: layer.opacity === 0 ? 100 : 0 }); }}
              className="text-textMuted hover:text-glowCyan transition-colors"
              aria-label="Toggle visibility"
            >
              {layer.opacity > 0 ? '👁' : '○'}
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#0F1222] border border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: layer.color }}>T</span>
            </div>
            {editingId === layer.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(layer.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(layer.id)}
                className="flex-1 min-w-0 px-1.5 py-0.5 rounded bg-black/30 border border-glowCyan/40 text-xs text-textPrimary focus:outline-none"
              />
            ) : (
              <button
                onDoubleClick={() => { setEditingId(layer.id); setEditName(layer.text); }}
                className="flex-1 min-w-0 text-left"
                title="Double-click to rename"
              >
                <p className="text-xs font-semibold text-textPrimary truncate">{layer.text || 'Untitled'}</p>
                <p className="text-[10px] text-textMuted">Text Layer · {Math.round(layer.opacity)}%</p>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteTextLayer(layer.id); }}
              className="text-textMuted/50 hover:text-glowMagenta transition-colors px-1"
              aria-label="Delete layer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Selected layer properties */}
      {selected && (
        <div className="border-t border-white/10 p-3 flex flex-col gap-3 overflow-y-auto max-h-[40%]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-heading uppercase tracking-wider text-glowCyan font-semibold">
              Layer Properties
            </span>
            <button
              onClick={() => onSelectTextLayer(null)}
              className="text-[10px] text-textMuted hover:text-white"
            >
              Deselect
            </button>
          </div>

          <div>
            <label className="text-[10px] font-heading uppercase tracking-wider text-textMuted block mb-1.5">
              Text Content
            </label>
            <input
              type="text"
              value={selected.text}
              onChange={(e) => onUpdateTextLayer(selected.id, { text: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-textPrimary focus:outline-none focus:border-glowCyan/50"
              placeholder="Type your text..."
            />
          </div>

          <GlowSlider
            label="Opacity"
            value={selected.opacity}
            min={0}
            max={100}
            unit="%"
            onChange={(val) => onUpdateTextLayer(selected.id, { opacity: val })}
            accent="mint"
          />

          <div>
            <label className="text-[10px] font-heading uppercase tracking-wider text-textMuted block mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GLOW_SWATCHES.map(color => (
                <button
                  key={color}
                  onClick={() => onUpdateTextLayer(selected.id, { color })}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selected.color === color ? 'border-glowCyan scale-110 shadow-[0_0_10px_currentColor]' : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'bold' as const, label: 'Bold', active: selected.bold },
              { key: 'italic' as const, label: 'Italic', active: selected.italic },
              { key: 'glow' as const, label: 'Glow', active: selected.glow },
            ].map(({ key, label, active }) => (
              <button
                key={key}
                onClick={() => onUpdateTextLayer(selected.id, { [key]: !selected[key] })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
                  active ? 'border-glowCyan bg-glowCyan/15 text-glowCyan' : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add layer button */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={onAddTextLayer}
          className="w-full py-2 rounded-xl border border-dashed border-glowViolet/50 bg-glowViolet/10 text-xs font-heading font-semibold uppercase tracking-wider text-glowCyan hover:bg-glowViolet/20 hover:border-glowCyan/50 transition-all"
        >
          + Add Text Layer
        </button>
      </div>
    </div>
  );
}