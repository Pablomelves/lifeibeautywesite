import type { Product } from '../types';

export interface ProductCategoryOption {
  id: string;
  name: string;
  description: string;
  tagline: string;
  koreanTag: string;
}

export const STORE_CATEGORIES: ProductCategoryOption[] = [
  {
    id: 'all',
    name: 'All Categories',
    description: 'Explore the complete catalog of Korean skincare, cosmetics, and self-care essentials.',
    tagline: 'Complete Collection',
    koreanTag: '전체 상품',
  },
  {
    id: 'skincare',
    name: 'Skin Care',
    description: 'High-performance serums, barrier creams, hydrogel masks, and gentle exfoliating toners.',
    tagline: 'Serums, Toners & Creams',
    koreanTag: '스킨케어',
  },
  {
    id: 'makeup',
    name: 'Makeup',
    description: 'Radiant cushions, lip treatments, tone-up formulations, and natural glow cosmetics.',
    tagline: 'Cushions, Tints & Glow',
    koreanTag: '메이크업',
  },
  {
    id: 'haircare',
    name: 'Hair Care',
    description: 'Nourishing scalp treatments, root strengthening essences, and restorative hair care.',
    tagline: 'Scalp Health & Repair',
    koreanTag: '헤어케어',
  },
  {
    id: 'bathbody',
    name: 'Bath & Body',
    description: 'Hydrating body lotions, barrier cushions, gentle cleansers, and soothing body washes.',
    tagline: 'Hydration & Treatments',
    koreanTag: '바디케어',
  },
  {
    id: 'fragrances',
    name: 'Fragrances',
    description: 'Subtle Seoul aromas, refreshing mists, and clean signature beauty fragrances.',
    tagline: 'Seoul Scents & Mist',
    koreanTag: '향수 & 미스트',
  },
  {
    id: 'giftsets',
    name: 'Gift Sets',
    description: 'Curated beauty gift boxes, multi-step ritual bundles, and clinical sculpting tools.',
    tagline: 'Curated Rituals & Tools',
    koreanTag: '기획 세트',
  },
];

export function normalizeCategoryId(value: string): string {
  const normalized = (value || '').toLowerCase().trim().replace(/[^\w]/g, '');
  if (normalized === 'skincare' || normalized === 'skin' || normalized === 'serums' || normalized === 'creams' || normalized === 'masks') return 'skincare';
  if (normalized === 'makeup' || normalized === 'cosmetics') return 'makeup';
  if (normalized === 'haircare' || normalized === 'hair') return 'haircare';
  if (normalized === 'bathbody' || normalized === 'bath' || normalized === 'body') return 'bathbody';
  if (normalized === 'fragrances' || normalized === 'fragrance') return 'fragrances';
  if (normalized === 'giftsets' || normalized === 'gift' || normalized === 'gifts' || normalized === 'tools' || normalized === 'sets') return 'giftsets';
  return normalized || 'all';
}

export function isProductInCategory(product: Product, categoryId: string): boolean {
  if (!product) return false;
  const target = normalizeCategoryId(categoryId);
  if (!target || target === 'all') return true;

  const title = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const desc = (product.description || product.fullDescription || '').toLowerCase();
  const type = (product.subtitle || '').toLowerCase();
  const tags = (product.tags || []).map(t => t.toLowerCase());
  const collections = (product.collections || []).map(c => `${c.title} ${c.handle}`.toLowerCase());
  const corpus = `${title} ${cat} ${desc} ${type} ${tags.join(' ')} ${collections.join(' ')}`;

  if (target === 'skincare') {
    return (
      cat.includes('serum') || cat.includes('mask') || cat.includes('moistur') ||
      cat.includes('clean') || cat.includes('eye') || cat.includes('cream') ||
      cat.includes('skin') || corpus.includes('serum') || corpus.includes('mask') ||
      corpus.includes('cream') || corpus.includes('toner') || corpus.includes('cleanser') ||
      corpus.includes('pads') || corpus.includes('peptide') || corpus.includes('collagen') ||
      corpus.includes('ceramide') || corpus.includes('pdrn') || corpus.includes('skincare') ||
      corpus.includes('facial') || !corpus.includes('scalp')
    );
  }

  if (target === 'makeup') {
    return (
      cat.includes('makeup') || corpus.includes('makeup') || corpus.includes('cushion') ||
      corpus.includes('tint') || corpus.includes('bb cream') || corpus.includes('cc cream') ||
      corpus.includes('tone up') || corpus.includes('glow') || corpus.includes('turmeric') ||
      corpus.includes('blush') || corpus.includes('lip') || corpus.includes('radiance')
    );
  }

  if (target === 'haircare') {
    return (
      cat.includes('hair') || cat.includes('scalp') || corpus.includes('hair') ||
      corpus.includes('scalp') || corpus.includes('shampoo') || corpus.includes('conditioner')
    );
  }

  if (target === 'bathbody') {
    return (
      cat.includes('body') || cat.includes('bath') || corpus.includes('body') ||
      corpus.includes('bath') || corpus.includes('lotion') || corpus.includes('shower') ||
      corpus.includes('wash') || corpus.includes('hand cream') || corpus.includes('cream')
    );
  }

  if (target === 'fragrances') {
    return (
      cat.includes('fragrance') || corpus.includes('fragrance') || corpus.includes('perfume') ||
      corpus.includes('mist') || corpus.includes('scent') || corpus.includes('rose') ||
      corpus.includes('damask') || corpus.includes('aroma')
    );
  }

  if (target === 'giftsets') {
    return (
      cat.includes('set') || cat.includes('bundle') || cat.includes('tool') ||
      corpus.includes('set') || corpus.includes('bundle') || corpus.includes('kit') ||
      corpus.includes('gift') || corpus.includes('roller') || corpus.includes('facial tool')
    );
  }

  return corpus.includes(target);
}

export function getCategoryById(categoryId: string): ProductCategoryOption {
  const normalized = normalizeCategoryId(categoryId);
  return STORE_CATEGORIES.find(c => c.id === normalized) || STORE_CATEGORIES[0];
}
