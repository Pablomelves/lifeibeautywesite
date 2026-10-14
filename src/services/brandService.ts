import type { Product } from '../types';

export type BrandId = 'medicube' | 'biodance' | 'cerave' | 'laneige' | 'beauty-of-joseon' | 'anua' | 'all';

export interface BrandInfo {
  id: BrandId;
  name: string;
  tag: string;
  koreanTag: string;
  description: string;
  bgGradient: string;
  tagColor: string;
  image?: string;
  accentColor?: string;
}

export const ALL_BRANDS_INFO: BrandInfo = {
  id: 'all',
  name: 'All Curated Brands',
  tag: 'Curated K-Beauty Selection',
  koreanTag: '전체 브랜드',
  description: 'Explore the complete curated lineup of authorized Korean clinical formulas, bio-collagen treatments, and specialized skincare essentials.',
  bgGradient: 'from-[#FFF0F9] via-[#F5F3FF] to-[#EFF6FF]',
  tagColor: 'text-slate-900 bg-white border border-slate-200',
  image: '/BC0C39FF-CA32-434C-8D58-12498BC5C2E2.png',
  accentColor: '#EC3460',
};

export const BRANDS: BrandInfo[] = [
  {
    id: 'medicube',
    name: 'Medicube',
    tag: 'Clinical K-Beauty',
    koreanTag: '메디큐브',
    description: 'Advanced Korean skincare featuring targeted serums, pore care, collagen treatments, and innovative skincare technology.',
    bgGradient: 'from-[#FFF0F9] to-[#FFE6F6]',
    tagColor: 'text-[#EC3460] bg-white border border-[#FFCDF2]',
    image: '/products/medicube.png',
    accentColor: '#EC3460',
  },
  {
    id: 'biodance',
    name: 'Biodance',
    tag: 'Bio-Collagen Treatments',
    koreanTag: '바이오던스',
    description: 'Hydrogel collagen masks and intensive skincare treatments designed to hydrate, plump, and enhance the appearance of radiant skin.',
    bgGradient: 'from-[#F5F3FF] to-[#EDE9FE]',
    tagColor: 'text-[#8B5CF6] bg-white border border-[#DDD6FE]',
    image: '/products/biodance.png',
    accentColor: '#8B5CF6',
  },
  {
    id: 'cerave',
    name: 'CeraVe',
    tag: 'Dermatologist Developed',
    koreanTag: '세라비',
    description: 'Dermatologist-developed skincare featuring ceramides and hydrating formulas to help support the skin barrier.',
    bgGradient: 'from-[#EFF6FF] to-[#DBEAFE]',
    tagColor: 'text-[#2563EB] bg-white border border-[#BFDBFE]',
    image: '/products/skincare-3.png',
    accentColor: '#2563EB',
  },
  {
    id: 'laneige',
    name: 'Laneige',
    tag: 'Water Science Hydration',
    koreanTag: '라네즈',
    description: 'Pioneering sleeping masks, water bank hydration systems, and iconic lip care formulations.',
    bgGradient: 'from-[#F0FDF4] to-[#DCFCE7]',
    tagColor: 'text-[#16A34A] bg-white border border-[#BBF7D0]',
    image: '/products/skincare-4.png',
    accentColor: '#16A34A',
  },
  {
    id: 'beauty-of-joseon',
    name: 'Beauty of Joseon',
    tag: 'Hanbang Herbal Wisdom',
    koreanTag: '조선미녀',
    description: 'Traditional Korean Hanbang herbal extracts reinterpreted into modern soothing and brightening serums.',
    bgGradient: 'from-[#FFFBEB] to-[#FEF3C7]',
    tagColor: 'text-[#D97706] bg-white border border-[#FDE68A]',
    image: '/products/medicube-turmeric.jpg',
    accentColor: '#D97706',
  },
  {
    id: 'anua',
    name: 'Anua',
    tag: 'Heartleaf Calm Rituals',
    koreanTag: '아누아',
    description: 'Minimalist calming skincare packed with Korean heartleaf extract for sensitive and breakout-prone skin.',
    bgGradient: 'from-[#FAF5FF] to-[#F3E8FF]',
    tagColor: 'text-[#9333EA] bg-white border border-[#E9D5FF]',
    image: '/products/medicube-pink.jpg',
    accentColor: '#9333EA',
  },
];

export function isProductOfBrand(product: Product, brandId: string): boolean {
  if (!product) return false;
  const target = brandId.toLowerCase().trim();
  if (target === 'all') return true;

  const searchCorpus = [
    product.name,
    product.subtitle,
    product.fullDescription,
    product.description,
    product.handle,
    product.vendor || '',
    ...(product.tags || []),
    ...(product.collections || []).map(c => `${c.title} ${c.handle}`),
  ].join(' ').toLowerCase();

  if (target === 'medicube') {
    return (
      searchCorpus.includes('medicube') ||
      product.handle.includes('refined-pore-oil-control-pads') ||
      product.handle.includes('kojic-acid-turmeric') ||
      product.name.toLowerCase().includes('pore & oil control pads') ||
      product.name.toLowerCase().includes('kojic acid turmeric')
    );
  }
  if (target === 'biodance') {
    return (
      searchCorpus.includes('biodance') ||
      product.name.toLowerCase().includes('bio-collagen real deep mask') ||
      product.name.toLowerCase().includes('hydrogel face mask') ||
      product.handle.includes('bio-collagen')
    );
  }
  if (target === 'cerave') {
    return searchCorpus.includes('cerave');
  }
  if (target === 'laneige') {
    return searchCorpus.includes('laneige') || searchCorpus.includes('lip sleeping mask');
  }
  if (target === 'beauty-of-joseon') {
    return searchCorpus.includes('beauty of joseon') || searchCorpus.includes('joseon') || searchCorpus.includes('relief sun');
  }
  if (target === 'anua') {
    return searchCorpus.includes('anua') || searchCorpus.includes('heartleaf');
  }
  return false;
}

export function getProductsForBrand(products: Product[], brandId: string): Product[] {
  if (brandId.toLowerCase().trim() === 'all') {
    // Return all curated products from the supported brands
    return (products || []).filter(product =>
      isProductOfBrand(product, 'medicube') ||
      isProductOfBrand(product, 'biodance') ||
      isProductOfBrand(product, 'cerave') ||
      isProductOfBrand(product, 'laneige') ||
      isProductOfBrand(product, 'beauty-of-joseon') ||
      isProductOfBrand(product, 'anua')
    );
  }
  return (products || []).filter(product => isProductOfBrand(product, brandId));
}

export function getBrandById(brandId: string): BrandInfo | undefined {
  const target = brandId.toLowerCase().trim();
  if (target === 'all') return ALL_BRANDS_INFO;
  return BRANDS.find(b => b.id === target);
}
