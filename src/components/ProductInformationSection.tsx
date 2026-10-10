import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types.js';
import type { ProductFact, ProductInformation } from '../types/productInformation.js';
import { getProductInformation, safeProductImageUrl } from '../services/productInformation.js';
import { BeforeAfterComparison } from './BeforeAfterComparison.js';

function InformationBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-4"><h3 className="font-anton text-xl uppercase tracking-tight text-slate-900">{title}</h3>{children}</section>;
}

function FactSources({ fact }: { fact: ProductFact }) {
  return <details className="mt-2 text-[11px] leading-relaxed text-slate-500"><summary className="min-h-8 cursor-pointer text-[#B31940]">Source information</summary>{fact.evidence.map((source, index) => <div key={index} className="mt-2"><p>{source.type === 'image' && safeProductImageUrl(source.reference) ? <a href={source.reference} target="_blank" rel="noopener noreferrer" className="underline">Original product gallery image</a> : source.type === 'metafield' ? `Shopify product metadata: ${source.reference}` : 'Original Shopify product description'}</p><p className="mt-1 whitespace-pre-wrap">{source.excerpt}</p></div>)}</details>;
}

export function ProductInformationContent({ information, productTitle, isSkincare = true }: { information: ProductInformation | null; productTitle: string; isSkincare?: boolean }) {
  const facts = information?.facts.filter(fact => fact.status === 'confirmed') || [];
  const matching = (kind: ProductFact['kind']) => facts.filter(fact => fact.kind === kind);
  const benefits = matching('benefit').slice(0, 5);
  const ingredients = matching('ingredient');
  const fullIngredients = matching('full_ingredients')[0];
  const concerns = matching('concern');
  const suitability = matching('skin_type');
  const directions = matching('usage');
  const frequency = matching('frequency');
  const warnings = matching('warning');
  const skincare = information ? information.category === 'skincare' : isSkincare;
  const comparisons = information?.comparisons.filter(comparison => comparison.status === 'confirmed') || [];
  const pending = (text: string) => <p className="text-xs leading-relaxed text-slate-600">{text}</p>;
  return <div className="space-y-8">
    <InformationBlock title={skincare ? 'Key Benefits' : 'Key Features'}>
      {benefits.length ? <ul className="grid gap-3 sm:grid-cols-2">{benefits.map(fact => <li key={fact.id} className="rounded-2xl border border-[#FFCDF2]/60 bg-[#FFF5FA] p-4"><p className="text-xs leading-relaxed text-slate-700">{fact.text}</p><FactSources fact={fact} /></li>)}</ul> : pending('Documented benefits are being verified against the product description and original labels. No unsupported benefits are added.')}
    </InformationBlock>
    {comparisons.length > 0 && <InformationBlock title="Before & After">{comparisons.map(comparison => <BeforeAfterComparison key={comparison.id} comparison={comparison} productTitle={productTitle} />)}</InformationBlock>}
    {(skincare || ingredients.length > 0) && <InformationBlock title={skincare ? 'Key Ingredients' : 'Documented Materials & Components'}>
      {ingredients.length ? <div className="grid gap-3 sm:grid-cols-2">{ingredients.map(fact => <article key={fact.id} className="rounded-2xl border border-[#FFCDF2]/60 bg-[#FFF5FA] p-4"><h4 className="text-xs font-bold text-slate-900">{fact.text}{fact.concentration && !fact.text.includes(fact.concentration) && <span className="ml-2 font-normal text-[#B31940]">{fact.concentration}</span>}</h4>{fact.function && <p className="mt-2 text-xs leading-relaxed text-slate-600">{fact.function}</p>}<FactSources fact={fact} /></article>)}</div> : pending('Key ingredient information is being verified. Ingredients are not inferred from similar products.')}
      {ingredients.length > 0 && pending('These are documented key ingredients or components, not necessarily the complete ingredient list.')}
    </InformationBlock>}
    {(skincare || fullIngredients) && <InformationBlock title="Full Ingredients">{fullIngredients ? <div className="rounded-2xl border border-[#FFCDF2]/60 bg-[#FFF5FA] p-4"><p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{fullIngredients.text}</p><FactSources fact={fullIngredients} /></div> : pending('Full ingredient information is being verified.')}</InformationBlock>}
    <InformationBlock title="Why Use This Product?">
      {concerns.length || suitability.length ? <ul className="space-y-3">{[...concerns, ...suitability].map(fact => <li key={fact.id} className="text-xs leading-relaxed text-slate-700">{fact.text}<FactSources fact={fact} /></li>)}</ul> : pending('Refer to the original product description for its documented purpose and suitability while additional information is verified.')}
    </InformationBlock>
    <InformationBlock title="How to Use">
      {directions.length ? <ol className="space-y-3">{directions.map((fact, index) => <li key={fact.id} className="flex gap-3 rounded-xl border border-[#FFCDF2]/40 bg-[#FFF5FA] p-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EC3460] text-[10px] font-bold text-white">{index + 1}</span><div className="text-xs leading-relaxed text-slate-700">{fact.text}<FactSources fact={fact} /></div></li>)}</ol> : pending('Application instructions are awaiting manual verification. Follow the directions on the original manufacturer packaging; no application order or frequency is assumed.')}
      {frequency.map(fact => <div key={fact.id} className="text-xs leading-relaxed text-slate-700"><span className="font-semibold">Documented frequency: </span>{fact.text}<FactSources fact={fact} /></div>)}
      {warnings.length > 0 && <section className="rounded-xl border border-[#FFCDF2] p-4"><h4 className="mb-2 text-xs font-bold text-[#B31940]">Documented Precautions</h4>{warnings.map(fact => <div key={fact.id} className="mb-2 text-xs leading-relaxed text-slate-700">{fact.text}<FactSources fact={fact} /></div>)}</section>}
    </InformationBlock>
  </div>;
}

export function ProductInformationSection({ product }: { product: Product }) {
  const section = useRef<HTMLElement>(null);
  const [information, setInformation] = useState<ProductInformation | null>(null);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const productId = product.shopifyId?.replace(/^gid:\/\/shopify\/Product\//, '') || String(product.id);
  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    setInformation(null); setUnavailable(false);
    const load = () => {
      if (started) return;
      started = true; setLoading(true);
      getProductInformation(productId, controller.signal).then(result => {
        if (!controller.signal.aborted && result.information?.productId === productId) setInformation(result.information);
      }).catch(() => { if (!controller.signal.aborted) setUnavailable(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    };
    if (!section.current || typeof IntersectionObserver === 'undefined') load();
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { load(); observer?.disconnect(); } }, { rootMargin: '350px' }) : null;
    if (section.current) observer?.observe(section.current);
    return () => { controller.abort(); observer?.disconnect(); };
  }, [productId]);
  return <section ref={section} aria-label="Verified product information" className="py-10">
    {(loading || unavailable) && <p role="status" className="mb-4 text-xs text-slate-500">{loading ? 'Reading source-backed product information…' : 'Additional product information is being verified. Original product details and purchase options remain available.'}</p>}
    <ProductInformationContent information={information} productTitle={product.name} isSkincare={!/bag|tool|roller|brush|accessor/i.test(product.category)} />
  </section>;
}
