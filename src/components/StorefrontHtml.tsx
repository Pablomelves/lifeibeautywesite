import { useMemo } from 'react';

export function sanitizeStorefrontHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'A', 'BLOCKQUOTE', 'DIV', 'SPAN', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'IMG']);
  document.querySelectorAll('script,style,iframe,object,embed,form,input,button,svg,math,link,meta,base').forEach(element => element.remove());
  for (const element of Array.from(document.body.querySelectorAll('*'))) {
    if (!allowed.has(element.tagName)) { element.replaceWith(...element.childNodes); continue; }
    const href = element.getAttribute('href');
    const source = element.getAttribute('src');
    const alt = element.getAttribute('alt');
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name);
    if (element.tagName === 'A' && href) {
      try {
        const url = new URL(href, window.location.origin);
        if (['https:', 'mailto:'].includes(url.protocol) || url.origin === window.location.origin) element.setAttribute('href', url.toString());
      } catch {}
    }
    if (element.tagName === 'IMG') {
      try {
        const url = new URL(source || '');
        if (url.protocol !== 'https:' || url.hostname !== 'cdn.shopify.com') { element.remove(); continue; }
        element.setAttribute('src', url.toString()); element.setAttribute('alt', alt || 'Product information'); element.setAttribute('loading', 'lazy'); element.setAttribute('decoding', 'async');
      } catch { element.remove(); }
    }
  }
  return document.body.innerHTML;
}

export function StorefrontHtml({ html }: { html: string }) {
  const safe = useMemo(() => sanitizeStorefrontHtml(html), [html]);
  return <div className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words [&_p]:mb-3 [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:underline [&_a]:text-[#B31940] [&_img]:max-w-full [&_img]:h-auto [&_table]:block [&_table]:overflow-x-auto" dangerouslySetInnerHTML={{ __html: safe }} />;
}
