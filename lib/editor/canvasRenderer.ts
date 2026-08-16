import { EditorState } from '@/types/editor';

function buildFilterString(state: EditorState): string {
  const parts: string[] = [];
  const { adjustments, activeFilterId, detailFX } = state;

  const brightnessVal = 1 + (adjustments.brightness + adjustments.exposure) / 100;
  const contrastVal = 1 + adjustments.contrast / 100;
  const saturationVal = 1 + (adjustments.saturation + adjustments.vibrance) / 100;

  parts.push(`brightness(${Math.max(0, brightnessVal)})`);
  parts.push(`contrast(${Math.max(0, contrastVal)})`);
  parts.push(`saturate(${Math.max(0, saturationVal)})`);
  if (adjustments.hue !== 0) parts.push(`hue-rotate(${adjustments.hue}deg)`);
  if (detailFX.blur > 0) parts.push(`blur(${detailFX.blur}px)`);

  if (activeFilterId && activeFilterId !== 'remove-bg') {
    switch (activeFilterId) {
      case 'enhance':
        parts.push('contrast(1.2) saturate(1.3) brightness(1.05)');
        break;
      case 'cinematic':
        parts.push('contrast(1.15) saturate(0.85) sepia(0.15) brightness(0.95)');
        break;
      case 'neon':
        parts.push('saturate(1.8) contrast(1.3) brightness(1.1)');
        break;
      case 'dream':
        parts.push('blur(0.5px) brightness(1.15) saturate(1.2)');
        break;
      case 'noir':
        parts.push('grayscale(1) contrast(1.4) brightness(0.9)');
        break;
    }
  }

  return parts.join(' ');
}

function applySharpness(ctx: CanvasRenderingContext2D, amount: number) {
  if (amount <= 0) return;
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);
  const strength = amount / 100;
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0,
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += copy[idx] * kernel[ki];
            ki++;
          }
        }
        const idx = (y * width + x) * 4 + c;
        data[idx] = Math.min(255, Math.max(0, copy[idx] + (sum - copy[idx]) * strength));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function getTargetDimensions(
  imgW: number,
  imgH: number,
  aspectRatio: EditorState['transform']['aspectRatio']
) {
  if (aspectRatio === 'free') return { w: imgW, h: imgH };
  if (aspectRatio === '1:1') {
    const min = Math.min(imgW, imgH);
    return { w: min, h: min };
  }
  if (aspectRatio === '4:5') return { w: imgW, h: (imgW * 5) / 4 };
  if (aspectRatio === '16:9') return { w: imgW, h: (imgW * 9) / 16 };
  return { w: (imgH * 9) / 16, h: imgH };
}

