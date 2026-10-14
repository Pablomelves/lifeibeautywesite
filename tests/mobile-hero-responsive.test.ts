import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../src/components/Header';
import { StaticHero } from '../src/components/StaticHero';
import { REFERENCE_HEROES } from '../src/data/referenceHeroes';

test('Mobile header and hero elements exist and have valid structure', () => {
  const headerHtml = renderToStaticMarkup(
    React.createElement(Header, {
      reference: REFERENCE_HEROES[0],
      referenceOverlay: true,
      cartCount: 2,
      wishlistCount: 0,
      profileIncomplete: false,
      onOpenCart: () => {},
      onOpenSearch: () => {},
      onOpenAccount: () => {},
      onSelectCategory: () => {},
      onNavigateSection: () => {},
      onOpenAbout: () => {},
      onOpenContact: () => {},
    })
  );

  // Check essential header targets are present
  assert.ok(headerHtml.includes('reference-logo-target'), 'Logo target should exist');
  assert.ok(headerHtml.includes('Life looks better with lifei'), 'Tagline should exist');
  assert.ok(headerHtml.includes('reference-search-target'), 'Search target should exist');
  assert.ok(headerHtml.includes('reference-account-target'), 'Account target should exist');
  assert.ok(headerHtml.includes('reference-cart-target'), 'Cart target should exist');
  assert.ok(headerHtml.includes('reference-cart-badge'), 'Cart count badge should exist');
  assert.ok(headerHtml.includes('reference-menu-target'), 'Menu hamburger target should exist');

  const heroHtml = renderToStaticMarkup(
    React.createElement(StaticHero, {
      reference: REFERENCE_HEROES[0],
      onNavigateSection: () => {},
      onSelectProduct: () => {},
    })
  );

  assert.ok(heroHtml.includes('reference-hero'), 'Hero wrapper should exist');
  assert.ok(heroHtml.includes('reference-slide-previous'), 'Prev button should exist');
  assert.ok(heroHtml.includes('reference-slide-next'), 'Next button should exist');
  assert.ok(heroHtml.includes('aria-label="Previous hero slide"'), 'Prev button should have accessible label');
  assert.ok(heroHtml.includes('aria-label="Next hero slide"'), 'Next button should have accessible label');
});

test('Mobile CSS defines touch targets, compact header, and responsive hero', () => {
  const css = readFileSync('src/index.css', 'utf-8');

  // Verify mobile media query has compact header rule
  assert.ok(css.includes('.reference-header {') && css.includes('height: 56px;'), 'Header is compact 56px on mobile');
  assert.ok(css.includes('min-width: 44px;') && css.includes('min-height: 44px;'), 'Accessible touch targets 44x44px are defined');
  assert.ok(css.includes('.reference-slide-arrow') && css.includes('width: 44px;'), 'Slideshow arrows have 44px touch targets');
  assert.ok(css.includes('width: 100%;'), 'Width 100% is used for responsive layout');
  assert.ok(css.includes('overflow-x: hidden;'), 'Body prevents horizontal overflow');
});
