import { shopifyFetch } from './shopifyClient.js';

export type PolicyType = 'shipping' | 'returns' | 'privacy' | 'terms';
export interface StorefrontDocument { title: string; body: string }
export interface StorefrontContent {
  name: string;
  policies: Record<PolicyType, StorefrontDocument | null>;
  about: StorefrontDocument | null;
  faq: StorefrontDocument | null;
  contact: StorefrontDocument | null;
}

export async function getStorefrontContent(signal: AbortSignal): Promise<StorefrontContent> {
  const data = await shopifyFetch<{ shop: { name: string; shippingPolicy: StorefrontDocument | null; refundPolicy: StorefrontDocument | null; privacyPolicy: StorefrontDocument | null; termsOfService: StorefrontDocument | null }; pages: { nodes: { handle: string; title: string; body: string }[] } }>(`
    query StorefrontInformation {
      shop { name shippingPolicy { title body } refundPolicy { title body } privacyPolicy { title body } termsOfService { title body } }
      pages(first: 100) { nodes { handle title body } }
    }
  `, {}, signal);
  const document = (value: StorefrontDocument | null | undefined) => value?.body.trim() && !/\[INSERT|\[ADD|\[YOUR|PLACEHOLDER/i.test(value.body) ? value : null;
  const page = (handles: string[]) => document(data.pages.nodes.find(page => handles.includes(page.handle)));
  return {
    name: data.shop.name,
    policies: {
      shipping: document(data.shop.shippingPolicy) || page(['shipping-policy']),
      returns: document(data.shop.refundPolicy) || page(['return-policy', 'refund-policy']),
      privacy: document(data.shop.privacyPolicy) || page(['privacy-policy']),
      terms: document(data.shop.termsOfService) || page(['terms-and-conditions', 'terms-of-service']),
    },
    about: page(['about-us', 'about']), faq: page(['faqs', 'faq']), contact: page(['contact', 'contact-us']),
  };
}
