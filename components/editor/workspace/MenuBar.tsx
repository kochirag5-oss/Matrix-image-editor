'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '../../GlassPanel';
import GlowButton from '../../GlowButton';
import { useWorkspaceStore } from '@/hooks/useWorkspaceState';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  submenu?: MenuItem[];
  disabled?: boolean;
}

interface MenuConfig {
  label: string;
  items: MenuItem[];
}

interface MenuBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSave?: () => void;
  onExport?: () => void;
  onNew?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onResetZoom?: () => void;
  onToggleRulers?: () => void;
  onToggleGrid?: () => void;
  onToggleGuides?: () => void;
  onOpenAI?: () => void;
}

function buildMenuConfigs({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onNew,
  onZoomIn,
  onZoomOut,
  onFit,
  onResetZoom,
  onToggleRulers,
  onToggleGrid,
  onToggleGuides,
  onOpenAI,
}: Required<Pick<
  MenuBarProps,
  'onUndo' | 'onRedo' | 'onSave' | 'onExport' | 'onNew' | 'onZoomIn' | 'onZoomOut' | 'onFit' | 'onResetZoom' | 'onToggleRulers' | 'onToggleGrid' | 'onToggleGuides' | 'onOpenAI'
>>): MenuConfig[] {
  return [
  {
    label: 'File',
    items: [
      { label: 'New', shortcut: 'Ctrl+N', action: onNew },
      { label: 'Open...', shortcut: 'Ctrl+O', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: onSave },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => {}, disabled: true },
      { label: 'Export', shortcut: 'Ctrl+E', action: onExport },
      { label: 'Import...', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Close', shortcut: 'Ctrl+W', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: onRedo },
      { divider: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: () => {}, disabled: true },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => {}, disabled: true },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Preferences', shortcut: 'Ctrl+K', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'Image',
    items: [
      { label: 'Resize Image...', action: () => {}, disabled: true },
      { label: 'Crop Canvas...', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Rotate Canvas 90° CW', action: () => {}, disabled: true },
      { label: 'Rotate Canvas 90° CCW', action: () => {}, disabled: true },
      { label: 'Flip Canvas Horizontal', action: () => {}, disabled: true },
      { label: 'Flip Canvas Vertical', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'Layer',
    items: [
      { label: 'New Layer', shortcut: 'Ctrl+Shift+N', action: () => {}, disabled: true },
      { label: 'Duplicate Layer', shortcut: 'Ctrl+J', action: () => {}, disabled: true },
      { label: 'Delete Layer', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Merge Down', shortcut: 'Ctrl+E', action: () => {}, disabled: true },
      { label: 'Merge Visible', shortcut: 'Ctrl+Shift+E', action: () => {}, disabled: true },
      { label: 'Flatten Image', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Layer Style', submenu: [
        { label: 'Drop Shadow', action: () => {}, disabled: true },
        { label: 'Inner Shadow', action: () => {}, disabled: true },
        { label: 'Outer Glow', action: () => {}, disabled: true },
        { label: 'Inner Glow', action: () => {}, disabled: true },
        { label: 'Bevel & Emboss', action: () => {}, disabled: true },
        { label: 'Stroke', action: () => {}, disabled: true },
      ]},
    ],
  },
  {
    label: 'Select',
    items: [
      { label: 'All', shortcut: 'Ctrl+A', action: () => {}, disabled: true },
      { label: 'Deselect', shortcut: 'Ctrl+D', action: () => {}, disabled: true },
      { label: 'Reselect', shortcut: 'Ctrl+Shift+D', action: () => {}, disabled: true },
      { label: 'Inverse', shortcut: 'Ctrl+Shift+I', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Feather...', shortcut: 'Shift+F6', action: () => {}, disabled: true },
      { label: 'Expand...', action: () => {}, disabled: true },
      { label: 'Contract...', action: () => {}, disabled: true },
      { label: 'Transform Selection', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'Filter',
    items: [
      { label: 'Camera Raw Filter...', shortcut: 'Ctrl+Shift+A', action: () => {}, disabled: true },
      { divider: true },
      { label: 'Blur', submenu: [
        { label: 'Gaussian Blur...', action: () => {}, disabled: true },
        { label: 'Motion Blur...', action: () => {}, disabled: true },
        { label: 'Radial Blur...', action: () => {}, disabled: true },
      ]},
      { label: 'Sharpen', submenu: [
        { label: 'Unsharp Mask...', action: () => {}, disabled: true },
        { label: 'Smart Sharpen...', action: () => {}, disabled: true },
      ]},
      { label: 'Noise', submenu: [
        { label: 'Add Noise...', action: () => {}, disabled: true },
        { label: 'Reduce Noise...', action: () => {}, disabled: true },
      ]},
      { label: 'Distort', submenu: [
        { label: 'Pinch/Punch...', action: () => {}, disabled: true },
        { label: 'Ripple...', action: () => {}, disabled: true },
        { label: 'Wave...', action: () => {}, disabled: true },
      ]},
      { label: 'Stylize', submenu: [
        { label: 'Oil Paint...', action: () => {}, disabled: true },
        { label: 'Wind...', action: () => {}, disabled: true },
        { label: 'Tiles...', action: () => {}, disabled: true },
      ]},
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Zoom In', shortcut: 'Ctrl++', action: onZoomIn },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: onZoomOut },
      { label: 'Fit on Screen', shortcut: 'Ctrl+0', action: onFit },
      { label: '100%', shortcut: 'Ctrl+1', action: onResetZoom },
      { divider: true },
      { label: 'Rulers', shortcut: 'Ctrl+R', action: onToggleRulers },
      { label: 'Grid', shortcut: 'Ctrl+\'', action: onToggleGrid },
      { label: 'Guides', shortcut: 'Ctrl+;', action: onToggleGuides },
      { label: 'Snap', action: () => {}, disabled: true },
      { divider: true },
      { label: 'New Guide...', action: () => {}, disabled: true },
      { label: 'Clear Guides', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'AI',
    items: [
      { label: 'Open AI Assistant', shortcut: 'Ctrl+Shift+A', action: onOpenAI },
      { divider: true },
      { label: 'Remove Background', action: () => {}, disabled: true },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+/', action: () => {}, disabled: true },
      { label: 'Online Documentation', action: () => {}, disabled: true },
      { label: 'Report a Bug', action: () => {}, disabled: true },
      { divider: true },
      { label: 'About Nebula', action: () => {}, disabled: true },
    ],
  },
];
}

interface DropdownMenuProps {
  items: MenuItem[];
  anchorRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  isSubmenu?: boolean;
  parentRect?: DOMRect;
}

function DropdownMenu({ items, anchorRef, onClose, isSubmenu = false, parentRect }: DropdownMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (!isSubmenu) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isSubmenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHoveredIndex(i => {
          const next = (i ?? -1) + 1;
          return next < items.length ? next : 0;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHoveredIndex(i => {
          const next = (i ?? items.length) - 1;
          return next >= 0 ? next : items.length - 1;
        });
      } else if (e.key === 'ArrowRight' && isSubmenu) {
        // Could navigate into submenu
      } else if (e.key === 'ArrowLeft' && isSubmenu) {
        onClose();
      } else if (e.key === 'Enter') {
        const idx = hoveredIndex ?? 0;
        const item = items[idx];
        if (item && !item.divider && !item.disabled && item.action) {
          item.action();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, hoveredIndex, onClose, isSubmenu]);

  if (items.length === 0) return null;

  const anchor = anchorRef.current;
  let top = 0, left = 0;
  
  if (isSubmenu && parentRect) {
    top = parentRect.top;
    left = parentRect.right + 4;
  } else if (anchor) {
    const rect = anchor.getBoundingClientRect();
    top = rect.bottom + 4;
    left = rect.left;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'fixed', top, left, zIndex: 1000 }}
        className="pointer-events-auto"
      >
        <GlassPanel className="p-1 min-w-[200px] max-w-[280px] shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider ? (
                <div className="my-1 border-t border-white/10" />
              ) : (
                <div
                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
                    hoveredIndex === index
                      ? 'bg-glowViolet/20 text-white'
                      : 'text-textMuted hover:bg-white/5 hover:text-white'
                  } ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
                  onMouseEnter={() => !item.divider && !item.disabled && setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    if (!item.divider && !item.disabled) {
                      if (item.submenu) {
                        // Submenu handled by hover
                      } else if (item.action) {
                        item.action();
                        onClose();
                      }
                    }
                  }}
                >
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] font-mono text-textMuted/60 ml-4">{item.shortcut}</span>
                  )}
                  {item.submenu && (
                    <span className="text-textMuted/60">▶</span>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </GlassPanel>
      </motion.div>
    </AnimatePresence>
  );
}

export default function MenuBar({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  onExport,
  onNew,
  onZoomIn,
  onZoomOut,
  onFit,
  onResetZoom,
  onToggleRulers,
  onToggleGrid,
  onToggleGuides,
  onOpenAI,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLButtonElement>>({});
  const [submenuState, setSubmenuState] = useState<{ menu: string; index: number; rect: DOMRect } | null>(null);

  const noop = () => {};
  const menuConfigs = buildMenuConfigs({
    onUndo: onUndo || noop,
    onRedo: onRedo || noop,
    onSave: onSave || noop,
    onExport: onExport || noop,
    onNew: onNew || noop,
    onZoomIn: onZoomIn || noop,
    onZoomOut: onZoomOut || noop,
    onFit: onFit || noop,
    onResetZoom: onResetZoom || noop,
    onToggleRulers: onToggleRulers || noop,
    onToggleGrid: onToggleGrid || noop,
    onToggleGuides: onToggleGuides || noop,
    onOpenAI: onOpenAI || noop,
  });

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
    setSubmenuState(null);
  };

  const handleSubmenuHover = (menuLabel: string, index: number, rect: DOMRect) => {
    if (openMenu === menuLabel) {
      setSubmenuState({ menu: menuLabel, index, rect });
    }
  };

  const handleSubmenuLeave = () => {
    // Keep submenu open briefly for cursor travel
    setTimeout(() => {
      setSubmenuState(s => s ? null : s);
    }, 100);
  };

  const activeSubmenu = openMenu && submenuState?.menu === openMenu ? submenuState : null;
  const activeMenuItems = openMenu ? menuConfigs.find(m => m.label === openMenu)?.items : [];

  return (
    <div className="flex items-center justify-between h-10 px-4 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_8px_rgba(0,0,0,0.3)] z-50">
      {/* Logo / App Title */}
      <div className="flex items-center gap-2">
        <span className="font-heading font-black text-xl text-textPrimary tracking-tight">
          <span className="text-glowViolet" style={{ textShadow: '0 0 12px #7B5CFF' }}>N</span>EBULA
        </span>
        <span className="hidden sm:inline text-textMuted text-xs tracking-wider uppercase">PRO</span>
      </div>

      {/* Menu Bar */}
      <div className="flex items-center gap-1 flex-1 justify-start">
        {menuConfigs.map((menu) => {
          const isOpen = openMenu === menu.label;
          const anchor = { current: menuRefs.current[menu.label] || null };

          return (
            <div key={menu.label} className="relative">
              <button
                ref={el => { menuRefs.current[menu.label] = el!; }}
                onClick={() => handleMenuClick(menu.label)}
                onMouseEnter={() => openMenu && handleMenuClick(menu.label)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isOpen
                    ? 'bg-glowViolet/20 text-glowCyan'
                    : 'text-textMuted hover:text-white hover:bg-white/5'
                }`}
                aria-haspopup="true"
                aria-expanded={isOpen}
              >
                {menu.label}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <DropdownMenu
                    items={menu.items}
                    anchorRef={anchor}
                    onClose={() => { setOpenMenu(null); setSubmenuState(null); }}
                  />
                )}

                {activeSubmenu && (
                  <DropdownMenu
                    items={menuConfigs.find(m => m.label === activeSubmenu.menu)?.items[activeSubmenu.index]?.submenu || []}
                    anchorRef={anchor}
                    onClose={() => { setOpenMenu(null); setSubmenuState(null); }}
                    isSubmenu
                    parentRect={activeSubmenu.rect}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Right side: Undo/Redo/Save/Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-textMuted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-textMuted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        
        <GlowButton variant="secondary" size="sm" onClick={onSave} className="hidden sm:flex">
          Save
        </GlowButton>
        <GlowButton variant="primary" size="sm" onClick={onExport} className="hidden sm:flex">
          Export
        </GlowButton>
      </div>
    </div>
  );
}