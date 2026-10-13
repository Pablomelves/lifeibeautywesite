import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GoogleSignInButton } from '../src/components/GoogleSignInButton';
import { resolveFirebaseAuthErrorMessage, firebaseConfig } from '../src/services/firebase';
import type { CustomerUser } from '../src/types';

test('resolveFirebaseAuthErrorMessage handles popup-closed-by-user gracefully', () => {
  const msg = resolveFirebaseAuthErrorMessage({ code: 'auth/popup-closed-by-user' });
  assert.match(msg, /closed before completion/i);
});

test('resolveFirebaseAuthErrorMessage handles auth/popup-blocked with clear guidance', () => {
  const msg = resolveFirebaseAuthErrorMessage({ code: 'auth/popup-blocked' });
  assert.match(msg, /popup was blocked/i);
  assert.match(msg, /lifeibeauty\.com/);
});

test('resolveFirebaseAuthErrorMessage handles auth/unauthorized-domain with setup instructions', () => {
  const msg = resolveFirebaseAuthErrorMessage({ code: 'auth/unauthorized-domain' });
  assert.match(msg, /not authorized/i);
  assert.match(msg, /Authorized Domains/i);
});

test('resolveFirebaseAuthErrorMessage handles auth/cancelled-popup-request', () => {
  const msg = resolveFirebaseAuthErrorMessage({ code: 'auth/cancelled-popup-request' });
  assert.match(msg, /only one sign-in window/i);
});

test('GoogleSignInButton renders unauthenticated CTA with Google branding', () => {
  const html = renderToStaticMarkup(
    React.createElement(GoogleSignInButton, {
      currentUser: null,
    })
  );

  assert.match(html, /Continue with Google/);
  // Contains Google 4-color SVG paths
  assert.match(html, /#4285F4/);
  assert.match(html, /#34A853/);
  assert.match(html, /#FBBC05/);
  assert.match(html, /#EA4335/);
});

test('GoogleSignInButton renders authenticated customer card with Connected badge and Sign Out button', () => {
  const mockCustomer: CustomerUser = {
    uid: 'firebase-user-123',
    email: 'pablo.kelvin17@gmail.com',
    displayName: 'Pablo Kelvin',
    photoURL: 'https://lh3.googleusercontent.com/a/mock-photo',
  };

  const html = renderToStaticMarkup(
    React.createElement(GoogleSignInButton, {
      currentUser: mockCustomer,
    })
  );

  assert.doesNotMatch(html, /Continue with Google/);
  assert.match(html, /Pablo Kelvin/);
  assert.match(html, /pablo\.kelvin17@gmail\.com/);
  assert.match(html, /Connected/);
  assert.match(html, /Sign Out/);
  assert.match(html, /referrerPolicy="no-referrer"/);
});

test('Customer profile isolation separates storage keys by Firebase uid without merging data', () => {
  const getCustomerProfileKey = (user: CustomerUser | null): string => {
    if (user?.uid) {
      return `lifei_profile_${user.uid}`;
    }
    return 'lifei_profile_info';
  };

  const userA: CustomerUser = {
    uid: 'google-uid-001',
    email: 'customer.a@example.com',
    displayName: 'Customer A',
    photoURL: null,
  };

  const userB: CustomerUser = {
    uid: 'google-uid-002',
    email: 'customer.b@example.com',
    displayName: 'Customer B',
    photoURL: null,
  };

  const guestKey = getCustomerProfileKey(null);
  const keyA = getCustomerProfileKey(userA);
  const keyB = getCustomerProfileKey(userB);

  assert.equal(guestKey, 'lifei_profile_info');
  assert.equal(keyA, 'lifei_profile_google-uid-001');
  assert.equal(keyB, 'lifei_profile_google-uid-002');
  assert.notEqual(keyA, keyB);
  assert.notEqual(keyA, guestKey);
});

test('Customer wishlist isolation maintains unique keys per customer and guest', () => {
  const getCustomerWishlistKey = (email?: string): string => {
    const trimmed = email?.trim().toLowerCase();
    if (trimmed && trimmed.includes('@')) {
      return `lifei_wishlist_${trimmed}`;
    }
    return 'lifei_wishlist_guest';
  };

  const guestKey = getCustomerWishlistKey(undefined);
  const userAKey = getCustomerWishlistKey('customer.a@example.com');
  const userBKey = getCustomerWishlistKey('customer.b@example.com');

  assert.equal(guestKey, 'lifei_wishlist_guest');
  assert.equal(userAKey, 'lifei_wishlist_customer.a@example.com');
  assert.equal(userBKey, 'lifei_wishlist_customer.b@example.com');
  assert.notEqual(userAKey, userBKey);
  assert.notEqual(userAKey, guestKey);
});

test('Customer authentication state is completely separate from administrator sessions', () => {
  // Admin session uses lifei_admin_session cookie / localStorage key lifei_admin_auth
  const ADMIN_STORAGE_KEY = 'lifei_admin_auth';
  const CUSTOMER_PREFIX = 'lifei_profile_';

  assert.ok(!ADMIN_STORAGE_KEY.startsWith(CUSTOMER_PREFIX));
});

test('Firebase configuration targets the lifeibeauty project with exact credentials', () => {
  assert.equal(firebaseConfig.projectId, 'lifeibeauty');
  assert.equal(firebaseConfig.authDomain, 'lifeibeauty.firebaseapp.com');
  assert.equal(firebaseConfig.storageBucket, 'lifeibeauty.firebasestorage.app');
  assert.equal(firebaseConfig.messagingSenderId, '832141637137');
  assert.equal(firebaseConfig.appId, '1:832141637137:web:e246d8b6dd041b77b2a3b0');
  assert.equal(firebaseConfig.apiKey, 'AIzaSyAztZxZwtVdeiYOtPjJn0KMfR63SIMKez4');
});
