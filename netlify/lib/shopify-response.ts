interface GraphqlPart {
  data?: Record<string, unknown>;
  path?: (string | number)[];
  errors?: unknown[];
  incremental?: GraphqlPart[];
  hasNext?: boolean;
}

export async function readShopifyResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('multipart/mixed')) return response.json();
  const boundary = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType);
  if (!boundary) throw new Error('Missing Shopify response boundary.');
  const text = await response.text();
  const result: { data: Record<string, unknown>; errors?: unknown[] } = { data: {} };
  let hasNext = true;
  let partCount = 0;
  const merge = (part: GraphqlPart) => {
    if (part.errors?.length) result.errors = [...(result.errors || []), ...part.errors];
    if (part.data) {
      let target = result.data;
      for (const segment of part.path || []) {
        if (['__proto__', 'prototype', 'constructor'].includes(String(segment))) throw new Error('Invalid Shopify response path.');
        const value = target[segment];
        if (!value || typeof value !== 'object') throw new Error('Invalid Shopify deferred response.');
        target = value as Record<string, unknown>;
      }
      Object.assign(target, part.data);
    }
    for (const patch of part.incremental || []) merge(patch);
  };
  for (const section of text.split(`--${boundary[1] || boundary[2]}`)) {
    const separator = /\r?\n\r?\n/.exec(section);
    if (!separator) continue;
    const body = section.slice(separator.index + separator[0].length).trim();
    if (!body) continue;
    const part: GraphqlPart = JSON.parse(body);
    merge(part);
    partCount += 1;
    if (typeof part.hasNext === 'boolean') hasNext = part.hasNext;
  }
  if (!partCount || hasNext) throw new Error('Shopify shipping response did not complete.');
  return result;
}
