import * as React from 'react';
import { EmailLayout } from './email-layout';

interface OrderItem {
  title: string;
  productUrl: string;
  reviewUrl: string;
  imageUrl?: string;
}

interface DeliveryConfirmationEmailProps {
  firstName: string;
  orderNumber: string;
  items: OrderItem[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function DeliveryConfirmationEmail({
  firstName,
  orderNumber,
  items,
}: DeliveryConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Your order #${orderNumber} has been delivered! We'd love to hear your thoughts.`}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '40px' }}>✅</span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          Your Order Has Arrived!
        </h1>

        <p style={{ color: '#64748b', marginBottom: '0' }}>
          Hi {firstName}, we hope you love your new handcrafted treasures!
        </p>
      </div>

      {/* Review request */}
      <div style={{
        backgroundColor: '#fefce8',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#854d0e',
          margin: '0 0 12px 0',
        }}>
          Share Your Experience ⭐
        </h2>
        <p style={{ color: '#713f12', marginBottom: '0' }}>
          Your feedback helps other customers discover amazing handcrafted products
          and supports our artisan community.
        </p>
      </div>

      {/* Items with review buttons */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          Review Your Items
        </h3>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: index < items.length - 1 ? '12px' : '0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  width="60"
                  height="60"
                  style={{
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <a
                href={item.productUrl}
                style={{
                  color: '#1e293b',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {item.title}
              </a>
            </div>
            <a
              href={item.reviewUrl}
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Write Review
            </a>
          </div>
        ))}
      </div>

      {/* Loyalty points */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{ margin: 0, color: '#166534' }}>
          <strong>🎁 Earn 100 loyalty points</strong> for each review you leave!
        </p>
      </div>

      {/* Care tips teaser */}
      <div style={{
        padding: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 12px 0',
        }}>
          💡 Care Tips for Your New Items
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
          Want to keep your handcrafted pieces looking their best? Check out our care guides
          for tips on maintaining the beauty and quality of your items.
        </p>
        <a
          href={`${baseUrl}/care-guides`}
          style={{ color: '#2563eb', fontSize: '14px', fontWeight: 500 }}
        >
          View Care Guides →
        </a>
      </div>
    </EmailLayout>
  );
}

export default DeliveryConfirmationEmail;
