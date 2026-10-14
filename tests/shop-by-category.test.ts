import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BestSellers } from '../src/components/BestSellers';
import { CategoryTilesSection } from '../src/components/CategoryTilesSection';
import { STORE_CATEGORIES, isProductInCategory, getCategoryById, normalizeCategoryId } from '../src/services/categoryFilter';
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

const mockRollerProduct: Product = {
  id: 3,
  shopifyId: 'gid://shopify/Product/3',
  name: 'Seoul Clinical Cryo Contour Roller Gift Set',
  handle: 'cryo-contour-roller-set',
  price: '$45.00',
  numericPrice: 45.0,
  category: 'Tools & Rollers',
  src: '/products/facial-roller.jpg',
  rating: 4.9,
  reviewsCount: 42,
  volume: '1 Set',
  description: 'Facial sculpting roller and peptide serum bundle kit.',
  badge: 'Gift Pick',
  availableForSale: true,
};

const mockProducts: Product[] = [mockMedicubeProduct, mockBiodanceProduct, mockRollerProduct];
const noop = () => {};

test('Category filter service defines standard luxury beauty categories', () => {
  const ids = STORE_CATEGORIES.map(c => c.id);
  assert.ok(ids.includes('all'));
  assert.ok(ids.includes('skincare'));
  assert.ok(ids.includes('makeup'));
  assert.ok(ids.includes('haircare'));
  assert.ok(ids.includes('bathbody'));
  assert.ok(ids.includes('fragrances'));
  assert.ok(ids.includes('giftsets'));
});

test('isProductInCategory correctly filters skincare and giftset products', () => {
  assert.equal(isProductInCategory(mockMedicubeProduct, 'skincare'), true);
  assert.equal(isProductInCategory(mockBiodanceProduct, 'skincare'), true);
  assert.equal(isProductInCategory(mockRollerProduct, 'giftsets'), true);
  assert.equal(isProductInCategory(mockMedicubeProduct, 'all'), true);
});

test('BestSellers renders Shop by Category navigation bar with all category tabs', () => {
  const html = renderToStaticMarkup(
    React.createElement(BestSellers, {
      products: mockProducts,
      selectedCategory: 'all',
      onSelectCategory: noop,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  assert.ok(html.includes('Shop by Category:'));
  assert.ok(html.includes('All Categories'));
  assert.ok(html.includes('Skin Care'));
  assert.ok(html.includes('Makeup'));
  assert.ok(html.includes('Hair Care'));
  assert.ok(html.includes('Bath &amp; Body') || html.includes('Bath & Body'));
  assert.ok(html.includes('Fragrances'));
  assert.ok(html.includes('Gift Sets'));
});

test('BestSellers filtered by skincare displays matching products with category header', () => {
  const html = renderToStaticMarkup(
    React.createElement(BestSellers, {
      products: mockProducts,
      selectedCategory: 'skincare',
      onSelectCategory: noop,
      onQuickView: noop,
      onAddToCart: noop,
    })
  );

  assert.ok(html.includes('스킨케어'));
  assert.ok(html.includes('Skin Care'));
  assert.ok(html.includes('Medicube PDRN Pink Peptide Serum'));
  assert.ok(html.includes('Biodance Bio-Collagen Real Deep Mask'));
  assert.ok(html.includes('View All Products') || html.includes('VIEW ALL PRODUCTS'));
});

test('CategoryTilesSection renders 6 attractive category tiles', () => {
  const html = renderToStaticMarkup(
    React.createElement(CategoryTilesSection, {
      onSelectCategory: noop,
      onNavigateSection: noop,
    })
  );

  assert.ok(html.includes('SHOP BY CATEGORY'));
  assert.ok(html.includes('Skin Care'));
  assert.ok(html.includes('Makeup'));
  assert.ok(html.includes('Hair Care'));
  assert.ok(html.includes('Bath &amp; Body') || html.includes('Bath & Body'));
  assert.ok(html.includes('Fragrances'));
  assert.ok(html.includes('Gift Sets'));
});
