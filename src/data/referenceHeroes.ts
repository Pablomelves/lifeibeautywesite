import type { Product } from '../types';

export const REFERENCE_HEROES = [
  {
    id: 'red',
    shopifyId: 'gid://shopify/Product/10682294960268',
    handle: 'age-defying-firming-serum',
    title: 'MEDICUBE EGF NAD FIRMING SERUM',
    artwork: '/hero/medicube-egf-nad.webp',
    headerArtwork: '/hero/medicube-egf-nad-header.webp',
    background: '#5f0b0c',
    shop: { left: 5.52, top: 86.31, width: 49.59, height: 5.41 },
    details: { left: 5.52, top: 93.02, width: 38.07, height: 2.38 },
  },
  {
    id: 'yellow',
    shopifyId: 'gid://shopify/Product/10705876779148',
    handle: 'kojic-acid-turmeric-clarifying-capsule-serum-for-troubled-skin',
    title: 'KOJIC ACID TURMERIC CLARIFYING CAPSULE SERUM FOR TROUBLED SKIN',
    artwork: '/hero/kojic-acid-turmeric.webp',
    headerArtwork: '/hero/kojic-acid-turmeric-header.webp',
    background: '#d38503',
    shop: { left: 5.05, top: 85.55, width: 48.18, height: 5.14 },
    details: { left: 5.4, top: 91.99, width: 37.25, height: 2.38 },
  },
  {
    id: 'pink',
    shopifyId: 'gid://shopify/Product/10679311106188',
    handle: 'revitalizing-salmon-dna-lifting-serum',
    title: 'MEDICUBE PDRN PINK PEPTIDE SERUM',
    artwork: '/hero/medicube-pdrn-pink.webp',
    headerArtwork: '/hero/medicube-pdrn-pink-header.webp',
    background: '#d23f5f',
    shop: { left: 4.82, top: 85.98, width: 45.36, height: 5.19 },
    details: { left: 5.05, top: 92.05, width: 38.54, height: 2.38 },
  },
] as const;

export type ReferenceHero = typeof REFERENCE_HEROES[number];

export function referenceHeroForProduct(product: Product | null) {
  return product ? REFERENCE_HEROES.find(hero => hero.shopifyId === product.shopifyId) : undefined;
}

export function referenceHeroForPath(path: string) {
  return REFERENCE_HEROES.find(hero => path.replace(/\/$/, '') === `/products/${hero.handle}`);
}
