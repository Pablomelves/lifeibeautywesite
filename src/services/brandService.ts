import type { Product } from '../types';

export type BrandId = 'medicube' | 'biodance' | 'cerave' | 'all';

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
  return false;
}

export function getProductsForBrand(products: Product[], brandId: string): Product[] {
  if (brandId.toLowerCase().trim() === 'all') {
    // Return all curated products from the supported brands
    return (products || []).filter(product =>
      isProductOfBrand(product, 'medicube') ||
      isProductOfBrand(product, 'biodance') ||
      isProductOfBrand(product, 'cerave')
    );
  }
  return (products || []).filter(product => isProductOfBrand(product, brandId));
}

export function getBrandById(brandId: string): BrandInfo | undefined {
  const target = brandId.toLowerCase().trim();
  if (target === 'all') return ALL_BRANDS_INFO;
  return BRANDS.find(b => b.id === target);
}
