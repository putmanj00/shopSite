import * as React from 'react';
import { EmailLayout, EmailButton, EmailProductCard } from './email-layout';

interface RelatedProduct {
  title: string;
  price: string;
  imageUrl?: string;
  productUrl: string;
}

interface CareTip {
  icon: string;
  title: string;
  description: string;
}

interface PostPurchaseEmailProps {
  firstName: string;
  purchasedProductTitle: string;
  purchasedProductType: string;
  careTips: CareTip[];
  relatedProducts: RelatedProduct[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function PostPurchaseEmail({
  firstName,
  purchasedProductTitle,
  purchasedProductType,
  careTips,
  relatedProducts,
}: PostPurchaseEmailProps) {
  return (
    <EmailLayout previewText={`Tips for your ${purchasedProductTitle} + products you might love`}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        Enjoying Your {purchasedProductType}?
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
        Hi {firstName}, we hope you&apos;re loving your <strong>{purchasedProductTitle}</strong>!
        Here are some tips to help you get the most out of your purchase.
      </p>

      {/* Care tips section */}
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
          margin: '0 0 20px 0',
        }}>
          Care Tips for Your {purchasedProductType}
        </h2>

        {careTips.map((tip, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: index < careTips.length - 1 ? '16px' : '0',
            }}
          >
            <span style={{ fontSize: '24px' }}>{tip.icon}</span>
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>
                {tip.title}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}>
            You Might Also Love
          </h2>

          <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
            Based on your recent purchase, we think you&apos;ll enjoy these handcrafted pieces:
          </p>

          {relatedProducts.map((product, index) => (
            <EmailProductCard
              key={index}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              href={product.productUrl}
            />
          ))}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <EmailButton href={`${baseUrl}/collections/${purchasedProductType.toLowerCase()}`} variant="secondary">
              Browse More {purchasedProductType}
            </EmailButton>
          </div>
        </div>
      )}

      {/* Referral program */}
      <div style={{
        backgroundColor: '#f5f3ff', // violet-50
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#5B21B6', // purple-800
          margin: '0 0 12px 0',
        }}>
          Share the Love 💙
        </h2>
        <p style={{ color: '#7C3AED', margin: '0 0 16px 0', fontSize: '14px' }}>
          Refer a friend and you&apos;ll both get $15 off your next order!
        </p>
        <EmailButton href={`${baseUrl}/account?tab=rewards`}>
          Get Your Referral Code
        </EmailButton>
      </div>
    </EmailLayout>
  );
}

export default PostPurchaseEmail;
