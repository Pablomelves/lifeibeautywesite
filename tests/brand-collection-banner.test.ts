import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandShoppingModal } from '../src/components/BrandShoppingModal';
import { BestSellers } from '../src/components/BestSellers';
import { getProductsForBrand, isProductOfBrand } from '../src/services/brandService';
import type { Product } from '../src/types';

const mockMedicubeProduct: Product = {
  id: 1,
  shopifyId: 'gid://shopify/Product/1',
  name: 'Medicube PDRN Pink Peptide Serum',
  handle: 'medicube-pdrn-pink-peptide-serum',
  price: '$39.99',
  numericPrice: 39.99,
  category: 'Serum',
  src: '/products/medicube-pink.jpg',
  rating: 4.9,
  reviewsCount: 128,
  volume: '30ml / 1.01 fl. oz.',
  description: 'Multi-peptide firming serum with salmon PDRN.',
  badge: 'Bestseller',
  availableForSale: true,
};

const mockBiodanceProduct: Product = {
  id: 2,
  shopifyId: 'gid://shopify/Product/2',
  name: 'Biodance Bio-Collagen Real Deep Mask',
  handle: 'biodance-bio-collagen-real-deep-mask',
  price: '$19.99',
  numericPrice: 19.99,
  category: 'Mask',
  src: '/products/biodance.png',
  rating: 4.8,
  reviewsCount: 94,
  volume: '4 Masks',
  description: 'Deep hydrating overnight collagen mask.',
  badge: 'Popular',
  availableForSale: true,
};

const mockProducts: Product[] = [mockMedicubeProduct, mockBiodanceProduct];

const noop = () => {};

