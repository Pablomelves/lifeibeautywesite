import type { Product } from '../types';

export interface BrandInfo {
  id: 'medicube' | 'biodance' | 'cerave';
  name: string;
  tag: string;
  koreanTag: string;
  description: string;
  bgGradient: string;
  tagColor: string;
}

export const BRANDS: BrandInfo[] = [
  {
    id: 'medicube',
    name: 'Medicube',
    tag: 'Clinical K-Beauty',
    koreanTag: '메디큐브',
    description: 'Advanced Korean skincare featuring targeted serums, pore care, collagen treatments, and innovative skincare technology.',
    bgGradient: 'from-[#FFF0F9] to-[#FFE6F6]',
    tagColor: 'text-[#EC3460] bg-white border border-[#FFCDF2]',
  },
  {
    id: 'biodance',
    name: 'Biodance',
    tag: 'Bio-Collagen Treatments',
    koreanTag: '바이오던스',
    description: 'Hydrogel collagen masks and intensive skincare treatments designed to hydrate, plump, and enhance the appearance of radiant skin.',
    bgGradient: 'from-[#F5F3FF] to-[#EDE9FE]',
    tagColor: 'text-[#8B5CF6] bg-white border border-[#DDD6FE]',
  },
  {
    id: 'cerave',
    name: 'CeraVe',
    tag: 'Dermatologist Developed',
    koreanTag: '세라비',
    description: 'Dermatologist-developed skincare featuring ceramides and hydrating formulas to help support the skin barrier.',
    bgGradient: 'from-[#EFF6FF] to-[#DBEAFE]',
    tagColor: 'text-[#2563EB] bg-white border border-[#BFDBFE]',
  },
];

export function isProductOfBrand(product: Product, brandId: string): boolean {
  if (!product) return false;
  const target = brandId.toLowerCase().trim();
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
    return searchCorpus.includes('medicube');
  }
  if (target === 'biodance') {
    return searchCorpus.includes('biodance') || product.name.toLowerCase().includes('bio-collagen real deep mask');
  }
  if (target === 'cerave') {
    return searchCorpus.includes('cerave');
  }
  return false;
}

export function getProductsForBrand(products: Product[], brandId: string): Product[] {
  return (products || []).filter(product => isProductOfBrand(product, brandId));
}

export function getBrandById(brandId: string): BrandInfo | undefined {
  return BRANDS.find(b => b.id === brandId.toLowerCase().trim());
}
