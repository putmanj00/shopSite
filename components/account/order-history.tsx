'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';
import Price from '@/components/price';
import type { Order, OrderLineItem } from '@/app/api/customer/orders/route';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}



function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');

  if (normalizedStatus.includes('paid') || normalizedStatus.includes('delivered')) {
    return 'bg-green-100 text-green-800';
  }
  if (normalizedStatus.includes('pending') || normalizedStatus.includes('transit')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (normalizedStatus.includes('refund') || normalizedStatus.includes('cancel')) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
}

function getFulfillmentStatus(order: Order): string {
  if (order.fulfillments.nodes.length === 0) {
    return 'Unfulfilled';
  }

  const latestFulfillment = order.fulfillments.nodes[0];
  if (latestFulfillment.latestShipmentStatus?.status) {
    return latestFulfillment.latestShipmentStatus.status.replace(/_/g, ' ');
  }
  return latestFulfillment.status.replace(/_/g, ' ');
}

interface OrderItemProps {
  item: OrderLineItem;
  onReorder: (productId: string) => void;
}

function OrderItem({ item, onReorder }: OrderItemProps) {
  const productHandle = item.productId ? item.productId.split('/').pop() : null;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      {item.image ? (
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={item.image.url}
            alt={item.image.altText || item.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.title}</p>
        {item.variantTitle && (
          <p className="text-sm text-gray-500">{item.variantTitle}</p>
        )}
        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-medium text-gray-900">
          <Price amount={item.price.amount} currencyCode={item.price.currencyCode} />
        </p>
        {productHandle && item.productId && (
          <button
            onClick={() => onReorder(item.productId!)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Buy again
          </button>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

function OrderCard({ order, isExpanded, onToggle }: OrderCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const fulfillmentStatus = getFulfillmentStatus(order);
  const trackingInfo = order.fulfillments.nodes[0]?.trackingInfo?.[0];

  const handleReorder = async (productId: string) => {
    // Extract handle from product GID
    const handle = productId.split('/').pop();
    if (!handle) return;

    try {
      // Fetch product details to get variant ID
      const response = await fetch(`/api/products/${handle}`);
      if (response.ok) {
        const data = await response.json();
        const variant = data.product?.variants?.edges?.[0]?.node;
        if (variant) {
          await addToCart(variant.id, 1);
        }
      }
    } catch (error) {
      console.error('Reorder error:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Order Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="font-semibold text-gray-900">Order #{order.number}</p>
            <p className="text-sm text-gray-500">{formatDate(order.processedAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              <Price amount={order.totalPrice.amount} currencyCode={order.totalPrice.currencyCode} />
            </p>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(order.financialStatus)}`}>
                {order.financialStatus.toLowerCase().replace(/_/g, ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(fulfillmentStatus)}`}>
                {fulfillmentStatus.toLowerCase()}
              </span>
            </div>
          </div>

          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Order Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Tracking Info */}
          {trackingInfo && (
            <div className="py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Tracking</p>
              <a
                href={trackingInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {trackingInfo.number} →
              </a>
            </div>
          )}

          {/* Line Items */}
          <div className="mt-2">
            {order.lineItems.nodes.map((item, index) => (
              <OrderItem
                key={`${order.id}-${index}`}
                item={item}
                onReorder={handleReorder}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/customer/orders?limit=20');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between">
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="text-right">
                <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-4">When you place an order, it will appear here.</p>
        <Link
          href="/collections"
          className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isExpanded={expandedOrder === order.id}
          onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
        />
      ))}
    </div>
  );
}
