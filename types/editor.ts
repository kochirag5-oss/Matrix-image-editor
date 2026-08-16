export interface ColorAdjustments {
  brightness: number; // -100 to 100 (0 default)
  contrast: number; // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  hue: number; // -180 to 180 (0 default)
  exposure: number; // -100 to 100 (0 default)
  temperature: number; // -100 to 100 (0 default, cool to warm)
  vibrance: number; // -100 to 100 (0 default)
  sharpness: number; // 0 to 100 (0 default)
}

export interface DetailFX {
  blur: number; // 0 to 20px
  vignette: number; // 0 to 100%
  vignetteColor: string; // hex or rgba
  grain: boolean; // toggle
  grainIntensity: number; // 0 to 50
}

export interface TransformSettings {
  rotate: number; // degrees (0, 90, 180, 270 or fine)
  flipH: boolean;
  flipV: boolean;
  aspectRatio: 'free' | '1:1' | '4:5' | '16:9' | '9:16';
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  fontSize: number; // px
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  glow: boolean;
  glowColor: string;
  opacity: number; // 0 - 100
  letterSpacing: number; // px
}

export interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  cssFilter?: string;
  isAi?: boolean;
}

export interface PaintStroke {
  id: string;
  points: { x: number; y: number }[]; // percentage 0 - 100
  size: number; // px
  color: string;
  opacity: number; // 0 - 100
  hard: boolean; // pencil = hard edge, brush = soft
}

export interface EditorState {
  originalImage: string;
  bgRemovedImage?: string | null;
  activeFilterId: string | null;
  adjustments: ColorAdjustments;
  detailFX: DetailFX;
  transform: TransformSettings;
  textLayers: TextLayer[];
  selectedTextId: string | null;
  strokes: PaintStroke[];
}
