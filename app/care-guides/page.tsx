import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/page-hero';

export const metadata: Metadata = {
    title: 'Care Guides | Wildenflower',
    description:
        'How to care for your handmade Wildenflower pieces — leather, tie-dye, and jewelry — so they stay beautiful for the life of the piece.',
};

const sections = [
    { id: 'leather', label: 'Leather' },
    { id: 'tie-dye', label: 'Tie-Dye' },
    { id: 'jewelry', label: 'Jewelry' },
];

export default function CareGuidesPage() {
    return (
        <>
            <PageHero
                backgroundImage="/assets/images/headers/botanical-header-blog.png"
                label="Care Guides"
                title="Caring for Your Pieces"
                subtitle="Every Wildenflower piece is handmade to be kept. A little care keeps the leather supple, the dye vivid, and the metal bright for years to come."
            />

            {/* Jump nav */}
            <section className="bg-parchment pt-12 lg:pt-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="catalog-label text-ink-brown/80">Find Your Guide</span>
                    <nav className="mt-4 flex flex-wrap gap-3" aria-label="Care guide sections">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="rounded-full border border-gold/30 bg-cream px-5 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-sage/10"
                            >
                                {s.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            {/* Leather */}
            <section id="leather" className="bg-parchment scroll-mt-24 py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="catalog-label text-ink-brown/80">Full-Grain Leather</span>
                    <h2 className="mt-3 mb-6 text-2xl font-bold font-heading text-ink-brown">
                        Leather Care
                    </h2>
                    <div className="bg-cream p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">A living material</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Our leather is full-grain and vegetable-tanned, so it ages the way good
                                leather should — deepening in color and softening with use. Every scratch and
                                patina mark is part of the story, not a flaw.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Everyday care</h3>
                            <ul className="text-earth text-sm leading-relaxed list-disc list-inside space-y-2">
                                <li>Wipe with a soft, dry cloth to lift dust and light dirt.</li>
                                <li>Keep it out of prolonged direct sun and away from radiators — heat dries the fibers.</li>
                                <li>Let a wet piece air-dry on its own, away from heat. Never force-dry with a hair dryer.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Conditioning</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Two to four times a year, work a small amount of a neutral leather conditioner
                                or balm in with a soft cloth. Test on a hidden spot first, apply thin, and buff
                                off the excess. This keeps the leather fed and supple.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">If it gets wet</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Blot — don&apos;t rub — with a dry cloth and let it dry naturally at room
                                temperature. Once fully dry, a light conditioning restores any color the water
                                pulled out.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Storage</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Store in the cotton dust bag it arrived in, somewhere cool and dry. Loosely
                                stuff bags to hold their shape and avoid airtight plastic, which traps moisture.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tie-Dye */}
            <section id="tie-dye" className="bg-parchment scroll-mt-24 py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="catalog-label text-ink-brown/80">Hand-Dyed Textiles</span>
                    <h2 className="mt-3 mb-6 text-2xl font-bold font-heading text-ink-brown">
                        Tie-Dye Care
                    </h2>
                    <div className="bg-cream p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">The first few washes</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Each piece is hand-dyed and rinsed until the water runs clear, but a little extra
                                dye can still release early on. Wash separately, or with like colors, for the
                                first two or three washes.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">How to wash</h3>
                            <ul className="text-earth text-sm leading-relaxed list-disc list-inside space-y-2">
                                <li>Machine wash cold on a gentle cycle, turned inside out.</li>
                                <li>Use a mild detergent — never bleach or any product with optical brighteners.</li>
                                <li>Skip the fabric softener; it dulls the colors over time.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Drying</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Line-dry in the shade whenever you can — direct sun fades dye, and high dryer
                                heat sets creases. If you machine-dry, use low heat and pull the piece while
                                it&apos;s still slightly damp.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Ironing &amp; keeping it bright</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Iron inside out on a warm setting, avoiding any printed or painted detail. Colors
                                stay richest when the piece is washed less often and dried out of the sun — a
                                gentle life keeps a hand-dyed piece vivid for years.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Jewelry */}
            <section id="jewelry" className="bg-parchment scroll-mt-24 pb-16 lg:pb-24 pt-12 lg:pt-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <span className="catalog-label text-ink-brown/80">Handcrafted Jewelry</span>
                    <h2 className="mt-3 mb-6 text-2xl font-bold font-heading text-ink-brown">
                        Jewelry Care
                    </h2>
                    <div className="bg-cream p-8 rounded-2xl shadow-sm space-y-6">
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">The last on, the first off</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Put jewelry on after lotion, perfume, and hairspray, and take it off before you
                                sleep, shower, swim, or exercise. Cosmetics, chlorine, and sweat are the fastest
                                way to dull a finish or tarnish metal.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Cleaning</h3>
                            <ul className="text-earth text-sm leading-relaxed list-disc list-inside space-y-2">
                                <li>Wipe after wear with a soft, dry cloth to remove oils.</li>
                                <li>For a deeper clean, use a jeweler&apos;s polishing cloth on metal.</li>
                                <li>Keep chemical dips and abrasive cleaners away from stones, crystals, and plated pieces.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Stones &amp; crystals</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Natural stones and crystals are softer than they look. Clean them with only a dry
                                or barely-damp cloth, keep them out of prolonged sun (some colors fade), and avoid
                                knocks against hard surfaces.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-ink-brown mb-2">Storage</h3>
                            <p className="text-earth text-sm leading-relaxed">
                                Store each piece separately — in a soft pouch or a lined box — so chains
                                don&apos;t tangle and harder stones don&apos;t scratch softer ones. A dry spot
                                away from humidity slows tarnish considerably.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Repair reassurance */}
            <section className="bg-parchment pb-16 lg:pb-24">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="bg-cream p-8 rounded-2xl shadow-sm text-center">
                        <p className="text-earth text-sm leading-relaxed">
                            Cared for and something still isn&apos;t right? Our handmade leather, tie-dye, and
                            jewelry are covered by our{' '}
                            <a href="/shipping-returns" className="text-primary-700 font-medium underline">
                                Lifetime Repair promise
                            </a>
                            . Email{' '}
                            <span className="text-primary-700">wildenflowercreations@gmail.com</span> and
                            we&apos;ll help.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
