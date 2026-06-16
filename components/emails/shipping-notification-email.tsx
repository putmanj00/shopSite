import * as React from 'react';
import { EmailLayout, EmailButton } from './email-layout';

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
}

interface ShippingNotificationEmailProps {
  firstName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
}

export function ShippingNotificationEmail({
  firstName,
  orderNumber,
  trackingNumber,
  trackingUrl,
  carrier,
  estimatedDelivery,
  items,
  shippingAddress,
}: ShippingNotificationEmailProps) {
  return (
    <EmailLayout previewText={`Great news, ${firstName}! Your order #${orderNumber} is on its way.`}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 16px 0',
        textAlign: 'center',
      }}>
        Your Order is On Its Way! 📦
      </h1>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '32px' }}>
        Great news, {firstName}! Your handcrafted treasures have shipped and are heading your way.
      </p>

      {/* Tracking info card */}
      <div style={{
        backgroundColor: '#FDF8F3', // Warm Cream
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#b05523', fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
          Tracking Number
        </p>
        <p style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          {trackingNumber}
        </p>
        <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>
          Shipped via {carrier}
        </p>
        {estimatedDelivery && (
          <p style={{ margin: '0 0 20px 0', color: '#16a34a', fontWeight: 600 }}>
            Estimated delivery: {estimatedDelivery}
          </p>
        )}
        <EmailButton href={trackingUrl}>
          Track Your Package
        </EmailButton>
      </div>

      {/* Order summary */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          Order #{orderNumber}
        </h2>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            <span style={{ color: '#475569' }}>
              {item.quantity}x {item.title}
            </span>
            <span style={{ color: '#1e293b', fontWeight: 500 }}>{item.price}</span>
          </div>
        ))}
      </div>

      {/* Shipping address */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '32px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#64748b',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Shipping To
        </h3>
        <p style={{ margin: 0, color: '#1e293b', lineHeight: 1.6 }}>
          {shippingAddress.name}<br />
          {shippingAddress.address1}<br />
          {shippingAddress.address2 && <>{shippingAddress.address2}<br /></>}
          {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}<br />
          {shippingAddress.country}
        </p>
      </div>

      {/* Helpful info */}
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
          Need Help?
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          If you have any questions about your order, our customer service team is here to help.
          Just reply to this email or contact us at <a href="mailto:support@wildenflower.com" style={{ color: '#b05523', textDecoration: 'none' }}>support@wildenflower.com</a>.
        </p>
      </div>
    </EmailLayout>
  );
}

export default ShippingNotificationEmail;
