import { useEffect, useId, useState } from 'react';
import { Truck } from 'lucide-react';
import type { CartItem } from '../types';
import { getShippingCountries, getShopifyShippingEstimate, type ShippingAddress, type ShippingEstimate } from '../services/shopifyShipping';

interface ShippingCalculatorProps {
  items: CartItem[];
  discountCode?: string;
}

const EMPTY_ADDRESS: ShippingAddress = { address1: '', address2: '', city: '', provinceCode: '', zip: '', countryCode: '' };

function formatShipping(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(amount);
}

export function ShippingCalculator({ items, discountCode }: ShippingCalculatorProps) {
  const inputId = useId();
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [submittedAddress, setSubmittedAddress] = useState<ShippingAddress | null>(null);
  const [countries, setCountries] = useState<{ isoCode: string; name: string }[]>([]);
  const [countriesError, setCountriesError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; estimate?: ShippingEstimate; error?: string } | null>(null);
  const itemKey = JSON.stringify(items.map(item => [item.product.id, item.variantId || item.product.selectedVariantId || item.product.variants?.find(variant => variant.availableForSale)?.id, item.quantity, item.product.availableForSale, item.product.variants?.map(variant => [variant.id, variant.availableForSale])]));
  const requestKey = JSON.stringify([itemKey, submittedAddress, discountCode, attempt]);
  const currentResult = result?.key === requestKey ? result : null;
  const loading = !!submittedAddress && !currentResult;

  useEffect(() => {
    const controller = new AbortController();
    getShippingCountries(controller.signal).then(setCountries).catch(() => {
      if (!controller.signal.aborted) setCountriesError(true);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!submittedAddress || !items.length) return;
    const controller = new AbortController();
    getShopifyShippingEstimate(items, submittedAddress, discountCode, controller.signal).then(estimate => {
      if (!controller.signal.aborted) setResult({ key: requestKey, estimate });
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ key: requestKey, error: error instanceof Error ? error.message : 'Shipping estimates are unavailable. Please check shipping at checkout.' });
    });
    return () => controller.abort();
  }, [requestKey]);

  const changeAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress(previous => ({ ...previous, [field]: value }));
    setSubmittedAddress(null);
  };
  const inputClass = 'w-full min-w-0 rounded-lg border border-[#FFCDF2] bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#EC3460]';
  const estimate = currentResult?.estimate;

  return (
    <section className="mt-4 rounded-xl border border-[#FFCDF2] bg-[#FFF5FA] p-4 text-xs">
      <h4 className="flex items-center gap-2 font-semibold uppercase tracking-wider text-slate-900"><Truck size={15} className="text-[#EC3460]" /> Shipping estimate</h4>
      <p className="mt-2 leading-relaxed text-slate-600">Enter your delivery address to check Shopify rates for {items.length > 1 ? 'your entire bag' : 'the selected item and quantity'}.</p>
      <details className="mt-3" open={!estimate}>
        <summary className="cursor-pointer font-medium text-[#B31940]">Delivery address{estimate ? ' · edit' : ''}</summary>
        <form className="mt-3 space-y-3" onSubmit={event => { event.preventDefault(); setSubmittedAddress({ ...address }); setAttempt(previous => previous + 1); }}>
          <label className="block space-y-1" htmlFor={`${inputId}-country`}>
            <span>Country / region</span>
            <select id={`${inputId}-country`} value={address.countryCode} onChange={event => changeAddress('countryCode', event.target.value)} required className={inputClass} autoComplete="shipping country" disabled={!countries.length}>
              <option value="">{countries.length ? 'Select your country' : countriesError ? 'Countries unavailable' : 'Loading countries…'}</option>
              {countries.map(country => <option key={country.isoCode} value={country.isoCode}>{country.name}</option>)}
            </select>
          </label>
          {countriesError && <p role="alert" className="text-[#B31940]">Shipping destinations could not be loaded. Please check delivery options at checkout.</p>}
          <label className="block space-y-1" htmlFor={`${inputId}-street`}><span>Street address</span><input id={`${inputId}-street`} value={address.address1} onChange={event => changeAddress('address1', event.target.value)} required maxLength={255} autoComplete="shipping address-line1" className={inputClass} /></label>
          <label className="block space-y-1" htmlFor={`${inputId}-unit`}><span>Apartment, suite, etc. (optional)</span><input id={`${inputId}-unit`} value={address.address2} onChange={event => changeAddress('address2', event.target.value)} maxLength={255} autoComplete="shipping address-line2" className={inputClass} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1" htmlFor={`${inputId}-city`}><span>City</span><input id={`${inputId}-city`} value={address.city} onChange={event => changeAddress('city', event.target.value)} required maxLength={100} autoComplete="shipping address-level2" className={inputClass} /></label>
            <label className="block space-y-1" htmlFor={`${inputId}-province`}><span>State / province code</span><input id={`${inputId}-province`} value={address.provinceCode} onChange={event => changeAddress('provinceCode', event.target.value.toUpperCase())} placeholder="e.g. NY, ON" maxLength={20} autoComplete="shipping address-level1" className={inputClass} /></label>
          </div>
          <label className="block space-y-1" htmlFor={`${inputId}-zip`}><span>ZIP / postal code (if applicable)</span><input id={`${inputId}-zip`} value={address.zip} onChange={event => changeAddress('zip', event.target.value)} maxLength={32} autoComplete="shipping postal-code" className={inputClass} /></label>
          <button type="submit" disabled={loading || !countries.length} className="w-full rounded-lg bg-[#EC3460] px-3 py-2.5 font-semibold text-white transition-colors hover:bg-[#D8224F] disabled:opacity-60 disabled:cursor-wait">{loading ? 'Checking Shopify rates…' : 'Calculate shipping'}</button>
        </form>
      </details>
      <div aria-live="polite" aria-busy={loading} className="mt-3">
        {loading && <div className="space-y-2"><p className="text-slate-600">Checking shipping for your address and selected items…</p><div className="h-4 w-full rounded bg-[#FFCDF2]/60 animate-pulse" /><div className="h-4 w-2/3 rounded bg-[#FFCDF2]/60 animate-pulse" /></div>}
        {currentResult?.error && <p role="alert" className="leading-relaxed text-[#B31940]">{currentResult.error} No shipping price has been assumed.</p>}
        {estimate && <div className="space-y-3">
          <p className="font-medium text-slate-900">{estimate.source === 'live' ? 'Current Shopify shipping rates' : 'Live rates unavailable — Shopify’s configured rates are shown instead.'}</p>
          {estimate.groups.map((group, index) => <div key={group.id} className="space-y-1.5">
            {estimate.groups.length > 1 && <p className="font-semibold text-slate-700">Shipment {index + 1}</p>}
            {group.deliveryOptions.map(option => <div key={option.handle} className="flex items-start justify-between gap-3 text-slate-700"><span>{option.title || 'Shipping'}</span><span className="shrink-0 font-mono">{formatShipping(Number(option.estimatedCost.amount), option.estimatedCost.currencyCode)}</span></div>)}
          </div>)}
          {estimate.combined ? <div className="flex items-center justify-between gap-3 border-t border-[#FFCDF2] pt-2 font-semibold text-slate-900"><span>{estimate.groups.length > 1 ? 'Combined shipping from' : 'Shipping from'}</span><span className="font-mono">{formatShipping(estimate.combined.amount, estimate.combined.currencyCode)}</span></div> : <p className="text-slate-600">Shipments use different currencies. Check the combined total at checkout.</p>}
          <p className="leading-relaxed text-slate-500">Choose your delivery service at checkout. Final shipping, discounts, and taxes are confirmed by Shopify. This estimate covers only the items and quantities shown here.</p>
          <button type="button" onClick={() => setAttempt(previous => previous + 1)} className="font-medium text-[#B31940] underline underline-offset-2">Refresh shipping rates</button>
        </div>}
      </div>
    </section>
  );
}
