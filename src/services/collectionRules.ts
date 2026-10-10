export interface CollectionReference {
  id: string;
  title: string;
  handle: string;
}

export interface CategorizationProduct {
  title: string;
  productType: string;
  tags: string[];
  description: string;
  vendor?: string;
  category?: { fullName: string } | null;
}

type Family = 'serums' | 'masks' | 'cleansers' | 'moisturizers' | 'eye' | 'tools' | 'bundles';

export function normalizeCollection(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function collectionFamily(title: string): Family | undefined {
  const name = normalizeCollection(title);
  const aliases: Record<Family, string[]> = {
    serums: ['targeted serum', 'targeted serums', 'serum', 'serums', 'treatment serums'],
    masks: ['bio collagen masks', 'bio collagen mask', 'masks', 'face masks', 'facial masks', 'sheet masks', 'hydrogel masks'],
    cleansers: ['pore cleanser', 'pore cleansers', 'pore cleansers toners', 'cleansers', 'cleansers toners', 'toners', 'exfoliants'],
    moisturizers: ['barrier cushion cream', 'barrier cushion creams', 'barrier cream', 'barrier creams', 'ceramide cream', 'ceramide creams', 'cream', 'creams', 'moisturizer', 'moisturizers', 'moisturising cream', 'moisturising creams', 'moisturizing cream', 'moisturizing creams', 'face creams', 'facial creams'],
    eye: ['eye care', 'eye patches', 'eye creams'],
    tools: ['tools rollers', 'facial tools', 'face rollers', 'tools'],
    bundles: ['sets bundles', 'sets', 'bundles', 'skincare sets'],
  };
  return (Object.keys(aliases) as Family[]).find(family => aliases[family].includes(name));
}

function productForms(text: string): Family[] {
  const value = normalizeCollection(text);
  if (/\b(hair|scalp|beard|lash|eyelash|nail|pet|dog|cat|oral|supplement|dietary|ice cream|shaving|depilatory)\b/.test(value)) return [];
  const forms: Family[] = [];
  if (/\b(eye|under eye)\b/.test(value) && /\b(patch|patches|cream|creams|serum|serums|mask|masks)\b/.test(value)) return ['eye'];
  if (/\b(roller|rollers|gua sha|facial tool|facial tools|mask brush|mask applicator|empty bottle|serum bottle|cream jar|dispenser)\b/.test(value)) return ['tools'];
  if (/\b(serum|serums|ampoule|ampoules)\b/.test(value) && !/\bserum infused\b/.test(value)) forms.push('serums');
  if (/\b(mask|masks|hydrogel|sheet mask)\b/.test(value) && !/\b(sleep mask|sleeping eye mask|led mask|surgical|respirator)\b/.test(value)) forms.push('masks');
  if (/\b(cleanser|cleansers|cleansing|toner|toners|exfoliant|exfoliants|exfoliating pads|toning pads|toner pads)\b/.test(value)) forms.push('cleansers');
  if (/\b(cream|creams|moisturizer|moisturizers|moisturiser|moisturisers|barrier balm)\b/.test(value) && !forms.includes('cleansers') && !/\b(sunscreen|sun cream|spf)\b/.test(value)) forms.push('moisturizers');
  if (/\b(set|sets|bundle|bundles|kit|kits)\b/.test(value)) forms.push('bundles');
  return forms;
}

export function categorizeProduct<Collection extends CollectionReference>(product: CategorizationProduct, collections: Collection[]) {
  const titleForms: Family[] = productForms(product.title);
  const typeForms = productForms(product.productType);
  const taxonomyForms = productForms(product.category?.fullName.split('>').at(-1) || '');
  const descriptionForms = productForms(product.description);
  const descriptionIdentity = normalizeCollection(product.description).match(/^(?:this|our|a|an)\s+(?:[\p{L}\p{N}]+\s+){0,4}?(?:serum|ampoule|mask|cleanser|toner|cream|moisturizer|exfoliant)\b/u)?.[0] || '';
  const descriptionIdentityForms = productForms(descriptionIdentity);
  const tagForms = [...new Set(product.tags.flatMap(productForms))].filter(family => descriptionIdentityForms.includes(family));
  if (!titleForms.length && /\bpore\b/.test(normalizeCollection(product.title)) && /\bpads\b/.test(normalizeCollection(product.title)) && descriptionForms.includes('cleansers')) titleForms.push('cleansers');
  const identityForms = [...new Set([...typeForms, ...taxonomyForms])];
  const isBundle = [...titleForms, ...identityForms].includes('bundles');
  const conflicts = identityForms.length > 0 && titleForms.length > 0 &&
    !isBundle && titleForms.some(family => !identityForms.includes(family));
  const families = [...new Set(identityForms.length ? identityForms : titleForms.length ? titleForms : tagForms)];
  const concrete: Family[] = families.filter(family => family !== 'bundles');
  const unsupportedIdentity = /\b(hair|scalp|beard|lash|eyelash|nail|pet|oral|dietary|supplement|shaving|depilatory)\b/.test(normalizeCollection(`${product.title} ${product.productType}`));
  const ambiguous = unsupportedIdentity || conflicts || (!isBundle && concrete.length > 1);
  const normalizedTags = product.tags.map(normalizeCollection);
  const matches = ambiguous ? [] : collections.filter(collection => {
    const family = collectionFamily(collection.title);
    const name = normalizeCollection(collection.title);
    if (family) {
      if (!families.includes(family)) return false;
      const identity = normalizeCollection(`${product.title} ${product.productType}`);
      const detail = normalizeCollection(`${product.description} ${product.tags.join(' ')}`);
      if (name === 'toners') return /\b(toner|toning)\b/.test(identity) || (/\bpads\b/.test(identity) && /\b(toner|toning)\b/.test(detail));
      if (name === 'exfoliants') return /\b(exfoliant|exfoliating)\b/.test(identity) || (/\bpads\b/.test(identity) && /\b(exfoliant|exfoliating|aha|bha)\b/.test(detail));
      if (name === 'ceramide creams' || name === 'ceramide cream') return /\b(ceramide|ceramides)\b/.test(identity) || /\b(with|contains|containing) (?:\w+ ){0,2}ceramides?\b/.test(detail) || product.tags.some(tag => /^ceramides?$/.test(normalizeCollection(tag)));
      if (name === 'barrier creams' || name === 'barrier cream') return /\bbarrier\b/.test(identity) || /\b(repair|restore|strengthen|support)\w* (?:\w+ ){0,3}barrier\b/.test(detail);
      if (name === 'sheet masks') return /\bsheet\b/.test(`${identity} ${detail}`);
      if (name === 'hydrogel masks') return /\bhydrogel\b/.test(`${identity} ${detail}`);
      if (name === 'eye creams') return /\bcream|creams\b/.test(identity);
      if (name === 'eye patches') return /\bpatch|patches\b/.test(identity);
      if (name === 'face rollers') return /\broller|rollers\b/.test(identity);
      return true;
    }
    if (!name) return false;
    const explicitTag = normalizedTags.includes(name) || (!!collection.handle && normalizedTags.includes(normalizeCollection(collection.handle)));
    const explicitType = !!product.productType && normalizeCollection(product.productType) === name;
    const explicitVendor = !!product.vendor && normalizeCollection(product.vendor) === name;
    const description = normalizeCollection(product.description);
    const corroborated = concrete.length > 0 && productForms(description).some(form => concrete.includes(form));
    return (explicitTag || explicitType || explicitVendor) && corroborated;
  });
  const missingFamilies = ambiguous ? [] : families.filter(family => !collections.some(collection => collectionFamily(collection.title) === family));
  const reasons = [
    ...(ambiguous ? ['Conflicting product identity; keyword-only assignment was rejected.'] : []),
    ...(!families.length ? ['No confident product form in the title, type, or Shopify taxonomy.'] : []),
    ...missingFamilies.map(family => `No existing Shopify collection matches ${family}.`),
    ...(!matches.length && families.length && !ambiguous && !missingFamilies.length ? ['No confident existing collection match.'] : []),
  ];
  return { collections: matches, reviewReasons: reasons, families };
}

export function belongsToCollection(product: { collections?: CollectionReference[] }, selection: string): boolean {
  if (!selection || selection === 'all') return true;
  const name = normalizeCollection(selection);
  const family = collectionFamily(selection) || ({ eye: 'eye', 'eye care': 'eye', 'tools rollers': 'tools', 'sets bundles': 'bundles' } as Record<string, Family>)[name];
  return (product.collections || []).some(collection =>
    family ? collectionFamily(collection.title) === family :
      normalizeCollection(collection.title) === name || normalizeCollection(collection.handle) === name);
}
