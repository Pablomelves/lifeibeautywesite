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
  assert.equal((html.match(/href="\/products\/merchant-updated-handle"/g) || []).length, 4);
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

test('homepage header initially reuses the original header crop and preserves sticky positioning', () => {
  const html = renderToStaticMarkup(React.createElement(Header, { ...headerProps, reference: REFERENCE_HEROES[0], referenceOverlay: true }));
  assert.match(html, /reference-header-overlay/);
  assert.equal((html.match(/<img/g) || []).length, 2);
  assert.ok(html.includes(REFERENCE_HEROES[0].headerArtwork));
  assert.match(html, /reference-scrolled-logo/);
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

test('header sizing follows resize and orientation changes while scrolling changes only its appearance', () => {
  const header = readFileSync(new URL('../src/components/Header.tsx', import.meta.url), 'utf8');
  assert.match(header, /new ResizeObserver\(updateHeight\)/);
  assert.match(header, /addEventListener\('orientationchange', updateHeight\)/);
  assert.match(header, /addEventListener\('resize', updateHeight\)/);
  assert.match(header, /setScrolled\(window.scrollY > 8\)/);
  assert.match(header, /addEventListener\('scroll', updateScrolled, \{ passive: true \}\)/);
  assert.match(header, /removeEventListener\('scroll', updateScrolled\)/);
  assert.match(header, /backgroundColor: scrolled \? '#ffffff' : reference.background/);
  assert.doesNotMatch(header, /transition-all duration-300/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.reference-header-scrolled \.reference-header-artwork \{\s*visibility: hidden;/);
  assert.match(header, /<Search aria-hidden="true"/);
  assert.match(header, /<ShoppingBag aria-hidden="true"/);
  const html = renderToStaticMarkup(React.createElement(Header, headerProps));
  assert.match(html, /site-header sticky top-0 z-\[65\]/);
  assert.match(html, /aria-label="Toggle menu" aria-expanded="false" aria-controls=/);
});

test('reference headers span the viewport with proportionate branding and edge-aligned tablet and desktop actions', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.reference-header \{[^}]*width: 100%;/);
  assert.match(css, /\.reference-header-frame \{[^}]*width: 100%;/);
  assert.doesNotMatch(css, /reference-artwork-width|max-width: 851px/);
  assert.match(css, /@media \(min-width: 768px\)/);
  assert.match(css, /\.reference-header-frame \{[^}]*height: clamp\(76px, 6vw, 96px\);[^}]*aspect-ratio: auto;/);
  assert.match(css, /\.reference-scrolled-logo \{[^}]*width: 180px;[^}]*height: 40px;/);
  assert.match(css, /\.reference-menu-target \{ right: clamp\(20px, 3vw, 48px\); \}/);
  assert.match(css, /\.reference-header-scrolled \.reference-logo-target > \*,\s*\.reference-header-scrolled \.reference-hit-target > svg \{\s*display: block;/);
});

test('tablet and desktop heroes keep viewport-covering artwork and overlay arrows', () => {
  for (const reference of REFERENCE_HEROES) {
    const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.match(html, /class="reference-hero-composition"/);
    assert.match(html, /class="reference-hero-actions"/);
  }
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /\.reference-hero \{[^}]*min-height: 100svh;/);
  assert.match(css, /\.reference-hero-frame \{[^}]*width: 100%;[^}]*height: 100%;/);
  assert.match(css, /\.reference-hero-composition \{[^}]*width: max\(100%, calc\(100svh \* 851 \/ 1848\)\);[^}]*aspect-ratio: 851 \/ 1848;/);
  assert.doesNotMatch(css, /reference-backdrop|\.reference-hero::before|\.reference-hero-artwork \{[^}]*object-fit: contain/);
  assert.match(css, /\.reference-slide-arrow \{\s*position: absolute;\s*top: calc\(50svh - 22px\);/);
  assert.match(css, /\.reference-slide-controls \{[^}]*inset: 0;[^}]*z-index: 2;/);
  assert.doesNotMatch(css, /100svh - 56px/);
  const document = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(document, /\.initial-hero \{[^}]*min-height: 100svh;/);
  assert.match(document, /\.initial-hero-frame \{[^}]*width: max\(100%, calc\(100svh \* 851 \/ 1848\)\);[^}]*aspect-ratio: 851 \/ 1848;/);
  assert.doesNotMatch(document, /\.initial-hero::before|filter: blur/);
});

