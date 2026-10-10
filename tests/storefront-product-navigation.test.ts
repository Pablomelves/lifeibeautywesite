import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { transformSync } from 'esbuild';

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const effectStart = source.indexOf('  useEffect(() => {\n    const syncRoute');
const effectEnd = source.indexOf('  }, [products]);', effectStart);
assert.ok(effectStart !== -1 && effectEnd !== -1, 'The storefront registers its route synchronization effect');
const effectScript = transformSync(source.slice(effectStart, effectEnd + '  }, [products]);'.length), {
  loader: 'tsx', target: 'es2022',
}).code;

function storefront(path = '/') {
  let selectedProduct: { id: number; handle: string } | null = null;
  let cleanup: (() => void) | undefined;
  const listeners = new Map<string, () => void>();
  const location = { pathname: path };
  const notices: string[] = [];
  const product = { id: 123, handle: 'published-product' };
  const context = {
    window: {
      location,
      addEventListener: (event: string, listener: () => void) => listeners.set(event, listener),
      removeEventListener: (event: string, listener: () => void) => {
        if (listeners.get(event) === listener) listeners.delete(event);
      },
    },
    document: { getElementById: () => null },
    products: [product],
    setRoutePath: () => {},
    setPolicyType: () => {},
    setAboutContactMode: () => {},
    setQuickViewProduct: (value: typeof selectedProduct) => { selectedProduct = value; },
    showToast: (message: string) => notices.push(message),
  };
  const refresh = (products = [product]) => {
    cleanup?.();
    context.products = products;
    runInNewContext(effectScript, { ...context, useEffect: (callback: () => () => void) => { cleanup = callback(); } });
  };
  refresh();
  return {
    product,
    notices,
    refresh,
    select: () => { selectedProduct = product; },
    selected: () => selectedProduct,
    navigate: (path: string) => { location.pathname = path; listeners.get('popstate')?.(); },
    cleanup: () => { cleanup?.(); assert.equal(listeners.size, 0); },
  };
}

test('catalog refreshes keep a product opened from the homepage visible', () => {
  const store = storefront();
  store.select();
  for (let refreshCount = 0; refreshCount < 3; refreshCount++) {
    store.refresh([{ ...store.product }]);
    assert.equal(store.selected(), store.product);
  }
  store.cleanup();
});

test('direct product links wait for catalog loading and remain open after refresh', () => {
  const store = storefront('/products/published-product/');
  assert.equal(store.selected(), store.product);
  store.refresh([]);
  const updatedProduct = { ...store.product };
  store.refresh([updatedProduct]);
  assert.equal(store.selected(), updatedProduct);
  store.cleanup();
});

test('browser navigation still opens product routes and closes products when leaving them', () => {
  const store = storefront();
  store.select();
  store.navigate('/');
  assert.equal(store.selected(), null);
  store.navigate('/products/published-product');
  assert.equal(store.selected(), store.product);
  store.navigate('/pages/contact');
  assert.equal(store.selected(), null);
  store.cleanup();
});

test('invalid and unavailable product links retain their existing notices', () => {
  const store = storefront();
  store.navigate('/products/%');
  store.navigate('/products/missing-product');
  assert.equal(store.notices.length, 2);
  assert.match(store.notices[0], /invalid/);
  assert.match(store.notices[1], /not available/);
  store.cleanup();
});
