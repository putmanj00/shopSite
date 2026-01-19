import * as React from 'react';
import { EmailLayout, EmailButton, EmailProductCard } from './email-layout';

interface CollectionProduct {
  title: string;
  price: string;
  imageUrl?: string;
  productUrl: string;
}

interface NewCollectionEmailProps {
  firstName: string;
  collectionName: string;
  collectionDescription: string;
  collectionUrl: string;
  heroImageUrl?: string;
  featuredProducts: CollectionProduct[];
  isEarlyAccess?: boolean;
  launchDate?: string;
}

export function NewCollectionEmail({
  firstName,
  collectionName,
  collectionDescription,
  collectionUrl,
  heroImageUrl,
  featuredProducts,
  isEarlyAccess = false,
  launchDate,
}: NewCollectionEmailProps) {
  return (
    <EmailLayout previewText={`${isEarlyAccess ? '🔓 Early Access: ' : ''}Introducing our new ${collectionName} collection`}>
      {/* Early access badge */}
      {isEarlyAccess && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            🔓 Early Access for Members
          </span>
        </div>
      )}

      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        Introducing: {collectionName}
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
        {isEarlyAccess
          ? `${firstName}, you're getting exclusive early access before anyone else!`
          : `${firstName}, we're excited to share our latest collection with you.`}
      </p>

      {/* Hero image */}
      {heroImageUrl && (
        <div style={{ marginBottom: '32px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt={collectionName}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Collection description */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 12px 0',
        }}>
          About This Collection
        </h2>
        <p style={{ color: '#475569', margin: 0, lineHeight: 1.7 }}>
          {collectionDescription}
        </p>
      </div>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}>
            Featured Pieces
          </h2>

          {featuredProducts.map((product, index) => (
            <EmailProductCard
              key={index}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              href={product.productUrl}
            />
          ))}
        </div>
      )}

      {/* Launch date for early access */}
      {isEarlyAccess && launchDate && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            <strong>Public launch:</strong> {launchDate}
            <br />
            <span style={{ fontSize: '14px' }}>Get yours first before everyone else!</span>
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <EmailButton href={collectionUrl}>
          Shop the Collection
        </EmailButton>
      </div>

      {/* Share section */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        padding: '20px',
        borderTop: '1px solid #e2e8f0',
      }}>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }}>
          Love what you see? Share with friends:
        </p>
        <a href={`https://twitter.com/intent/tweet?text=Check out the new ${encodeURIComponent(collectionName)} collection!&url=${encodeURIComponent(collectionUrl)}`} style={{ margin: '0 8px', color: '#1da1f2', textDecoration: 'none' }}>Twitter</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(collectionUrl)}`} style={{ margin: '0 8px', color: '#4267b2', textDecoration: 'none' }}>Facebook</a>
        <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(collectionUrl)}&description=${encodeURIComponent(`New ${collectionName} collection`)}`} style={{ margin: '0 8px', color: '#bd081c', textDecoration: 'none' }}>Pinterest</a>
      </div>
    </EmailLayout>
  );
}

export default NewCollectionEmail;
