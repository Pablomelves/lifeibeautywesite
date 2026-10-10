import type { ImgHTMLAttributes } from 'react';

export function ResponsiveProductImage({ src, sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px', loading = 'lazy', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const supported = typeof src === 'string' && /^https:\/\/cdn\.shopify\.com\//.test(src);
  const image = (width: number) => {
    const url = new URL(src || 'https://cdn.shopify.com/');
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', '85');
    return url.toString();
  };
  return <img {...props} src={supported ? image(960) : src} srcSet={supported ? [160, 320, 640, 960, 1440].map(width => image(width) + ' ' + width + 'w').join(', ') : undefined} sizes={supported ? sizes : undefined} loading={loading} decoding="async" onError={event => {
    props.onError?.(event);
    if (!src || event.currentTarget.dataset.originalSource) return;
    event.currentTarget.dataset.originalSource = 'true';
    event.currentTarget.removeAttribute('srcset');
    event.currentTarget.src = src;
  }} />;
}
