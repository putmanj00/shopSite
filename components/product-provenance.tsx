import type { ShopifyProductVariant } from '@/types/shopify';
import type { ProductEntry } from '@/lib/product-entry';

interface ProductProvenanceProps {
  entry: ProductEntry;
  /** Selected variant — supplies the fixed Size fact for one-of-one pieces. */
  variant: ShopifyProductVariant;
  oneOfOne: boolean;
}

const EDITION_COPY: Record<NonNullable<ProductEntry['edition']>, string> = {
  one_of_one: 'one of one — never re-run',
  small_run: 'small run — returns to the field',
};

interface Row {
  key: string;
  value: string;
}

/**
 * The provenance block — the journal entry itself as the buy-box trust device
 * (concept note 10). Maker, gathered, technique, edition. For a one-of-one the
 * size is a fixed fact of the piece ("M — the only one"), stated here instead of
 * shown as a picker. Renders nothing when the product has no entry facts at all
 * (zero-metafield fallback).
 */
export default function ProductProvenance({
  entry,
  variant,
  oneOfOne,
}: ProductProvenanceProps) {
  const rows: Row[] = [];

  // One-of-one: size is a fact, not a choice.
  if (oneOfOne) {
    const sizeOption = variant.selectedOptions.find((o) => /size/i.test(o.name));
    if (sizeOption?.value) {
      rows.push({ key: 'Size', value: `${sizeOption.value} — the only one` });
    }
  }

  if (entry.maker) rows.push({ key: 'Maker', value: entry.maker });
  if (entry.gathered) rows.push({ key: 'Gathered', value: entry.gathered });
  if (entry.technique) rows.push({ key: 'Technique', value: entry.technique });
  if (entry.edition) rows.push({ key: 'Edition', value: EDITION_COPY[entry.edition] });

  if (rows.length === 0) return null;

  return (
    <dl className="border-t border-gold/30 pt-6 space-y-3">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[7rem_1fr] gap-3 text-sm">
          <dt className="uppercase tracking-[0.14em] text-earth/70 text-xs pt-0.5">
            {row.key}
          </dt>
          <dd className="text-ink-brown">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
