export async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api/shopify/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
      signal: signal || (typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(15000) : undefined),
    });
  } catch (err: any) {
    if (signal?.aborted || err?.message === 'Aborted') {
      throw err;
    }
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      throw new Error('Shopify request timed out. Please try again or continue to checkout.');
    }
    throw new Error('The Shopify connection endpoint is unavailable. Please try again or continue to checkout.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (response.status === 404 || contentType.includes('text/html') || !contentType.includes('application/json')) {
    throw new Error('The Shopify connection endpoint is unavailable. Please try again or continue to checkout.');
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new Error('The Shopify response could not be parsed. Please try again or continue to checkout.');
  }

  if (!response.ok) throw new Error(json.error || 'Shopify is temporarily unavailable. Please try again or continue to checkout.');
  if (json.errors?.length || !json.data) {
    throw new Error('Shopify could not calculate this request. Please verify the address or continue to checkout.');
  }
  return json.data as T;
}
