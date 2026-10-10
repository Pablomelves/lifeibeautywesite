import { useEffect, useRef, useState } from 'react';
import type { CartItem, Product } from '../types';
import { requestBag, restoreBag, serializeBag, type StoredBagLine } from '../services/bag';

export function usePersistentBag(products: Product[], catalogReady: boolean, catalogError: string | null = null) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedLines, setSavedLines] = useState<StoredBagLine[] | null>(null);
  const [cartReady, setCartReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const revision = useRef(0);
  const initialized = useRef(false);
  const lastQueued = useRef('');
  const queue = useRef<Promise<void>>(Promise.resolve());
  const active = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    active.current = true;
    requestBag('GET', undefined, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      revision.current = data.revision;
      setSavedLines(data.lines || []);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setPersistenceError('Your saved bag is unavailable. You can still shop and checkout, but your current bag may not be saved.');
      setSavedLines([]);
    });
    return () => { active.current = false; controller.abort(); };
  }, []);

  useEffect(() => {
    if (initialized.current || savedLines === null || !catalogReady) return;
    if (catalogError && !products.length) {
      setPersistenceError('Your saved bag cannot be displayed until current product information loads. The saved bag has not been cleared. Please retry.');
      setCartReady(true);
      return;
    }
    const restored = restoreBag(savedLines, products);
    if (restored.length !== savedLines.length) setPersistenceError('Some saved products are no longer published. Available items have been restored.');
    lastQueued.current = JSON.stringify(serializeBag(restored));
    initialized.current = true;
    setCartItems(restored);
    setCartReady(true);
  }, [savedLines, products, catalogReady, catalogError]);

  useEffect(() => {
    if (!cartReady || !initialized.current) return;
    const lines = serializeBag(cartItems);
    const signature = JSON.stringify(lines);
    if (signature === lastQueued.current) return;
    lastQueued.current = signature;
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!active.current) return;
      try {
        const data = await requestBag('PUT', { lines, revision: revision.current });
        revision.current = data.revision;
        if (active.current) setPersistenceError(null);
      } catch (error) {
        if (active.current) setPersistenceError(error instanceof Error ? error.message : 'Your bag could not be saved. Please retry.');
      }
    });
  }, [cartItems, cartReady]);

  const retryPersistence = () => {
    if (!initialized.current) return;
    const lines = serializeBag(cartItems);
    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        const current = await requestBag('GET');
        const data = await requestBag('PUT', { lines, revision: current.revision });
        revision.current = data.revision;
        if (active.current) setPersistenceError(null);
      } catch {
        if (active.current) setPersistenceError('Your bag could not be saved. Your current items are still available for checkout. Please retry.');
      }
    });
  };

  const flushPersistence = () => queue.current;
  return { cartItems, setCartItems, cartReady, persistenceError, retryPersistence, flushPersistence };
}
