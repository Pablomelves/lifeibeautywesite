import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { acceptInvite, getUser, handleAuthCallback, login, logout } from '@netlify/identity';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { ModeratedProductReview } from '../../types';
import { getModerationQueue, moderateProductReview } from '../../services/reviews';
import { ReviewStars } from '../ProductReviews';

export function AdminReviewsTab() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [status, setStatus] = useState<ModeratedProductReview['status']>('pending');
  const [reviews, setReviews] = useState<ModeratedProductReview[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const actionPending = useRef(false);
  const requestVersion = useRef(0);
  const buttonClass = 'min-h-11 px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 cursor-pointer hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed';

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const callback = await handleAuthCallback();
        if (active && callback?.type === 'invite') setInviteToken(callback.token || null);
        const user = callback?.user || await getUser();
        if (active) setAuthenticated(!!user);
      } catch { if (active) setError('Review moderation sign-in is unavailable. Check Netlify Identity configuration.'); }
      finally { if (active) setChecking(false); }
    })();
    return () => { active = false; requestVersion.current++; };
  }, []);

  const load = useCallback(async (before?: number) => {
    const version = ++requestVersion.current;
    setBusy(true);
    setError(null);
    try {
      const result = await getModerationQueue(status, before);
      if (version !== requestVersion.current) return;
      setReviews(previous => before ? [...previous, ...result.reviews] : result.reviews);
      setNextCursor(result.nextCursor);
    } catch (failure) {
      if (version === requestVersion.current) setError(failure instanceof Error ? failure.message : 'Reviews could not be loaded.');
    } finally { if (version === requestVersion.current) setBusy(false); }
  }, [status]);

  useEffect(() => {
    if (authenticated) { setReviews([]); setNextCursor(null); void load(); }
    return () => { requestVersion.current++; };
  }, [authenticated, load]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true); setError(null);
    try {
      const user = inviteToken ? await acceptInvite(inviteToken, password) : await login(email, password);
      setAuthenticated(!!user); setInviteToken(null); setPassword('');
    } catch { setError('Sign-in failed. Check your invited Netlify Identity account and password.'); }
    finally { actionPending.current = false; setBusy(false); }
  };

  const update = async (id: number, nextStatus: ModeratedProductReview['status']) => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true); setError(null); setNotice(null);
    try {
      await moderateProductReview(id, nextStatus);
      setReviews(previous => previous.filter(review => review.id !== id));
      setNotice(nextStatus === 'approved' ? 'Review approved and published.' : nextStatus === 'rejected' ? 'Review rejected and hidden from product pages.' : 'Review moved back to the moderation queue.');
      window.dispatchEvent(new Event('lifei-reviews-updated'));
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'This review could not be updated.'); }
    finally { actionPending.current = false; setBusy(false); }
  };

  const signOut = async () => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true); setError(null);
    try { await logout(); setAuthenticated(false); setReviews([]); setNextCursor(null); }
    catch { setError('Sign-out failed. Please try again.'); }
    finally { actionPending.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold text-stone-900">Customer Reviews & Moderation</h2><p className="text-xs text-stone-500 mt-1">Customer submissions are saved securely and remain private until approved. Demo previews are never stored or published.</p></div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-stone-50 border border-stone-200 p-4 text-sm text-stone-700">{notice}</p>}
      {checking ? <p role="status" className="text-sm text-stone-500">Checking moderation access…</p> : !authenticated ? (
        <form onSubmit={signIn} className="rounded-2xl border border-stone-200 bg-white p-5 max-w-lg space-y-4">
          <h3 className="font-semibold text-stone-900">{inviteToken ? 'Accept moderator invitation' : 'Moderator sign-in'}</h3>
          <p className="text-xs text-stone-600">Use an invited Netlify Identity account with an <code>admin</code> or <code>review_moderator</code> role. This is separate from the existing store-owner login.</p>
          {!inviteToken && <div><label htmlFor="review-moderator-email" className="block text-xs font-semibold mb-1">Email</label><input id="review-moderator-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="w-full min-h-11 rounded-xl border border-stone-200 px-3 py-2" disabled={busy} /></div>}
          <div><label htmlFor="review-moderator-password" className="block text-xs font-semibold mb-1">{inviteToken ? 'Choose a password' : 'Password'}</label><input id="review-moderator-password" type="password" autoComplete={inviteToken ? 'new-password' : 'current-password'} required minLength={inviteToken ? 12 : undefined} value={password} onChange={event => setPassword(event.target.value)} className="w-full min-h-11 rounded-xl border border-stone-200 px-3 py-2" disabled={busy} /></div>
          <button type="submit" className={buttonClass} disabled={busy}>{busy ? 'Signing in…' : inviteToken ? 'Accept invitation' : 'Sign in to moderate'}</button>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <label htmlFor="review-moderation-status" className="text-xs font-semibold text-stone-600">Status</label>
            <select id="review-moderation-status" value={status} onChange={event => { setNotice(null); setStatus(event.target.value as typeof status); }} disabled={busy} className="min-h-11 px-3 rounded-xl border border-stone-200 bg-white text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
            <button type="button" onClick={() => void load()} className={`${buttonClass} flex items-center gap-2`} disabled={busy}><RefreshCw size={15} />Refresh</button>
            <button type="button" onClick={() => void signOut()} className={buttonClass} disabled={busy}>Sign out of moderation</button>
          </div>
          {busy && <p role="status" className="flex items-center gap-2 text-xs text-stone-500"><Loader2 size={16} className="animate-spin motion-reduce:animate-none" />Loading…</p>}
          {!busy && !error && reviews.length === 0 && <p className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500">No {status} customer reviews.</p>}
          <div className="space-y-3">
            {reviews.map(review => (
              <article key={review.id} className="rounded-2xl border border-stone-200 bg-white p-5 min-w-0">
                <div className="flex flex-wrap gap-2 justify-between"><h3 className="font-semibold text-stone-900 break-words min-w-0 max-w-full">{review.productName}</h3><span className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString('en-US')}</span></div>
                <p className="text-xs text-stone-500 mt-1 break-words">Public nickname: {review.author} · Product ID: {review.productId}</p>
                <div className="mt-3"><ReviewStars rating={review.rating} /></div>
                <h4 className="font-semibold text-sm mt-2 break-words">{review.title}</h4><p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap break-words">{review.comment}</p>
                <p className="text-xs text-stone-400 mt-3">Customer-submitted. Purchase not verified. Original review text is preserved.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {status !== 'approved' && <button type="button" onClick={() => void update(review.id, 'approved')} className={`${buttonClass} flex items-center gap-2`} disabled={busy}><CheckCircle size={16} />Approve</button>}
                  {status !== 'rejected' && <button type="button" onClick={() => void update(review.id, 'rejected')} className={`${buttonClass} flex items-center gap-2`} disabled={busy}><XCircle size={16} />Reject</button>}
                  {status !== 'pending' && <button type="button" onClick={() => void update(review.id, 'pending')} className={buttonClass} disabled={busy}>Return to pending</button>}
                </div>
              </article>
            ))}
          </div>
          {nextCursor && <button type="button" onClick={() => void load(nextCursor)} className={buttonClass} disabled={busy}>Load more reviews</button>}
        </>
      )}
    </div>
  );
}
