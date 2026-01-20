import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {previewText && (
          <title>{previewText}</title>
        )}
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#FDF8F3', // Warm Cream
        fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#1C1917', // Charcoal
      }}>
        {/* Preview text (hidden) */}
        {previewText && (
          <div style={{
            display: 'none',
            maxHeight: 0,
            overflow: 'hidden',
          }}>
            {previewText}
          </div>
        )}

        {/* Email wrapper */}
        <table
          role="presentation"
          width="100%"
          style={{
            borderCollapse: 'collapse',
            backgroundColor: '#FDF8F3', // Warm Cream
          }}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: '40px 20px' }}>
                {/* Email container */}
                <table
                  role="presentation"
                  width="600"
                  style={{
                    borderCollapse: 'collapse',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    maxWidth: '100%',
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{
                        padding: '32px 40px',
                        textAlign: 'center',
                        borderBottom: '1px solid #e7ddd1',
                      }}>
                        <a href={baseUrl} style={{ textDecoration: 'none' }}>
                          <span style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#0D9488', // Deep Turquoise
                            letterSpacing: '0.5px',
                            fontFamily: 'Georgia, serif',
                          }}>
                            Wildenflower
                          </span>
                        </a>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td style={{ padding: '40px' }}>
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{
                        padding: '24px 40px',
                        borderTop: '1px solid #e7ddd1',
                        backgroundColor: '#FDF8F3', // Warm Cream
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                      }}>
                        {/* Social links */}
                        <table role="presentation" width="100%" style={{ borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '16px' }}>
                                <a href={`${baseUrl}/social/facebook`} style={{ margin: '0 8px', textDecoration: 'none', color: '#78716C' }}>Facebook</a>
                                <a href={`${baseUrl}/social/instagram`} style={{ margin: '0 8px', textDecoration: 'none', color: '#78716C' }}>Instagram</a>
                                <a href={`${baseUrl}/social/pinterest`} style={{ margin: '0 8px', textDecoration: 'none', color: '#78716C' }}>Pinterest</a>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style={{ fontSize: '12px', color: '#78716C' }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                  © 2026 Wildenflower. All rights reserved.
                                </p>
                                <p style={{ margin: '0' }}>
                                  <a href={`${baseUrl}/unsubscribe`} style={{ color: '#0D9488' }}>Unsubscribe</a>
                                  {' | '}
                                  <a href={`${baseUrl}/privacy`} style={{ color: '#0D9488' }}>Privacy Policy</a>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// Reusable button component
export function EmailButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const styles = {
    primary: {
      backgroundColor: '#0D9488', // Deep Turquoise
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#FDF8F3', // Warm Cream
      color: '#1C1917', // Charcoal
      border: '1px solid #e7ddd1',
    },
  };

  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '14px',
        textAlign: 'center',
        ...styles[variant],
      }}
    >
      {children}
    </a>
  );
}

// Product card for email
export interface EmailProductProps {
  title: string;
  price: string;
  imageUrl?: string;
  href: string;
}

export function EmailProductCard({ title, price, imageUrl, href }: EmailProductProps) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e7ddd1',
        marginBottom: '12px',
      }}
    >
      <table role="presentation" width="100%" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            {imageUrl && (
              <td width="80" style={{ verticalAlign: 'top' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  width="80"
                  height="80"
                  style={{
                    display: 'block',
                    borderRadius: '6px',
                    objectFit: 'cover',
                  }}
                />
              </td>
            )}
            <td style={{ verticalAlign: 'middle', paddingLeft: imageUrl ? '16px' : '0' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1C1917' }}>{title}</p>
              <p style={{ margin: 0, color: '#78716C' }}>{price}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </a>
  );
}

export default EmailLayout;
