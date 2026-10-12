import { useEffect, useRef, useState, useCallback } from 'react';
import type { CartItem, Product } from '../types';
import { requestBag, restoreBag, serializeBag, type StoredBagLine } from '../services/bag';

const LOCAL_STORAGE_KEY = 'lifei_bag_backup';

function readLocalBackup(): StoredBagLine[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalBackup(lines: StoredBagLine[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage might be unavailable or full
  }
}

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

  // Initial load from server
  useEffect(() => {
    const controller = new AbortController();
    active.current = true;
    requestBag('GET', undefined, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        revision.current = data.revision;
        const serverLines = data.lines || [];
        if (serverLines.length > 0) {
          setSavedLines(serverLines);
        } else {
          // If server has empty bag, check if there's local storage backup
          const localLines = readLocalBackup();
          setSavedLines(localLines.length > 0 ? localLines : []);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // On network failure, fall back to local storage
        const localLines = readLocalBackup();
        setSavedLines(localLines);
        setPersistenceError('Your saved bag is unavailable. You can still shop and checkout, but changes may not sync to server.');
      });

    return () => {
      active.current = false;
      controller.abort();
    };
  }, []);

  // Hydrate cart when catalog is ready
  useEffect(() => {
    if (initialized.current || savedLines === null || !catalogReady) return;
    if (catalogError && !products.length) {
      setPersistenceError('Your saved bag cannot be displayed until current product information loads. The saved bag has not been cleared. Please retry.');
      setCartReady(true);
      return;
    }

    const restored = restoreBag(savedLines, products);
    if (restored.length !== savedLines.length && savedLines.length > 0) {
      setPersistenceError('Some saved products are no longer published. Available items have been restored.');
    }

    const serialized = serializeBag(restored);
    lastQueued.current = JSON.stringify(serialized);
    writeLocalBackup(serialized);
    initialized.current = true;
    setCartItems(restored);
    setCartReady(true);
  }, [savedLines, products, catalogReady, catalogError]);

  // Synchronize cart changes to server
  useEffect(() => {
    if (!cartReady || !initialized.current) return;
    const lines = serializeBag(cartItems);
    writeLocalBackup(lines);

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
        if (active.current) {
          setPersistenceError(error instanceof Error ? error.message : 'Your bag could not be saved. Please retry.');
        }
      }
    });
  }, [cartItems, cartReady]);

  // Retry persistence functionality
  const retryPersistence = useCallback(() => {
    setPersistenceError(null);

    queue.current = queue.current.catch(() => {}).then(async () => {
      try {
        const lines = serializeBag(cartItems);
        // Refresh session revision from server
        const current = await requestBag('GET');
        revision.current = current.revision;

        // If cart items exist, save them
        if (lines.length > 0) {
          const data = await requestBag('PUT', { lines, revision: current.revision });
          revision.current = data.revision;
        } else if (current.lines && current.lines.length > 0 && products.length > 0) {
          // If local items were empty but server had items, restore them
          const restored = restoreBag(current.lines, products);
          setCartItems(restored);
        }

        if (!initialized.current) {
          initialized.current = true;
          setCartReady(true);
        }

        if (active.current) setPersistenceError(null);
      } catch {
        if (active.current) {
          setPersistenceError('Your bag could not be saved. Your current items are still available for checkout. Please retry.');
        }
      }
    });
  }, [cartItems, products]);

  const flushPersistence = () => queue.current;

  return { cartItems, setCartItems, cartReady, persistenceError, retryPersistence, flushPersistence };
}
