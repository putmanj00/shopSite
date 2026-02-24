import Image from 'next/image';
import Link from 'next/link';

interface CTA {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

interface EnhancedHeroProps {
  heading: string;
  subheading?: string;
  ctas?: CTA[];
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity?: number;
}

export default function EnhancedHero({
  heading = 'Where Color Comes Alive',
  subheading = 'Trippy treasures for free spirits. Vibrant tie-dye, mandala art, crystals, and festival-ready handcrafted goods — art you can wear, magic you can feel.',
  ctas = [
    { label: 'Shop the Vibe', href: '/collections/all', variant: 'primary' },
    { label: 'Our Story', href: '#brand-story', variant: 'secondary' },
  ],
  backgroundImage = '/images/hero-background.png',
  backgroundVideo,
  overlayOpacity = 50,
}: EnhancedHeroProps) {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background */}
      {backgroundVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        // Fallback gradient
        <div
          className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
          aria-hidden="true"
        />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity / 100 }}
        aria-hidden="true"
      />

      {/* Content — parchment card floating left */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-xl bg-[#F5EDD6]/90 backdrop-blur-sm border border-[#C9A642]/50 rounded-2xl shadow-xl p-8 md:p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1E3B30] leading-tight mb-4 font-heading">
            {heading}
          </h1>

          {subheading && (
            <p className="text-base md:text-lg text-[#5C4033] mb-8 max-w-md">
              {subheading}
            </p>
          )}

          {ctas && ctas.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              {ctas.map((cta, index) => (
                <Link
                  key={index}
                  href={cta.href}
                  className={`
                    inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-lg transition-all hover:scale-105
                    ${cta.variant === 'secondary'
                      ? 'border-2 border-[#1E3B30] text-[#1E3B30] hover:bg-[#1E3B30] hover:text-[#F5EDD6]'
                      : 'bg-terracotta text-white hover:bg-terracotta/90'
                    }
                  `}
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          )}

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap gap-6 text-[#5C4033]/70 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1E3B30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free Shipping Over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1E3B30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Handmade with Care</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1E3B30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
