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
    <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
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
                className="w-full flex items-center justify-between py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
              >
                <span className="text-base font-semibold text-neutral-900">
                  {section.title}
                </span>
                <svg
                  className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
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
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'pb-4' : ''
              }`}
            >
              {typeof section.content === 'string' ? (
                <div
                  className="prose prose-sm max-w-none text-neutral-600"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              ) : (
                <div className="text-neutral-600">{section.content}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Pre-built accordion sections for common product info
 */
export function getProductAccordionSections(product: {
  descriptionHtml?: string;
  productType?: string;
  tags?: string[];
}): AccordionSection[] {
  const sections: AccordionSection[] = [];

  // Description section
  if (product.descriptionHtml) {
    sections.push({
      id: 'description',
      title: 'Description',
      content: product.descriptionHtml,
      defaultOpen: true,
    });
  }

  // Materials section (check for materials-related tags)
  const materialTags = product.tags?.filter(
    (tag) =>
      tag.toLowerCase().includes('material') ||
      tag.toLowerCase().includes('cotton') ||
      tag.toLowerCase().includes('leather') ||
      tag.toLowerCase().includes('silver') ||
      tag.toLowerCase().includes('gold') ||
      tag.toLowerCase().includes('canvas')
  );
  if (materialTags && materialTags.length > 0) {
    sections.push({
      id: 'materials',
      title: 'Materials',
      content: `<ul class="list-disc list-inside space-y-1">${materialTags.map((t) => `<li>${t}</li>`).join('')}</ul>`,
    });
  }

  // Care instructions section
  const careTags = product.tags?.filter(
    (tag) =>
      tag.toLowerCase().includes('care') ||
      tag.toLowerCase().includes('wash') ||
      tag.toLowerCase().includes('clean')
  );
  if (careTags && careTags.length > 0) {
    sections.push({
      id: 'care',
      title: 'Care Instructions',
      content: `<ul class="list-disc list-inside space-y-1">${careTags.map((t) => `<li>${t}</li>`).join('')}</ul>`,
    });
  } else {
    // Default care instructions based on product type
    let careInstructions = '';
    const productType = product.productType?.toLowerCase() || '';

    if (productType.includes('apparel') || productType.includes('clothing') || productType.includes('tie-dye')) {
      careInstructions = `
        <ul class="list-disc list-inside space-y-1">
          <li>Machine wash cold with like colors</li>
          <li>Tumble dry low or hang to dry</li>
          <li>Do not bleach</li>
          <li>Iron on low heat if needed</li>
        </ul>
      `;
    } else if (productType.includes('leather')) {
      careInstructions = `
        <ul class="list-disc list-inside space-y-1">
          <li>Clean with a soft, dry cloth</li>
          <li>Apply leather conditioner periodically</li>
          <li>Store in a cool, dry place</li>
          <li>Avoid prolonged exposure to direct sunlight</li>
        </ul>
      `;
    } else if (productType.includes('jewelry')) {
      careInstructions = `
        <ul class="list-disc list-inside space-y-1">
          <li>Store in a dry place away from humidity</li>
          <li>Clean gently with a soft cloth</li>
          <li>Remove before swimming or bathing</li>
          <li>Avoid contact with perfumes and lotions</li>
        </ul>
      `;
    }

    if (careInstructions) {
      sections.push({
        id: 'care',
        title: 'Care Instructions',
        content: careInstructions,
      });
    }
  }

  // Shipping section (always include)
  sections.push({
    id: 'shipping',
    title: 'Shipping & Returns',
    content: `
      <div class="space-y-4">
        <div>
          <h4 class="font-medium text-neutral-900 mb-1">Shipping</h4>
          <ul class="list-disc list-inside space-y-1">
            <li>Free shipping on orders over $75</li>
            <li>Standard shipping: 5-7 business days</li>
            <li>Express shipping: 2-3 business days</li>
            <li>International shipping available</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-neutral-900 mb-1">Returns</h4>
          <ul class="list-disc list-inside space-y-1">
            <li>30-day return policy</li>
            <li>Items must be unused and in original packaging</li>
            <li>Free returns on defective items</li>
          </ul>
        </div>
      </div>
    `,
  });

  return sections;
}
