import eventsData from '@/data/events.json';

interface WildenflowerEvent {
  id: string;
  name: string;
  date: string; // ISO "YYYY-MM-DD"
  venue: string;
  url: string | null;
}

// Hide past events; renders server-side, so the list refreshes whenever the page revalidates
function upcomingEvents(): WildenflowerEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (eventsData as WildenflowerEvent[]).filter(
    (event) => new Date(event.date + 'T00:00:00') >= today
  );
}

function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoDate + 'T00:00:00'));
}

// headingLevel lets the section stand alone as a page (h1 on /booth) while staying an
// h2 when stacked under the homepage's h1.
export default function FindUsInTheWild({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const events = upcomingEvents();
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <section className="bg-parchment py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <span className="catalog-label text-ink-brown/80">The Field Log</span>
        <Heading className="text-ink-brown font-heading font-bold text-3xl sm:text-4xl mt-3">
          Find Us in the Wild
        </Heading>
        <p className="text-earth mt-3 mb-10">
          We take Wildenflower to the markets — come say hello.
        </p>

        {events.length === 0 ? (
          <p className="text-earth text-center py-8">
            No upcoming events right now — check back soon. In the meantime, browse the shop or follow us on Instagram.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-cream rounded-lg shadow-sm p-6">
                <p className="font-heading font-bold text-ink-brown text-lg mb-1">
                  {event.name}
                </p>
                <p className="text-primary-700 text-sm font-medium mb-1">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-earth text-sm mb-3">{event.venue}</p>
                {event.url !== null && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-700 hover:underline text-sm"
                  >
                    More info
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
