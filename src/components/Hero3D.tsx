import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Layers, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  ShoppingBag,
  Heart,
  Scale
} from 'lucide-react';
import { Product } from '../types';

const SLIDE_TRANSITION_MS = 350;
const AUTO_SLIDE_INTERVAL_MS = 4000;

interface Hero3DProps {
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onExploreCatalog: () => void;
  products?: Product[];
  autoSlide?: boolean;
  wishlistIds?: number[];
  onToggleWishlist?: (productId: number) => void;
  comparisonIds?: number[];
  onToggleComparison?: (productId: number) => void;
}

export const Hero3D: React.FC<Hero3DProps> = ({
  onAddToCart,
  onQuickView,
  onExploreCatalog,
  products,
  autoSlide = true,
  wishlistIds = [],
  onToggleWishlist,
  comparisonIds = [],
  onToggleComparison,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [justWishlisted, setJustWishlisted] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 'desktop';
      if (window.innerWidth >= 640) return 'tablet';
    }
    return 'mobile';
  });

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  // 3D Parallax & Tilt State
  const [tilt3DEnabled, setTilt3DEnabled] = useState<boolean>(true);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [isFlipped3D, setIsFlipped3D] = useState<boolean>(false);

  // Swipe / Drag detection
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const SWIPE_THRESHOLD = 50;

  // Mouse / Touch Tilt Physics (normalized -1 to 1)
  const targetTilt = useRef({ x: 0, y: 0 });
  const [currentTilt, setCurrentTilt] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Take all available products for the 3D Hero Carousel
  const heroProducts = products || [];
  const activeProduct = heroProducts[activeIndex] || heroProducts[0];

  const isWishlisted = activeProduct ? wishlistIds.includes(activeProduct.id) : false;

  // Trigger pop animation when this product is wishlisted
  useEffect(() => {
    if (isWishlisted) {
      setJustWishlisted(true);
      const timer = setTimeout(() => setJustWishlisted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  // Navigate carousel
  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped3D(false);
    setDragX(0);

    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % heroProducts.length);
    } else {
      setActiveIndex((prev) => (prev + heroProducts.length - 1) % heroProducts.length);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, SLIDE_TRANSITION_MS);
  }, [isAnimating, heroProducts.length]);

  // Auto-slide effect
  useEffect(() => {
    if (!autoSlide) return;
    const interval = setInterval(() => {
      if (!isAnimating) {
        navigate('next');
      }
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeIndex, isAnimating, navigate, autoSlide]);

  // Scroll-based navigation effect
  const lastScrollY = useRef(0);
  const scrollAccumulator = useRef(0);
  const SCROLL_THRESHOLD = 200;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          lastScrollY.current = currentScrollY;
          return;
        }
      }
      scrollAccumulator.current += diff;
      if (Math.abs(scrollAccumulator.current) > SCROLL_THRESHOLD && !isAnimating) {
        if (scrollAccumulator.current > 0) navigate('next');
        else navigate('prev');
        scrollAccumulator.current = 0;
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAnimating, navigate]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setDeviceType('desktop');
      else if (window.innerWidth >= 640) setDeviceType('tablet');
      else setDeviceType('mobile');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth 3D lerp loop
  useEffect(() => {
    const loop = () => {
      setCurrentTilt((prev) => {
        const factor = 0.08;
        const dx = targetTilt.current.x - prev.x;
        const dy = targetTilt.current.y - prev.y;

        if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
          return prev;
        }

        return {
          x: prev.x + dx * factor,
          y: prev.y + dy * factor,
        };
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isDragging.current && dragStartX.current !== null) {
      const diff = e.clientX - dragStartX.current;
      setDragX(diff);
    }
    if (!tilt3DEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetTilt.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    if (isDragging.current && dragStartX.current !== null) {
      const diff = e.clientX - dragStartX.current;
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) navigate('prev');
        else navigate('next');
      } else {
        setDragX(0);
      }
    }
    dragStartX.current = null;
    isDragging.current = false;
    targetTilt.current = { x: 0, y: 0 };
  };

  const handleMouseLeave = () => {
    dragStartX.current = null;
    isDragging.current = false;
    targetTilt.current = { x: 0, y: 0 };
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length > 0) {
      dragStartX.current = e.touches[0].clientX;
      isDragging.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    if (isDragging.current && dragStartX.current !== null) {
      const diff = touch.clientX - dragStartX.current;
      setDragX(diff);
    }
    if (!tilt3DEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;
    targetTilt.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (isDragging.current && dragStartX.current !== null && e.changedTouches.length > 0) {
      const diff = e.changedTouches[0].clientX - dragStartX.current;
      if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) navigate('prev');
        else navigate('next');
      } else {
        setDragX(0);
      }
    }
    dragStartX.current = null;
    isDragging.current = false;
    targetTilt.current = { x: 0, y: 0 };
  };

  // Derived carousel indices
  const centerIndex = activeIndex;
  const leftIndex = (activeIndex + heroProducts.length - 1) % heroProducts.length;
  const rightIndex = (activeIndex + 1) % heroProducts.length;

  // 3D Carousel Positioning: Fills the page and covers GLOW with subtle mouse-follow parallax
  const getProduct3DStyles = (index: number) => {
    const transition = ['transform', 'filter', 'opacity', 'left', 'width', 'height', 'top']
      .map((property) => `${property} ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`)
      .join(', ');
    const willChange = 'transform, filter, opacity, left';

    // Center product: fills page, covers GLOW, subtle mouse-follow parallax movement for deep-space feel
    if (index === centerIndex) {
      // Subtle mouse-follow translation (moves product smoothly with cursor)
      const mouseParallaxX = currentTilt.x * (isMobile ? 14 : 32) + dragX;
      const mouseParallaxY = currentTilt.y * (isMobile ? 10 : 22);

      // Deep perspective rotation
      const rotX = -currentTilt.y * 11;
      const rotY = currentTilt.x * 13;
      const transZ = 55;

      let width = '90%';
      let height = '80%';
      let scale = 1.1;

      if (isMobile) {
        width = '100%';
        height = '90%';
        scale = 1.05;
      } else if (isTablet) {
        width = '95%';
        height = '85%';
        scale = 1.08;
      }

      return {
        left: '50%',
        top: '50%',
        width,
        maxWidth: isDesktop ? '1680px' : 'none',
        height,
        transform: `translate(calc(-50% + ${mouseParallaxX}px), calc(-50% + ${mouseParallaxY}px)) translateZ(${transZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
        opacity: 1,
        filter: 'none',
        zIndex: 25,
        transition: isAnimating ? transition : `opacity ${SLIDE_TRANSITION_MS}ms, filter ${SLIDE_TRANSITION_MS}ms`,
        willChange,
      };
    }

    // Left product: subtle deep-space offset (hidden unless animating)
    if (index === leftIndex) {
      const leftParallaxX = currentTilt.x * 16 + (dragX < 0 ? 0 : dragX * 0.8);
      const leftParallaxY = currentTilt.y * 10;

      let width = '40%';
      let height = '52%';

      if (isMobile) {
        width = '45%';
        height = '38%';
      }

      return {
        left: isMobile ? '4%' : '8%',
        top: '50%',
        width,
        maxWidth: '700px',
        height,
        transform: `translate(calc(-50% + ${leftParallaxX}px), calc(-50% + ${leftParallaxY}px)) translateZ(-340px) rotateY(${32 + currentTilt.x * 5}deg) scale(0.6)`,
        opacity: isAnimating ? 0.35 : 0,
        filter: 'blur(3px)',
        zIndex: 10,
        transition,
        willChange,
      };
    }

    // Right product: subtle deep-space offset
    const rightParallaxX = currentTilt.x * 16 + (dragX > 0 ? 0 : dragX * 0.8);
    const rightParallaxY = currentTilt.y * 10;

    let rWidth = '40%';
    let rHeight = '52%';

    if (isMobile) {
      rWidth = '45%';
      rHeight = '38%';
    }

    return {
      left: isMobile ? '96%' : '92%',
      top: '50%',
      width: rWidth,
      maxWidth: '700px',
      height: rHeight,
      transform: `translate(calc(-50% + ${rightParallaxX}px), calc(-50% + ${rightParallaxY}px)) translateZ(-340px) rotateY(${-32 + currentTilt.x * 5}deg) scale(0.6)`,
      opacity: isAnimating ? 0.35 : 0,
      filter: 'blur(3px)',
      zIndex: 10,
      transition,
      willChange,
    };
  };

  if (!heroProducts || heroProducts.length === 0 || !activeProduct) {
    return (
      <section 
        id="hero"
        className="relative w-full overflow-hidden flex flex-col justify-center items-center font-inter bg-slate-900 text-white min-h-[500px] py-20 px-4"
      >
        <div className="max-w-md text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EC3460] block mb-3">
            LI FEI BEAUTY · SEOUL DIRECT
          </span>
          <h1 className="font-anton text-4xl sm:text-5xl uppercase tracking-tight text-white mb-4">
            PREMIUM K-BEAUTY
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Loading authentic Seoul skincare formulations and barrier repair treatments directly from our Shopify store...
          </p>
          <button
            type="button"
            onClick={onExploreCatalog}
            className="px-6 py-3 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="hero"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden flex flex-col justify-between perspective-1200 preserve-3d aspect-[9/16] sm:aspect-[4/3] lg:aspect-[16/9]"
      style={{
        backgroundColor: activeProduct.shopifyId === 'gid://shopify/Product/10679311106188'
          ? '#CF3556'
          : activeProduct.shopifyId === 'gid://shopify/Product/10705876779148'
            ? '#E69201'
            : activeProduct.panel,
        transition: `background-color ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {/* Full-bleed ambient atmospheric blur from active product visual */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen transition-opacity duration-700 overflow-hidden" 
        aria-hidden="true"
      >
        <img 
          src={activeProduct.src} 
          alt="" 
          className="w-full h-full object-cover blur-3xl scale-125 opacity-40"
        />
      </div>

      {/* Dynamic 3D lighting halo following mouse */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-85 transition-opacity duration-700" 
        aria-hidden="true"
      >
        <div 
          className="absolute rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{
            left: `calc(50% + ${currentTilt.x * 140}px)`,
            top: `calc(50% + ${currentTilt.y * 90}px)`,
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '450px' : '750px',
            height: isMobile ? '450px' : '750px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0) 80%)',
          }}
        />
      </div>

      {/* ==================================================
          GIANT "GLOW" TYPOGRAPHY (Deep-space reverse parallax)
          ================================================== */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none user-select-none z-[2]"
        style={{
          transform: `translate3d(${currentTilt.x * -42}px, ${currentTilt.y * -28}px, -110px)`,
          transition: isAnimating ? `transform ${SLIDE_TRANSITION_MS}ms ease-out` : 'none',
        }}
        aria-hidden="true"
      >
        <span
          className="font-anton uppercase tracking-[-0.04em] select-none text-center leading-[0.8] whitespace-nowrap"
          style={{
            fontSize: isMobile 
              ? 'clamp(110px, 32vw, 240px)' 
              : isTablet 
                ? 'clamp(130px, 30vw, 360px)'
                : 'clamp(150px, 32vw, 480px)',
            fontWeight: 900,
            color: activeProduct.darkTone ? 'rgba(255, 255, 255, 0.42)' : 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Li Fei
        </span>
      </div>

      {/* ==================================================
          3D FLOATING PARTICLES (Full viewport spread with deep parallax)
          ================================================== */}
      {particlesEnabled && (
        <div className="absolute inset-0 pointer-events-none z-[30] overflow-hidden">
          {/* Subtle bubbles and dewy droplets with differential Z-space */}
          {[
            { id: 1, size: 44, x: '10%', y: '22%', z: 95, delay: '0s', dur: '5.2s' },
            { id: 2, size: 30, x: '88%', y: '18%', z: 110, delay: '1.2s', dur: '4.8s' },
            { id: 3, size: 34, x: '14%', y: '72%', z: 55, delay: '2.1s', dur: '6.4s' },
            { id: 4, size: 28, x: '84%', y: '75%', z: 70, delay: '0.8s', dur: '5.6s' },
            { id: 5, size: 18, x: '24%', y: '16%', z: 135, delay: '1.5s', dur: '4.2s' },
            { id: 6, size: 20, x: '76%', y: '30%', z: 90, delay: '2.5s', dur: '4.9s' },
          ].map((p) => {
            const offsetX = currentTilt.x * (p.z * 0.52);
            const offsetY = currentTilt.y * (p.z * 0.38);

            return (
              <div
                key={p.id}
                className="absolute animate-orbit-bubble flex items-center justify-center"
                style={{
                  left: p.x,
                  top: p.y,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                  transform: `translate3d(${offsetX}px, ${offsetY}px, ${p.z}px)`,
                  transition: 'transform 100ms ease-out',
                }}
              >
                <div className="w-full h-full rounded-full border border-white/60 bg-white/20 backdrop-blur-xs shadow-[0_0_18px_rgba(255,255,255,0.45)] relative">
                  <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/85" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================
          3D PRODUCT STAGE: FULL PAGE & COVERS "GLOW"
          ================================================== */}
      <div className="absolute inset-0 z-[20] overflow-hidden pointer-events-none preserve-3d">
        {heroProducts.map((product, idx) => {
          const isCenter = idx === centerIndex;
          const style = getProduct3DStyles(idx);

          return (
            <div
              key={product.id}
              style={style}
              className="absolute flex items-center justify-center pointer-events-auto cursor-pointer preserve-3d"
              onClick={() => {
                if (idx !== centerIndex && !isAnimating) {
                  if (idx === rightIndex) navigate('next');
                  else if (idx === leftIndex) navigate('prev');
                } else if (isCenter) {
                  setIsFlipped3D(prev => !prev);
                }
              }}
            >
              {isCenter && !isAnimating && (
                <>
                  {/* Wishlist Button for Hero */}
                  {onToggleWishlist && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      className={`absolute top-[10%] right-[-10%] sm:right-[-15%] z-[50] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white shadow-xl ${
                        isWishlisted
                          ? 'bg-white text-[#EC3460] shadow-raspberry'
                          : 'bg-black/20 text-white/80 hover:text-white'
                      } ${justWishlisted ? 'animate-pop' : ''}`}
                    >
                      <Heart
                        size={isMobile ? 20 : 26}
                        fill={isWishlisted ? '#EC3460' : 'none'}
                        className={isWishlisted ? 'text-[#EC3460]' : ''}
                      />
                    </button>
                  )}

                  {onToggleComparison && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComparison(product.id);
                      }}
                      className={`absolute top-[28%] right-[-10%] sm:right-[-15%] z-[50] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-white shadow-xl ${
                        comparisonIds.includes(product.id)
                          ? 'bg-[#EC3460] text-white border-[#EC3460] shadow-raspberry'
                          : 'bg-black/20 text-white/80 hover:text-white'
                      }`}
                    >
                      <Scale size={isMobile ? 20 : 26} />
                    </button>
                  )}

                </>
              )}
              {/* 3D Floating container */}
              <div 
                className={`relative w-full h-full flex items-center justify-center preserve-3d ${
                  isCenter && !isFlipped3D ? 'animate-float-levitate' : ''
                }`}
                style={{
                  transform: isFlipped3D && isCenter ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* FRONT: Full-Page 3D Product & Splash Visual Covering "GLOW" */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden preserve-3d">
                  {/* Shadow underneath (moves opposite to simulate ground height) */}
                  {isCenter && (
                    <div 
                      className="absolute bottom-4 sm:bottom-8 w-[80%] h-12 bg-black/30 blur-3xl rounded-full pointer-events-none transition-all duration-300" 
                      style={{
                        transform: `translate(${currentTilt.x * -24}px, ${currentTilt.y * -14}px) scale(${1 - Math.abs(currentTilt.y) * 0.12})`,
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* The Full-Page 3D Product Visual */}
                  <img
                    src={product.src}
                    alt={`${product.name} 3D animated Korean skincare hero visual`}
                    draggable={false}
                    className="w-full h-full object-contain object-center drop-shadow-[0_30px_70px_rgba(0,0,0,0.35)] select-none"
                  />

                  {/* 3D Specular Light Sheen tracking cursor light source */}
                  {isCenter && (
                    <div 
                      className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-overlay opacity-40 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle at ${50 + currentTilt.x * 38}% ${45 + currentTilt.y * 32}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 55%)`,
                      }}
                    />
                  )}

                  {/* 3D Info Flip Button on center visual */}
                  {isCenter && (
                    <div 
                      className="absolute top-6 right-6 sm:top-10 sm:right-12 bg-black/35 backdrop-blur-md text-white border border-white/25 text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-auto hover:bg-black/55 transition-colors shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped3D(true);
                      }}
                    >
                      <RotateCw size={12} className="animate-spin-slow" />
                      <span>FLIP 3D SPECS</span>
                    </div>
                  )}
                </div>

                {/* BACK: 3D Holographic Clinical Breakdown Card */}
                <div 
                  className="w-full max-w-lg p-6 sm:p-10 rounded-3xl flex flex-col justify-between text-white backface-hidden shadow-2xl border border-white/30 backdrop-blur-2xl"
                  style={{
                    transform: 'rotateY(180deg)',
                    background: activeProduct.darkTone 
                      ? 'linear-gradient(135deg, rgba(30,5,10,0.94) 0%, rgba(65,10,20,0.94) 100%)' 
                      : 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 100%)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/80">
                        3D CLINICAL SPECS
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped3D(false);
                        }}
                        className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <h3 className="font-anton text-2xl sm:text-3xl uppercase tracking-tight mt-3">
                      {product.name}
                    </h3>
                    <p className="text-xs text-white/90 font-medium mb-3">
                      {product.clinicalClaim}
                    </p>
                    
                    <div className="space-y-2.5 mt-4 text-xs">
                      <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block mb-0.5">Active Formula Matrix</span>
                        <span className="font-semibold text-white">{product.keyIngredients.join(' · ')}</span>
                      </div>
                      <div className="bg-black/25 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase tracking-wider text-white/70 block mb-0.5">Application Protocol</span>
                        <span className="text-white/90">{product.ritualStep}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="flex-1 bg-white text-slate-900 font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-white/90 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={15} />
                      <span>Add to Bag · {product.price}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped3D(false);
                      }}
                      className="px-4 py-3.5 bg-black/35 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-black/50"
                    >
                      Front
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Film-grain texture */}
      <div 
        className="absolute inset-0 pointer-events-none z-[45] grain-overlay opacity-25" 
        aria-hidden="true"
      />

      {/* Floating 3D Controls Pill Bar in Hero */}
      <div className="relative z-[60] pt-4 px-6 flex justify-end">
        <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
          <button
            onClick={() => setTilt3DEnabled(prev => !prev)}
            aria-label="Toggle 3D mouse parallax"
            title={tilt3DEnabled ? "Disable 3D tilt" : "Enable 3D tilt"}
            className={`p-1.5 rounded-full text-white transition-all cursor-pointer ${
              tilt3DEnabled ? 'bg-white/25 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <Compass size={15} />
          </button>
          <button
            onClick={() => setParticlesEnabled(prev => !prev)}
            aria-label="Toggle 3D particles"
            title={particlesEnabled ? "Disable floating particles" : "Enable floating particles"}
            className={`p-1.5 rounded-full text-white transition-all cursor-pointer ${
              particlesEnabled ? 'bg-white/25 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            <Layers size={15} />
          </button>
        </div>
      </div>

      {/* Empty Spacer */}
      <div className="flex-1" />

      {/* ==================================================
          BOTTOM HERO AREA (Info + Indicator + Shop Now CTA)
          ================================================== */}
      <div className="relative w-full z-[60] pointer-events-none pb-6 sm:pb-8">
        {/* BOTTOM-LEFT CONTENT */}
        <div 
          className="absolute left-6 bottom-6 sm:left-14 sm:bottom-12 max-w-[420px] pointer-events-auto flex flex-col gap-2.5 bg-black/25 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <span className="font-inter text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A64D63]">
              Life looks better with lifei
            </span>
          </div>

          <h2 className="font-inter font-bold text-white uppercase tracking-[0.12em] text-lg sm:text-2xl leading-tight">
            {activeProduct.name}
          </h2>

          <p className="font-inter text-xs sm:text-sm text-white opacity-90 leading-[1.5]">
            {isMobile ? activeProduct.subtitle : activeProduct.fullDescription}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-white font-medium pt-0.5">
            <Sparkles size={13} className="text-amber-300 shrink-0" />
            <span>{activeProduct.clinicalClaim}</span>
          </div>

          {/* Navigation Buttons Under Text */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('prev')}
              disabled={isAnimating}
              aria-label="Previous product"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white border-2 border-white/90 bg-black/20 hover:scale-108 hover:bg-white/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <ArrowLeft size={isMobile ? 20 : 22} strokeWidth={2.25} />
            </button>

            <button
              type="button"
              onClick={() => navigate('next')}
              disabled={isAnimating}
              aria-label="Next product"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white border-2 border-white/90 bg-black/20 hover:scale-108 hover:bg-white/20 active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <ArrowRight size={isMobile ? 20 : 22} strokeWidth={2.25} />
            </button>

            <button
              type="button"
              onClick={() => onQuickView(activeProduct)}
              className="text-[11px] uppercase tracking-wider text-white underline ml-2 font-medium cursor-pointer"
            >
              View Clinical Details
            </button>
          </div>
        </div>

        {/* PRODUCT INDICATOR (Bottom Center) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 font-inter text-xs tracking-[0.25em] text-white opacity-95 font-semibold pointer-events-auto flex items-center gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-lg"
          style={{
            bottom: isMobile ? '16px' : '28px'
          }}
        >
          <div className="flex gap-1.5">
            {heroProducts.length <= 10 ? (
              heroProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isAnimating) {
                      setActiveIndex(i);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))
            ) : (
              <div className="h-1 w-20 bg-white/20 rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-white transition-all duration-300"
                  style={{ width: `${((activeIndex + 1) / heroProducts.length) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM-RIGHT CTA (SHOP NOW) */}
        <div 
          className="absolute right-1 bottom-6 sm:right-4 sm:bottom-12 pointer-events-auto bg-black/25 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-3 rounded-2xl border border-white/15 shadow-xl"
        >
          <button
            type="button"
            onClick={() => {
              onAddToCart(activeProduct);
            }}
            className="group flex items-center gap-2 text-white font-anton uppercase opacity-95 hover:opacity-100 transition-opacity duration-200 cursor-pointer text-left"
            style={{
              fontSize: 'clamp(20px, 3.5vw, 44px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            <span>SHOP NOW</span>
            <span className="transform transition-transform duration-200 ease-out group-hover:translate-x-[4px]">
              <ArrowRight size={isMobile ? 20 : 28} strokeWidth={2.25} />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
