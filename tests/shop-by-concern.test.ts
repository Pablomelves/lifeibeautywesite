import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { ShopByConcern, CONCERN_CATEGORIES } from '../src/components/ShopByConcern';
import type { Product } from '../src/types';

const noop = () => {};

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Medicube PDRN Pink Peptide Serum',
    handle: 'medicube-pdrn-pink-peptide-serum',
    price: '$39.00',
    numericPrice: 39.0,
    category: 'Serums',
    src: '/products/pink.jpg',
    description: 'High-purity salmon DNA PDRN serum for intense elasticity and collagen lifting.',
    keyIngredients: ['Rose PDRN', 'Peptide Complex'],
    benefits: ['Firming', 'Elasticity'],
    clinicalClaim: '+192% Collagen Plump',
    rating: 4.9,
    reviewsCount: 154,
    volume: '30ml',
    stockStatus: 'In Stock',
    vendor: 'Medicube'
  },
  {
    id: 2,
    name: 'Biodance Collagen Real Deep Mask',
    handle: 'biodance-collagen-real-deep-mask',
    price: '$19.00',
    numericPrice: 19.0,
    category: 'Masks',
    src: '/products/mask.jpg',
    description: 'Hydrogel overnight face mask for deep hydration and pore minimizing.',
    keyIngredients: ['Oligo-Hyaluronic Acid', 'Low-Molecular Collagen'],
    benefits: ['Hydration', 'Pore Tightening'],
    clinicalClaim: '+208% Moisture Barrier',
    rating: 5.0,
    reviewsCount: 312,
    volume: '4 Pack',
    stockStatus: 'In Stock',
    vendor: 'Biodance'
  },
  {
    id: 3,
    name: 'CeraVe Moisturizing Cream',
    handle: 'cerave-moisturizing-cream',
    price: '$17.99',
    numericPrice: 17.99,
    category: 'Moisturizers',
    src: '/products/cerave-cream.jpg',
    description: 'Formulated with three essential ceramides to repair the protective skin barrier and soothe dry skin.',
    keyIngredients: ['Ceramides 1, 3, 6-II', 'Hyaluronic Acid'],
    benefits: ['Barrier Repair', 'Moisturizing'],
    clinicalClaim: '24-hour Barrier Hydration',
    rating: 4.8,
    reviewsCount: 520,
    volume: '19oz',
    stockStatus: 'In Stock',
    vendor: 'CeraVe'
  },
  {
    id: 4,
    name: 'Medicube Kojic Acid Turmeric Clarifying Capsule Serum',
    handle: 'medicube-kojic-acid-turmeric-serum',
    price: '$34.00',
    numericPrice: 34.0,
    category: 'Serums',
    src: '/products/kojic.jpg',
    description: 'Kojic acid and turmeric clarifying serum for troubled skin, fading dark spots and boosting radiance.',
    keyIngredients: ['Kojic Acid', 'Fermented Turmeric'],
    benefits: ['Brightening', 'Dark Spot Fading'],
    clinicalClaim: '-48% Melanin Density',
    rating: 4.9,
    reviewsCount: 88,
    volume: '30ml',
    stockStatus: 'In Stock',
    vendor: 'Medicube'
  },
  {
    id: 5,
    name: 'CeraVe Foaming Acne Cream Cleanser',
    handle: 'cerave-acne-foaming-cream-cleanser',
    price: '$15.99',
    numericPrice: 15.99,
    category: 'Cleansers',
    src: '/products/cleanser.jpg',
    description: 'Face wash with 4% benzoyl peroxide to treat acne blemishes and clarify clogged pores.',
    keyIngredients: ['Benzoyl Peroxide 4%', 'Niacinamide'],
    benefits: ['Acne Control', 'Pore Clarifying'],
    clinicalClaim: 'Clears Active Breakouts',
    rating: 4.7,
    reviewsCount: 210,
    volume: '5oz',
    stockStatus: 'In Stock',
    vendor: 'CeraVe'
  }
];

test('ShopByConcern renders section title, subtitle, and all 5 primary concern tabs', () => {
  const html = renderToStaticMarkup(
    React.createElement(ShopByConcern, {
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop
    })
  );

  assert.ok(html.includes('SHOP BY SKIN CONCERN'));
  assert.ok(html.includes('TARGETED KOREAN FORMULATIONS · SHOP BY CONCERN'));

  // Ensure all 5 concern tabs are present with English & Korean labels
  assert.ok(html.includes('Hydration'));
  assert.ok(html.includes('수분 보습'));
  assert.ok(html.includes('Firming'));
  assert.ok(html.includes('탄력 리프팅'));
  assert.ok(html.includes('Barrier Repair'));
  assert.ok(html.includes('장벽 강화'));
  assert.ok(html.includes('Brightening &amp; Radiance') || html.includes('Brightening & Radiance'));
  assert.ok(html.includes('미백 광채'));
  assert.ok(html.includes('Pore Care &amp; Acne') || html.includes('Pore Care & Acne'));
  assert.ok(html.includes('모공 · 트러블'));
});

test('ShopByConcern dynamically matches products based on concern keywords and displays product cards', () => {
  const html = renderToStaticMarkup(
    React.createElement(ShopByConcern, {
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop
    })
  );

  // Default active tab is Hydration
  assert.ok(html.includes('Hydration Focus'));
  assert.ok(html.includes('Oligo-Hyaluronic Acid'));
  assert.ok(html.includes('Biodance Collagen Real Deep Mask'));
  assert.ok(html.includes('CeraVe Moisturizing Cream'));

  // Action buttons
  assert.ok(html.includes('Add'));
  assert.ok(html.includes('Quick view'));
  assert.ok(html.includes('id="concern-sort-select"'));
});

test('Mobile hero in index.css fills edge-to-edge (100% width) and displays SHOW BY BRAND button', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));

  // Edge to edge full width without max-width constriction
  assert.match(mobile, /\.reference-hero-composition \{\s*position: relative;\s*width: 100%;\s*aspect-ratio: 851 \/ 1848;/);
  assert.match(mobile, /\.reference-hero-artwork-shop span \{\s*display: inline;/);
  assert.match(mobile, /\.reference-hero-artwork-details span \{\s*display: inline;/);

  // Verifies visible styled SHOW BY BRAND button
  assert.match(mobile, /\.reference-hero-composition \.reference-hero-artwork-details/);

  const document = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(document.includes('SHOW BY BRAND'));
  assert.ok(!document.includes('VIEW CLINICAL DETAILS'));
});
