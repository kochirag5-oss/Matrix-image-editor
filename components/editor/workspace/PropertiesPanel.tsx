'use client';

import React from 'react';
import GlowSlider from '../GlowSlider';
import { EditorState, TextLayer, TransformSettings } from '@/types/editor';
import { TEXT_FONTS, GLOW_SWATCHES } from '@/lib/editor/defaults';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';

interface PropertiesPanelProps {
  activeTool: string;
  state: EditorState;
  zoomLevel: number;
  onUpdateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  onTransformChange: (updates: Partial<TransformSettings>) => void;
}

const COMING_SOON_MESSAGE = (tool: string) =>
  `The ${tool} tool is coming soon in a future update. Use Color, Filters, Text, Crop or Transform in the meantime.`;

export default function PropertiesPanel({
  activeTool,
  state,
  zoomLevel,
  onUpdateTextLayer,
  onTransformChange,
}: PropertiesPanelProps) {
  const selected = state.textLayers.find(l => l.id === state.selectedTextId);
  const paintSize = useWorkspaceStore(s => s.paintSize);
  const setPaintSize = useWorkspaceStore(s => s.setPaintSize);
  const fgColor = useWorkspaceStore(s => s.fgColor);

  const renderCropProps = () => (
    <>
      <SectionLabel>Transform & Crop</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {(['free', '1:1', '4:5', '16:9', '9:16'] as const).map(ratio => (
          <button
            key={ratio}
            onClick={() => onTransformChange({ aspectRatio: ratio })}
            className={`px-2 py-2 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
              state.transform.aspectRatio === ratio
                ? 'border-glowCyan bg-glowCyan/15 text-glowCyan'
                : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
            }`}
          >
            {ratio === 'free' ? 'Free' : ratio}
          </button>
        ))}
      </div>
      <GlowSlider
        label="Rotation"
        value={state.transform.rotate}
        min={0}
        max={360}
        unit="°"
        onChange={(val) => onTransformChange({ rotate: val })}
        accent="cyan"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onTransformChange({ flipH: !state.transform.flipH })}
          className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
            state.transform.flipH
              ? 'border-glowCyan bg-glowCyan/15 text-glowCyan'
              : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
          }`}
        >
          Flip H
        </button>
        <button
          onClick={() => onTransformChange({ flipV: !state.transform.flipV })}
          className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
            state.transform.flipV
              ? 'border-glowCyan bg-glowCyan/15 text-glowCyan'
              : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
          }`}
        >
          Flip V
        </button>
      </div>
      <p className="text-[10px] text-textMuted/70 leading-relaxed">
        The crop grid on the canvas updates live. Changes are applied on export.
      </p>
    </>
  );

  const renderTextProps = () => {
    if (!selected) {
      return (
        <div className="text-center text-textMuted/60 text-xs py-6">
          Select a text layer to edit its properties.
        </div>
      );
    }
    return (
      <>
        <SectionLabel>Text Properties</SectionLabel>
        <div>
          <label className="text-[10px] font-heading uppercase tracking-wider text-textMuted block mb-1.5">
            Content
          </label>
          <input
            type="text"
            value={selected.text}
            onChange={(e) => onUpdateTextLayer(selected.id, { text: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm text-textPrimary focus:outline-none focus:border-glowCyan/50"
          />
        </div>
        <div>
          <label className="text-[10px] font-heading uppercase tracking-wider text-textMuted block mb-2">
            Font Family
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEXT_FONTS.map(font => (
              <button
                key={font.id}
                onClick={() => onUpdateTextLayer(selected.id, { fontFamily: font.id })}
                style={{ fontFamily: font.stack }}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] border transition-all ${
                  selected.fontFamily === font.id
                    ? 'border-glowCyan bg-glowCyan/15 text-glowCyan'
                    : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>
        <GlowSlider
          label="Font Size"
          value={selected.fontSize}
          min={12}
          max={120}
          unit="px"
          onChange={(val) => onUpdateTextLayer(selected.id, { fontSize: val })}
          accent="cyan"
        />
        <GlowSlider
          label="Letter Spacing"
          value={selected.letterSpacing}
          min={-10}
          max={30}
          unit="px"
          onChange={(val) => onUpdateTextLayer(selected.id, { letterSpacing: val })}
          accent="violet"
        />
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
                  selected.color === color ? 'border-glowCyan scale-110' : 'border-white/10 hover:border-white/30'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'bold', label: 'Bold' },
            { key: 'italic', label: 'Italic' },
            { key: 'glow', label: 'Glow' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onUpdateTextLayer(selected.id, { [key]: !selected[key] })}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-heading uppercase tracking-wider border transition-all ${
                selected[key] ? 'border-glowCyan bg-glowCyan/15 text-glowCyan' : 'border-white/10 bg-white/5 text-textMuted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-textMuted/70 leading-relaxed">
          Select the Type tool and click a text layer on the canvas to drag it into place.
        </p>
      </>
    );
  };

  const renderComingSoon = (tool: string) => (
    <>
      <SectionLabel>{tool.replace(/-/g, ' ').toUpperCase()} Options</SectionLabel>
      <div className="px-3 py-6 rounded-2xl bg-white/5 border border-dashed border-white/15 flex flex-col items-center text-center gap-2">
        <span className="text-lg">🚧</span>
        <p className="text-xs text-textMuted leading-relaxed">
          {COMING_SOON_MESSAGE(tool.replace(/-/g, ' '))}
        </p>
        <span className="text-[9px] font-heading uppercase tracking-[0.2em] text-glowViolet mt-1">
          Coming Soon
        </span>
      </div>
    </>
  );

  const renderToolProps = () => {
    switch (activeTool) {
      case 'crop':
        return renderCropProps();
      case 'text':
      case 'text-vertical':
        return renderTextProps();
      case 'move':
        return (
          <>
            <SectionLabel>Move Options</SectionLabel>
            <p className="text-xs text-textMuted leading-relaxed">
              Click a text layer on the canvas to select it, then drag to reposition. Hold{' '}
              <span className="font-mono text-glowCyan">Space</span> with the Hand tool to pan the canvas.
            </p>
          </>
        );
      case 'hand':
        return (
          <>
            <SectionLabel>Hand Options</SectionLabel>
            <p className="text-xs text-textMuted leading-relaxed">
              Drag on the canvas to pan around the document. Use the zoom controls in the bottom-right
              corner or <span className="font-mono text-glowCyan">Ctrl+Scroll</span> to zoom.
            </p>
          </>
        );
      case 'zoom':
        return (
          <>
            <SectionLabel>Zoom Options</SectionLabel>
            <p className="text-xs text-textMuted leading-relaxed">
              Use <span className="font-mono text-glowCyan">Ctrl+Scroll</span>, the zoom buttons in the
              canvas corner, or the status bar to zoom in and out.
            </p>
          </>
        );
      case 'brush':
      case 'pencil':
        return (
          <>
            <SectionLabel>{activeTool === 'pencil' ? 'Pencil Options' : 'Brush Options'}</SectionLabel>
            <GlowSlider
              label="Size"
              value={paintSize}
              min={2}
              max={80}
              unit="px"
              onChange={setPaintSize}
              accent="violet"
            />
            <div className="mt-3 p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="w-4 h-4 rounded-full border border-white/30"
                  style={{ backgroundColor: fgColor }}
                />
                <span className="text-[10px] font-heading uppercase tracking-wider text-textMuted">
                  Foreground color
                </span>
              </div>
              <p className="text-[10px] text-textMuted/70 leading-relaxed">
                {activeTool === 'pencil'
                  ? 'Pencil draws a thin hard-edged line. Pick a color from the swatches at the bottom of the toolbar.'
                  : 'Brush paints a soft glowing stroke. Pick a color from the swatches at the bottom of the toolbar.'}
              </p>
            </div>
          </>
        );
      case 'marquee':
      case 'lasso':
      case 'wand':
      case 'eyedropper':
      case 'healing':
      case 'clone':
      case 'eraser':
      case 'gradient':
      case 'bucket':
      case 'pen':
      case 'freeform-pen':
      case 'shape':
      case 'shape-ellipse':
      case 'shape-line':
      case 'move-vector':
      case 'marquee-ellipse':
      case 'lasso-polygon':
        return renderComingSoon(activeTool);
      default:
        return renderComingSoon(activeTool || 'this');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-heading font-bold text-textPrimary uppercase tracking-wider">Properties</p>
          <p className="text-[9px] text-textMuted capitalize">{activeTool.replace(/-/g, ' ')} · Zoom {Math.round(zoomLevel * 100)}%</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">{renderToolProps()}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1 first:pt-0">
      <span className="w-3 h-[1px] bg-glowViolet/50" />
      <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-glowViolet">{children}</span>
    </div>
  );
}