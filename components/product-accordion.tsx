'use client';

import { useState, useId } from 'react';

interface AccordionSection {
  id: string;
  title: string;
  content: string | React.ReactNode;
  defaultOpen?: boolean;
}

interface ProductAccordionProps {
  sections: AccordionSection[];
}

/**
 * Expandable accordion sections for product details
 * WCAG 2.1 AA compliant with proper ARIA attributes and keyboard navigation
 */
export default function ProductAccordion({ sections }: ProductAccordionProps) {
  const baseId = useId();
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    sections.forEach((section) => {
      if (section.defaultOpen) {
        initial.add(section.id);
      }
    });
    return initial;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(sectionId);
    }
  };

  if (sections.length === 0) return null;

  return (
    <div className="divide-y divide-gold/20 border-t border-b border-gold/20">
      {sections.map((section) => {
        const isOpen = openSections.has(section.id);
        const headingId = `${baseId}-${section.id}-heading`;
        const contentId = `${baseId}-${section.id}-content`;

        return (
          <div key={section.id}>
            <h3>
              <button
                id={headingId}
                onClick={() => toggleSection(section.id)}
                onKeyDown={(e) => handleKeyDown(e, section.id)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="w-full flex items-center justify-between py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded"
              >
                <span className="text-base font-semibold text-ink-brown">
                  {section.title}
                </span>
                <svg
                  className={`w-5 h-5 text-sage transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </h3>
            <div
              id={contentId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
              className={`overflow-hidden transition-all duration-200 ${isOpen ? 'pb-4' : ''
                }`}
            >
              {typeof section.content === 'string' ? (
                <div
                  className="prose prose-sm max-w-none text-earth"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              ) : (
                <div className="text-earth">{section.content}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// End of file
