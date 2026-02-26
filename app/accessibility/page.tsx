import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/ui/page-hero';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Wildenflower',
  description:
    'Our commitment to digital accessibility. Learn about our WCAG 2.1 AA compliance efforts and how to request accommodations.',
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        backgroundImage="/assets/images/headers/botanical-header-faq.png"
        label="Our Commitment"
        title="Accessibility Statement"
        subtitle="Wildenflower is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards."
      />

      <section className="bg-parchment py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Conformance Status
              </h2>
              <p className="text-earth mb-4 leading-relaxed">
                The Web Content Accessibility Guidelines (WCAG) defines requirements
                for designers and developers to improve accessibility for people with
                disabilities. It defines three levels of conformance: Level A, Level
                AA, and Level AAA.
              </p>
              <p className="text-earth leading-relaxed">
                Wildenflower is{' '}
                <strong>partially conformant with WCAG 2.1 level AA</strong>. Partially
                conformant means that some parts of the content do not fully conform
                to the accessibility standard.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Accessibility Features
              </h2>
              <p className="text-earth mb-4 leading-relaxed">
                We have implemented the following accessibility features:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth">
                <li>
                  <strong>Keyboard Navigation:</strong> All interactive elements can
                  be accessed using a keyboard alone
                </li>
                <li>
                  <strong>Skip Links:</strong> Skip navigation links allow users to
                  bypass repetitive content
                </li>
                <li>
                  <strong>Focus Indicators:</strong> Visible focus outlines on all
                  interactive elements
                </li>
                <li>
                  <strong>Color Contrast:</strong> Text and UI components meet WCAG
                  AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
                </li>
                <li>
                  <strong>Alt Text:</strong> All meaningful images include descriptive
                  alternative text
                </li>
                <li>
                  <strong>Semantic HTML:</strong> Proper heading hierarchy and
                  landmark regions for screen reader navigation
                </li>
                <li>
                  <strong>Form Labels:</strong> All form inputs have associated labels
                  and error messages
                </li>
                <li>
                  <strong>ARIA Live Regions:</strong> Dynamic content changes are
                  announced to screen readers
                </li>
                <li>
                  <strong>Reduced Motion:</strong> Animations are disabled for users
                  who prefer reduced motion
                </li>
                <li>
                  <strong>Touch Targets:</strong> Interactive elements have a minimum
                  touch target size of 44x44 pixels
                </li>
                <li>
                  <strong>Responsive Design:</strong> Content is accessible across all
                  screen sizes and zoom levels up to 200%
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Assistive Technologies Supported
              </h2>
              <p className="text-earth mb-4 leading-relaxed">
                Our website is designed to be compatible with the following assistive
                technologies:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth">
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Alternative keyboard devices</li>
                <li>Switch access devices</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Known Limitations
              </h2>
              <p className="text-earth mb-4 leading-relaxed">
                While we strive for full accessibility, some areas may have
                limitations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth">
                <li>
                  <strong>Third-party content:</strong> Some embedded content from
                  third-party services may not fully conform to accessibility
                  standards
                </li>
                <li>
                  <strong>PDF documents:</strong> Some older PDF documents may not be
                  fully accessible. Please contact us for alternative formats
                </li>
                <li>
                  <strong>User-generated content:</strong> Product reviews and
                  user-submitted images may not always include appropriate alt text
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Feedback and Contact
              </h2>
              <p className="text-earth mb-4 leading-relaxed">
                We welcome your feedback on the accessibility of Wildenflower.
                Please let us know if you encounter accessibility barriers:
              </p>
              <ul className="list-none space-y-2 text-earth">
                <li>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:wildenflowercreations@gmail.com"
                    className="text-terracotta hover:underline"
                  >
                    wildenflowercreations@gmail.com
                  </a>
                </li>
                <li>
                  <strong>Contact Form:</strong>{' '}
                  <Link
                    href="/contact"
                    className="text-terracotta hover:underline"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
              <p className="text-earth mt-4 leading-relaxed">
                We aim to respond to accessibility feedback within 2 business days.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Assessment Approach
              </h2>
              <p className="text-earth leading-relaxed">
                Wildenflower assesses the accessibility of our website through
                the following methods:
              </p>
              <ul className="list-disc list-inside space-y-2 text-earth mt-4">
                <li>Self-evaluation using WCAG 2.1 AA success criteria</li>
                <li>Automated testing using axe-core and Lighthouse</li>
                <li>Manual keyboard navigation testing</li>
                <li>Screen reader testing with VoiceOver and NVDA</li>
                <li>Color contrast analysis</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-heading text-ink-brown mb-4">
                Date
              </h2>
              <p className="text-earth leading-relaxed">
                This statement was last updated on January 17, 2026.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
