import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PolicyModal } from '../src/components/PolicyModal';

test('shipping policy displays the approved copy regardless of Shopify loading, errors, or old content', () => {
  for (const state of [{ isLoading: true }, { error: 'Store information is unavailable.' }, { document: { title: 'Old shipping policy', body: '<p>Outdated shipping terms.</p>' } }]) {
    const html = renderToStaticMarkup(React.createElement(PolicyModal, { type: 'shipping', onClose: () => {}, ...state }));
    for (const heading of ['1. Order Processing', '2. Shipping Methods and Costs', '3. Delivery Times', '4. Order Tracking', '5. Incorrect Addresses', '6. Delayed, Lost, or Damaged Orders', '7. International Shipping', '8. Contact Us']) {
      assert.ok(html.includes(heading));
    }
    assert.ok(html.includes('At Li Fei Beauty, we aim to provide a smooth and transparent shopping experience.'));
    assert.ok(html.includes('Li Fei Beauty — Premium Korean Skincare &amp; Barrier Repair.'));
    assert.match(html, /<button[^>]*>contact page<\/button>/);
    assert.doesNotMatch(html, /Loading the current store policy|Store information is unavailable|Outdated shipping terms|not yet been published/);
  }
});

test('other policies retain their existing loading and error handling', () => {
  const loading = renderToStaticMarkup(React.createElement(PolicyModal, { type: 'returns', onClose: () => {}, isLoading: true }));
  assert.match(loading, /Loading the current store policy/);
  const error = renderToStaticMarkup(React.createElement(PolicyModal, { type: 'privacy', onClose: () => {}, error: 'Store information is unavailable.' }));
  assert.match(error, /Store information is unavailable/);
  assert.doesNotMatch(error, /1\. Order Processing/);
});
