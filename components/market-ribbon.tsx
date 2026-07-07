import Link from 'next/link';
import eventsData from '@/data/events.json';

interface WildenflowerEvent {
  id: string;
  name: string;
  date: string; // ISO "YYYY-MM-DD"
  venue: string;
  url: string | null;
}

// The ribbon always carries the NEXT physical market — never a discount, never a
// hand-typed date. It is bound to the site's real schedule (data/events.json). When
// every event on file is past, it shows the honest empty state: the last market plus
// "next date posts here first." (redesign concept 01, note 01 — booth → online funnel.)

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function nextMarket(events: WildenflowerEvent[], today: Date): WildenflowerEvent | null {
  const upcoming = events
    .filter((e) => new Date(e.date + 'T00:00:00') >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? null;
}

function lastMarket(events: WildenflowerEvent[], today: Date): WildenflowerEvent | null {
  const past = events
    .filter((e) => new Date(e.date + 'T00:00:00') < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? null;
}

function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate + 'T00:00:00'));
}

export default function MarketRibbon() {
  const events = eventsData as WildenflowerEvent[];
  const today = startOfToday();
  const next = nextMarket(events, today);
  const last = next ? null : lastMarket(events, today);

  // Nothing on file at all, past or future — render no ribbon rather than an empty shell.
  if (!next && !last) return null;

  return (
    <div className="bg-forest text-woods-ink border-b border-gold/40">
      <p className="max-w-7xl mx-auto px-4 py-2 text-center text-xs sm:text-sm tracking-[0.08em]">
        {next ? (
          <>
            <span className="text-woods-ink/80">Next market · </span>
            <strong className="font-medium text-cream">
              {next.name} — {next.venue}
            </strong>
            <span className="text-woods-ink/80"> · {formatEventDate(next.date)}</span>
          </>
        ) : (
          <>
            <span className="text-woods-ink/80">From the field log · last market: </span>
            <strong className="font-medium text-cream">
              {last!.name} — {last!.venue}
            </strong>
            <span className="text-woods-ink/80">
              {' '}· {formatEventDate(last!.date)} · next date posts here first
            </span>
          </>
        )}
        {' · '}
        <Link
          href="/booth"
          className="text-woods-ink underline underline-offset-2 hover:text-cream transition-colors"
        >
          Booth details
        </Link>
      </p>
    </div>
  );
}