test('cropped tablet and desktop heroes retain visible shopping links above the indicators', () => {
  const component = readFileSync(new URL('../src/components/StaticHero.tsx', import.meta.url), 'utf8');
  assert.ok(component.includes('top: `${area.top}%`'));
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(min-aspect-ratio: 1 \/ 2\)/);
  assert.match(css, /\.reference-hero-composition \.reference-hit-target \{\s*display: none;/);
  assert.match(css, /\.reference-hero-actions \{[^}]*bottom: max\(64px, calc\(env\(safe-area-inset-bottom\) \+ 56px\)\);[^}]*display: flex;[^}]*flex-wrap: wrap;/);
  assert.match(css, /\.reference-hero-actions a \{[^}]*min-height: 44px;/);
  for (const reference of REFERENCE_HEROES) {
    const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.match(html, /class="reference-hero-shop"[^>]*><span>SHOP NOW<\/span><span class="reference-shop-arrow" aria-hidden="true">→<\/span><\/a>/);
    assert.match(html, /class="reference-hero-details"[^>]*>VIEW CLINICAL DETAILS<\/a>/);
  }
});

test('mobile heroes keep complete artwork and reference-shaped themed shopping controls in both orientations', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));
  assert.match(css, /\.reference-hero-actions \.reference-hero-shop \{[^}]*border-radius: 999px;[^}]*background: var\(--hero-shop-background\);[^}]*color: var\(--hero-shop-color\);/);
  assert.equal(new Set(REFERENCE_HEROES.map(reference => reference.shopBackground)).size, 3);
  assert.match(mobile, /\.reference-hero \{\s*height: auto;\s*min-height: 0;/);
  assert.match(mobile, /\.reference-hero-composition \{\s*position: relative;\s*width: 100%;[^}]*transform: none;/);
  assert.match(mobile, /border-radius: 999px;\s*background: var\(--hero-shop-background\);\s*color: var\(--hero-shop-color\);/);
  assert.doesNotMatch(mobile, /--reference-target-left|--reference-target-width/);
  assert.match(mobile, /\.reference-hero-artwork-shop span \{\s*display: inline;/);
  assert.match(mobile, /\.reference-slide-controls \{\s*position: static;/);
  assert.match(mobile, /\.reference-hero-actions \{\s*display: none;/);
  for (const reference of REFERENCE_HEROES) {
    const html = renderToStaticMarkup(React.createElement(StaticHero, { reference, products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.match(html, /class="reference-hit-target reference-hero-artwork-shop"[^>]*><span>SHOP NOW<\/span><span class="reference-shop-arrow" aria-hidden="true">→<\/span><\/a>/);
    assert.ok(html.includes(`--hero-shop-background:${reference.shopBackground}`));
    assert.ok(html.includes(`--hero-shop-color:${reference.shopColor}`));
    assert.ok(html.includes(`left:${reference.shop.left}%;`));
    assert.ok(html.includes(`width:${reference.shop.width}%;`));
    assert.ok(html.includes(`top:min(${reference.shop.top}%, calc(${reference.details.top}% - 48px))`));
    assert.ok(html.includes(`top:${reference.details.top}%`));
  }
  const document = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(document, /@media \(max-width: 767px\)/);
  assert.match(document, /\.initial-hero \{ height: auto; min-height: 0; padding-bottom: 56px;/);
  assert.match(document, /class="initial-hero-shop"[^>]*><span>SHOP NOW<\/span><span class="initial-shop-arrow" aria-hidden="true">→<\/span><\/a>/);
  assert.ok(document.includes(`background: ${REFERENCE_HEROES[0].shopBackground}`));
  assert.ok(document.includes(`color: ${REFERENCE_HEROES[0].shopColor}`));
});
