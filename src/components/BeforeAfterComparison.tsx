import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import type { ComparisonImage, ProductImageComparison } from '../types/productInformation.js';
import { safeProductImageUrl } from '../services/productInformation.js';

export function BeforeAfterComparison({ comparison, productTitle }: { comparison: ProductImageComparison; productTitle: string }) {
  const [position, setPosition] = useState(50);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const frameId = useId();

  useEffect(() => {
    setPosition(50); setFailed(false);
    const element = frame.current;
    if (!element || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [comparison.id]);

  if (![comparison.before, comparison.after].every(image => safeProductImageUrl(image.url) && image.width > 0 && image.height > 0) || !Number.isFinite(comparison.aspectRatio) || comparison.aspectRatio <= 0) return null;
  const updatePointer = (clientX: number) => {
    const bounds = frame.current?.getBoundingClientRect();
    if (bounds?.width) setPosition(Math.max(0, Math.min(100, Math.round((clientX - bounds.left) / bounds.width * 100))));
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const changes: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
    if (event.key === 'Home') setPosition(0);
    else if (event.key === 'End') setPosition(100);
    else if (event.key in changes) setPosition(current => Math.max(0, Math.min(100, current + changes[event.key])));
    else return;
    event.preventDefault();
  };
  const photo = (image: ComparisonImage, label: string) => (
    <svg className="absolute inset-0 w-full h-full" viewBox={`${image.region.x * image.width} ${image.region.y * image.height} ${image.region.width * image.width} ${image.region.height * image.height}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${label}: original manufacturer photograph for ${productTitle}`} data-original-url={image.url}>
      {visible && !failed && <image href={image.url} width={image.width} height={image.height} preserveAspectRatio="xMidYMid meet" onError={() => setFailed(true)} />}
    </svg>
  );
  return (
    <figure className="space-y-3" aria-label={`Before and after comparison for ${productTitle}`}>
      {failed ? <p className="text-xs text-slate-600" role="status">The original comparison images are temporarily unavailable.</p> : (
        <div ref={frame} id={frameId} className="relative mx-auto overflow-hidden rounded-2xl border border-[#FFCDF2] bg-[#FFF0F9]" style={{ width: `min(100%, calc(70svh * ${comparison.aspectRatio}))`, aspectRatio: comparison.aspectRatio, touchAction: 'pan-y' } as CSSProperties}>
          {photo(comparison.after, 'After')}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>{photo(comparison.before, 'Before')}</div>
          <span className="absolute top-3 left-3 rounded bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-900 pointer-events-none">BEFORE</span>
          <span className="absolute top-3 right-3 rounded bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-900 pointer-events-none">AFTER</span>
          <div role="slider" tabIndex={0} aria-label={`Reveal before and after images for ${productTitle}`} aria-controls={frameId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={position} aria-valuetext={`${position}% of the before photograph is visible`} aria-orientation="horizontal" className="absolute top-0 bottom-0 w-11 cursor-ew-resize focus-visible:outline-2 focus-visible:outline-[#B31940] focus-visible:outline-offset-[-2px]" style={{ left: `calc(${position}% - 22px)`, touchAction: 'pan-y' }}
            onKeyDown={keyboard}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              pointerId.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              event.currentTarget.focus({ preventScroll: true });
              updatePointer(event.clientX);
            }}
            onPointerMove={event => { if (pointerId.current === event.pointerId) updatePointer(event.clientX); }}
            onPointerUp={event => {
              if (pointerId.current !== event.pointerId) return;
              updatePointer(event.clientX); pointerId.current = null;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => { pointerId.current = null; }}>
            <span className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white shadow-md pointer-events-none" />
            <span className="absolute top-1/2 left-0 flex h-11 w-11 items-center justify-center rounded-full border border-[#FFCDF2] bg-white text-[#B31940] shadow-md pointer-events-none" style={{ marginTop: '-22px' }}><ChevronsLeftRight size={22} aria-hidden="true" /></span>
          </div>
        </div>
      )}
      <figcaption className="space-y-1 text-[11px] leading-relaxed text-slate-600">
        <p>Drag the divider horizontally, or focus it and use the arrow keys. Vertical scrolling remains available.</p>
        {comparison.timeline && <p>Documented image timeline: {comparison.timeline}</p>}
        <p>Original manufacturer-supplied imagery. Individual results vary; these photographs are not independent clinical evidence.</p>
        <p className="flex flex-wrap gap-x-4"><a href={comparison.before.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline text-[#B31940]">View original before source</a><a href={comparison.after.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline text-[#B31940]">View original after source</a></p>
      </figcaption>
    </figure>
  );
}
