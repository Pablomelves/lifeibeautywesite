import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Star, Loader2 } from 'lucide-react';
import type { Product, ProductReviewPage } from '../types';
import { getProductReviews, submitProductReview } from '../services/reviews';

export function ReviewStars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="relative inline-flex text-slate-200" aria-hidden="true">
          <Star size={size} fill="currentColor" />
          <span className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: `${Math.max(0, Math.min(1, rating - index)) * 100}%` }}>
            <Star size={size} fill="currentColor" />
          </span>
        </span>
      ))}
    </span>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const [page, setPage] = useState<ProductReviewPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const submissionId = useRef<string | null>(null);
  const submitPending = useRef(false);
  const loadPending = useRef(false);
  const requestVersion = useRef(0);
  const fieldId = `product-review-${product.id}`;
  const inputClass = 'w-full min-h-11 px-3 py-2.5 rounded-xl border border-[#A64D63]/20 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC3460]/40';
  const buttonClass = 'min-h-11 px-4 py-2.5 rounded-xl border border-[#A64D63]/20 text-xs font-semibold text-slate-700 hover:bg-[#FFF0F9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const load = useCallback(async (before?: number, signal?: AbortSignal) => {
    if (before && loadPending.current) return;
    const version = ++requestVersion.current;
    loadPending.current = true;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getProductReviews(product.id, before, signal);
      if (!signal?.aborted && version === requestVersion.current) setPage(previous => before && previous ? { ...result, reviews: [...previous.reviews, ...result.reviews] } : result);
    } catch (error) {
      if (!signal?.aborted && version === requestVersion.current) setLoadError(error instanceof Error ? error.message : 'Reviews could not be loaded. Please try again.');
    } finally {
      if (version === requestVersion.current) {
        loadPending.current = false;
        if (!signal?.aborted) setLoading(false);
      }
    }
  }, [product.id]);

  useEffect(() => {
    const controller = new AbortController();
    void load(undefined, controller.signal);
    return () => { requestVersion.current++; loadPending.current = false; controller.abort(); };
  }, [load, refresh]);

  useEffect(() => {
    const update = () => setRefresh(value => value + 1);
    window.addEventListener('lifei-reviews-updated', update);
    return () => window.removeEventListener('lifei-reviews-updated', update);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitPending.current) return;
    submitPending.current = true;
    setSubmitting(true);
    setSubmissionError(null);
    setSuccess(null);
    try {
      submissionId.current ||= crypto.randomUUID();
      const result = await submitProductReview({ submissionId: submissionId.current, productId: String(product.id), author, rating, title, comment, consent, website });
      if (result.accepted !== true) throw new Error('Your review could not be saved. Please try again.');
      setSuccess('Thank you. Your review was received and is awaiting moderation. It is not published yet.');
      setFormOpen(false);
      setAuthor(''); setRating(0); setTitle(''); setComment(''); setConsent(false); setWebsite('');
      submissionId.current = null;
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Your review could not be saved. Please try again.');
    } finally {
      submitPending.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section id="product-reviews" className="py-10" aria-labelledby="product-reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 id="product-reviews-heading" className="font-anton text-2xl uppercase tracking-tight text-slate-900">Customer reviews</h3>
        <button type="button" className={buttonClass} aria-expanded={formOpen} aria-controls={`${fieldId}-form`} onClick={() => setFormOpen(value => !value)} disabled={submitting}>
          {formOpen ? 'Close review form' : 'Write a review'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-4">Reviews are customer-submitted and moderated before publication. Purchases have not been independently verified.</p>
      {page && page.total > 0 && page.averageRating !== null && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ReviewStars rating={page.averageRating} />
          <span className="text-sm font-semibold text-slate-900">{page.averageRating.toFixed(1)} out of 5</span>
          <span className="text-xs text-slate-500">Based on {page.total} published {page.total === 1 ? 'review' : 'reviews'}</span>
        </div>
      )}
      {loading && <p role="status" className="text-xs text-slate-500 flex items-center gap-2 mb-4"><Loader2 size={16} className="animate-spin motion-reduce:animate-none" />Loading reviews…</p>}
      {loadError && <div role="alert" className="rounded-2xl border border-[#A64D63]/20 bg-[#FFF5FA] p-4 mb-4 text-xs text-slate-700"><p>{loadError}</p><button type="button" className={`${buttonClass} mt-2`} onClick={() => page?.nextCursor ? void load(page.nextCursor) : setRefresh(value => value + 1)} disabled={loading}>Try again</button></div>}
      {!loading && !loadError && page?.total === 0 && <div className="rounded-2xl border border-[#A64D63]/20 bg-[#FFF5FA] p-5 text-xs text-slate-600">No published customer reviews for {product.name} yet. Share your honest experience to help other shoppers.</div>}
      <div className="space-y-3">
        {page?.reviews.map(review => (
          <article key={review.id} className="rounded-2xl border border-[#A64D63]/20 bg-white p-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2"><span className="text-sm font-semibold text-slate-900 break-words min-w-0 max-w-full">{review.author}</span><time dateTime={review.createdAt} className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time></div>
            <ReviewStars rating={review.rating} />
            <h4 className="font-semibold text-sm text-slate-900 mt-3 break-words">{review.title}</h4>
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words">{review.comment}</p>
          </article>
        ))}
      </div>
      {page?.nextCursor && <button type="button" className={`${buttonClass} mt-4`} onClick={() => void load(page.nextCursor!)} disabled={loading}>Show more reviews</button>}
      {success && <p role="status" className="mt-4 rounded-xl bg-[#FFF0F9] p-4 text-sm text-slate-700">{success}</p>}
      {formOpen && (
        <form id={`${fieldId}-form`} onSubmit={submit} className="mt-5 p-5 rounded-2xl border border-[#A64D63]/20 bg-[#FFF5FA] space-y-4">
          <fieldset disabled={submitting} className="space-y-4 min-w-0">
            <legend className="text-sm font-semibold text-slate-900 mb-3">Your review of {product.name}</legend>
            <p className="text-xs text-slate-600">Use a public nickname. Do not include email addresses, order numbers, or other private information.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label htmlFor={`${fieldId}-author`} className="block text-xs font-semibold text-slate-700 mb-1">Public nickname</label><input id={`${fieldId}-author`} name="author" type="text" required minLength={2} maxLength={60} value={author} onChange={event => setAuthor(event.target.value)} className={inputClass} autoComplete="off" /></div>
              <div><label htmlFor={`${fieldId}-rating`} className="block text-xs font-semibold text-slate-700 mb-1">Your rating</label><select id={`${fieldId}-rating`} name="rating" required value={rating || ''} onChange={event => setRating(Number(event.target.value))} className={inputClass}><option value="" disabled>Select a rating</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}</select></div>
            </div>
            <div><label htmlFor={`${fieldId}-title`} className="block text-xs font-semibold text-slate-700 mb-1">Review headline</label><input id={`${fieldId}-title`} name="title" type="text" required minLength={3} maxLength={120} value={title} onChange={event => setTitle(event.target.value)} className={inputClass} /></div>
            <div><label htmlFor={`${fieldId}-comment`} className="block text-xs font-semibold text-slate-700 mb-1">Your experience</label><textarea id={`${fieldId}-comment`} name="comment" required minLength={20} maxLength={3000} rows={4} value={comment} onChange={event => setComment(event.target.value)} className={`${inputClass} resize-y`} /><p className="mt-1 text-[11px] text-slate-500">20–3,000 characters. Please describe only your own experience.</p></div>
            <div hidden aria-hidden="true"><label htmlFor={`${fieldId}-website`}>Leave this field empty</label><input id={`${fieldId}-website`} name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></div>
            <label className="flex items-start gap-3 text-xs text-slate-600 py-2"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#EC3460]" /><span>I am sharing my own honest experience and agree that my nickname, rating, and review may be displayed publicly after moderation. <a href="/policies/privacy-policy" className="underline">Privacy policy</a></span></label>
            <details className="rounded-xl border border-[#A64D63]/20 bg-white p-4">
              <summary className="cursor-pointer text-xs font-semibold text-slate-700 min-h-6">Preview review layout — demo only</summary>
              <div className="mt-3 border-t border-[#A64D63]/10 pt-3" aria-label="Demo review preview, not published customer feedback">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#A64D63] mb-3">Demo preview — not a published customer review</p>
                <p className="text-sm font-semibold text-slate-900 break-words">{author.trim() || 'Your public nickname'}</p>
                {rating ? <ReviewStars rating={rating} /> : <p className="text-xs text-slate-500 mt-1">Your selected star rating appears here.</p>}
                <p className="text-sm font-semibold text-slate-900 mt-3 break-words">{title.trim() || 'Your review headline'}</p>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap break-words">{comment.trim() || 'Your own feedback about this product appears here after approval. This placeholder is not a customer testimonial.'}</p>
                <p className="text-[11px] text-slate-500 mt-3">This preview is not counted toward product ratings.</p>
              </div>
            </details>
            {submissionError && <p role="alert" className="text-sm text-rose-700">{submissionError}</p>}
            <button type="submit" className="min-h-11 px-5 py-3 rounded-xl bg-[#EC3460] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{submitting && <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />}{submitting ? 'Submitting…' : 'Submit for moderation'}</button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
