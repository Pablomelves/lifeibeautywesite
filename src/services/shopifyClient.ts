export async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/shopify/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(35000)]) : AbortSignal.timeout(15000),
  });
  if (response.status === 404 || response.headers.get('content-type')?.includes('text/html')) {
    throw new Error('The Shopify connection endpoint is unavailable. Please try again or continue to checkout.');
  }
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Shopify is temporarily unavailable. Please try again or continue to checkout.');
  if (json.errors?.length || !json.data) {
    throw new Error('Shopify could not calculate this request. Please verify the address or continue to checkout.');
  }
  return json.data as T;
}
