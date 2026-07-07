import type { Metadata } from 'next';
import FindUsInTheWild from '@/components/homepage/find-us-in-the-wild';

export const metadata: Metadata = {
  title: 'Visit the Booth — Find Us in the Wild | Wildenflower',
  description:
    'Where to find Wildenflower in person — the markets and fairs we bring the booth to. New dates enter the field log the moment they are booked.',
};

// The booth → online funnel: the "Find Us in the Wild" section, promoted from a
// homepage strip to its own destination so the market ribbon and the mobile Booth
// tab have somewhere real to point (redesign concept 01, note 01).
export default function BoothPage() {
  return <FindUsInTheWild headingLevel={1} />;
}
