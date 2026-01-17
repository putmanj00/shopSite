export interface AccordionSection {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

/**
 * Pre-built accordion sections for common product info
 * Moved here to avoid usage of 'use client' file in server components
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
