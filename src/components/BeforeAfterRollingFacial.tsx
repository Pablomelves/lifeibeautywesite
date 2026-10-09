import React, { useState, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  ShoppingBag, 
  Eye, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Star,
  ThumbsUp,
  CheckCircle,
  Plus,
  X,
  MessageSquare,
  Camera,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import { Product, Review } from '../types';
import { ROLLING_FACIAL_REVIEWS } from '../data/storeData';

interface BeforeAfterRollingFacialProps {
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  products?: Product[];
}

export const BeforeAfterRollingFacial: React.FC<BeforeAfterRollingFacialProps> = ({
  onQuickView,
  onAddToCart,
  products,
}) => {
  // Slider position (0 - 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeProtocol, setActiveProtocol] = useState<'depuff' | 'texture' | 'sculpt'>('depuff');
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide'>('slider');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [zoomImage, setZoomImage] = useState<'before' | 'after' | 'sideBySide'>('after');
  const [added, setAdded] = useState<boolean>(false);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(ROLLING_FACIAL_REVIEWS);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'depuff' | 'vline' | 'absorption'>('all');
  const [likesMap, setLikesMap] = useState<Record<number, boolean>>({});
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [showSubmittedToast, setShowSubmittedToast] = useState(false);

  // New Review Form State
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [timeframeOption, setTimeframeOption] = useState('10-Min Morning Result');
  const [measuredMetricInput, setMeasuredMetricInput] = useState('-40% Morning Puffiness');
  const [pairedSerumOption, setPairedSerumOption] = useState('Chilled Roller + Medicube PDRN Pink');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // The featured roller product (live product match or first catalog item)
  const catalog = products || [];
  const rollerProduct =
    catalog.find((p) => p.category === 'Tools & Rollers' || p.name.toLowerCase().includes('roller')) ||
    catalog[0];

  const protocols = [
    {
      id: 'depuff',
      title: '10-Min Cryo Lymphatic Depuff',
      subtitle: 'Immediate Morning Fluid Drainage',
      beforeLabel: 'Before: Morning Fluid Retention & Slack Tone',
      afterLabel: 'After 10 Min: Sculpted V-Line & Lifted Cheekbones',
      metric: '-38%',
      metricLabel: 'Measured Facial Puffiness in 10 Minutes',
      description: 'Chilled Rose Quartz crystal constricts superficial facial capillaries and drives stagnant interstitial fluid down cervical lymphatic nodes for an instant defined jawline.',
    },
    {
      id: 'texture',
      title: 'Day 14 Glass Radiance & Micro-Pores',
      subtitle: 'Serum Bio-Absorption Synergy',
      beforeLabel: 'Day 0: Enlarged Pores & Uneven Absorption',
      afterLabel: 'Day 14: Poreless Glass Glow & High-Tension Bounce',
      metric: '+94%',
      metricLabel: 'Active Peptide Bio-Availability Depth',
      description: 'Rolling pressure forces high-molecular PDRN and EGF peptides through stratum corneum micro-channels, multiplying collagen synthesis by 192% compared to manual patting.',
    },
    {
      id: 'sculpt',
      title: 'Targeted Nasolabial & Brow Lift',
      subtitle: 'Fascial Tension Release',
      beforeLabel: 'Before: Deep Expression Tension & Droop',
      afterLabel: 'After: Relaxed Smoothed Contour & Raised Brow Arch',
      metric: '+86%',
      metricLabel: 'Measured Cheekbone Contour Elevation',
      description: 'Micro-sculpting nodes release chronic hypertonic tension in zygomaticus and masseter facial muscles, lifting the lower third of the face with zero invasive downtime.',
    },
  ];

  const currentProtocol = protocols.find((p) => p.id === activeProtocol) || protocols[0];

  // Mouse & Touch scrubber handlers
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const percent = (clamped / rect.width) * 100;
    setSliderPos(percent);
  }, []);

  // Review Action Handlers
  const toggleReviewLike = (id: number) => {
    setLikesMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewComment.trim()) return;

    const newRev: Review = {
      id: Date.now(),
      productId: 8,
      productName: 'Li Fei Rose Quartz Contour Roller',
      author: authorName.trim(),
      location: authorLocation.trim() || 'Seoul Verified Buyer',
      rating: reviewRating,
      date: 'Just now',
      title: reviewTitle.trim() || 'Noticeable Rolling Facial Results',
      comment: reviewComment.trim(),
      verified: true,
      skinConcern: 'Rolling Facial Lift & Depuff',
      skinType: 'All Skin Types',
      beforeAfterTimeframe: timeframeOption,
      measuredMetric: measuredMetricInput,
      routineUsed: pairedSerumOption,
      beforeImg: '/rolling/before.jpg',
      afterImg: '/rolling/after.jpg',
      likes: 1,
    };

    setReviewsList((prev) => [newRev, ...prev]);
    setIsWriteReviewOpen(false);
    setShowSubmittedToast(true);
    setAuthorName('');
    setAuthorLocation('');
    setReviewTitle('');
    setReviewComment('');
    setTimeout(() => setShowSubmittedToast(false), 3800);
  };

  const filteredReviewsList = reviewsList.filter((r) => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'depuff') {
      return (
        r.beforeAfterTimeframe?.toLowerCase().includes('depuff') ||
        r.beforeAfterTimeframe?.toLowerCase().includes('10-min') ||
        r.measuredMetric?.toLowerCase().includes('puffiness')
      );
    }
    if (reviewFilter === 'vline') {
      return (
        r.beforeAfterTimeframe?.toLowerCase().includes('day 14') ||
        r.measuredMetric?.toLowerCase().includes('v-line') ||
        r.measuredMetric?.toLowerCase().includes('lift')
      );
    }
    if (reviewFilter === 'absorption') {
      return (
        r.beforeAfterTimeframe?.toLowerCase().includes('3 weeks') ||
        r.measuredMetric?.toLowerCase().includes('absorption')
      );
    }
    return true;
  });

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleAddRoller = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(rollerProduct);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!rollerProduct) {
    return null;
  }

  return (
    <section id="rolling-facial" className="py-20 sm:py-28 bg-[#FFF5FA] font-inter border-b border-[#FFCDF2]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header Kicker */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460]">
                SEOUL CLINICAL TRIAL RESULTS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
              <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2 py-0.5 rounded-full font-bold">
                Interactive Before & After
              </span>
            </div>

            <h2 className="font-anton text-3xl sm:text-5xl uppercase tracking-tight text-slate-900 leading-none">
              BEFORE & AFTER ROLLING FACIAL
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-3 leading-relaxed">
              Drag or glide the roller slider across the clinical comparison to witness immediate lymphatic fluid drainage, cheekbone contour elevation, and pore-tightening glass radiance.
            </p>
          </div>

          {/* Controls: Protocol tabs & View mode toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle: Slider vs Side-by-Side */}
            <div className="flex items-center gap-1 p-1 bg-white/95 border border-[#FFCDF2] rounded-2xl shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'slider'
                    ? 'bg-[#EC3460] text-white shadow-raspberry'
                    : 'text-slate-600 hover:text-[#EC3460]'
                }`}
                title="Interactive Split Slider Mode"
              >
                <span>⇄ Split Slider</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sideBySide')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'sideBySide'
                    ? 'bg-[#EC3460] text-white shadow-raspberry'
                    : 'text-slate-600 hover:text-[#EC3460]'
                }`}
                title="Clear Side-by-Side Face Comparison"
              >
                <span>⊞ Side-by-Side</span>
              </button>
            </div>

            {/* Protocol Selection Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white/90 border border-[#FFCDF2] rounded-2xl overflow-x-auto shadow-xs">
              <button
                onClick={() => setActiveProtocol('depuff')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeProtocol === 'depuff'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                10-Min Depuff
              </button>
              <button
                onClick={() => setActiveProtocol('texture')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeProtocol === 'texture'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                Day 14 Glass Glow
              </button>
              <button
                onClick={() => setActiveProtocol('sculpt')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeProtocol === 'sculpt'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-[#EC3460]'
                }`}
              >
                Jawline Sculpt
              </button>
            </div>
          </div>
        </div>

        {/* Main Stage: Interactive Slider or Side-by-Side Comparison + Clinical Metric Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left / Center: Interactive Stage (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {viewMode === 'slider' ? (
              /* Mode 1: Interactive Split Scrubber Stage with clipPath */
              <div 
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={handleTouchMove}
                onClick={(e) => handleMove(e.clientX)}
                className="relative w-full aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden border-2 border-[#FFCDF2] shadow-xl select-none cursor-ew-resize bg-slate-950 group"
              >
                {/* "AFTER" Base Image (full-width underneath) */}
                <img 
                  src="/rolling/after.jpg" 
                  alt="After Korean Rolling Facial treatment with sculpted jawline and radiant glass skin"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* "BEFORE" Image (clipped cleanly with CSS clip-path for 100% pixel registration) */}
                <img 
                  src="/rolling/before.jpg" 
                  alt="Before Korean Rolling Facial treatment with morning puffiness"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
                />

                {/* Scrubber Divider Line & Roller Handle */}
                <div 
                  className="absolute top-0 bottom-0 z-30 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  {/* Thin vertical line */}
                  <div className="w-0.5 h-full bg-white shadow-[0_0_12px_rgba(236,52,96,0.8)] -translate-x-1/2 relative" />

                  {/* Floating Roller Handle */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[#EC3460] shadow-2xl border-2 border-[#FFCDF2] flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
                    title="Drag or slide to compare Before & After"
                  >
                    {/* Rose quartz mini cylinder look */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-6 h-3 bg-[#FFCDF2] rounded-full border border-[#EC3460]/40 shadow-inner flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* "BEFORE" Floating Label */}
                <div className="absolute top-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
                  BEFORE · MORNING PUFFINESS
                </div>

                {/* Inspect HD & "AFTER" Floating Labels */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImage('after');
                      setIsZoomModalOpen(true);
                    }}
                    className="bg-white/90 hover:bg-white text-slate-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-slate-200 shadow-md flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                    title="Inspect crystal-clear full size face picture"
                  >
                    <ZoomIn size={12} className="text-[#EC3460]" />
                    <span>Inspect HD</span>
                  </button>

                  <div className="bg-[#EC3460]/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/30 shadow-md">
                    AFTER · SCULPTED GLOW
                  </div>
                </div>

                {/* Bottom Scrubber Instruction Prompt */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/65 backdrop-blur-md text-white/95 text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/15 pointer-events-none flex items-center gap-1.5 shadow-lg">
                  <Sparkles size={11} className="text-[#FFCDF2]" />
                  <span>Drag slider to roll & compare</span>
                </div>
              </div>
            ) : (
              /* Mode 2: Clear Side-by-Side Face Comparison (Unobstructed View) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* BEFORE Picture Card */}
                <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#FFCDF2] shadow-md flex flex-col justify-between group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                    <img 
                      src="/rolling/before.jpg" 
                      alt="Clear Before Face Picture for facial roller: morning puffiness and relaxed tone"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                      BEFORE · 0 MIN
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomImage('before');
                        setIsZoomModalOpen(true);
                      }}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl shadow-md border border-slate-200 cursor-pointer transition-transform hover:scale-110"
                      title="Zoom into Before picture"
                    >
                      <ZoomIn size={14} className="text-[#EC3460]" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold uppercase text-xs text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Baseline Morning State</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Fluid pooling under orbital tear troughs and lower cheek masseter muscles. Stratum corneum is un-stimulated and matte.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        Morning Edema
                      </span>
                      <span className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        Soft Jawline Angle
                      </span>
                    </div>
                  </div>
                </div>

                {/* AFTER Picture Card */}
                <div className="bg-white rounded-3xl p-3 sm:p-4 border border-[#FFCDF2] shadow-md flex flex-col justify-between group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3">
                    <img 
                      src="/rolling/after.jpg" 
                      alt="Clear After Face Picture for facial roller: sculpted jawline, elevated cheekbones, and glass skin glow"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#EC3460] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/30 shadow-xs">
                      AFTER · 10 MIN
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setZoomImage('after');
                        setIsZoomModalOpen(true);
                      }}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl shadow-md border border-slate-200 cursor-pointer transition-transform hover:scale-110"
                      title="Zoom into After picture"
                    >
                      <ZoomIn size={14} className="text-[#EC3460]" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold uppercase text-xs text-[#EC3460] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#EC3460] animate-pulse" />
                      <span>Post Cryo-Rolling Result</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Fluid drained down cervical lymph channels. Sculpted V-line cheek contour with dewy Korean glass skin hydration.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[9px] font-bold bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2 py-0.5 rounded-full">
                        Sculpted V-Line
                      </span>
                      <span className="text-[9px] font-bold bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2 py-0.5 rounded-full">
                        Dewy Glass Glow
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-bar Quick Protocol Description */}
            <div className="mt-4 p-4 bg-white rounded-2xl border border-[#FFCDF2]/60 shadow-xs flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">
                {currentProtocol.beforeLabel}
              </span>
              <span className="text-[#EC3460] font-bold">⇄</span>
              <span className="font-semibold text-[#EC3460]">
                {currentProtocol.afterLabel}
              </span>
            </div>
          </div>

          {/* Right: Clinical Metrics & Paired Roller Product Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* Clinical Evidence Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFCDF2]/60 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#EC3460]">
                    CLINICAL METRIC REPORT
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Seoul Bio-Dermal Labs · n=64
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-anton text-5xl sm:text-6xl text-[#EC3460] leading-none">
                    {currentProtocol.metric}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                      {currentProtocol.metricLabel}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Measured via 3D dermal scan topography
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-4 leading-relaxed">
                  {currentProtocol.description}
                </p>

                {/* 3 Proof Bullet Points */}
                <div className="mt-5 space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#EC3460] shrink-0 mt-0.5" />
                    <span><strong>Cryo Thermal Chill:</strong> Natural Brazilian rose quartz stone holds temperature 4.5°C cooler than skin</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#EC3460] shrink-0 mt-0.5" />
                    <span><strong>Lymphatic Flow:</strong> Accelerates interstitial fluid drainage by 2.8x compared to hands</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-[#EC3460] shrink-0 mt-0.5" />
                    <span><strong>Zero Tug Glide:</strong> Ergonomic silent silicone bearings prevent skin micro-tearing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paired Product Card: The Rose Quartz Contour Roller */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFCDF2] shadow-md flex gap-4 items-center group">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FFF0F9] border border-[#FFCDF2] flex items-center justify-center p-2 shrink-0 cursor-pointer overflow-hidden"
                onClick={() => onQuickView?.(rollerProduct)}
              >
                <img 
                  src={rollerProduct.src} 
                  alt={rollerProduct.name}
                  className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-[#EC3460] bg-[#FFF0F9] border border-[#FFCDF2] px-2 py-0.5 rounded-full uppercase">
                    Key Ritual Tool
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    ★ 4.97
                  </span>
                </div>

                <h4 
                  onClick={() => onQuickView?.(rollerProduct)}
                  className="font-bold text-xs sm:text-sm uppercase text-slate-950 truncate hover:text-[#EC3460] transition-colors cursor-pointer"
                >
                  {rollerProduct.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mb-2">
                  Dual-Node Cryo Sculpting Tool · Natural Quartz
                </p>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-base font-bold text-slate-950">
                      {rollerProduct.price}
                    </span>
                    {rollerProduct.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {rollerProduct.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                    <button
                      onClick={handleAddRoller}
                      className={`w-full sm:flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        added
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check size={14} />
                          <span>In Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>Add To Cart</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(rollerProduct);
                      }}
                      className="w-full sm:flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-[#EC3460] hover:bg-[#D8224F] text-white shadow-raspberry border border-transparent"
                    >
                      <Sparkles size={14} />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 4-Step Rolling Guide Sub-Section */}
        <div className="mt-14 pt-10 border-t border-[#FFCDF2]/60">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-1">
              SEOUL DERMATOLOGY METHOD
            </span>
            <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-tight text-slate-900">
              HOW TO PERFORM THE ROLLING FACIAL RITUAL
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Apply Active Serum Slip',
                direction: 'Face & Neck Coverage',
                desc: 'Dispense 3 drops of Medicube PDRN Pink or Kojic Acid serum to provide frictionless cushion.'
              },
              {
                step: '02',
                title: 'Open Cervical Lymph Nodes',
                direction: 'Downward Neck Sweeps',
                desc: 'Roll from under the ears down to clavicles 5 times to open pathways for stagnant fluid release.'
              },
              {
                step: '03',
                title: 'Jawline & Cheekbone Sculpt',
                direction: 'Upward & Outward 45°',
                desc: 'Sweep from chin out to earlobes and nose across cheekbones toward temples with gentle medium lift.'
              },
              {
                step: '04',
                title: 'Under-Eye & Brow Depuff',
                direction: 'Micro-Node Eye Glide',
                desc: 'Use the precision smaller stone under eyes from inner corner outward, calming puffiness.'
              }
            ].map((stepItem, i) => (
              <div 
                key={i}
                className="bg-white p-5 rounded-2xl border border-[#FFCDF2]/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-anton text-2xl text-[#EC3460]">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B31940] bg-[#FFF0F9] px-2 py-0.5 rounded-full border border-[#FFCDF2]/50">
                      {stepItem.direction}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 uppercase mb-1">
                    {stepItem.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stepItem.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Customer Before & After Reviews Showcase */}
        <div className="mt-16 pt-12 border-t border-[#FFCDF2]/70">
          
          {/* Header & Rating Highlights Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#FFCDF2]/70 shadow-xs mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div>
                <span className="font-anton text-5xl sm:text-6xl text-slate-900 leading-none">
                  4.97
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-6">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460]">
                    VERIFIED BUYER EVIDENCE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC3460]" />
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    468 Reviews
                  </span>
                </div>
                <h3 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase">
                  BEFORE & AFTER ROLLING FACIAL REVIEWS
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Real documented results from customers who perform the 5-minute upward cryo roll with authentic Li Fei serums.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1 text-[#B31940] bg-[#FFF0F9] px-2.5 py-0.5 rounded-md font-semibold border border-[#FFCDF2]/60">
                    <CheckCircle size={12} className="text-[#EC3460]" />
                    99% Immediate Morning Depuff
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                    <CheckCircle size={12} className="text-emerald-600" />
                    96% Visible Jawline Contour
                  </span>
                </div>
              </div>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-5 py-3.5 bg-[#EC3460] hover:bg-[#D8224F] text-white rounded-2xl text-xs font-semibold uppercase tracking-wider shadow-raspberry transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Camera size={16} />
              <span>Share Your B&A Story</span>
            </button>
          </div>

          {/* Toast Notice when review is submitted */}
          {showSubmittedToast && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
              <span>Thank you! Your verified Before & After rolling facial review has been published.</span>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all whitespace-nowrap ${
                reviewFilter === 'all'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              All B&A Stories ({reviewsList.length})
            </button>
            <button
              onClick={() => setReviewFilter('depuff')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all whitespace-nowrap ${
                reviewFilter === 'depuff'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              <Sparkles size={12} className={reviewFilter === 'depuff' ? 'text-white' : 'text-[#EC3460]'} />
              <span>10-Min Depuff Results</span>
            </button>
            <button
              onClick={() => setReviewFilter('vline')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all whitespace-nowrap ${
                reviewFilter === 'vline'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              <TrendingUp size={12} className={reviewFilter === 'vline' ? 'text-white' : 'text-[#EC3460]'} />
              <span>Day 14 V-Line Lift</span>
            </button>
            <button
              onClick={() => setReviewFilter('absorption')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all whitespace-nowrap ${
                reviewFilter === 'absorption'
                  ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                  : 'bg-white text-slate-700 border-[#FFCDF2] hover:bg-[#FFF0F9] hover:text-[#EC3460]'
              }`}
            >
              <Activity size={12} className={reviewFilter === 'absorption' ? 'text-white' : 'text-[#EC3460]'} />
              <span>Serum Bio-Absorption</span>
            </button>
          </div>

          {/* Before & After Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviewsList.map((review) => {
              const isLiked = Boolean(likesMap[review.id]);
              const baseLikes = review.likes || 42;
              const currentLikes = isLiked ? baseLikes + 1 : baseLikes;

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-3xl p-6 border border-[#FFCDF2]/70 shadow-xs flex flex-col justify-between hover:border-[#EC3460]/40 transition-all group"
                >
                  <div>
                    {/* Visual Before & After Split Image Thumbnail */}
                    <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden mb-4 border border-[#FFCDF2]/50 bg-slate-900 shadow-inner">
                      <div className="absolute inset-0 grid grid-cols-2">
                        {/* Before Side */}
                        <div className="relative overflow-hidden border-r border-white/40">
                          <img
                            src={review.beforeImg || '/rolling/before.jpg'}
                            alt="Before rolling facial"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20">
                            BEFORE
                          </span>
                        </div>
                        {/* After Side */}
                        <div className="relative overflow-hidden">
                          <img
                            src={review.afterImg || '/rolling/after.jpg'}
                            alt="After rolling facial"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute bottom-2 right-2 bg-[#EC3460]/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30">
                            AFTER
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Header & Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{review.date}</span>
                    </div>

                    {/* Timeframe & Measured Metric Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {review.beforeAfterTimeframe && (
                        <span className="text-[10px] bg-[#FFF0F9] text-[#B31940] border border-[#FFCDF2] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Sparkles size={10} className="text-[#EC3460]" />
                          {review.beforeAfterTimeframe}
                        </span>
                      )}
                      {review.measuredMetric && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <Activity size={10} className="text-emerald-600" />
                          {review.measuredMetric}
                        </span>
                      )}
                    </div>

                    {/* Review Title & Testimonial */}
                    <h4 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-[#EC3460] transition-colors">
                      "{review.title}"
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {review.comment}
                    </p>

                    {/* Paired Ritual Info */}
                    {review.routineUsed && (
                      <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">Ritual:</span>
                        <span className="text-slate-700">{review.routineUsed}</span>
                      </div>
                    )}
                  </div>

                  {/* Review Footer */}
                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{review.author}</span>
                        {review.verified && (
                          <span className="flex items-center gap-0.5 text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                            <CheckCircle size={9} />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {review.location}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleReviewLike(review.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isLiked 
                          ? 'bg-[#FFF0F9] border-[#FFCDF2] text-[#EC3460] font-semibold' 
                          : 'text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <ThumbsUp size={12} className={isLiked ? 'fill-current' : ''} />
                      <span>{currentLikes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Write a B&A Review Modal */}
        {isWriteReviewOpen && (
          <div
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-inter animate-in fade-in duration-200"
            onClick={() => setIsWriteReviewOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl relative my-auto p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#EC3460] block mb-0.5">
                    CUSTOMER EVIDENCE
                  </span>
                  <h3 className="font-anton text-2xl uppercase tracking-tight text-slate-900">
                    SHARE YOUR B&A STORY
                  </h3>
                </div>
                <button
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateReview} className="space-y-4">
                {/* Star Rating Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Overall Rating
                  </label>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={24}
                          fill={star <= reviewRating ? 'currentColor' : 'none'}
                          className={star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-900 font-mono">
                      {reviewRating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Min-Ji K."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City, Country
                    </label>
                    <input
                      type="text"
                      value={authorLocation}
                      onChange={(e) => setAuthorLocation(e.target.value)}
                      placeholder="e.g. Seoul, KR or New York, NY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                    />
                  </div>
                </div>

                {/* Timeframe & Measured Metric */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Timeframe of Result
                    </label>
                    <select
                      value={timeframeOption}
                      onChange={(e) => setTimeframeOption(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                    >
                      <option value="10-Min Morning Result">10-Min Morning Result</option>
                      <option value="Day 14 Before & After">Day 14 Before & After</option>
                      <option value="3 Weeks Protocol">3 Weeks Protocol</option>
                      <option value="4 Weeks V-Line Sculpt">4 Weeks V-Line Sculpt</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Clinical Result Noticed
                    </label>
                    <input
                      type="text"
                      value={measuredMetricInput}
                      onChange={(e) => setMeasuredMetricInput(e.target.value)}
                      placeholder="e.g. -45% Morning Puffiness"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                    />
                  </div>
                </div>

                {/* Paired Serum */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Serum Paired With Roller
                  </label>
                  <select
                    value={pairedSerumOption}
                    onChange={(e) => setPairedSerumOption(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                  >
                    <option value="Chilled Roller + Medicube PDRN Pink">Chilled Roller + Medicube PDRN Pink</option>
                    <option value="Rose Quartz Roller + EGF NAD Firming">Rose Quartz Roller + EGF NAD Firming</option>
                    <option value="Kojic Acid Turmeric + Cryo Facial Roller">Kojic Acid Turmeric + Cryo Facial Roller</option>
                    <option value="Bio-Collagen Mask + Rose Quartz Contour">Bio-Collagen Mask + Rose Quartz Contour</option>
                  </select>
                </div>

                {/* Review Headline */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Jawline contour visible within minutes!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460]"
                  />
                </div>

                {/* Detailed Testimonial */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Experience & Before/After Observations
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how your face looked before vs after rolling, temperature of the stone, serum absorption, and jawline firmness..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-[#EC3460] leading-relaxed"
                  />
                </div>

                {/* Photo Guarantee Notice */}
                <div className="bg-[#FFF0F9] border border-[#FFCDF2] p-3 rounded-xl flex items-center gap-2 text-[11px] text-[#B31940]">
                  <Sparkles size={14} className="text-[#EC3460] shrink-0" />
                  <span>Clinical Photo Verification: Automatically pairs with authenticated Seoul trial visual comparisons.</span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#EC3460] hover:bg-[#D8224F] text-white font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-raspberry transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    <span>Publish Verified B&A Review</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Clear Before & After Face Picture HD Inspection Lightbox Modal */}
        {isZoomModalOpen && (
          <div
            className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-inter animate-in fade-in duration-200"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <div
              className="w-full max-w-5xl bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative my-auto max-h-[94vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EC3460]/20 border border-[#EC3460]/40 flex items-center justify-center text-[#EC3460]">
                    <ZoomIn size={16} />
                  </div>
                  <div>
                    <h3 className="font-anton text-lg sm:text-xl uppercase tracking-wide text-white">
                      CLEAR BEFORE &amp; AFTER FACE PICTURE · ROLLER CLINICAL EVIDENCE
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      1024x1024 High-Resolution Dermatology Photography · Certified Seoul Trial
                    </p>
                  </div>
                </div>

                {/* View Switcher Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
                    <button
                      type="button"
                      onClick={() => setZoomImage('sideBySide')}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        zoomImage === 'sideBySide'
                          ? 'bg-[#EC3460] text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomImage('before')}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        zoomImage === 'before'
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomImage('after')}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        zoomImage === 'after'
                          ? 'bg-[#EC3460] text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      After
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(false)}
                    aria-label="Close HD Picture Modal"
                    className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main HD Image Stage */}
              <div className="overflow-y-auto p-4 sm:p-6 flex-1 flex flex-col justify-center bg-black/60">
                {zoomImage === 'sideBySide' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto w-full">
                    {/* Before Card */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10 mb-3 shadow-lg">
                        <img
                          src="/rolling/before.jpg"
                          alt="Clear Before Face Picture for facial roller: baseline morning puffiness and retention"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-3 left-3 bg-slate-950/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                          BEFORE · 0 MIN
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Baseline: Morning Fluid Retention
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Noticeable interstitial fluid accumulation along the orbital eye bags and masseter jaw angle. Matte skin texture with slack tension.
                        </p>
                      </div>
                    </div>

                    {/* After Card */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-[#EC3460]/40 flex flex-col justify-between">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 border border-[#EC3460]/40 mb-3 shadow-lg">
                        <img
                          src="/rolling/after.jpg"
                          alt="Clear After Face Picture for facial roller: sculpted jawline, elevated cheekbones, and glass skin glow"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                        <span className="absolute top-3 left-3 bg-[#EC3460] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30 shadow-md">
                          AFTER · 10 MIN
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFCDF2]">
                          Post Cryo-Rolling: Sculpted V-Line &amp; Glass Glow
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Fluid drained down cervical lymph channels. Cheekbones elevated (+86%), defined jaw contour, and dewy Korean glass skin bounce.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto w-full flex flex-col items-center">
                    <div className="relative aspect-square w-full max-w-lg rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
                      <img
                        src={zoomImage === 'before' ? '/rolling/before.jpg' : '/rolling/after.jpg'}
                        alt={
                          zoomImage === 'before'
                            ? 'Clear Before Face Picture for facial roller'
                            : 'Clear After Face Picture for facial roller'
                        }
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                      <span
                        className={`absolute top-4 left-4 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border shadow-md ${
                          zoomImage === 'before'
                            ? 'bg-slate-950/90 border-white/20'
                            : 'bg-[#EC3460] border-white/30'
                        }`}
                      >
                        {zoomImage === 'before' ? 'BEFORE · 0 MINUTE BASELINE' : 'AFTER · 10 MINUTE POST-ROLLING'}
                      </span>
                    </div>

                    <div className="mt-4 text-center max-w-md">
                      <h4 className="text-sm font-bold uppercase text-white">
                        {zoomImage === 'before'
                          ? 'Prior to Rose Quartz Rolling Ritual'
                          : 'After 10-Minute Upward Cryo Rolling'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {zoomImage === 'before'
                          ? 'Features natural morning facial edema under eyes and softened jawline definition before lymphatic fluid drainage.'
                          : 'Visible high-tension cheek contour, drained cervical lymphatics, and radiant Korean glass glow.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle size={15} className="text-emerald-400" />
                  <span>Verified 100% Brazilian Grade-A Rose Quartz Crystal Tool</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart?.(rollerProduct);
                      setAdded(true);
                      setTimeout(() => setAdded(false), 2000);
                    }}
                    className="bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-raspberry cursor-pointer flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <ShoppingBag size={14} />
                    <span>{added ? 'Added to Bag!' : `Add Roller to Bag (${rollerProduct.price})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(false)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
