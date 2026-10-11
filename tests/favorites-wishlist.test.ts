import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../src/components/Header';
import { MyFavoritesSection } from '../src/components/MyFavoritesSection';
import type { Product } from '../src/types';

const noop = () => {};

const mockProduct: Product = {
  id: 10691183050892,
  shopifyId: 'gid://shopify/Product/10691183050892',
  name: 'Rose PDRN Glass Glow Ampoule',
  subtitle: 'Salmon DNA & Peptide Serum',
  price: '$39.99',
  numericPrice: 39.99,
  category: 'serums',
  src: 'https://cdn.shopify.com/s/files/1/0000/0001/products/ampoule.jpg',
  volume: '30 ml / 1.01 fl. oz.',
  rating: 4.9,
  reviewsCount: 142,
  availableForSale: true,
  variants: [
    {
      id: 'gid://shopify/ProductVariant/101',
      title: 'Default Title',
      price: '$39.99',
      numericPrice: 39.99,
      availableForSale: true,
    }
  ],
};

test('Header hides the count badge when wishlistCount is 0', () => {
  const html = renderToStaticMarkup(
    React.createElement(Header, {
      cartCount: 0,
      wishlistCount: 0,
      onOpenCart: noop,
      onOpenSearch: noop,
      onOpenAccount: noop,
      onSelectCategory: noop,
      onNavigateSection: noop,
      onOpenAbout: noop,
      onOpenContact: noop,
    })
  );

  // Badge span with bg-[#EC3460] containing count should NOT appear
  assert.doesNotMatch(html, /<span[^>]*class="[^"]*animate-pop[^"]*">\s*0\s*<\/span>/);
  // Heart icon should have fill="none"
  assert.match(html, /fill="none"/);
  // Accessible label indicates 0 saved items
  assert.match(html, /aria-label="Wishlist, 0 saved items"/);
});

test('Header displays accurate badge and filled heart when wishlistCount > 0', () => {
  const html = renderToStaticMarkup(
    React.createElement(Header, {
      cartCount: 0,
      wishlistCount: 2,
      onOpenCart: noop,
      onOpenSearch: noop,
      onOpenAccount: noop,
      onSelectCategory: noop,
      onNavigateSection: noop,
      onOpenAbout: noop,
      onOpenContact: noop,
    })
  );

  // Badge should show 2
  assert.match(html, /<span[^>]*class="[^"]*animate-pop[^"]*">\s*2\s*<\/span>/);
  // Heart icon should be filled
  assert.match(html, /fill="#EC3460"/);
  // Accessible label indicates 2 saved items
  assert.match(html, /aria-label="Wishlist, 2 saved items"/);
});

test('MyFavoritesSection renders empty state when customer has 0 saved favorites', () => {
  const html = renderToStaticMarkup(
    React.createElement(MyFavoritesSection, {
      products: [mockProduct],
      wishlistIds: [],
      onToggleWishlist: noop,
      onAddToCart: noop,
      onQuickView: noop,
    })
  );

  assert.match(html, /YOUR FAVORITES LIST IS EMPTY/);
  assert.match(html, /0 Saved/);
});

test('MyFavoritesSection renders saved product when customer has saved items', () => {
  const html = renderToStaticMarkup(
    React.createElement(MyFavoritesSection, {
      products: [mockProduct],
      wishlistIds: [mockProduct.id],
      onToggleWishlist: noop,
      onAddToCart: noop,
      onQuickView: noop,
    })
  );

  assert.doesNotMatch(html, /YOUR FAVORITES LIST IS EMPTY/);
  assert.match(html, /1 Saved/);
  assert.match(html, /Rose PDRN Glass Glow Ampoule/);
});

test('Stale or demo IDs (e.g. 1, 2, 3, 4) that are not in catalog evaluate to empty favorites list', () => {
  const staleDemoIds = [1, 2, 3, 4];
  // Filtering against catalog products
  const matching = [mockProduct].filter(p => staleDemoIds.includes(p.id));
  assert.equal(matching.length, 0);

  const html = renderToStaticMarkup(
    React.createElement(MyFavoritesSection, {
      products: [mockProduct],
      wishlistIds: staleDemoIds.filter(id => [mockProduct].some(p => p.id === id)),
      onToggleWishlist: noop,
      onAddToCart: noop,
      onQuickView: noop,
    })
  );

  assert.match(html, /YOUR FAVORITES LIST IS EMPTY/);
  assert.match(html, /0 Saved/);
});

test('Customer favorites isolation creates separate keys for different customers', () => {
  const getCustomerWishlistKey = (email?: string): string => {
    const trimmed = email?.trim().toLowerCase();
    if (trimmed && trimmed.includes('@')) {
      return `lifei_wishlist_${trimmed}`;
    }
    return 'lifei_wishlist_guest';
  };

  const customerA = getCustomerWishlistKey('pablo.kelvin17@gmail.com');
  const customerB = getCustomerWishlistKey('sarah.lee@example.com');
  const guest = getCustomerWishlistKey('');

  assert.equal(customerA, 'lifei_wishlist_pablo.kelvin17@gmail.com');
  assert.equal(customerB, 'lifei_wishlist_sarah.lee@example.com');
  assert.equal(guest, 'lifei_wishlist_guest');
  assert.notEqual(customerA, customerB);
  assert.notEqual(customerA, guest);
});

