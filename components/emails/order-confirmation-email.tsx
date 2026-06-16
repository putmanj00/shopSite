import * as React from 'react';
import { EmailLayout, EmailButton } from './email-layout';

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
  imageUrl?: string;
  variantTitle?: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  orderStatusUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  orderStatusUrl,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Order #${orderNumber} confirmed! Thank you for your purchase.`}>
      {/* Confirmation header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '32px' }}>✓</span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 8px 0',
        }}>
          Thank You for Your Order!
        </h1>

        <p style={{ color: '#64748b', margin: 0 }}>
          Hi {customerName}, we&apos;ve received your order and are getting it ready.
        </p>
      </div>

      {/* Order number card */}
      <div style={{
        backgroundColor: '#FDF8F3', // Warm Cream
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '32px',
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#C8642A', fontWeight: 600, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
          Order Number
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 16px 0',
        }}>
          #{orderNumber}
        </p>
        {orderStatusUrl && (
          <EmailButton href={orderStatusUrl} variant="primary">
            Track Your Order
          </EmailButton>
        )}
      </div>

      {/* Order items */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
          margin: '0 0 16px 0',
          paddingBottom: '12px',
          borderBottom: '1px solid #e2e8f0',
        }}>
          Order Summary
        </h2>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            {item.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.imageUrl}
                alt={item.title}
                width="60"
                height="60"
                style={{
                  borderRadius: '6px',
                  marginRight: '12px',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 500, color: '#1e293b' }}>
                {item.title}
              </p>
              {item.variantTitle && (
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#64748b' }}>
                  {item.variantTitle}
                </p>
              )}
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                Qty: {item.quantity}
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 500, color: '#1e293b' }}>
              {item.price}
            </p>
          </div>
        ))}

        {/* Order totals */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Subtotal</span>
            <span style={{ color: '#1e293b' }}>{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Shipping</span>
            <span style={{ color: '#1e293b' }}>{shipping}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#64748b' }}>Tax</span>
            <span style={{ color: '#1e293b' }}>{tax}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: '#1e293b' }}>{total}</span>
          </div>
        </div>
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

      {/* What's next */}
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
          What&apos;s Next?
        </h3>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>
            We&apos;ll prepare your handcrafted items with care
          </li>
          <li style={{ marginBottom: '8px' }}>
            You&apos;ll receive a shipping notification when your order is on its way
          </li>
          <li style={{ marginBottom: '0' }}>
            Your treasures will arrive at your door!
          </li>
        </ol>
      </div>

      {/* Questions */}
      <p style={{
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '14px',
        color: '#64748b',
      }}>
        Questions about your order? Reply to this email or{' '}
        <a href={`${baseUrl}/contact`} style={{ color: '#C8642A' }}>contact us</a>.
      </p>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;
