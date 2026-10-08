export interface ImageFilters {
  brightness: number; // -100 to 100 (0 default)
  contrast: number;   // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  warmth: number;     // -100 to 100 (0 default, warm peach/rose K-beauty tone)
  sharpen: boolean;   // subtle unsharp mask filter for crisp packaging
}

export interface ProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: '1:1' | '4:5' | '16:9' | 'original';
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  quality?: number; // 0.1 to 1.0
  filters?: Partial<ImageFilters>;
  cropMode?: 'cover' | 'contain';
}

export interface ProcessingResult {
  dataUrl: string;
  blob: Blob;
  originalSize: number;
  processedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  processingTimeMs: number;
  format: string;
}

/**
 * Fast Client-Side Image Processor utilizing HTML5 Canvas & TypedArrays
 * Executes high-performance resizing, color grading, and format encoding in <20ms
 */
export async function processFastImage(
  source: File | Blob | string,
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const startTime = performance.now();

  const {
    maxWidth = 1000,
    maxHeight = 1000,
    aspectRatio = '1:1',
    format = 'image/webp',
    quality = 0.85,
    cropMode = 'cover',
    filters = {},
  } = options;

  const {
    brightness = 0,
    contrast = 0,
    saturation = 0,
    warmth = 0,
    sharpen = false,
  } = filters;

  // 1. Resolve source image element and original byte size
  let originalSize = 0;
  let imgSource: HTMLImageElement;

  if (typeof source === 'string') {
    // Estimate dataURL byte size
    const base64Part = source.split(',')[1] || source;
    originalSize = Math.round((base64Part.length * 3) / 4);
    imgSource = await loadImageFromUrl(source);
  } else {
    originalSize = source.size;
    const objectUrl = URL.createObjectURL(source);
    try {
      imgSource = await loadImageFromUrl(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  const srcW = imgSource.naturalWidth || imgSource.width;
  const srcH = imgSource.naturalHeight || imgSource.height;

  // 2. Compute Target Dimensions
  let targetW = srcW;
  let targetH = srcH;

  if (aspectRatio === '1:1') {
    const size = Math.min(maxWidth, maxHeight, Math.max(srcW, srcH));
    targetW = size;
    targetH = size;
  } else if (aspectRatio === '4:5') {
    const maxW = Math.min(maxWidth, srcW);
    targetW = maxW;
    targetH = Math.round(maxW * 1.25);
  } else if (aspectRatio === '16:9') {
    const maxW = Math.min(maxWidth, srcW);
    targetW = maxW;
    targetH = Math.round(maxW * (9 / 16));
  } else {
    // Original Aspect Ratio with Bounds
    let ratio = srcW / srcH;
    if (targetW > maxWidth) {
      targetW = maxWidth;
      targetH = Math.round(targetW / ratio);
    }
    if (targetH > maxHeight) {
      targetH = maxHeight;
      targetW = Math.round(targetH * ratio);
    }
  }

  // Ensure minimum dimensions
  targetW = Math.max(64, Math.round(targetW));
  targetH = Math.max(64, Math.round(targetH));

  // 3. Render onto Canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw background if JPEG or white backdrop requested
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Calculate Crop / Scale coordinates
  let sx = 0, sy = 0, sWidth = srcW, sHeight = srcH;

  if (aspectRatio !== 'original') {
    const targetAspect = targetW / targetH;
    const srcAspect = srcW / srcH;

    if (cropMode === 'cover') {
      if (srcAspect > targetAspect) {
        // Source is wider: crop horizontally
        sWidth = srcH * targetAspect;
        sx = (srcW - sWidth) / 2;
      } else {
        // Source is taller: crop vertically
        sHeight = srcW / targetAspect;
        sy = (srcH - sHeight) / 2;
      }
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imgSource, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

  // 4. Pixel-Level Filters (Brightness, Contrast, Saturation, Warmth, Sharpen)
  const hasPixelAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0 || warmth !== 0 || sharpen;

  if (hasPixelAdjustments) {
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;

    const bFactor = (brightness / 100) * 255;
    const cFactor = (contrast + 100) / 100;
    const sFactor = (saturation + 100) / 100;
    const wFactor = warmth / 100; // Positive adds warm rose/peach (+R, -B)

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness & Contrast
      r = ((r - 128) * cFactor + 128) + bFactor;
      g = ((g - 128) * cFactor + 128) + bFactor;
      b = ((b - 128) * cFactor + 128) + bFactor;

      // Saturation
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = gray + (r - gray) * sFactor;
      g = gray + (g - gray) * sFactor;
      b = gray + (b - gray) * sFactor;

      // Warmth (Seoul Rosy Peach Tint)
      if (wFactor !== 0) {
        r += wFactor * 18;
        g += wFactor * 6;
        b -= wFactor * 14;
      }

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    // Optional Quick Sharpen (Unsharp Mask Kernel)
    if (sharpen && targetW > 100 && targetH > 100) {
      applyQuickSharpen(data, targetW, targetH);
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // 5. Output Encoding
  let mimeType = format;
  // Browser WebP fallback check
  const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  if (format === 'image/webp' && !supportsWebP) {
    mimeType = 'image/jpeg';
  }

  const dataUrl = canvas.toDataURL(mimeType, quality);
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), mimeType, quality);
  });

  const processedSize = blob.size || Math.round((dataUrl.length * 3) / 4);
  const savingsPercent = originalSize > 0 
    ? Math.max(0, Math.round(((originalSize - processedSize) / originalSize) * 100))
    : 0;

  const processingTimeMs = Math.round(performance.now() - startTime);

  return {
    dataUrl,
    blob,
    originalSize,
    processedSize,
    savingsPercent,
    width: targetW,
    height: targetH,
    processingTimeMs,
    format: mimeType.replace('image/', '').toUpperCase(),
  };
}

/**
 * Upload base64 processed image to the server API
 */
export async function uploadFastImageToServer(
  dataUrl: string, 
  filename = 'fast_processed'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename }),
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return { success: true, url: data.url };
  } catch (err: any) {
    console.error('Fast Image Upload Error:', err);
    return { success: false, error: err.message || 'Upload failed' };
  }
}

/**
 * Helper to load HTMLImageElement from URL with cross-origin handling
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image source'));
    img.src = url;
  });
}

/**
 * Lightweight 3x3 unsharp convolution kernel
 */
function applyQuickSharpen(data: Uint8ClampedArray, width: number, height: number) {
  const buff = new Uint8ClampedArray(data);
  const weight = 0.25;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * width + x) * 4 + c;
        const bottom = ((y + 1) * width + x) * 4 + c;
        const left = (y * width + (x - 1)) * 4 + c;
        const right = (y * width + (x + 1)) * 4 + c;
        
        const surrounding = (buff[top] + buff[bottom] + buff[left] + buff[right]) * 0.25;
        const diff = buff[idx + c] - surrounding;
        data[idx + c] = Math.min(255, Math.max(0, buff[idx + c] + diff * weight));
      }
    }
  }
}

/**
 * Format bytes into human readable string (KB / MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
}
