import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Wildenflower',
  description:
    'Our commitment to digital accessibility. Learn about our WCAG 2.1 AA compliance efforts and how to request accommodations.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          Accessibility Statement
        </h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-neutral-700 mb-8">
            Wildenflower is committed to ensuring digital accessibility for
            people with disabilities. We continually improve the user experience
            for everyone and apply the relevant accessibility standards.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Conformance Status
            </h2>
            <p className="text-neutral-700 mb-4">
              The Web Content Accessibility Guidelines (WCAG) defines requirements
              for designers and developers to improve accessibility for people with
              disabilities. It defines three levels of conformance: Level A, Level
              AA, and Level AAA.
            </p>
            <p className="text-neutral-700">
              Wildenflower is{' '}
              <strong>partially conformant with WCAG 2.1 level AA</strong>. Partially
              conformant means that some parts of the content do not fully conform
              to the accessibility standard.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Accessibility Features
            </h2>
            <p className="text-neutral-700 mb-4">
              We have implemented the following accessibility features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
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
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Assistive Technologies Supported
            </h2>
            <p className="text-neutral-700 mb-4">
              Our website is designed to be compatible with the following assistive
              technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
              <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Alternative keyboard devices</li>
              <li>Switch access devices</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Known Limitations
            </h2>
            <p className="text-neutral-700 mb-4">
              While we strive for full accessibility, some areas may have
              limitations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700">
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
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Feedback and Contact
            </h2>
            <p className="text-neutral-700 mb-4">
              We welcome your feedback on the accessibility of Wildenflower.
              Please let us know if you encounter accessibility barriers:
            </p>
            <ul className="list-none space-y-2 text-neutral-700">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:accessibility@wildenflower.com"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  accessibility@wildenflower.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{' '}
                <a
                  href="tel:+18001234567"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  1-800-123-4567
                </a>
              </li>
              <li>
                <strong>Contact Form:</strong>{' '}
                <Link
                  href="/contact"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
            <p className="text-neutral-700 mt-4">
              We aim to respond to accessibility feedback within 2 business days.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Assessment Approach
            </h2>
            <p className="text-neutral-700">
              Wildenflower assesses the accessibility of our website through
              the following methods:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-700 mt-4">
              <li>Self-evaluation using WCAG 2.1 AA success criteria</li>
              <li>Automated testing using axe-core and Lighthouse</li>
              <li>Manual keyboard navigation testing</li>
              <li>Screen reader testing with VoiceOver and NVDA</li>
              <li>Color contrast analysis</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Date
            </h2>
            <p className="text-neutral-700">
              This statement was last updated on January 17, 2026.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
