import React, { useRef } from 'react';
import type { Product } from '../types';
import { REFERENCE_HEROES, type ReferenceHero } from '../data/referenceHeroes';

interface StaticHeroProps {
  reference: ReferenceHero;
  products: Product[];
  onSelectReference: (reference: ReferenceHero) => void;
  onOpenProduct: (handle: string) => void;
}

export function StaticHero({ reference, products, onSelectReference, onOpenProduct }: StaticHeroProps) {
  const activeIndex = REFERENCE_HEROES.findIndex(hero => hero.id === reference.id);
  const gesture = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
  const suppressClick = useRef(false);
  const selectSlide = (index: number) => onSelectReference(REFERENCE_HEROES[(index + REFERENCE_HEROES.length) % REFERENCE_HEROES.length]);
  const openProduct = (event: React.MouseEvent<HTMLAnchorElement>, handle: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenProduct(handle);
  };
  const placement = (area: ReferenceHero['shop'] | ReferenceHero['details']): React.CSSProperties => ({
    left: `${area.left}%`, top: `min(${area.top}%, calc(100% - 44px))`, width: `${area.width}%`, height: `${area.height}%`,
  });

  return (
      <section id="hero" className="reference-hero" aria-label="Featured skincare products" aria-roledescription="carousel" tabIndex={0} style={{ backgroundColor: reference.background }}
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.key === 'ArrowRight') selectSlide(activeIndex + 1);
          else if (event.key === 'ArrowLeft') selectSlide(activeIndex - 1);
          else if (event.key === 'Home') selectSlide(0);
          else if (event.key === 'End') selectSlide(REFERENCE_HEROES.length - 1);
          else return;
          event.preventDefault();
        }}>
        <div className="reference-hero-frame"
          onPointerDown={event => {
            suppressClick.current = false;
            gesture.current = null;
            if (!event.isPrimary || event.pointerType === 'mouse' || (event.target as HTMLElement).closest('a, button')) return;
            gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
          }}
          onPointerCancel={() => { gesture.current = null; }}
          onPointerUp={event => {
            const start = gesture.current;
            gesture.current = null;
            if (!start || start.pointerId !== event.pointerId) return;
            const horizontal = event.clientX - start.startX;
            const vertical = event.clientY - start.startY;
            if (Math.abs(horizontal) < 50 || Math.abs(horizontal) <= Math.abs(vertical) * 1.5) return;
            suppressClick.current = true;
            selectSlide(activeIndex + (horizontal < 0 ? 1 : -1));
          }}
          onClickCapture={event => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}>
          <div className="reference-hero-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {REFERENCE_HEROES.map((hero, index) => {
              const handle = products.find(product => product.shopifyId === hero.shopifyId)?.handle || hero.handle;
              const destination = `/products/${encodeURIComponent(handle)}`;
              const active = index === activeIndex;
              return (
                <div key={hero.id} id={`hero-slide-${hero.id}`} className="reference-hero-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of 3: ${hero.title}`} aria-hidden={!active} inert={!active}>
                  <img className="reference-hero-artwork" src={hero.artwork} width={851} height={1848} alt={`${hero.title} — original LiFei Beauty banner with product, promotional text and shopping buttons`} fetchPriority={active ? 'high' : 'low'} loading={active ? 'eager' : 'lazy'} draggable={false} />
                  <div className="sr-only">
                    <p>LIFE LOOKS BETTER WITH LIFEI</p>
                    {active ? <h1>{hero.title}</h1> : <h2>{hero.title}</h2>}
                  </div>
                  <a className="reference-hit-target" href={destination} onClick={event => openProduct(event, handle)} style={placement(hero.shop)} aria-label={`SHOP NOW → — ${hero.title}`} />
                  <a className="reference-hit-target" href={destination} onClick={event => openProduct(event, handle)} style={placement(hero.details)} aria-label={`VIEW CLINICAL DETAILS — ${hero.title}`} />
                </div>
              );
            })}
          </div>
        </div>
        <nav className="reference-slide-controls" aria-label="Hero slideshow controls">
          <button type="button" className="reference-slide-arrow reference-slide-previous" aria-label="Previous hero slide" onClick={() => selectSlide(activeIndex - 1)}>‹</button>
          <div className="reference-slide-indicators">
            {REFERENCE_HEROES.map((hero, index) => (
              <button key={hero.id} type="button" className="reference-slide-indicator" aria-label={`Show slide ${index + 1}: ${hero.title}`} aria-controls={`hero-slide-${hero.id}`} aria-pressed={hero.id === reference.id} onClick={() => selectSlide(index)}><span aria-hidden="true" /></button>
            ))}
          </div>
          <button type="button" className="reference-slide-arrow reference-slide-next" aria-label="Next hero slide" onClick={() => selectSlide(activeIndex + 1)}>›</button>
        </nav>
        <p className="sr-only" aria-live="polite" aria-atomic="true">Slide {activeIndex + 1} of 3: {reference.title}</p>
      </section>
  );
}
