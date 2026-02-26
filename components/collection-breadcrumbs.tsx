import Link from 'next/link';

interface CollectionBreadcrumbsProps {
  collectionTitle: string;
  collectionHandle: string;
}

/**
 * Breadcrumb navigation for collection pages
 * Provides hierarchical navigation context for accessibility and SEO
 */
export default function CollectionBreadcrumbs({
  collectionTitle,
  collectionHandle,
}: CollectionBreadcrumbsProps) {
  return (
    <nav
      className="flex items-center gap-2 text-sm mb-6"
      aria-label="Breadcrumb"
    >
      <ol
        className="flex items-center gap-2"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/"
            className="text-earth hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 rounded"
            itemProp="item"
          >
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        <li aria-hidden="true">
          <svg
            className="w-4 h-4 text-sage"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </li>

        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            href="/collections/all"
            className="text-neutral-600 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            itemProp="item"
          >
            <span itemProp="name">Collections</span>
          </Link>
          <meta itemProp="position" content="2" />
        </li>

        <li aria-hidden="true">
          <svg
            className="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </li>

        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
          aria-current="page"
        >
          <span
            className="text-ink-brown font-medium"
            itemProp="name"
          >
            {collectionTitle}
          </span>
          <link
            itemProp="item"
            href={`/collections/${collectionHandle}`}
          />
          <meta itemProp="position" content="3" />
        </li>
      </ol>
    </nav>
  );
}
