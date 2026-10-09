import type { Product } from '../types';

export function getDemoProductReviews(product: Product) {
  const category = product.category.toLowerCase();
  const application = category.includes('mask')
    ? 'A relaxing addition to my evening routine. I like saving it for nights when I have a little more time.'
    : category.includes('tool') || category.includes('roller')
      ? 'Easy to work into my evening routine. I prefer gentle pressure and a few minutes rather than rushing.'
      : category.includes('cleanser')
        ? 'Easy to rinse off and fits nicely into my evening routine. A small amount is enough for me.'
        : 'Fits nicely between cleansing and the rest of my routine. I give it a minute before layering my next step.';
  const photos = [...new Set([product.src, ...(product.images || [])].filter(Boolean))];
  const reviews = [
    { author: 'Maya R.', location: 'Austin, TX', rating: 5, date: 'September 28, 2026', title: 'An easy routine upgrade', comment: `I tried ${product.name} as part of a simpler routine. ${application}` },
    { author: 'Sophie L.', location: 'Seattle, WA', rating: 5, date: 'September 21, 2026', title: 'Happy with my first impressions', comment: 'The packaging is easy to use and looks lovely on my bathroom shelf. Still early days, so I am keeping my expectations realistic, but I have enjoyed using it so far.' },
    { author: 'Jasmine K.', location: 'Brooklyn, NY', rating: 4, date: 'September 16, 2026', title: 'Good addition, not an overnight fix', comment: `${application} I would not expect dramatic changes overnight. Giving it four stars while I decide how it fits into my routine long term.` },
    { author: 'Elena M.', location: 'San Diego, CA', rating: 5, date: 'September 9, 2026', title: 'Keeping things simple', comment: `I have been using ${product.name} without adding lots of other new products at once. The instructions are easy to follow, and I appreciate having one clear step to focus on.` },
    { author: 'Olivia T.', location: 'Chicago, IL', rating: 4, date: 'September 2, 2026', title: 'Enjoying it, with a little patience', comment: 'A nice addition to my shelf, though I needed a few tries to settle into a consistent routine. I would start slowly rather than change everything at once.' },
  ].map((review, index) => ({
    ...review,
    id: `${product.id}-demo-${index}`,
    photo: photos[index % photos.length],
  }));

  return {
    reviews,
    rating: Number((reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)),
    count: reviews.length,
  };
}
