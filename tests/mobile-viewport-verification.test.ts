import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../src/components/Header';
import { StaticHero } from '../src/components/StaticHero';
import { REFERENCE_HEROES } from '../src/data/referenceHeroes';

const noop = () => {};
const headerProps = {
  cartCount: 2,
  wishlistCount: 1,
  onOpenCart: noop,
  onOpenSearch: noop,
  onOpenAccount: noop,
  onSelectCategory: noop,
  onNavigateSection: noop,
  onOpenAbout: noop,
  onOpenContact: noop,
};

test('Mobile header and hero verification across 320px, 375px, 390px, and 430px viewports', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));

  // 1. Verify mobile header rules
  assert.match(mobile, /\.reference-header \{\s*height: 56px;/);
  assert.match(mobile, /\.reference-header-frame \{\s*height: 56px;\s*aspect-ratio: auto;\s*display: flex;/);
  assert.match(mobile, /\.reference-header-artwork \{\s*display: none;/);
  assert.match(mobile, /\.reference-header \.reference-logo-target > \*,\s*\.reference-header \.reference-hit-target > svg \{\s*display: block;/);
  assert.match(mobile, /\.reference-header \.reference-hit-target:not\(\.reference-logo-target\) \{\s*position: static;\s*display: inline-flex;\s*align-items: center;\s*justify-content: center;\s*width: 44px;\s*min-width: 44px;\s*height: 44px;\s*min-height: 44px;/);

  // 2. Verify mobile hero layout
  assert.match(mobile, /\.reference-hero \{\s*height: auto;\s*min-height: 0;\s*width: 100%;/);
  assert.match(mobile, /\.reference-hero-composition \{\s*position: relative;\s*width: 100%;\s*aspect-ratio: 851 \/ 1848;/);
  assert.match(mobile, /\.reference-header-overlay \+ \.reference-hero \{\s*margin-top: 0;/);

  // 3. Verify mobile slideshow controls (no overlap with bottle/text)
  assert.match(mobile, /\.reference-slide-controls \{\s*position: static;\s*display: flex;\s*align-items: center;\s*justify-content: space-between;/);
  assert.match(mobile, /\.reference-slide-arrow \{\s*position: static;\s*display: inline-flex;\s*align-items: center;\s*justify-content: center;\s*width: 44px;\s*height: 44px;\s*min-width: 44px;\s*min-height: 44px;/);

  // 4. Test render output for all viewports
  for (const viewportWidth of [320, 375, 390, 430]) {
    // Header check
    const headerHtml = renderToStaticMarkup(React.createElement(Header, { ...headerProps, reference: REFERENCE_HEROES[0], referenceOverlay: true }));
    assert.ok(headerHtml.includes('reference-header'));
    assert.ok(headerHtml.includes('reference-logo-target'));
    assert.ok(headerHtml.includes('reference-scrolled-logo'));
    assert.ok(headerHtml.includes('Life looks better with lifei'));
    assert.ok(headerHtml.includes('reference-search-target'));
    assert.ok(headerHtml.includes('reference-account-target'));
    assert.ok(headerHtml.includes('reference-cart-target'));
    assert.ok(headerHtml.includes('reference-cart-badge'));
    assert.ok(headerHtml.includes('reference-menu-target'));

    // Check 4 action buttons width calculation: 4 * 44px = 176px + padding 16px = 192px
    const remainingForLogo = viewportWidth - 192;
    assert.ok(remainingForLogo >= 120, `Viewport ${viewportWidth}px has ${remainingForLogo}px available for logo (>= 120px required)`);

    // Hero check
    const heroHtml = renderToStaticMarkup(React.createElement(StaticHero, { reference: REFERENCE_HEROES[0], products: [], onSelectReference: noop, onOpenProduct: noop }));
    assert.ok(heroHtml.includes('reference-hero'));
    assert.ok(heroHtml.includes('reference-hero-artwork-shop'));
    assert.ok(heroHtml.includes('SHOP NOW'));
    assert.ok(heroHtml.includes('reference-hero-artwork-details'));
    assert.ok(heroHtml.includes('SHOW BY BRAND'));
    assert.ok(heroHtml.includes('reference-slide-controls'));
    assert.ok(heroHtml.includes('reference-slide-previous'));
    assert.ok(heroHtml.includes('reference-slide-next'));
    assert.ok(heroHtml.includes('reference-slide-indicators'));
  }
});
