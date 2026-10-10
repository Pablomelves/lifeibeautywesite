import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticHero } from '../src/components/StaticHero';
import { Header } from '../src/components/Header';
import { REFERENCE_HEROES, referenceHeroForPath, referenceHeroForProduct } from '../src/data/referenceHeroes';
import type { Product } from '../src/types';

const noop = () => {};
const headerProps = {
  cartCount: 0,
  wishlistCount: 0,
  onOpenCart: noop,
  onOpenSearch: noop,
  onOpenAccount: noop,
  onSelectCategory: noop,
  onNavigateSection: noop,
  onOpenAbout: noop,
  onOpenContact: noop,
};

test('all three reference heroes render immediately with original artwork and real product destinations without catalog data', () => {
  for (const reference of REFERENCE_HEROES) {
    const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.ok(html.includes(`src="${reference.artwork}"`));
    assert.match(html, /fetchPriority="high" loading="eager"/);
    assert.ok(html.includes(`href="/products/${reference.handle}"`));
    assert.ok(html.includes(reference.title));
    assert.match(html, /SHOP NOW →/);
    assert.match(html, /VIEW CLINICAL DETAILS/);
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
    assert.ok(existsSync(new URL(`../public${reference.artwork}`, import.meta.url)));
    assert.ok(existsSync(new URL(`../public${reference.headerArtwork}`, import.meta.url)));
    for (const area of [reference.shop, reference.details]) {
      assert.ok(area.left + area.width <= 100);
      assert.ok(area.top + area.height <= 100);
    }
  }
});

test('hero destinations follow the corresponding live Shopify ID, not catalog ordering or similar product names', () => {
  const reference = REFERENCE_HEROES[0];
  const products = [{ shopifyId: REFERENCE_HEROES[2].shopifyId, handle: 'pink' }, { shopifyId: reference.shopifyId, handle: 'merchant-updated-handle' }] as Product[];
  const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products, onSelectReference: noop, onOpenProduct: noop }));
  assert.equal((html.match(/href="\/products\/merchant-updated-handle"/g) || []).length, 2);
});

test('reference product headers are restricted to the three exact Shopify products and routes', () => {
  for (const reference of REFERENCE_HEROES) {
    assert.equal(referenceHeroForProduct({ shopifyId: reference.shopifyId } as Product), reference);
    assert.equal(referenceHeroForPath(`/products/${reference.handle}/`), reference);
    const html = renderToStaticMarkup(React.createElement(Header, { ...headerProps, reference }));
    assert.ok(html.includes(reference.headerArtwork));
    assert.match(html, /Search products/);
    assert.match(html, /Open My Profile personal information/);
    assert.match(html, /Shopping Cart, 0 items/);
    assert.match(html, /Toggle menu/);
    assert.match(html, /href="\/"/);
    assert.doesNotMatch(html, /backdrop-blur|shadow-sm|border-b/);
  }
  for (const path of ['/', '/collections/all', '/cart', '/account', '/products/unrelated-pink-serum', '/pages/contact']) {
    assert.equal(referenceHeroForPath(path), undefined);
  }
  assert.equal(referenceHeroForProduct(null), undefined);
  assert.equal(referenceHeroForProduct({ shopifyId: 'unrelated', name: 'Medicube EGF Nad Firming Serum' } as Product), undefined);
  const defaultHeader = renderToStaticMarkup(React.createElement(Header, headerProps));
  assert.match(defaultHeader, /BC0C39FF-CA32-434C-8D58-12498BC5C2E2\.png/);
  assert.doesNotMatch(defaultHeader, /reference-header/);
});

test('homepage header reuses the original header crop so its logo and icons remain visible while scrolling', () => {
  const html = renderToStaticMarkup(React.createElement(Header, { ...headerProps, reference: REFERENCE_HEROES[0], referenceOverlay: true }));
  assert.match(html, /reference-header-overlay/);
  assert.equal((html.match(/<img/g) || []).length, 1);
  assert.ok(html.includes(REFERENCE_HEROES[0].headerArtwork));
  assert.doesNotMatch(html, /<svg|BC0C39FF/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.reference-header \{\s*position: sticky;\s*top: 0;/);
  assert.match(css, /\.reference-header-overlay \+ \.reference-hero/);
});

test('hero contains no motion implementation and the initial document already includes the red reference', () => {
  const component = readFileSync(new URL('../src/components/StaticHero.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(component, /setInterval|setTimeout|requestAnimationFrame|useEffect|onMouseMove|onTouchMove|transition|animation/);
  assert.equal(existsSync(new URL('../src/components/Hero3D.tsx', import.meta.url)), false);
  const document = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(document, /rel="preload" as="image" href="\/hero\/medicube-egf-nad.webp"/);
  assert.match(document, /<section class="initial-hero"/);
  assert.match(document, /viewport-fit=cover/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /floatLevitate|pulseGlow|orbitBubble|perspective:|transform-style:/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('carousel contains exactly three accessible slides, two arrows, and three manual indicators', () => {
  for (const reference of REFERENCE_HEROES) {
    const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.equal((html.match(/aria-roledescription="slide"/g) || []).length, 3);
    assert.equal((html.match(/class="reference-slide-indicator"/g) || []).length, 3);
    assert.equal((html.match(/aria-hidden="true" inert=""/g) || []).length, 2);
    assert.equal((html.match(/loading="lazy"/g) || []).length, 2);
    assert.match(html, /aria-label="Previous hero slide"/);
    assert.match(html, /aria-label="Next hero slide"/);
    assert.match(html, /aria-roledescription="carousel" tabindex="0"/);
    assert.match(html, /aria-live="polite" aria-atomic="true"/);
    for (const hero of REFERENCE_HEROES) {
      assert.ok(html.includes(`aria-controls="hero-slide-${hero.id}"`));
    }
  }
});

test('header sizing follows resize and orientation changes without scroll-triggered changes', () => {
  const header = readFileSync(new URL('../src/components/Header.tsx', import.meta.url), 'utf8');
  assert.match(header, /new ResizeObserver\(updateHeight\)/);
  assert.match(header, /addEventListener\('orientationchange', updateHeight\)/);
  assert.match(header, /addEventListener\('resize', updateHeight\)/);
  assert.doesNotMatch(header, /setScrolled|addEventListener\('scroll'|transition-all duration-300/);
  const html = renderToStaticMarkup(React.createElement(Header, headerProps));
  assert.match(html, /site-header sticky top-0 z-\[65\]/);
  assert.match(html, /aria-label="Toggle menu" aria-expanded="false" aria-controls=/);
});
