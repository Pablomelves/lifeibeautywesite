import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { acceptInvite, getUser, handleAuthCallback, login, logout } from '@netlify/identity';
import { downloadProductAnalysisAudit, getProductAnalysisQueue, publishReviewedProductInformation, requestProductAnalysisScan, safeProductImageUrl } from '../../services/productInformation';
import type { AnalysisReviewRecord } from '../../services/productInformation';
import type { ImageRegion, InformationKind, RawProductFact } from '../../types/productInformation';
import { BeforeAfterComparison } from '../BeforeAfterComparison';

const buttonClass = 'min-h-11 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50';
const inputClass = 'min-h-11 w-full rounded-lg border border-stone-200 bg-white p-2 text-sm';
const kinds: InformationKind[] = ['ingredient', 'benefit', 'concern', 'skin_type', 'usage', 'frequency', 'warning', 'full_ingredients'];
type ManualFact = RawProductFact & { reference: string };

function ReviewEditor({ record, saved }: { record: AnalysisReviewRecord; saved: () => Promise<void> }) {
  const [factIds, setFactIds] = useState(() => new Set(record.published?.facts.map(fact => fact.id) || []));
  const [comparisonIds, setComparisonIds] = useState(() => new Set(record.published?.comparisons.map(comparison => comparison.id) || []));
  const [comparisons, setComparisons] = useState(record.information?.comparisons || []);
  const [manualFacts, setManualFacts] = useState<ManualFact[]>([]);
  const [kind, setKind] = useState<InformationKind>('ingredient');
  const [text, setText] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [reference, setReference] = useState(`/products/${encodeURIComponent(record.source.handle)}`);
  const [concentration, setConcentration] = useState('');
  const [ingredientFunction, setIngredientFunction] = useState('');
  const [complete, setComplete] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const toggle = (setter: typeof setFactIds, id: string) => setter(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const changeRegion = (id: string, side: 'before' | 'after', field: keyof ImageRegion, value: number) => {
    setComparisons(previous => previous.map(comparison => {
      if (comparison.id !== id) return comparison;
      const next = { ...comparison, [side]: { ...comparison[side], region: { ...comparison[side].region, [field]: value / 100 } } };
      return { ...next, aspectRatio: next.before.width * next.before.region.width / (next.before.height * next.before.region.height) };
    }));
  };
  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmed || submitting.current) return;
    submitting.current = true; setBusy(true); setError(null);
    try {
      await publishReviewedProductInformation(record, [...factIds], [...comparisonIds], comparisons.filter(comparison => comparisonIds.has(comparison.id)).map(comparison => ({ id: comparison.id, before: comparison.before.region, after: comparison.after.region })), manualFacts);
      await saved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The review could not be saved.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <form onSubmit={publish} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5">
    <div><h3 className="text-lg font-bold">{record.source.title}</h3><p className="text-xs text-stone-500">{record.source.handle} · {record.status} · {record.information?.imagesInspected || 0}/{record.source.images.length} images inspected</p></div>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    <details><summary className="min-h-11 cursor-pointer text-sm font-semibold">Original Shopify description and every gallery image</summary><p className="whitespace-pre-wrap text-sm text-stone-600">{record.source.description}</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{record.source.images.filter(image => safeProductImageUrl(image.url)).map((image, index) => <a key={image.url} href={image.url} target="_blank" rel="noopener noreferrer" className="text-xs underline"><img src={image.url} alt={image.altText || `Original gallery image ${index + 1}`} loading="lazy" decoding="async" className="aspect-square w-full rounded-lg object-contain" />Image {index + 1}</a>)}</div></details>
    <details><summary className="min-h-11 cursor-pointer text-sm font-semibold">Extraction warnings</summary><ul className="list-disc pl-5 text-xs text-stone-600">{record.information?.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></details>
    <fieldset className="space-y-3"><legend className="mb-2 font-semibold">Choose source-checked facts to publish</legend>{record.information?.facts.map(fact => <label key={fact.id} className="block rounded-xl border border-stone-200 p-3 text-sm"><span className="flex gap-3"><input type="checkbox" checked={factIds.has(fact.id)} onChange={() => toggle(setFactIds, fact.id)} /><span><strong>{fact.kind.replaceAll('_', ' ')}</strong>: {fact.text}{fact.concentration && !fact.text.includes(fact.concentration) ? ` (${fact.concentration})` : ''}{fact.function ? ` — ${fact.function}` : ''}<span className="block text-xs text-stone-500">{fact.status}</span></span></span>{fact.evidence.map((evidence, index) => <span key={index} className="mt-2 block text-xs text-stone-600">{evidence.type === 'image' && safeProductImageUrl(evidence.reference) ? <a href={evidence.reference} target="_blank" rel="noopener noreferrer" className="underline">Original image</a> : evidence.reference}: “{evidence.excerpt}”</span>)}</label>)}</fieldset>
    {comparisons.map(comparison => <fieldset key={comparison.id} className="space-y-3 rounded-xl border border-stone-200 p-4"><legend className="font-semibold">Manufacturer comparison candidate</legend><p className="text-xs text-rose-700">Do not enable until the original BEFORE/AFTER labels, subject, framing, lighting and exact photo boundaries are checked. Model-proposed crops may include the wrong area.</p><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={comparisonIds.has(comparison.id)} onChange={() => toggle(setComparisonIds, comparison.id)} />Publish this checked comparison</label><div className="grid gap-4 sm:grid-cols-2">{(['before', 'after'] as const).map(side => <div key={side}><h4 className="text-sm font-semibold capitalize">{side} photo region (% of original)</h4><div className="grid grid-cols-2 gap-2">{(['x', 'y', 'width', 'height'] as const).map(field => <label key={field} className="text-xs">{field}<input className={inputClass} type="number" min="0" max="100" step="0.01" value={Number((comparison[side].region[field] * 100).toFixed(4))} onChange={event => changeRegion(comparison.id, side, field, Number(event.target.value))} /></label>)}</div></div>)}</div><BeforeAfterComparison comparison={comparison} productTitle={record.source.title} /></fieldset>)}
    <details><summary className="min-h-11 cursor-pointer text-sm font-semibold">Add an accurate source transcription</summary><div className="space-y-3"><p className="text-xs text-stone-600">Copy only wording you personally verified in the selected original source. Complete INCI must preserve every ingredient and its order. Do not infer missing text, functions, concentrations or instructions.</p><label className="block text-xs">Information type<select className={inputClass} value={kind} onChange={event => setKind(event.target.value as InformationKind)}>{kinds.map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label><label className="block text-xs">Original source<select className={inputClass} value={reference} onChange={event => setReference(event.target.value)}><option value={`/products/${encodeURIComponent(record.source.handle)}`}>Shopify description</option>{record.source.images.map((image, index) => <option key={image.url} value={image.url}>Gallery image {index + 1}</option>)}{record.source.metadata.map(field => <option key={`${field.namespace}.${field.key}`} value={`${field.namespace}.${field.key}`}>{field.namespace}.{field.key}</option>)}</select></label><label className="block text-xs">Exact fact text<textarea className={inputClass} maxLength={16000} value={text} onChange={event => setText(event.target.value)} /></label><label className="block text-xs">Verbatim supporting excerpt<textarea className={inputClass} maxLength={20000} value={excerpt} onChange={event => setExcerpt(event.target.value)} /></label><label className="block text-xs">Verified concentration (optional)<input className={inputClass} value={concentration} onChange={event => setConcentration(event.target.value)} /></label><label className="block text-xs">Verbatim documented ingredient function (optional)<input className={inputClass} value={ingredientFunction} onChange={event => setIngredientFunction(event.target.value)} /></label>{kind === 'full_ingredients' && <label className="flex min-h-11 items-center gap-3 text-xs"><input type="checkbox" checked={complete} onChange={event => setComplete(event.target.checked)} />I checked that the entire list is complete and in its original order.</label>}<button type="button" className={buttonClass} disabled={!text.trim() || !excerpt.trim() || manualFacts.length >= 20 || (kind === 'full_ingredients' && !complete)} onClick={() => { setManualFacts(previous => [...previous, { id: '', kind, text: text.trim(), excerpt: excerpt.trim(), concentration: concentration.trim() || null, function: ingredientFunction.trim() || null, complete, confidence: 1, reference }]); setText(''); setExcerpt(''); setConcentration(''); setIngredientFunction(''); setComplete(false); }}>Add to this review</button>{manualFacts.map((fact, index) => <div key={index} className="flex items-center justify-between gap-3 text-xs"><span>{fact.kind}: {fact.text}</span><button type="button" className={buttonClass} onClick={() => setManualFacts(previous => previous.filter((_, position) => position !== index))}>Remove</button></div>)}</div></details>
    <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I personally checked every selected fact and crop against the original sources. I confirmed ingredient completeness where applicable, consistent comparison framing and source labels; no results were generated or exaggerated.</label>
    <button className={buttonClass} disabled={!confirmed || busy || !record.information || !['verified', 'needs_review'].includes(record.status)}>{busy ? 'Saving source review…' : 'Publish only checked information'}</button>
  </form>;
}

export function AdminProductAnalysisTab() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [records, setRecords] = useState<AnalysisReviewRecord[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const version = useRef(0);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try { const callback = await handleAuthCallback(); if (active && callback?.type === 'invite') setInviteToken(callback.token || null); const user = callback?.user || await getUser(); if (active) setAuthenticated(!!user); }
      catch { if (active) setError('Netlify Identity sign-in is unavailable.'); }
      finally { if (active) setChecking(false); }
    })();
    return () => { active = false; version.current++; };
  }, []);
  const load = async (after?: string | null) => {
    const requestVersion = ++version.current;
    setBusy(true); setError(null);
    try { const result = await getProductAnalysisQueue(after); if (requestVersion !== version.current) return; setRecords(previous => after ? [...previous, ...result.records] : result.records); setCursor(result.nextCursor); }
    catch (failure) { if (requestVersion === version.current) setError(failure instanceof Error ? failure.message : 'The review queue could not be loaded.'); }
    finally { if (requestVersion === version.current) setBusy(false); }
  };
  useEffect(() => { if (authenticated) void load(); return () => { version.current++; }; }, [authenticated]);
  const action = async (operation: () => Promise<void>) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(null);
    try { await operation(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'The action could not be completed.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return <div className="space-y-5"><div><h2 className="text-xl font-bold">Product Source Review</h2><p className="mt-1 text-xs text-stone-500">All Shopify galleries are inspected individually. Uncertain OCR facts and comparison crops stay private until checked. This does not edit Shopify products or checkout.</p></div>{error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="text-sm text-stone-600">{notice}</p>}{checking ? <p role="status">Checking review access…</p> : !authenticated ? <form className="max-w-lg space-y-3 rounded-2xl border border-stone-200 bg-white p-5" onSubmit={event => { event.preventDefault(); void action(async () => { const user = inviteToken ? await acceptInvite(inviteToken, password) : await login(email, password); setAuthenticated(!!user); setPassword(''); setInviteToken(null); }); }}><p className="text-xs">Use an invited Netlify Identity account with the admin or product_reviewer role, separate from the store-owner login.</p>{!inviteToken && <label className="block text-xs">Email<input className={inputClass} type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>}<label className="block text-xs">Password<input className={inputClass} type="password" autoComplete={inviteToken ? 'new-password' : 'current-password'} required value={password} onChange={event => setPassword(event.target.value)} /></label><button className={buttonClass} disabled={busy}>{inviteToken ? 'Accept invitation' : 'Sign in'}</button></form> : <><div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={busy} onClick={() => void load()}>Refresh queue</button><button className={buttonClass} disabled={busy} onClick={() => void action(async () => { await requestProductAnalysisScan(); setNotice('Catalog scan queued. The worker inspects all images and resumes incomplete analysis automatically.'); })}>Scan complete catalog</button><button className={buttonClass} disabled={busy} onClick={() => void action(downloadProductAnalysisAudit)}>Download audit</button><button className={buttonClass} disabled={busy} onClick={() => void action(async () => { await logout(); setAuthenticated(false); setRecords([]); setCursor(null); })}>Sign out</button></div>{busy && <p role="status">Loading source review…</p>}{records.map(record => <ReviewEditor key={`${record.source.productId}:${record.updatedAt}`} record={record} saved={async () => { setNotice('Only checked information was published. Shopify products were not modified.'); await load(); }} />)}{cursor && <button className={buttonClass} disabled={busy} onClick={() => void load(cursor)}>Load more products</button>}</>}</div>;
}