export function renderEditorToCanvas(
  canvas: HTMLCanvasElement,
  state: EditorState,
  options?: { showOriginal?: boolean }
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve();
      return;
    }

    const sourceImageSrc =
      state.activeFilterId === 'remove-bg' && state.bgRemovedImage
        ? state.bgRemovedImage
        : state.originalImage;

    if (!sourceImageSrc) {
      canvas.width = 600;
      canvas.height = 450;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      resolve();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
    const isRotated90or270 =
      state.transform.rotate === 90 || state.transform.rotate === 270;
    const baseW = isRotated90or270 ? img.height : img.width;
    const baseH = isRotated90or270 ? img.width : img.height;
    const { w: targetW, h: targetH } = getTargetDimensions(
      baseW,
      baseH,
      state.transform.aspectRatio
    );

    canvas.width = Math.round(targetW);
    canvas.height = Math.round(targetH);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (options?.showOriginal) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve();
      return;
    }

    ctx.save();
    ctx.filter = buildFilterString(state);
    ctx.translate(canvas.width / 2, canvas.height / 2);

    if (state.transform.rotate !== 0) {
      ctx.rotate((state.transform.rotate * Math.PI) / 180);
    }
    if (state.transform.flipH || state.transform.flipV) {
      ctx.scale(state.transform.flipH ? -1 : 1, state.transform.flipV ? -1 : 1);
    }

    const drawW = isRotated90or270 ? canvas.height : canvas.width;
    const drawH = isRotated90or270 ? canvas.width : canvas.height;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    if (state.adjustments.sharpness > 0) {
      applySharpness(ctx, state.adjustments.sharpness);
    }

    if (state.adjustments.temperature !== 0) {
      ctx.save();
      const temp = state.adjustments.temperature;
      ctx.fillStyle =
        temp > 0
          ? `rgba(255, 140, 0, ${temp * 0.002})`
          : `rgba(0, 150, 255, ${Math.abs(temp) * 0.002})`;
      ctx.globalCompositeOperation = 'color';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (state.detailFX.vignette > 0) {
      ctx.save();
      const radius = Math.max(canvas.width, canvas.height) * 0.7;
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.1,
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      const vigOpacity = state.detailFX.vignette / 100;
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, state.detailFX.vignetteColor || `rgba(0,0,0,${vigOpacity})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    if (state.detailFX.grain && state.detailFX.grainIntensity > 0) {
      ctx.save();
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 128;
      noiseCanvas.height = 128;
      const noiseCtx = noiseCanvas.getContext('2d');
      if (noiseCtx) {
        const noiseImgData = noiseCtx.createImageData(128, 128);
        const data = noiseImgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = (Math.random() - 0.5) * 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = (state.detailFX.grainIntensity / 100) * 80;
        }
        noiseCtx.putImageData(noiseImgData, 0, 0);
        const pattern = ctx.createPattern(noiseCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      ctx.restore();
    }

    (state.strokes || []).forEach((stroke) => {
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = stroke.color || '#FFFFFF';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = (stroke.size || 8) * (canvas.width / 600) * (stroke.hard ? 0.55 : 1);
      ctx.globalAlpha = (stroke.opacity ?? 100) / 100;
      if (!stroke.hard) {
        ctx.shadowColor = stroke.color || '#FFFFFF';
        ctx.shadowBlur = (stroke.size || 8) * 0.4;
      }
      ctx.beginPath();
      stroke.points.forEach((pt, i) => {
        const px = (pt.x / 100) * canvas.width;
        const py = (pt.y / 100) * canvas.height;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    });

    state.textLayers.forEach((layer) => {
      ctx.save();
      const scale = canvas.width / 600;
      const size = layer.fontSize * scale;
      ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${size}px ${layer.fontFamily}, sans-serif`;
      ctx.fillStyle = layer.color || '#FFFFFF';
      ctx.globalAlpha = (layer.opacity ?? 100) / 100;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${layer.letterSpacing}px`;
      }

      if (layer.glow) {
        ctx.shadowColor = layer.glowColor || '#00E5FF';
        ctx.shadowBlur = 20;
      }

      const posX = (layer.x / 100) * canvas.width;
      const posY = (layer.y / 100) * canvas.height;
      ctx.fillText(layer.text, posX, posY);

      if (state.selectedTextId === layer.id) {
        const metrics = ctx.measureText(layer.text);
        const boxW = metrics.width + 24;
        const boxH = size + 16;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(posX - boxW / 2, posY - boxH / 2, boxW, boxH);
      }
        ctx.restore();
      });
      resolve();
    };
    img.onerror = () => resolve();
    img.src = sourceImageSrc;
  });
}

export function exportEditorState(
  state: EditorState,
  format: 'png' | 'jpeg',
  quality = 0.92
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!state.originalImage) {
      resolve(null);
      return;
    }
    const canvas = document.createElement('canvas');
    renderEditorToCanvas(canvas, { ...state, selectedTextId: null }).then(() => {
      canvas.toBlob(
        (blob) => resolve(blob),
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality
      );
    });
  });
}

export function getPresetPreviewFilter(presetId: string): string {
  switch (presetId) {
    case 'enhance':
      return 'contrast(1.2) saturate(1.3) brightness(1.05)';
    case 'cinematic':
      return 'contrast(1.15) saturate(0.85) sepia(0.2) brightness(0.95)';
    case 'neon':
      return 'saturate(1.8) contrast(1.3) brightness(1.1)';
    case 'dream':
      return 'blur(0.5px) brightness(1.15) saturate(1.2)';
    case 'noir':
      return 'grayscale(1) contrast(1.4) brightness(0.9)';
    default:
      return 'none';
  }
}
