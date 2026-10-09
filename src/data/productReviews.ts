import type { Product, Review } from '../types';

const reviewSamples = [
  {
    author: 'Maya R.',
    rating: 5,
    title: 'A lovely addition to my routine',
    comment: 'Easy to work into my everyday routine. I enjoy taking a little extra time for myself with this one.',
  },
  {
    author: 'Celeste W.',
    rating: 4,
    title: 'Simple, thoughtful self-care',
    comment: 'The presentation is beautiful and the routine feels straightforward. A nice choice for a quiet self-care evening.',
  },
  {
    author: 'Nina L.',
    rating: 5,
    title: 'My new routine favourite',
    comment: 'I love having this in my collection. It makes my daily ritual feel a little more special without adding too many steps.',
  },
];

export function getProductReviews(product: Pick<Product, 'id' | 'name' | 'src' | 'images'>): Review[] {
  const pictures = [...new Set([product.src, ...(product.images || [])].filter(Boolean))];

  return reviewSamples.map((sample, index) => ({
    ...sample,
    id: product.id * 10 + index,
    productId: product.id,
    productName: product.name,
    location: '',
    date: '',
    verified: false,
    skinConcern: '',
    skinType: '',
    photos: pictures.length > 0 ? [pictures[index % pictures.length]] : [],
  }));
}

export function getReviewRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  return Math.round(reviews.reduce((total, review) => total + review.rating, 0) / reviews.length * 10) / 10;
}
