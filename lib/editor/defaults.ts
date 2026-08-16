import { ColorAdjustments, DetailFX, EditorState, TransformSettings } from '@/types/editor';

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  temperature: 0,
  vibrance: 0,
  sharpness: 0,
};

export const DEFAULT_DETAIL_FX: DetailFX = {
  blur: 0,
  vignette: 0,
  vignetteColor: 'rgba(0,0,0,0.6)',
  grain: false,
  grainIntensity: 25,
};

export const DEFAULT_TRANSFORM: TransformSettings = {
  rotate: 0,
  flipH: false,
  flipV: false,
  aspectRatio: 'free',
};

export function createInitialEditorState(): EditorState {
  return {
    originalImage: '',
    bgRemovedImage: null,
    activeFilterId: null,
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    detailFX: { ...DEFAULT_DETAIL_FX },
    transform: { ...DEFAULT_TRANSFORM },
    textLayers: [],
    selectedTextId: null,
    strokes: [],
  };
}

export const TEXT_FONTS = [
  { id: 'Space Grotesk', label: 'Space Grotesk', stack: 'var(--font-space-grotesk), sans-serif' },
  { id: 'Orbitron', label: 'Orbitron', stack: 'var(--font-orbitron), sans-serif' },
  { id: 'Inter', label: 'Inter', stack: 'var(--font-inter), sans-serif' },
  { id: 'Georgia', label: 'Georgia', stack: 'Georgia, serif' },
  { id: 'Courier New', label: 'Mono', stack: '"Courier New", monospace' },
] as const;

export const GLOW_SWATCHES = [
  '#F4F5FF',
  '#FFFFFF',
  '#7B5CFF',
  '#00E5FF',
  '#FF3DBB',
  '#39FFB0',
  '#FFD166',
  '#FF6B6B',
  '#05050A',
];

export const EDITOR_STAGES = [
  'upload',
  'color',
  'filters',
  'text',
  'crop',
  'detail',
  'export',
] as const;

export type EditorStageId = (typeof EDITOR_STAGES)[number];
