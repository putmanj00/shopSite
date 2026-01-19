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
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#1e293b',
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
            backgroundColor: '#f8fafc',
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
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                        <a href={baseUrl} style={{ textDecoration: 'none' }}>
                          <span style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            color: '#2563eb',
                            letterSpacing: '-0.5px',
                          }}>
                            Artisan Collective
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
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                      }}>
                        {/* Social links */}
                        <table role="presentation" width="100%" style={{ borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '16px' }}>
                                <a href={`${baseUrl}/social/facebook`} style={{ margin: '0 8px', textDecoration: 'none', color: '#64748b' }}>Facebook</a>
                                <a href={`${baseUrl}/social/instagram`} style={{ margin: '0 8px', textDecoration: 'none', color: '#64748b' }}>Instagram</a>
                                <a href={`${baseUrl}/social/twitter`} style={{ margin: '0 8px', textDecoration: 'none', color: '#64748b' }}>Twitter</a>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style={{ fontSize: '12px', color: '#94a3b8' }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                  © 2026 Artisan Collective. All rights reserved.
                                </p>
                                <p style={{ margin: '0' }}>
                                  <a href={`${baseUrl}/unsubscribe`} style={{ color: '#64748b' }}>Unsubscribe</a>
                                  {' | '}
                                  <a href={`${baseUrl}/privacy`} style={{ color: '#64748b' }}>Privacy Policy</a>
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
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: '#1e293b',
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
        border: '1px solid #e2e8f0',
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
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>{title}</p>
              <p style={{ margin: 0, color: '#64748b' }}>{price}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </a>
  );
}

export default EmailLayout;
