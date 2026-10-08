import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Upload, 
  Zap, 
  Sliders, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  CloudUpload, 
  Image as ImageIcon, 
  RotateCcw, 
  Maximize2, 
  Layers, 
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  processFastImage, 
  uploadFastImageToServer, 
  formatBytes, 
  ProcessingOptions, 
  ProcessingResult 
} from '../utils/fastImageProcessor';

interface FastPictureProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  onApplyImage?: (imageUrl: string) => void;
  title?: string;
}

export const FastPictureProcessorModal: React.FC<FastPictureProcessorModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  onApplyImage,
  title = 'Fast Picture Processor & Studio Optimizer',
}) => {
  const [sourceImage, setSourceImage] = useState<File | string | null>(initialImageUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configuration options
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | 'original'>('1:1');
  const [maxDimension, setMaxDimension] = useState<number>(1000);
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);

  // Filter sliders
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(0);
  const [sharpen, setSharpen] = useState<boolean>(false);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial image if provided
  useEffect(() => {
    if (initialImageUrl) {
      setSourceImage(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Execute processing whenever inputs change
  const runProcessing = useCallback(async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const options: ProcessingOptions = {
        maxWidth: maxDimension,
        maxHeight: maxDimension,
        aspectRatio,
        format,
        quality,
        cropMode: 'cover',
        filters: {
          brightness,
          contrast,
          saturation,
          warmth,
          sharpen,
        },
      };

      const res = await processFastImage(sourceImage, options);
      setResult(res);
    } catch (err: any) {
      console.error('Fast image processing failed:', err);
      setErrorMessage(err.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, maxDimension, aspectRatio, format, quality, brightness, contrast, saturation, warmth, sharpen]);

  useEffect(() => {
    if (sourceImage && isOpen) {
      runProcessing();
    }
  }, [sourceImage, runProcessing, isOpen]);

  // Handle Clipboard Paste
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            setSourceImage(file);
            setUploadedUrl(null);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSourceImage(file);
        setUploadedUrl(null);
      } else {
        setErrorMessage('Please drop an image file (PNG, JPG, WebP)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSourceImage(e.target.files[0]);
      setUploadedUrl(null);
    }
  };

  // Preset: K-Beauty Glass Glow
  const applyGlassGlowPreset = () => {
    setBrightness(8);
    setContrast(6);
    setWarmth(12);
    setSaturation(10);
    setSharpen(true);
    setQuality(0.88);
  };

  // Reset Filters
  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setWarmth(0);
    setSaturation(0);
    setSharpen(false);
  };

  // Upload to Cloud / Server
  const handleUploadToServer = async () => {
    if (!result) return;
    setIsUploading(true);

    try {
      const filename = `lifei_product_${Date.now()}`;
      const res = await uploadFastImageToServer(result.dataUrl, filename);
      if (res.success && res.url) {
        setUploadedUrl(res.url);
      } else {
        setErrorMessage(res.error || 'Server upload failed');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Download Output File
  const handleDownload = () => {
    if (!result) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `lifei-optimized-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Data URL
  const handleCopyDataUrl = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.dataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // 1-Click Apply to Form
  const handleApply = () => {
    if (!onApplyImage || !result) return;
    const finalUrl = uploadedUrl || result.dataUrl;
    onApplyImage(finalUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-inter"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center text-[#EC3460] shadow-xs">
              <Zap size={18} className="fill-[#EC3460]/20" />
            </div>
            <div>
              <h3 className="font-anton text-lg tracking-wide uppercase text-slate-950 flex items-center gap-2">
                {title}
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-inter font-bold px-2 py-0.5 rounded-full lowercase tracking-normal">
                  sub-20ms speed
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                High-performance client-side asset compressor &amp; K-Beauty visual studio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Canvas & Dropzone */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Visual Display Container */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative min-h-[340px] sm:min-h-[400px] flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                isDragOver 
                  ? 'border-[#EC3460] bg-rose-50/70 scale-[0.99]' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {result?.dataUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={result.dataUrl}
                    alt="Processed Preview"
                    className="max-h-[380px] max-w-full rounded-xl object-contain shadow-md transition-all"
                  />
                  {/* Floating Performance Tag */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <Zap size={11} className="text-amber-400 fill-amber-400" />
                    <span>⚡ {result.processingTimeMs} ms</span>
                  </div>

                  {/* Format & Dimensions Tag */}
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-medium px-2.5 py-1 rounded-lg shadow-lg">
                    {result.width} × {result.height} · {result.format}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-[#FFCDF2] text-[#EC3460] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                    <Upload size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Drop Skincare Photo Here
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports PNG, JPG, WebP. Or paste directly from your clipboard (<kbd className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd>).
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <ImageIcon size={14} />
                    Browse Photo
                  </button>
                </div>
              )}

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </div>

            {/* Change Image Button if image is loaded */}
            {sourceImage && (
              <div className="flex items-center justify-between gap-3 text-xs bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium truncate flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400" />
                  {typeof sourceImage === 'string' ? 'Loaded from URL / Preset' : sourceImage.name}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#EC3460] hover:underline font-bold shrink-0 cursor-pointer"
                >
                  Choose Different Image
                </button>
              </div>
            )}

            {/* Performance & Optimization Metrics Card */}
            {result && (
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {formatBytes(result.originalSize)} ➔ {formatBytes(result.processedSize)}
                      </span>
                      {result.savingsPercent > 0 && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                          -{result.savingsPercent}% lighter
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Optimized for Korean glass skin rendering &amp; ultra-fast mobile loading
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Speed Engine Settings & Studio Sliders */}
          <div className="lg:col-span-5 flex flex-col gap-5 overflow-y-auto pr-1 text-xs">
            {/* Quick 1-Click Aesthetic Presets */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#EC3460]" />
                  AESTHETIC PRESETS
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={10} />
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={applyGlassGlowPreset}
                  className="py-2 px-3 bg-white hover:bg-[#FFF0F9] border border-[#FFCDF2] text-[#B31940] rounded-xl font-bold transition-all text-left flex items-center justify-between cursor-pointer shadow-2xs group"
                >
                  <span>✨ Glass Glow</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-[#EC3460] font-mono">Seoul AM</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrightness(4);
                    setContrast(12);
                    setWarmth(0);
                    setSharpen(true);
                  }}
                  className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl font-bold transition-all text-left flex items-center justify-between cursor-pointer shadow-2xs"
                >
                  <span>🔬 Clinical Crisp</span>
                  <span className="text-[10px] text-slate-400 font-mono">Formula</span>
                </button>
              </div>
            </div>

            {/* Geometry & Format Controls */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                OUTPUT GEOMETRY &amp; FORMAT
              </span>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '1:1', label: '1:1 Square', note: 'Product' },
                    { id: '4:5', label: '4:5 Portrait', note: 'Model' },
                    { id: '16:9', label: '16:9 Wide', note: 'Banner' },
                    { id: 'original', label: 'Original', note: 'Custom' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAspectRatio(item.id as any)}
                      className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer ${
                        aspectRatio === item.id
                          ? 'bg-[#EC3460] text-white border-[#EC3460] font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-medium text-[11px] leading-tight">{item.id}</span>
                      <span className="block text-[9px] opacity-75">{item.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Dimension */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Max Dimension
                  </label>
                  <select
                    value={maxDimension}
                    onChange={(e) => setMaxDimension(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 cursor-pointer"
                  >
                    <option value={800}>800 px (Fast Mobile)</option>
                    <option value={1000}>1000 px (Catalog Standard)</option>
                    <option value={1200}>1200 px (High-Res Retina)</option>
                    <option value={1600}>1600 px (Studio Hero)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Encoding Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 cursor-pointer"
                  >
                    <option value="image/webp">WebP (90% smaller)</option>
                    <option value="image/jpeg">JPEG (Universal)</option>
                    <option value="image/png">PNG (Lossless)</option>
                  </select>
                </div>
              </div>

              {/* Quality Slider */}
              {format !== 'image/png' && (
                <div>
                  <div className="flex justify-between text-slate-700 font-medium mb-1">
                    <span>Compression Quality</span>
                    <span className="font-mono font-bold text-[#EC3460]">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-[#EC3460] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                KOREAN SKINCARE LIGHTING &amp; ENHANCERS
              </span>

              {/* Brightness */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Dewy Luminosity (Exposure)</span>
                  <span className="font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                  className="w-full accent-[#EC3460] cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Micro-Dermal Contrast</span>
                  <span className="font-mono">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                  className="w-full accent-[#EC3460] cursor-pointer"
                />
              </div>

              {/* Warmth (Rose Peach Tint) */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Seoul Rose Warmth</span>
                  <span className="font-mono">{warmth > 0 ? `+${warmth}` : warmth}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="40"
                  value={warmth}
                  onChange={(e) => setWarmth(parseInt(e.target.value, 10))}
                  className="w-full accent-[#EC3460] cursor-pointer"
                />
              </div>

              {/* Sharpen Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-medium text-slate-700">Crisp Packaging Sharpening</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharpen}
                    onChange={(e) => setSharpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EC3460]"></div>
                </label>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {/* If onApplyImage provided, show high-visibility Apply button */}
              {onApplyImage && result && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>Apply Processed Picture to Product</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {/* Upload to Server */}
                <button
                  type="button"
                  disabled={!result || isUploading}
                  onClick={handleUploadToServer}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <span>Uploading...</span>
                  ) : uploadedUrl ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Uploaded!</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload size={14} />
                      <span>Upload to Cloud</span>
                    </>
                  )}
                </button>

                {/* Download */}
                <button
                  type="button"
                  disabled={!result}
                  onClick={handleDownload}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>

              {/* Copy URL / Cloud URL banner */}
              {uploadedUrl && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
                  <span className="font-mono truncate mr-2">{uploadedUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="shrink-0 text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
