import type { Metadata } from 'next';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Size Guide | Wildenflower',
    description: 'Size charts and fitting guides for Wildenflower apparel, jewelry, and accessories.',
};

const apparelSizes = [
    { size: 'XS', chest: '32–34"', waist: '24–26"', hips: '34–36"' },
    { size: 'S', chest: '34–36"', waist: '26–28"', hips: '36–38"' },
    { size: 'M', chest: '36–38"', waist: '28–30"', hips: '38–40"' },
    { size: 'L', chest: '38–40"', waist: '30–32"', hips: '40–42"' },
    { size: 'XL', chest: '40–42"', waist: '32–34"', hips: '42–44"' },
    { size: '2XL', chest: '42–44"', waist: '34–36"', hips: '44–46"' },
];

const ringSizes = [
    { size: '5', diameter: '15.7mm', circumference: '49.3mm' },
    { size: '6', diameter: '16.5mm', circumference: '51.8mm' },
    { size: '7', diameter: '17.3mm', circumference: '54.4mm' },
    { size: '8', diameter: '18.1mm', circumference: '57.0mm' },
    { size: '9', diameter: '18.9mm', circumference: '59.5mm' },
    { size: '10', diameter: '19.8mm', circumference: '62.1mm' },
];

export default function SizeGuidePage() {
    return (
        <>
            <BotanicalHeader />

            {/* Hero */}
            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        Find Your Fit
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl">
                        Size Guide
                    </h1>
                    <p className="mt-4 text-lg text-earth max-w-2xl mx-auto">
                        Every artisan piece is unique. Use these measurements to find your perfect fit.
                    </p>
                </div>
            </section>

            {/* Apparel Sizes */}
            <section className="bg-white py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                        Apparel
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-gold/20">
                        <table className="w-full text-sm">
                            <thead className="bg-sage/10">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Size</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Chest</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Waist</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Hips</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {apparelSizes.map((row) => (
                                    <tr key={row.size} className="hover:bg-parchment/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-terracotta">{row.size}</td>
                                        <td className="px-5 py-3 text-earth">{row.chest}</td>
                                        <td className="px-5 py-3 text-earth">{row.waist}</td>
                                        <td className="px-5 py-3 text-earth">{row.hips}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tips */}
                    <div className="mt-6 bg-sage/10 p-6 rounded-xl">
                        <h3 className="font-semibold text-ink-brown mb-2">💡 Measuring Tips</h3>
                        <ul className="text-earth text-sm leading-relaxed space-y-1 list-disc list-inside">
                            <li>Measure over undergarments for the most accurate fit</li>
                            <li>Keep the tape measure snug but not tight</li>
                            <li>If between sizes, we recommend sizing up for a relaxed fit</li>
                            <li>Our tie-dye pieces are intentionally oversized for a bohemian drape</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Ring Sizes */}
            <section className="bg-parchment py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                        Ring Sizes
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-gold/20 bg-white">
                        <table className="w-full text-sm">
                            <thead className="bg-sage/10">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">US Size</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Inner Diameter</th>
                                    <th className="px-5 py-3 text-left font-semibold text-ink-brown">Circumference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {ringSizes.map((row) => (
                                    <tr key={row.size} className="hover:bg-parchment/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-terracotta">{row.size}</td>
                                        <td className="px-5 py-3 text-earth">{row.diameter}</td>
                                        <td className="px-5 py-3 text-earth">{row.circumference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 bg-sage/10 p-6 rounded-xl">
                        <h3 className="font-semibold text-ink-brown mb-2">🍀 Finding Your Ring Size</h3>
                        <ul className="text-earth text-sm leading-relaxed space-y-1 list-disc list-inside">
                            <li>Wrap a strip of paper around your finger</li>
                            <li>Mark where the paper overlaps and measure the length</li>
                            <li>Match your measurement to the circumference column above</li>
                            <li>Fingers swell in heat — measure in the afternoon for best results</li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}
