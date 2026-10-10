import React from 'react';
import type { Product } from '../types';
import { REFERENCE_HEROES, type ReferenceHero } from '../data/referenceHeroes';

interface StaticHeroProps {
  reference: ReferenceHero;
  products: Product[];
  onSelectReference: (reference: ReferenceHero) => void;
  onOpenProduct: (handle: string) => void;
}

export function StaticHero({ reference, products, onSelectReference, onOpenProduct }: StaticHeroProps) {
  const handle = products.find(product => product.shopifyId === reference.shopifyId)?.handle || reference.handle;
  const destination = `/products/${encodeURIComponent(handle)}`;
  const openProduct = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenProduct(handle);
  };
  const placement = (area: ReferenceHero['shop'] | ReferenceHero['details']): React.CSSProperties => ({
    left: `${area.left}%`, top: `min(${area.top}%, calc(100% - 44px))`, width: `${area.width}%`, height: `${area.height}%`,
  });

  return (
    <>
      <section id="hero" className="reference-hero" aria-label={reference.title} style={{ backgroundColor: reference.background }}>
        <div className="reference-hero-frame">
          <img className="reference-hero-artwork" src={reference.artwork} width={851} height={1848} alt="" fetchPriority="high" loading="eager" />
          <div className="sr-only">
            <p>LIFE LOOKS BETTER WITH LIFEI</p>
            <h1>{reference.title}</h1>
          </div>
          <a className="reference-hit-target" href={destination} onClick={openProduct} style={placement(reference.shop)} aria-label={`SHOP NOW → — ${reference.title}`} />
          <a className="reference-hit-target" href={destination} onClick={openProduct} style={placement(reference.details)} aria-label={`VIEW CLINICAL DETAILS — ${reference.title}`} />
        </div>
      </section>
      <nav className="reference-slide-controls" aria-label="Choose a static product hero">
        {REFERENCE_HEROES.map(hero => (
          <button key={hero.id} type="button" aria-pressed={hero.id === reference.id} onClick={() => onSelectReference(hero)}>
            {hero.title}
          </button>
        ))}
      </nav>
    </>
  );
}
