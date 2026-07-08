'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ReviewSubmitFormProps {
  handle: string;
  externalId: string | null;
  productTitle: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

/**
 * Brand-native review form. Posts to our /api/reviews proxy, which forwards to
 * Judge.me for moderation. Anyone can leave a note — no account required.
 */
export default function ReviewSubmitForm({ handle, externalId, productTitle }: ReviewSubmitFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (rating < 1) {
      setError('Please choose a star rating.');
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('submitting');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          externalId,
          rating,
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          title: String(data.get('title') ?? ''),
          body: String(data.get('body') ?? ''),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error || 'Could not submit your note. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setError('Could not submit your note. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-lg border border-gold/30 bg-cream p-6 text-center"
      >
        <p className="font-display text-xl text-ink-brown">Thank you for your note.</p>
        <p className="mt-2 text-ink-brown/80">
          It has been sent for approval and will appear on this entry once reviewed.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="border-t border-gold/25 pt-6">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Write a note
        </Button>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-gold/30 bg-cream p-6"
      noValidate
    >
      <div>
        <h3 className="font-display text-xl text-ink-brown">Leave a note</h3>
        <p className="mt-1 text-sm text-ink-brown/70">
          Share your experience with {productTitle}. No account needed.
        </p>
      </div>

      <fieldset>
        <legend className="catalog-label text-ink-brown/80 mb-2">Your rating</legend>
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value > 1 ? 's' : ''} — ${RATING_LABELS[value]}`}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(value)}
              onBlur={() => setHover(0)}
              className="rounded p-1 text-2xl leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className={value <= shown ? 'text-gold' : 'text-sage/50'} aria-hidden="true">
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-sm text-ink-brown/70" aria-live="polite">
            {shown ? RATING_LABELS[shown] : ''}
          </span>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="catalog-label text-ink-brown/80">Name</span>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-ink-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </label>
        <label className="block">
          <span className="catalog-label text-ink-brown/80">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-ink-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
          <span className="mt-1 block text-xs text-ink-brown/70">Not published.</span>
        </label>
      </div>

      <label className="block">
        <span className="catalog-label text-ink-brown/80">Title (optional)</span>
        <input
          name="title"
          type="text"
          maxLength={200}
          className="mt-1 w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-ink-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </label>

      <label className="block">
        <span className="catalog-label text-ink-brown/80">Your note</span>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={5000}
          className="mt-1 w-full rounded-md border border-gold/30 bg-cream px-3 py-2 text-ink-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Submit note'}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-brown/70 underline hover:text-ink-brown"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
