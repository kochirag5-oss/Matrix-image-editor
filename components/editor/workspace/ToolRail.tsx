'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';

interface ToolVariant {
  id: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

interface ToolGroup {
  id: string;
  shortcut: string;
  icon: React.ReactNode;
  label: string;
  variants: ToolVariant[];
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const moveIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M5 3l7 7 4-4 3 3-4 4 7 7-3 3-7-7-4 4-3-3 4-4-7-7z" /></svg>;
const marqueeIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="4 3" /></svg>;
const lassoIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M4 7c0-2 4-3 8-3s8 1 8 3c0 2-4 3-8 3-5 0-8-1-8-3z" /><path d="M4 7v6c0 2 2 4 4 4 3 0 5-2 5-2" /></svg>;
const wandIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M15 4V2m0 4V4m0 0h2m-2 0v2M9 9l9-9 1 1-9 9M9 9l3 3 6-6" /></svg>;
const cropIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" /></svg>;
const eyedropperIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M11 13l5-5 3 3-5 5-3-3z" /><path d="M9 15L3 21h4l5-5" /></svg>;
const healingIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M12 3a9 9 0 100 18 9 9 0 000-18z" /><path d="M8 12h8" /></svg>;
const brushIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M14 3l7 7L9 22H2v-7L14 3z" /><path d="M12 8l4 4" /></svg>;
const cloneIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 012-2h10" /></svg>;
const eraserIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M16 3l5 5-9 9-6-1-3-3L16 3z" /><path d="M21 21H9" /></svg>;
const gradientIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="2" /></svg>;
const bucketIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M7 13l6-6 5 5-6 6-5-5z" /><path d="M13 7l4-4 3 3-4 4" /></svg>;
const penIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M12 19l7-7-3-3-7 7-4 4zM12 19l-2-5 5-2" /></svg>;
const textIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M4 6V4h16v2M12 4v16M8 20h8" /></svg>;
const shapeIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><rect x="4" y="4" width="16" height="16" rx="2" /></svg>;
const handIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M18 11V8a2 2 0 00-4 0v3m0-1V6a2 2 0 00-4 0v4m0-1V7a2 2 0 00-4 0v8l-2 1 3 4h9a3 3 0 003-3v-6a2 2 0 00-2-2h-3z" /></svg>;
const zoomIcon = <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35M8 11h6M11 8v6" /></svg>;

const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'move', shortcut: 'V', icon: moveIcon, label: 'Move',
    variants: [{ id: 'move', label: 'Move', shortcut: 'V', icon: moveIcon }, { id: 'move-vector', label: 'Move Vector', shortcut: 'A', icon: moveIcon }],
  },
  {
    id: 'marquee', shortcut: 'M', icon: marqueeIcon, label: 'Marquee',
    variants: [
      { id: 'marquee', label: 'Rect Marquee', shortcut: 'M', icon: marqueeIcon },
      { id: 'marquee-ellipse', label: 'Ellipse Marquee', shortcut: 'M', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><ellipse cx="12" cy="12" rx="9" ry="6" strokeDasharray="4 3" /></svg> },
    ],
  },
  {
    id: 'lasso', shortcut: 'L', icon: lassoIcon, label: 'Lasso',
    variants: [
      { id: 'lasso', label: 'Lasso', shortcut: 'L', icon: lassoIcon },
      { id: 'lasso-polygon', label: 'Polygonal Lasso', shortcut: 'L', icon: lassoIcon },
    ],
  },
  {
    id: 'wand', shortcut: 'W', icon: wandIcon, label: 'Magic Wand',
    variants: [{ id: 'wand', label: 'Magic Wand', shortcut: 'W', icon: wandIcon }],
  },
  {
    id: 'crop', shortcut: 'C', icon: cropIcon, label: 'Crop',
    variants: [{ id: 'crop', label: 'Crop', shortcut: 'C', icon: cropIcon }],
  },
  {
    id: 'eyedropper', shortcut: 'I', icon: eyedropperIcon, label: 'Eyedropper',
    variants: [{ id: 'eyedropper', label: 'Eyedropper', shortcut: 'I', icon: eyedropperIcon }],
  },
  {
    id: 'healing', shortcut: 'J', icon: healingIcon, label: 'Spot Healing',
    variants: [{ id: 'healing', label: 'Spot Healing Brush', shortcut: 'J', icon: healingIcon }],
  },
  {
    id: 'brush', shortcut: 'B', icon: brushIcon, label: 'Brush',
    variants: [
      { id: 'brush', label: 'Brush', shortcut: 'B', icon: brushIcon },
      { id: 'pencil', label: 'Pencil', shortcut: 'B', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z" /></svg> },
    ],
  },
  {
    id: 'clone', shortcut: 'S', icon: cloneIcon, label: 'Clone Stamp',
    variants: [{ id: 'clone', label: 'Clone Stamp', shortcut: 'S', icon: cloneIcon }],
  },
  {
    id: 'eraser', shortcut: 'E', icon: eraserIcon, label: 'Eraser',
    variants: [{ id: 'eraser', label: 'Eraser', shortcut: 'E', icon: eraserIcon }],
  },
  {
    id: 'gradient', shortcut: 'G', icon: gradientIcon, label: 'Gradient',
    variants: [
      { id: 'gradient', label: 'Gradient', shortcut: 'G', icon: gradientIcon },
      { id: 'bucket', label: 'Paint Bucket', shortcut: 'G', icon: bucketIcon },
    ],
  },
  {
    id: 'pen', shortcut: 'P', icon: penIcon, label: 'Pen',
    variants: [
      { id: 'pen', label: 'Pen', shortcut: 'P', icon: penIcon },
      { id: 'freeform-pen', label: 'Freeform Pen', shortcut: 'P', icon: penIcon },
    ],
  },
  {
    id: 'text', shortcut: 'T', icon: textIcon, label: 'Type',
    variants: [
      { id: 'text', label: 'Horizontal Type', shortcut: 'T', icon: textIcon },
      { id: 'text-vertical', label: 'Vertical Type', shortcut: 'T', icon: textIcon },
    ],
  },
  {
    id: 'shape', shortcut: 'U', icon: shapeIcon, label: 'Shape',
    variants: [
      { id: 'shape', label: 'Rectangle', shortcut: 'U', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><rect x="4" y="5" width="16" height="14" rx="1" /></svg> },
      { id: 'shape-ellipse', label: 'Ellipse', shortcut: 'U', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><ellipse cx="12" cy="12" rx="8" ry="6" /></svg> },
      { id: 'shape-line', label: 'Line', shortcut: 'U', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" {...stroke}><path d="M5 19L19 5" /></svg> },
    ],
  },
  {
    id: 'hand', shortcut: 'H', icon: handIcon, label: 'Hand (Pan)',
    variants: [{ id: 'hand', label: 'Hand', shortcut: 'H', icon: handIcon }],
  },
  {
    id: 'zoom', shortcut: 'Z', icon: zoomIcon, label: 'Zoom',
    variants: [{ id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: zoomIcon }],
  },
];

// Tools that are genuinely functional in this build. Everything else is greyed
// out with a "Coming soon" label rather than silently doing nothing.
const COMING_SOON_TOOLS = new Set([
  'marquee', 'lasso', 'wand', 'eyedropper', 'healing', 'clone',
  'eraser', 'gradient', 'pen', 'shape',
]);

function ToolButton({
  group,
  active,
  onActivate,
}: {
  group: ToolGroup;
  active: boolean;
  onActivate: (id: string) => void;
}) {
  const [showFlyout, setShowFlyout] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>();

  const comingSoon = COMING_SOON_TOOLS.has(group.id);
  const isMulti = group.variants.length > 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowFlyout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = () => {
    if (comingSoon) return;
    if (isMulti) {
      setShowFlyout(s => !s);
    } else {
      onActivate(group.id);
      setShowTooltip(false);
    }
  };

  const handleVariantClick = (id: string) => {
    onActivate(id);
    setShowFlyout(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); if (!comingSoon) setShowFlyout(true); }}
        onMouseEnter={() => { setShowTooltip(true); window.clearTimeout(hideTimer.current); }}
        onMouseLeave={() => {
          hideTimer.current = window.setTimeout(() => setShowTooltip(false), 200);
        }}
        disabled={comingSoon}
        aria-disabled={comingSoon}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
          comingSoon
            ? 'text-textMuted/30 cursor-not-allowed'
            : active
            ? 'bg-gradient-to-br from-glowViolet/30 to-glowCyan/20 border border-glowCyan/60 shadow-[0_0_15px_rgba(0,229,255,0.3)] text-glowCyan'
            : 'text-textMuted border border-transparent hover:text-white hover:bg-white/5'
        }`}
        aria-label={group.label}
        aria-haspopup={isMulti}
        title={`${group.label}${comingSoon ? ' — Coming soon' : ` (${group.shortcut})`}`}
      >
        {group.icon}
        {comingSoon && (
          <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-textMuted/40" />
        )}
        {isMulti && !comingSoon && (
          <span className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-glowViolet" />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !showFlyout && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0F1222]/95 backdrop-blur-xl border border-white/10 whitespace-nowrap text-xs text-textPrimary shadow-xl pointer-events-none z-50"
          >
            <span className="font-semibold">{group.label}</span>
            {comingSoon ? (
              <span className="text-textMuted/60 ml-2 text-[10px] uppercase tracking-wider">Coming soon</span>
            ) : (
              <span className="text-textMuted/60 ml-2 font-mono text-[10px]">{group.shortcut}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flyout for tool variants */}
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-full ml-2 top-0 z-50"
            onMouseEnter={() => window.clearTimeout(hideTimer.current)}
            onMouseLeave={() => { hideTimer.current = window.setTimeout(() => setShowFlyout(false), 200); }}
          >
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-glowViolet to-glowCyan shadow-2xl shadow-black/50">
              <div className="w-full bg-[#0F1222]/95 backdrop-blur-2xl rounded-2xl border border-white/10 p-1.5 flex flex-col gap-0.5 min-w-[180px]">
                {group.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantClick(v.id)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-textMuted hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="text-textPrimary">{v.icon}</span>
                    <span className="flex-1 text-left">{v.label}</span>
                    <span className="text-[10px] font-mono text-textMuted/50">{v.shortcut}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ToolRail() {
  const activeTool = useWorkspaceStore(s => s.activeTool);
  const setActiveTool = useWorkspaceStore(s => s.setActiveTool);
  const fgColor = useWorkspaceStore(s => s.fgColor);
  const bgColor = useWorkspaceStore(s => s.bgColor);
  const setFgColor = useWorkspaceStore(s => s.setFgColor);
  const setBgColor = useWorkspaceStore(s => s.setBgColor);
  const swapColors = useWorkspaceStore(s => s.swapColors);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'fg' | 'bg'>('fg');

  // Scope-cut: only render the tools that are verified working end-to-end.
  // All other groups remain defined in TOOL_GROUPS above for future work.
  const SURVIVING_TOOL_IDS = ['move', 'brush', 'crop', 'hand'];
  const visibleGroups = TOOL_GROUPS
    .filter(g => SURVIVING_TOOL_IDS.includes(g.id))
    // Keep only the primary variant so a click activates the tool directly
    .map(g => (g.id === 'brush' ? g : { ...g, variants: [g.variants[0]] }));

  const handleGroupActivate = (id: string) => {
    setActiveTool(id);
  };

  return (
    <div className="flex flex-col items-center justify-between py-3 gap-2 w-[60px] h-full min-h-0 shrink-0 bg-white/5 backdrop-blur-xl border-r border-white/10">
      {/* Tool Groups — scrollable so every tool stays reachable on short viewports */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-1.5 py-1 px-0.5">
        {visibleGroups.map(group => (
          <ToolButton
            key={group.id}
            group={group}
            active={activeTool === group.id || group.variants.some(v => v.id === activeTool)}
            onActivate={handleGroupActivate}
          />
        ))}

        {/* Intentional note so the trimmed rail doesn't read as broken */}
        <div className="flex flex-col items-center gap-1 mt-2 pt-3 w-full border-t border-white/10">
          <span className="text-[8px] font-heading uppercase tracking-[0.2em] text-textMuted/50 text-center leading-relaxed px-1">
            More tools
            <br />
            coming soon
          </span>
        </div>
      </div>

      {/* Bottom: colors + quick mask */}
      <div className="flex flex-col items-center gap-3 pb-1 shrink-0">
        {/* Foreground/Background swatches */}
        <div className="relative w-10 h-10">
          <button
            onClick={() => { setPickerTarget('bg'); setShowPicker(true); }}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-md border border-white/20 shadow-lg"
            style={{ backgroundColor: bgColor }}
            aria-label="Background color"
          />
          <button
            onClick={() => { setPickerTarget('fg'); setShowPicker(true); }}
            className="absolute top-0 left-0 w-6 h-6 rounded-md border border-white/20 shadow-lg"
            style={{ backgroundColor: fgColor, boxShadow: '0 0 8px rgba(123,92,255,0.4)' }}
            aria-label="Foreground color"
          />
        </div>

        <button
          onClick={swapColors}
          className="text-textMuted hover:text-white transition-all text-xs w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center"
          title="Swap colors (X)"
          aria-label="Swap colors"
        >
          ⇄
        </button>
      </div>

      {/* Color picker popover */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-[64px] bottom-24 z-50"
          >
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-glowViolet to-glowCyan shadow-2xl shadow-black/50">
              <div className="w-[220px] bg-[#0F1222]/95 backdrop-blur-2xl rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-heading uppercase tracking-wider text-textMuted mb-3">
                  {pickerTarget === 'fg' ? 'Foreground' : 'Background'} Color
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {['#7B5CFF', '#00E5FF', '#FF3DBB', '#39FFB0', '#F4F5FF', '#FFD166', '#FF6B6B', '#05050A', '#FFFFFF', '#9CA3C7'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        if (pickerTarget === 'fg') setFgColor(c);
                        else setBgColor(c);
                        setShowPicker(false);
                      }}
                      className="w-full aspect-square rounded-md border border-white/10 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pickerTarget === 'fg' ? fgColor : bgColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                        if (pickerTarget === 'fg') setFgColor(v);
                        else setBgColor(v);
                      }
                    }}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs font-mono text-textPrimary focus:outline-none focus:border-glowCyan/50"
                  />
                  <button
                    onClick={() => setShowPicker(false)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-glowViolet to-glowCyan text-white text-xs font-semibold"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}