test('Medicube brand collection page renders official lineup hero banner with exact reference asset', () => {
  const html = renderToStaticMarkup(
    React.createElement(BrandShoppingModal, {
      brandId: 'medicube',
      isOpen: true,
      onClose: noop,
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  // Exact reference image asset must be used as primary source
  assert.ok(html.includes('src="/5931077C-048F-40AA-B867-AEFF21A819B7.png"'));
  assert.ok(html.includes('alt="Medicube Official Skincare Lineup'));

  // Responsive srcset with tailored mobile asset for smaller screen widths
  assert.ok(html.includes('srcset=') || html.includes('srcSet='));
  assert.ok(html.includes('/5931077C-048F-40AA-B867-AEFF21A819B7-mobile.webp'));
  assert.ok(html.includes('/5931077C-048F-40AA-B867-AEFF21A819B7-mobile.png'));
  assert.ok(html.includes('768w'));
  assert.ok(html.includes('1920w'));

  // Picture element and media queries for tailored mobile assets
  assert.ok(html.includes('<picture'));
  assert.ok(html.includes('media="(max-width: 768px)"'));
  assert.ok(html.includes('sizes='));

  // High performance loading attributes
  assert.ok(html.includes('loading="eager"'));
  assert.ok(html.includes('fetchpriority="high"') || html.includes('fetchPriority="high"'));

  // Supports all 3 device modes perfectly: mobile, tablet, and desktop
  assert.ok(html.includes('media="(max-width: 768px)"')); // Mobile mode
  assert.ok(html.includes('media="(min-width: 769px) and (max-width: 1024px)"')); // Tablet mode
  assert.ok(html.includes('/5931077C-048F-40AA-B867-AEFF21A819B7-tablet.webp'));
  assert.ok(html.includes('/5931077C-048F-40AA-B867-AEFF21A819B7-tablet.png'));
  assert.ok(html.includes('media="(min-width: 1025px)"')); // Desktop mode
  assert.ok(html.includes('/5931077C-048F-40AA-B867-AEFF21A819B7.webp'));

  // Responsive object-contain scaling to prevent product clipping
  assert.ok(html.includes('object-contain'));

  // Accessible section landmark
  assert.ok(html.includes('aria-label="Medicube Official Brand Lineup Banner"'));
});

test('Other brand collections (Biodance, CeraVe) do not display the Medicube lineup banner', () => {
  const biodanceHtml = renderToStaticMarkup(
    React.createElement(BrandShoppingModal, {
      brandId: 'biodance',
      isOpen: true,
      onClose: noop,
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  assert.equal(biodanceHtml.includes('5931077C-048F-40AA-B867-AEFF21A819B7.png'), false);
  assert.equal(biodanceHtml.includes('Medicube Official Brand Lineup Banner'), false);
});

test('Medicube brand collection displays real Shopify products below the banner with details and controls', () => {
  const html = renderToStaticMarkup(
    React.createElement(BrandShoppingModal, {
      brandId: 'medicube',
      isOpen: true,
      onClose: noop,
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  // Medicube collection title and description are present
  assert.ok(html.includes('Medicube'));
  assert.ok(html.includes('Clinical K-Beauty'));
  // Real Medicube product from Shopify
  assert.ok(html.includes('Medicube PDRN Pink Peptide Serum'));
  assert.ok(html.includes('$39.99'));
  assert.ok(html.includes('Add to Bag'));
  // Biodance product is excluded from Medicube brand collection
  assert.equal(html.includes('Biodance Bio-Collagen Real Deep Mask'), false);
});

test('Brand service correctly isolates Medicube products without duplicate or guessed items', () => {
  assert.equal(isProductOfBrand(mockMedicubeProduct, 'medicube'), true);
  assert.equal(isProductOfBrand(mockBiodanceProduct, 'medicube'), false);

  const matched = getProductsForBrand(mockProducts, 'medicube');
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, mockMedicubeProduct.id);
});

test('BrandShoppingModal renders horizontal brand filter strip below Medicube banner with quick toggle buttons', () => {
  const html = renderToStaticMarkup(
    React.createElement(BrandShoppingModal, {
      brandId: 'medicube',
      isOpen: true,
      onClose: noop,
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  // Horizontal brand filter strip is rendered
  assert.ok(html.includes('aria-label="Curated Brands Quick Switch Strip"'));
  assert.ok(html.includes('Curated Brand Filter'));
  // Contains buttons for curated brands
  assert.ok(html.includes('Medicube'));
  assert.ok(html.includes('Biodance'));
  assert.ok(html.includes('CeraVe'));
  assert.ok(html.includes('All Curated Brands'));
});

test('BrandShoppingModal sorting dropdown includes Price Low-High, Price High-Low, Newest Arrivals, and Sales', () => {
  const html = renderToStaticMarkup(
    React.createElement(BrandShoppingModal, {
      brandId: 'medicube',
      isOpen: true,
      onClose: noop,
      products: mockProducts,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  assert.ok(html.includes('id="brand-sort-select"'));
  assert.ok(html.includes('Price: Low to High'));
  assert.ok(html.includes('Price: High to Low'));
  assert.ok(html.includes('Newest Arrivals'));
  assert.ok(html.includes('Sales &amp; Offers') || html.includes('Sales & Offers'));
  // Quick sales filter button is also present
  assert.ok(html.includes('On Sale'));
});

test('BestSellers renders BRANDS AND BEST SELLERS title and replaces category tabs with brand tabs', () => {
  const html = renderToStaticMarkup(
    React.createElement(BestSellers, {
      products: mockProducts,
      selectedCategory: 'all',
      onSelectCategory: noop,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  // Section title matches requirement
  assert.ok(html.includes('BRANDS AND BEST SELLERS'));
  assert.ok(!html.includes('FEATURED &amp; BEST SELLERS') && !html.includes('FEATURED & BEST SELLERS'));

  // Category tabs have been removed
  assert.ok(!html.includes('Glass Serums'));
  assert.ok(!html.includes('Masks &amp; Prep') && !html.includes('Masks & Prep'));
  assert.ok(!html.includes('Barrier Creams'));

  // Brand tabs have replaced them
  assert.ok(html.includes('All Brands'));
  assert.ok(html.includes('Medicube'));
  assert.ok(html.includes('Biodance'));
  assert.ok(html.includes('CeraVe'));
});

test('BestSellers divides each brand with its curated products in the All Brands view', () => {
  const html = renderToStaticMarkup(
    React.createElement(BestSellers, {
      products: mockProducts,
      selectedCategory: 'all',
      onSelectCategory: noop,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  // Medicube curated section exists with its Korean tag and product
  assert.ok(html.includes('메디큐브'));
  assert.ok(html.includes('Medicube PDRN Pink Peptide Serum'));

  // Biodance curated section exists with its Korean tag and product
  assert.ok(html.includes('바이오던스'));
  assert.ok(html.includes('Biodance Bio-Collagen Real Deep Mask'));
});

